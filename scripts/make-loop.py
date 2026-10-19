#!/usr/bin/env python3
"""Turn a green-screen clip into a small, transparent, seamlessly looping WebM.

Usage:
  python3 scripts/make-loop.py work/clips/builder.mp4 builder
  python3 scripts/make-loop.py work/clips/mentor.mp4 mentor

Writes:
  public/character/<name>-loop.webm    transparent loop (VP9 with alpha), no audio
  work/loops/<name>/preview.png        check this before using the loop

Needs: ffmpeg (brew install ffmpeg), python3, and  pip3 install pillow numpy

What it does
  1. Pulls frames at 12 fps and crops the middle square of the 16:9 frame.
  2. Calms the video noise in the parts of the picture that don't move, so
     outlines don't shimmer.
  3. Removes the green with soft edges (no hard on/off pixels).
  4. Finds the best loop point inside the clip and blends the last frames
     into the ones before the start, so the restart doesn't jump.
  5. Extends edge colours into the transparent area (no dark rim) and encodes.
"""
import argparse
import os
import shutil
import subprocess
import sys

import numpy as np
from numpy.lib.stride_tricks import sliding_window_view
from PIL import Image, ImageFilter


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"Command failed: {' '.join(cmd)}\n{result.stderr}")
    return result


# ---------------------------------------------------------------- noise ----
def calm_static_pixels(stack, win=3, tol=20):
    """AI video "boils" the outlines of things that aren't moving: the line sits
    a pixel to the left on one frame and a pixel to the right on the next.
    Where the picture really is still (judged on a blurred copy, so tiny line
    wobble doesn't count as movement), use the middle value over a few frames."""
    n = len(stack)
    blurred = np.stack([
        np.asarray(Image.fromarray(f).filter(ImageFilter.GaussianBlur(2))) for f in stack
    ]).astype(np.int16)
    out = stack.copy()
    for t in range(n):
        lo, hi = max(0, t - win), min(n, t + win + 1)
        spread = blurred[lo:hi].max(axis=0) - blurred[lo:hi].min(axis=0)
        moving = spread.max(axis=-1) >= tol
        # keep a safety margin around anything that moves
        for _ in range(4):
            grown = moving.copy()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    grown |= np.roll(np.roll(moving, dy, 0), dx, 1)
            moving = grown
        still = ~moving
        if still.any():
            med = np.median(stack[lo:hi], axis=0).astype(np.uint8)
            out[t][still] = med[still]
    return out


# ------------------------------------------------------------------ key ----
def key_frame(rgb):
    """Green background -> transparent. rgb is uint8 (h, w, 3).
    Returns float32 colour (h, w, 3) and float32 alpha (h, w) in 0..1."""
    a = rgb.astype(np.float32)
    strip = np.concatenate([a[:12].reshape(-1, 3), a[:, :12].reshape(-1, 3)])
    bg = np.median(strip, axis=0)
    bg_excess = bg[1] - max(bg[0], bg[2])
    if bg_excess < 60:
        sys.exit(
            f"The background doesn't look like green screen (edge colour {bg.round().tolist()}). "
            "Is the character in the middle square with flat green around it?"
        )
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # how "green" each pixel is, compared with the background
    raw = 1 - np.clip((g - np.maximum(r, b)) / bg_excess, 0, 1)
    # take the green out of the colour of edge pixels
    mix = np.maximum(raw, 0.04)
    fg = np.clip((a - (1 - mix)[..., None] * bg) / mix[..., None], 0, 255)
    fg[..., 1] = np.minimum(fg[..., 1], (fg[..., 0] + fg[..., 2]) / 2 + 4)  # remove green spill
    # Clear the faint leftovers the video leaves in the background (under 12%),
    # treat nearly solid as solid (over 88%), and keep real edge pixels soft.
    alpha = np.clip((raw - 0.12) / 0.76, 0, 1)
    # Remove lone faint specks: a faint pixel with nothing solid within 2 px is dirt, not an edge.
    nearby = sliding_window_view(np.pad(alpha, 2), (5, 5)).max(axis=(2, 3))
    alpha = np.where((alpha < 0.25) & (nearby < 0.4), 0, alpha)
    return fg, alpha


