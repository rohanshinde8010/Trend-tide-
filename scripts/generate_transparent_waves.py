import numpy as np
from PIL import Image

im = Image.open('client/public/bg-wave.png').convert('RGBA')
arr = np.array(im, dtype=np.float32)

rgb = arr[:, :, :3]
# corners estimate
corners = [rgb[:20, :20], rgb[:20, -20:], rgb[-20:, :20], rgb[-20:, -20:]]
bg_est = np.mean([c.mean(axis=(0, 1)) for c in corners], axis=0)

diff = np.maximum(0, rgb - bg_est)
diff_mag = np.linalg.norm(diff, axis=-1)
max_val = np.percentile(diff_mag, 99.5)
norm_signal = np.clip(diff_mag / max_val, 0, 1)

# Generate Option 1: Slate-blue / violet wave lines on transparent background
# For light/grayish theme (#EAEFF4):
out1 = np.zeros_like(arr)
# Slate 700 / violet tint: R=51, G=65, B=85
out1[:, :, 0] = 71
out1[:, :, 1] = 85
out1[:, :, 2] = 105
# Alpha proportional to signal power curve
out1[:, :, 3] = (norm_signal ** 0.85) * 230
img_light = Image.fromarray(out1.astype(np.uint8), mode='RGBA')
img_light.save('client/public/bg-wave-slate.png')
print("Saved client/public/bg-wave-slate.png")

# Generate Option 2: Gemstone chromatic tinted wave lines on transparent background
# Using the original RGB colors amplified onto transparent background
out2 = np.zeros_like(arr)
out2[:, :, :3] = np.clip(diff * 1.5, 0, 255)
out2[:, :, 3] = (norm_signal ** 0.8) * 240
img_gem = Image.fromarray(out2.astype(np.uint8), mode='RGBA')
img_gem.save('client/public/bg-wave-glow.png')
print("Saved client/public/bg-wave-glow.png")

