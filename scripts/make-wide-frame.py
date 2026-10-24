#!/usr/bin/env python3
"""Put a square green-screen still on a 16:9 green frame, ready to upload to Gemini.

Gemini only makes 16:9 (or 9:16) video. A square picture gets cropped to fit, which
cuts off heads and feet. This puts your square still in the middle of a 1920 x 1080
frame (1080 x 1080 picture, flat green on both sides), so nothing is cropped.
It also paints out Gemini's little corner sparkle and flattens the noise in the green.

Usage:
  python3 scripts/make-wide-frame.py work/source-v2/speaker.png
  python3 scripts/make-wide-frame.py work/source-v2/speaker.png --out work/frames/speaker-16x9.png

Needs: python3 and  pip3 install pillow numpy
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("still", help="the square green-screen PNG")
    p.add_argument("--out", help="where to save (default: work/frames/<name>-16x9.png)")
    args = p.parse_args()

    if not os.path.isfile(args.still):
        sys.exit(f"File not found: {args.still}")
    im = Image.open(args.still).convert("RGB")
    w, h = im.size
    if w != h:
        sys.exit(f"The still must be square, but it is {w} x {h}. Export it from Figma as a square PNG.")

    a = np.asarray(im).astype(np.int16)
    bg = np.median(a[:30].reshape(-1, 3), axis=0).astype(np.int16)
    if bg[1] - max(bg[0], bg[2]) < 120:
        sys.exit(f"The top edge isn't green screen (colour {bg.tolist()}). Is this the green-screen version?")

    # 1. paint out the sparkle, only if that corner holds nothing but green and the star
    y0, y1, x0, x1 = int(h * 0.85), int(h * 0.92), int(w * 0.85), int(w * 0.92)
    win = a[y0:y1, x0:x1]
    r, g, b = win[..., 0], win[..., 1], win[..., 2]
    is_bg = np.abs(win - bg).sum(axis=2) < 60
    is_star = (np.maximum(r, b) > 22) & (g > 200) & ((g - np.maximum(r, b)) > 50)
    leftovers = int((~(is_bg | is_star)).sum())
    if leftovers == 0:
        if int(is_star.sum()) > 0:
            print("sparkle found and painted out")
        a[y0:y1, x0:x1] = bg
    else:
        print(f"note: the bottom-right corner has {leftovers} pixels of artwork, so I left it alone. "
              "If a sparkle shows there, paint it out in Figma first.")

    # 2. flatten the faint noise in the green so the background is one exact colour
    dist = np.abs(a - bg).sum(axis=2)
    a[dist < 24] = bg

    # 3. 1080 x 1080 in the middle of a 1920 x 1080 canvas
    square = Image.fromarray(a.astype(np.uint8)).resize((1080, 1080), Image.LANCZOS)
    canvas = Image.new("RGB", (1920, 1080), tuple(int(v) for v in bg))
    canvas.paste(square, (420, 0))

    name = os.path.splitext(os.path.basename(args.still))[0]
    out = args.out or os.path.join("work", "frames", f"{name}-16x9.png")
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    canvas.save(out)
    print(f"saved {out}  (1920 x 1080, green {bg.tolist()})")
    print("Upload this file to Gemini, not the square one.")


if __name__ == "__main__":
    main()