# ------------------------------------------------------------- the rest ----
def blend(a, b, w):
    """Mix two (colour, alpha) frames, w = how much of b. Alpha-aware."""
    (ca, aa), (cb, ab) = a, b
    alpha = (1 - w) * aa + w * ab
    prem = (1 - w) * ca * aa[..., None] + w * cb * ab[..., None]
    colour = prem / np.maximum(alpha, 1e-3)[..., None]
    return colour, alpha


def extend_colours(colour, alpha, iters=5):
    """Fill colour into the transparent area next to the character, so the
    encoder doesn't smear black into the edges."""
    colour = colour.copy()
    known = alpha >= 0.03
    for _ in range(iters):
        acc = np.zeros_like(colour)
        cnt = np.zeros(known.shape, np.float32)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                k = np.roll(np.roll(known, dy, 0), dx, 1)
                c = np.roll(np.roll(colour, dy, 0), dx, 1)
                acc += c * k[..., None]
                cnt += k
        grow = (~known) & (cnt > 0)
        colour[grow] = acc[grow] / cnt[grow][:, None]
        known = known | grow
    colour[~known] = 0
    return colour


def find_loop(small, fps, min_s, max_s):
    """Pick start/end frames whose pictures match best. Returns (start, end, mse)."""
    stack = np.stack(small)
    n = len(stack)
    lo, hi = int(min_s * fps), int(max_s * fps)
    best = None
    for i in range(n):
        for j in range(i + lo, min(n, i + hi + 1)):
            d = float(np.mean((stack[i] - stack[j]) ** 2))
            if best is None or d < best[0]:
                best = (d, i, j)
    if best is None:
        return 0, n, None
    return best[1], best[2], best[0]


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("clip")
    p.add_argument("name")
    p.add_argument("--size", type=int, default=0, help="width and height in px (default: the clip's own size, at most 800)")
    p.add_argument("--fps", type=int, default=12)
    p.add_argument("--crf", type=int, default=32, help="quality: lower = better and bigger (default 32)")
    p.add_argument("--min", type=float, default=4.0, help="shortest loop in seconds")
    p.add_argument("--max", type=float, default=8.0, help="longest loop in seconds")
    p.add_argument("--blend", type=int, default=3, help="frames blended at the restart (0 = none)")
    p.add_argument("--no-loop-search", action="store_true", help="use the whole clip as it is")
    p.add_argument("--out", default="public/character")
    args = p.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found. Install it with:  brew install ffmpeg")
    if not os.path.isfile(args.clip):
        sys.exit(f"Clip not found: {args.clip}")

    work = os.path.join("work", "loops", args.name)
    shutil.rmtree(work, ignore_errors=True)
    raw_dir = os.path.join(work, "raw")
    key_dir = os.path.join(work, "keyed")
    os.makedirs(raw_dir)
    os.makedirs(key_dir)
    os.makedirs(args.out, exist_ok=True)

    print("1/6 extracting frames...")
    run(["ffmpeg", "-v", "error", "-y", "-i", args.clip, "-an",
         "-vf", f"fps={args.fps}", os.path.join(raw_dir, "f_%04d.png")])
    names = sorted(os.listdir(raw_dir))
    if len(names) < 12:
        sys.exit("The clip is too short.")

    first = Image.open(os.path.join(raw_dir, names[0]))
    side = first.size[1]  # the square is as tall as the frame
    size = args.size or min(side, 800)
    print(f"    {len(names)} frames; the middle square is {side}px, output {size}px")
    frames = []
    for name in names:
        im = Image.open(os.path.join(raw_dir, name)).convert("RGB")
        w, h = im.size
        left = (w - h) // 2
        sq = im.crop((left, 0, left + h, h)) if w != h else im
        if size != h:
            sq = sq.resize((size, size), Image.LANCZOS)
        frames.append(np.asarray(sq))

    print("2/6 looking for the best loop point...")
    small = [np.asarray(Image.fromarray(f).convert("L").resize((96, 96), Image.BILINEAR)).astype(np.float32) for f in frames]
    if args.no_loop_search:
        start, end, mse = 0, len(frames), None
    else:
        start, end, mse = find_loop(small, args.fps, args.min, args.max)
    note = f"match score {mse:.0f}" if mse is not None else "whole clip"
    print(f"    using frames {start}-{end} ({(end - start) / args.fps:.1f} s, {note})")
    if mse is not None and mse > 150:
        print("    warning: no close match found, so the restart may show a small jump.")

    pre = min(args.blend, start)  # frames before the start, used to blend the restart
    first_idx = start - pre
    print("3/6 calming noise in the parts that don't move...")
    stack = calm_static_pixels(np.stack(frames[first_idx:end]))

    print("4/6 removing the green...")
    keyed = [key_frame(f) for f in stack]
    seg = keyed[pre:]  # the loop itself
    if pre > 0:
        before = keyed[:pre]  # frames just before the start
        for k in range(pre):
            w = (k + 1) / (pre + 1)
            idx = len(seg) - pre + k
            seg[idx] = blend(seg[idx], before[k], w)

    print("5/6 encoding...")
    for i, (colour, alpha) in enumerate(seg):
        colour = extend_colours(colour, alpha)
        rgba = np.dstack([colour, alpha * 255]).clip(0, 255).astype(np.uint8)
        Image.fromarray(rgba, "RGBA").save(os.path.join(key_dir, f"k_{i + 1:04d}.png"))
    video = os.path.join(args.out, f"{args.name}-loop.webm")
    run(["ffmpeg", "-v", "error", "-y", "-framerate", str(args.fps),
         "-i", os.path.join(key_dir, "k_%04d.png"),
         "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", str(args.crf),
         "-auto-alt-ref", "0", "-row-mt", "1", "-an", video])

    print("6/6 checking the result...")
    check = os.path.join(work, "decoded.png")
    run(["ffmpeg", "-v", "error", "-y", "-c:v", "libvpx-vp9", "-i", video, "-frames:v", "1", check])
    dec = Image.open(check).convert("RGBA")
    if dec.getpixel((2, 2))[3] != 0:
        sys.exit("The video came out without transparency. Check your ffmpeg has libvpx-vp9.")

    # preview: three frames on cream, the first on magenta (shows any green left over),
    # and a close-up of the busiest edge area on cream
    tile = 360
    cream = (248, 240, 224, 255)
    sheet = Image.new("RGB", (tile * 5, tile), cream[:3])

    def frame_img(i):
        return Image.open(os.path.join(key_dir, f"k_{i + 1:04d}.png")).convert("RGBA")

    picks = [0, len(seg) // 3, 2 * len(seg) // 3]
    for k, idx in enumerate(picks):
        im = frame_img(idx)
        bg = Image.new("RGBA", im.size, cream)
        sheet.paste(Image.alpha_composite(bg, im).convert("RGB").resize((tile, tile), Image.LANCZOS), (k * tile, 0))
    im0 = frame_img(0)
    mag = Image.new("RGBA", im0.size, (255, 0, 255, 255))
    sheet.paste(Image.alpha_composite(mag, im0).convert("RGB").resize((tile, tile), Image.LANCZOS), (3 * tile, 0))
    # 4x close-up of the busiest edge area (where trouble would show first)
    a0 = np.asarray(im0)[..., 3].astype(np.float32) / 255
    cw = im0.size[0] // 4
    step = max(cw // 4, 1)
    best, box = -1, (0, 0)
    for y in range(0, im0.size[1] - cw + 1, step):
        for x in range(0, im0.size[0] - cw + 1, step):
            score = float(((a0[y:y + cw, x:x + cw] > 0.1) & (a0[y:y + cw, x:x + cw] < 0.9)).sum())
            if score > best:
                best, box = score, (x, y)
    zoom = Image.alpha_composite(Image.new("RGBA", im0.size, cream), im0).convert("RGB")
    zoom = zoom.crop((box[0], box[1], box[0] + cw, box[1] + cw)).resize((tile, tile), Image.NEAREST)
    sheet.paste(zoom, (4 * tile, 0))
    sheet.save(os.path.join(work, "preview.png"))

    v_kb = os.path.getsize(video) / 1024
    print(f"\n{video}  {v_kb:.0f} KB   {'(over the 500 KB budget: try --crf 36 or --size 640)' if v_kb > 500 else 'ok'}")
    print(f"Look at {os.path.join(work, 'preview.png')} before using it (green edges? jumps?).")


if __name__ == "__main__":
    main()
