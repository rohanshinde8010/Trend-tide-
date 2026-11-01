import numpy as np
from PIL import Image

# Process bg-constellation.jpg
im_const = Image.open('client/public/bg-constellation.jpg').convert('RGB')
arr_const = np.array(im_const, dtype=np.float32)

# Corners estimate
corners = [arr_const[:20, :20], arr_const[:20, -20:], arr_const[-20:, :20], arr_const[-20:, -20:]]
bg_const_est = np.mean([c.mean(axis=(0, 1)) for c in corners], axis=0)

diff_const = np.maximum(0, arr_const - bg_const_est)
mag_const = np.linalg.norm(diff_const, axis=-1)
norm_const = np.clip(mag_const / np.percentile(mag_const, 99.5), 0, 1)

# Slate constellation on transparent
out_const = np.zeros((arr_const.shape[0], arr_const.shape[1], 4), dtype=np.uint8)
out_const[:, :, 0] = 71
out_const[:, :, 1] = 85
out_const[:, :, 2] = 105
out_const[:, :, 3] = ((norm_const ** 0.8) * 230).astype(np.uint8)

img_const_out = Image.fromarray(out_const, mode='RGBA')
img_const_out.save('client/public/bg-constellation-slate.png')
print("Saved client/public/bg-constellation-slate.png")

