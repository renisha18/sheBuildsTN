#!/usr/bin/env python3
"""Get a Gemini-edited green-screen still ready for process-frames.mjs.

Gemini image edits come back at 1024 x 1024, but process-frames.mjs wants 2048 x 2048,
and Gemini leaves a little sparkle in the bottom-right corner. This:
  1. saves your original in work/backup/
  2. resizes the still to 2048 x 2048 (high-quality Lanczos)
  3. paints out the sparkle, only if that corner holds nothing but green and the star

Usage:
  python3 scripts/prep-still.py work/source-v2/speaker.png

Needs: python3 and  pip3 install pillow numpy
"""
import argparse
import os
import shutil
import sys

import numpy as np
from PIL import Image

SIZE = 2048


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("still", help="the square green-screen PNG to prepare (it is replaced in place)")
    args = p.parse_args()

    if not os.path.isfile(args.still):
        sys.exit(f"File not found: {args.still}")
    im = Image.open(args.still).convert("RGB")
    w, h = im.size
    if w != h:
        sys.exit(f"The still must be square, but it is {w} x {h}.")

    a = np.asarray(im)
    bg = np.median(a[:30].reshape(-1, 3), axis=0).astype(np.int16)
    if bg[1] - max(bg[0], bg[2]) < 120:
        sys.exit(f"The top edge isn't green screen (colour {bg.tolist()}). Is this the green-screen version?")

    backup_dir = os.path.join("work", "backup")
    os.makedirs(backup_dir, exist_ok=True)
    name = os.path.splitext(os.path.basename(args.still))[0]
    backup = os.path.join(backup_dir, f"{name}-original-{w}.png")
    already = [f for f in os.listdir(backup_dir) if f.startswith(f"{name}-original-")]
    if not already:  # keep only the very first original
        shutil.copy2(args.still, backup)
        print(f"original saved as {backup}")

    if w != SIZE:
        im = im.resize((SIZE, SIZE), Image.LANCZOS)
        print(f"resized {w} x {h} -> {SIZE} x {SIZE}")
    else:
        print(f"already {SIZE} x {SIZE}")

    a = np.asarray(im).astype(np.int16)
    y0, y1, x0, x1 = int(SIZE * 0.85), int(SIZE * 0.92), int(SIZE * 0.85), int(SIZE * 0.92)
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
        print(f"note: the bottom-right corner has {leftovers} pixels of artwork, so I left it alone.")

    Image.fromarray(a.astype(np.uint8)).save(args.still)
    print(f"saved {args.still}  ({SIZE} x {SIZE})")


if __name__ == "__main__":
    main()
