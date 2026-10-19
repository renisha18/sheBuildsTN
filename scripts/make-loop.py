#!/usr/bin/env python3
"""Turn a green-screen clip into a small, transparent, seamlessly looping WebM.

Usage:
  python3 scripts/make-loop.py work/clips/builder.mp4 builder
  python3 scripts/make-loop.py work/clips/mentor.mp4 mentor --crf 32 --size 800

Writes:
  public/character/<name>-loop.webm    transparent loop (VP9 with alpha), no audio
  work/loops/<name>/preview.png        check this: frames on cream and on magenta

Needs: ffmpeg (brew install ffmpeg), python3, and  pip3 install pillow numpy

What it does
  1. Pulls frames at 12 fps (with light denoising, AI video is noisy).
  2. Crops the middle square of the 16:9 frame (the character is in the middle).
  3. Removes the green background (difference matte plus spill removal).
  4. Finds the best loop point inside the clip, so the restart doesn't jump.
  5. Encodes a transparent WebM and writes a preview.
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"Command failed: {' '.join(cmd)}\n{result.stderr}")
    return result


def key_frame(img):
    """Green background -> transparent. Returns an RGBA image."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    # background colour from the top and left edges of the square
    strip = np.concatenate([a[:12].reshape(-1, 3), a[:, :12].reshape(-1, 3)])
    bg = np.median(strip, axis=0)
    bg_excess = bg[1] - max(bg[0], bg[2])
    if bg_excess < 60:
        sys.exit(
            f"The background doesn't look like green screen (edge colour {bg.round().tolist()}). "
            "Is the character in the middle square with flat green around it?"
        )
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # how much "green-ness" each pixel has, compared with the background
    alpha = 1 - np.clip((g - np.maximum(r, b)) / bg_excess, 0, 1)
    alpha = np.where(alpha > 0.96, 1.0, np.where(alpha < 0.04, 0.0, alpha))
    # take the green out of edge pixels
    fg = np.clip((a - (1 - alpha)[..., None] * bg) / np.maximum(alpha, 1e-3)[..., None], 0, 255)
    fg[..., 1] = np.minimum(fg[..., 1], (fg[..., 0] + fg[..., 2]) / 2 + 4)
    # firmer edges keep the video small and stable from frame to frame
    alpha255 = np.clip((alpha * 255 - 100) / 55.0, 0, 1) * 255
    rgba = np.dstack([fg, alpha255]).astype(np.uint8)
    rgba[alpha255 < 8, :3] = 0  # no colour data under transparent pixels (saves a lot of bytes)
    return Image.fromarray(rgba, "RGBA")


def find_loop(frames, fps, min_s, max_s):
    """Pick start/end frames whose pictures match best. Returns (start, end, mse)."""
    small = []
    for im in frames:
        white = Image.new("RGBA", im.size, (255, 255, 255, 255))
        small.append(
            np.asarray(Image.alpha_composite(white, im).convert("L").resize((96, 96), Image.BILINEAR)).astype(np.float32)
        )
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
    p.add_argument("--size", type=int, default=720, help="output width and height in px (default 720)")
    p.add_argument("--fps", type=int, default=12)
    p.add_argument("--crf", type=int, default=34, help="quality: lower = better and bigger (default 34)")
    p.add_argument("--min", type=float, default=4.0, help="shortest loop in seconds")
    p.add_argument("--max", type=float, default=8.0, help="longest loop in seconds")
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

    print("1/5 extracting frames...")
    run(["ffmpeg", "-v", "error", "-y", "-i", args.clip, "-an",
         "-vf", f"fps={args.fps},hqdn3d=8:6:12:9", os.path.join(raw_dir, "f_%04d.png")])
    raw = sorted(os.listdir(raw_dir))
    if len(raw) < 12:
        sys.exit("The clip is too short.")

    print(f"2/5 removing the green from {len(raw)} frames...")
    frames = []
    for name in raw:
        im = Image.open(os.path.join(raw_dir, name))
        w, h = im.size
        left = (w - h) // 2
        square = im.crop((left, 0, left + h, h)) if w != h else im
        frames.append(key_frame(square).resize((args.size, args.size), Image.LANCZOS))

    if args.no_loop_search:
        start, end, mse = 0, len(frames), None
    else:
        print("3/5 looking for the best loop point...")
        start, end, mse = find_loop(frames, args.fps, args.min, args.max)
    seg = frames[start:end]
    note = f"match score {mse:.0f}" if mse is not None else "whole clip"
    print(f"    using frames {start}-{end} ({len(seg) / args.fps:.1f} s, {note}).")
    if mse is not None and mse > 150:
        print("    warning: no close match found, so the restart may show a small jump.")

    print("4/5 encoding...")
    for i, im in enumerate(seg):
        im.save(os.path.join(key_dir, f"k_{i + 1:04d}.png"))
    video = os.path.join(args.out, f"{args.name}-loop.webm")
    run(["ffmpeg", "-v", "error", "-y", "-framerate", str(args.fps),
         "-i", os.path.join(key_dir, "k_%04d.png"),
         "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", str(args.crf),
         "-auto-alt-ref", "0", "-row-mt", "1", "-an", video])

    print("5/5 checking the result...")
    check = os.path.join(work, "decoded.png")
    run(["ffmpeg", "-v", "error", "-y", "-c:v", "libvpx-vp9", "-i", video, "-frames:v", "1", check])
    dec = Image.open(check).convert("RGBA")
    corner_alpha = dec.getpixel((2, 2))[3]
    if corner_alpha != 0:
        sys.exit("The video came out without transparency. Check your ffmpeg has libvpx-vp9.")

    # preview: a few frames on cream, and the first frame on magenta (shows any green left over)
    picks = [0, len(seg) // 3, 2 * len(seg) // 3]
    tile = 360
    sheet = Image.new("RGB", (tile * 4, tile), (248, 240, 224))
    for k, idx in enumerate(picks):
        bg = Image.new("RGBA", seg[idx].size, (248, 240, 224, 255))
        sheet.paste(Image.alpha_composite(bg, seg[idx]).convert("RGB").resize((tile, tile), Image.LANCZOS), (k * tile, 0))
    mag = Image.new("RGBA", seg[0].size, (255, 0, 255, 255))
    sheet.paste(Image.alpha_composite(mag, seg[0]).convert("RGB").resize((tile, tile), Image.LANCZOS), (3 * tile, 0))
    sheet.save(os.path.join(work, "preview.png"))

    v_kb = os.path.getsize(video) / 1024
    print(f"\n{video}  {v_kb:.0f} KB   {'(over the 450 KB budget: try --crf 38 or --size 640)' if v_kb > 450 else 'ok'}")
    print(f"Look at {os.path.join(work, 'preview.png')} before using it (green edges? jumps?).")


if __name__ == "__main__":
    main()
