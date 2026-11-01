import os
from PIL import Image
import numpy as np

# Check all images in client/public
files = [f for f in os.listdir('client/public') if f.endswith(('.png', '.jpg', '.svg'))]
print("Files in client/public:", files)

# Let's inspect bg-wave.png, bg-constellation.jpg, bg-stars.png, trendtide-logo.jpg
for fname in files:
    if fname.endswith(('.png', '.jpg')):
        p = os.path.join('client/public', fname)
        im = Image.open(p)
        print(f"\n{fname}: size={im.size}, mode={im.mode}")

