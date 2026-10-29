"""Trim the empty bottom of a rendered PDF page, keeping a margin: python3 croppdf.py page.png"""
import sys

from PIL import Image, ImageChops

path = sys.argv[1]
im = Image.open(path).convert("RGB")
diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L").point(lambda p: 255 if p > 12 else 0)
box = diff.getbbox()
if box:
    margin = int(im.width * 0.05)
    im.crop((0, 0, im.width, min(im.height, box[3] + margin))).save(path)
