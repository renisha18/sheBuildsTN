#!/usr/bin/env python3
"""Turn a green-screen clip into a small, transparent, seamlessly looping WebM.

Usage:
  python3 scripts/make-loop.py work/clips/builder.mp4 builder
  python3 scripts/make-loop.py work/clips/mentor.mp4 mentor
  python3 scripts/make-loop.py work/clips/speaker.mp4 speaker --pingpong   (can never jump)

Writes:
  public/character/<name>-loop.webm    transparent loop (VP9 with alpha), no audio
  work/loops/<name>/preview.png        check this before using the loop

Needs: ffmpeg (brew install ffmpeg), python3, and  pip3 install pillow numpy

What it does
  1. Pulls frames at 12 fps and crops the middle square of the 16:9 frame.
  2. Calms the video noise in the parts of the picture that don't move, so
     outlines don't shimmer.
  3. Removes the green with soft edges (no hard on/off pixels).
  4. Finds a restart point where the moving part (the hand, the head) is in the same
     place and moving the same way, and blends the last frames into the ones before the
     start. It prints a restart check. If it says VISIBLE, add --pingpong.
  5. Extends edge colours into the transparent area (no dark rim) and encodes.
"""
import argparse
import os
import shutil
import subprocess
import sys

import numpy as np
from numpy.lib.stride_tricks import sliding_window_view
from PIL import Image, ImageDraw, ImageFilter


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


def _phase_shift(ref, img):
    """Shift (dx, dy), in pixels, to apply to img so that it lines up with ref."""
    h, w = ref.shape
    win = np.outer(np.hanning(h), np.hanning(w)).astype(np.float32)
    A = np.fft.fft2((ref - ref.mean()) * win)
    B = np.fft.fft2((img - img.mean()) * win)
    R = A * np.conj(B)
    R /= np.maximum(np.abs(R), 1e-9)
    r = np.fft.ifft2(R).real
    y, x = np.unravel_index(np.argmax(r), r.shape)

    def sub(v, n, line):
        c, l, rr = line[v], line[(v - 1) % n], line[(v + 1) % n]
        den = l - 2 * c + rr
        return 0.0 if den == 0 else 0.5 * (l - rr) / den

    dy = y + sub(y, h, r[:, x])
    dx = x + sub(x, w, r[y, :])
    if dy > h / 2:
        dy -= h
    if dx > w / 2:
        dx -= w
    return dx, dy


def moving_part(small):
    """The whole figure sways a little in generated video. Cancel that, then find the
    part of the picture that really moves (the hand, the head). Returns the aligned
    small frames, the per-frame sway in px, and a mask of the moving part."""
    ref = np.median(np.stack(small[:: max(1, len(small) // 20)]), axis=0)
    aligned, sway = [], []
    for g in small:
        dx, dy = _phase_shift(ref, g)
        sway.append((dx, dy))
        im = Image.fromarray(g.clip(0, 255).astype(np.uint8))
        im = im.transform(im.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy), resample=Image.BICUBIC)
        aligned.append(np.asarray(im).astype(np.float32))
    G = np.stack(aligned)
    std = G.std(axis=0)
    mask = std > max(float(np.percentile(std, 99.5)) * 0.30, 3.0)
    grown = mask.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            grown |= np.roll(np.roll(mask, dy, 0), dx, 1)
    if grown.sum() < 30:
        grown = std >= np.percentile(std, 95)
    return G, np.array(sway), grown


def find_loop(small, fps, min_s, max_s, blend=3, pingpong=False):
    """Choose where the loop restarts so the restart can't be seen.
    A restart is smooth when the moving part is in the same place AND moving the same
    way (so a few frames either side are compared, not just one), and when it is moving
    slowly there. Returns (start, end, info); the loop shows frames start..end-1."""
    n = len(small)
    lo, hi = int(min_s * fps), int(max_s * fps)
    G, sway, mask = moving_part(small)
    X = G[:, mask]
    sq = (X ** 2).sum(axis=1)
    D = np.maximum((sq[:, None] + sq[None, :] - 2 * X @ X.T) / X.shape[1], 0)   # moving part, frame i vs frame j
    SW = 100.0 * ((sway[:, None, 0] - sway[None, :, 0]) ** 2 + (sway[:, None, 1] - sway[None, :, 1]) ** 2)
    C = D + SW
    step = np.array([np.sqrt(D[k, k + 1]) for k in range(n - 1)])
    typical = float(step.mean()) or 1.0
    speed2 = np.full(n, 1e9)
    for k in range(1, n - 1):
        speed2[k] = D[k - 1, k + 1] / 4
    best = None
    for i in range(2, n - 1):
        for j in range(i + lo, min(n - 1, i + hi + 1)):
            if pingpong:
                if step[i:j].mean() < 0.6 * typical:
                    continue  # a loop that hardly moves isn't worth having
                cost = 6 * (speed2[i] + speed2[j])
            else:
                cost = (C[i - 2, j - 2] + 2 * C[i - 1, j - 1] + 3 * C[i, j] + 2 * C[i + 1, j + 1]
                        + 4 * (speed2[i] + speed2[j]))
            if best is None or cost < best[0]:
                best = (cost, i, j)
    if best is None:
        return 0, n, None
    _, i, j = best
    info = {"typical": typical}
    if pingpong:
        info["edge_speed"] = float((np.sqrt(speed2[i]) + np.sqrt(speed2[j])) / 2)
    else:
        w = min(blend, i) / (min(blend, i) + 1) if blend and i > 0 else 0.0
        last = (1 - w) * G[j - 1] + w * G[max(i - 1, 0)]          # what the last frame looks like after blending
        info["jump"] = float(np.sqrt(np.mean((last[mask] - G[i][mask]) ** 2)))
        # How different the two ends of the loop really are, before any blending. Blending can
        # hide a mismatch behind a faint ghost, so this is the number to trust.
        info["gap"] = float(max(np.sqrt(D[j, i]), np.sqrt(D[j - 1, i - 1])))
        # The check we show: the average size of the change at the restart, against the average
        # size of the change between any two neighbouring frames. (An average of absolute
        # differences keeps a big jump looking big; a root-mean-square one hides it.)
        l1 = lambda a, b: float(np.mean(np.abs(G[a][mask] - G[b][mask])))
        info["step_l1"] = float(np.mean([l1(k, k + 1) for k in range(n - 1)])) or 1.0
        info["gap_l1"] = max(l1(j, i), l1(j - 1, i - 1))
    ys, xs = np.nonzero(mask)
    info["bbox"] = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1, mask.shape[1], mask.shape[0])
    return i, j, info


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("clip")
    p.add_argument("name")
    p.add_argument("--size", type=int, default=1000, help="width and height in px (default 1000)")
    p.add_argument("--fps", type=int, default=12)
    p.add_argument("--crf", type=int, default=28, help="quality: lower = sharper and bigger (default 28)")
    p.add_argument("--min", type=float, default=4.0, help="shortest loop in seconds")
    p.add_argument("--max", type=float, default=8.0, help="longest loop in seconds")
    p.add_argument("--blend", type=int, default=3, help="frames blended at the restart (0 = none)")
    p.add_argument("--no-loop-search", action="store_true", help="use the whole clip as it is")
    p.add_argument("--pingpong", action="store_true",
                   help="play the loop forward then backward: can never jump (the file is about twice as big)")
    p.add_argument("--sharpen", type=float, default=0.6, help="edge sharpening, 0 = off (default 0.6)")
    p.add_argument("--start", type=float, default=0.0, help="only use the clip from this second (skip a bad start)")
    p.add_argument("--end", type=float, default=0.0, help="only use the clip up to this second (skip a bad end)")
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
    if args.start or args.end:
        a = int(args.start * args.fps)
        b = int(args.end * args.fps) if args.end else len(names)
        names = names[a:b]
        print(f"    using only {args.start:g}s to {(b / args.fps):g}s of the clip ({len(names)} frames)")
    if len(names) < 12:
        sys.exit("The clip is too short.")

    first = Image.open(os.path.join(raw_dir, names[0]))
    side = first.size[1]  # the square is as tall as the frame
    size = args.size
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
    small = [np.asarray(Image.fromarray(f).convert("L").resize((192, 192), Image.BILINEAR)).astype(np.float32) for f in frames]
    info = None
    if args.no_loop_search:
        start, end = 0, len(frames)
    else:
        start, end, info = find_loop(small, args.fps, args.min, args.max, blend=args.blend, pingpong=args.pingpong)
    print(f"    using frames {start}-{end} ({(end - start) / args.fps:.1f} s{', then backwards' if args.pingpong else ''})")
    if info and "gap_l1" in info:
        ratio = info["gap_l1"] / info["step_l1"]
        verdict = ("smooth" if ratio <= 1.1 else "slightly visible: look at seam.png, and try --pingpong if the hand jumps"
                   if ratio <= 1.6 else "VISIBLE: use --pingpong, or make a new clip")
        print(f"    restart check: a normal frame-to-frame change is {info['step_l1']:.1f}; "
              f"at the restart it is {info['gap_l1']:.1f} ({ratio:.1f}x) -> {verdict}")
        print("    (a rough guide: also look at seam.png in the loop's work folder)")
    elif info and "edge_speed" in info:
        ratio = info["edge_speed"] / info["typical"]
        print(f"    turn-around check: the moving part is at {ratio:.1f}x its normal speed where the loop turns around "
              f"-> {'smooth' if ratio <= 0.6 else 'a little abrupt'}")

    pre = 0 if args.pingpong else min(args.blend, start)  # frames before the start, used to blend the restart
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

    if args.pingpong:
        seg = seg + seg[-2:0:-1]  # forward, then back (without repeating the two turning frames)

    # seam.png: the last frames of the loop and the first ones, exactly as a viewer sees them
    cream = (248, 240, 224, 255)
    if info and "bbox" in info and len(seg) >= 8:
        x0, y0, x1, y1, bw, bh = info["bbox"]
        sc = size / bw
        pad = 12
        box = (max(int(x0 * sc) - pad, 0), max(int(y0 * sc) - pad, 0), min(int(x1 * sc) + pad, size), min(int(y1 * sc) + pad, size))
        if (box[2] - box[0]) * (box[3] - box[1]) > 0.7 * size * size:
            box = (0, 0, size, size)
        cut = len(seg) // 2 if args.pingpong else len(seg)       # where the loop turns around or restarts
        pick = list(range(cut - 4, cut)) + list(range(cut, cut + 4)) if args.pingpong else list(range(len(seg) - 4, len(seg))) + [0, 1, 2, 3]
        tiles = []
        for t in pick:
            colour, alpha = seg[t]
            rgba = np.dstack([colour, alpha * 255]).clip(0, 255).astype(np.uint8)
            comp = Image.alpha_composite(Image.new("RGBA", (size, size), cream), Image.fromarray(rgba, "RGBA")).convert("RGB").crop(box)
            th = 260
            tiles.append(comp.resize((max(int(comp.width * th / comp.height), 1), th), Image.LANCZOS))
        labels = (["turn-3", "turn-2", "turn-1", "turn", "back+1", "back+2", "back+3", "back+4"] if args.pingpong
                  else ["last-3", "last-2", "last-1", "last", "first", "first+1", "first+2", "first+3"])
        gap_px = 14
        sheet = Image.new("RGB", (sum(t.width for t in tiles) + gap_px * 9, 260 + 30), (255, 255, 255))
        x = gap_px // 2
        d = ImageDraw.Draw(sheet)
        for k, t in enumerate(tiles):
            sheet.paste(t, (x, 30))
            d.text((x + 2, 8), labels[k], fill=(0, 0, 0))
            x += t.width + gap_px
            if k == 3:
                d.rectangle((x - gap_px // 2 - 2, 0, x - gap_px // 2 + 2, sheet.height), fill=(220, 30, 30))
        sheet.save(os.path.join(work, "seam.png"))
        print(f"    seam.png: the last 4 and first 4 frames around the restart (red line = the restart)")

    print("5/6 encoding...")
    for i, (colour, alpha) in enumerate(seg):
        colour = extend_colours(colour, alpha)
        if args.sharpen > 0:
            sharp = Image.fromarray(colour.clip(0, 255).astype(np.uint8)).filter(
                ImageFilter.UnsharpMask(radius=1.3, percent=int(130 * args.sharpen), threshold=2))
            colour = np.asarray(sharp).astype(np.float32)
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
    print(f"\n{video}  {v_kb:.0f} KB   {'(over the 500 KB budget: try --crf 32 or --size 800)' if v_kb > 500 else 'ok'}")
    print(f"Look at {os.path.join(work, 'preview.png')} before using it (green edges? jumps?).")


if __name__ == "__main__":
    main()
