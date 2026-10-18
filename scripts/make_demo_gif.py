import os
from PIL import Image

assets_dir = '/Users/ath1614/Dadi-s-Dawai-Diary/BakeCraft-AI/docs/assets'
frame_names = [
    'bakecraft_studio_loaded.png',
    'brioche_buns_loaded.png',
    'celebration_cake_loaded.png',
    'luxe_macarons_loaded.png',
    'sourdough_scaled_3x.png',
    'fda_label_and_social.png',
    'toast_and_social.png'
]

frames = []
target_width = 1000

for name in frame_names:
    p = os.path.join(assets_dir, name)
    if os.path.exists(p):
        img = Image.open(p).convert('RGBA')
        w, h = img.size
        target_height = int((h / w) * target_width)
        img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        # convert to RGB with white background
        bg = Image.new('RGB', (target_width, target_height), (255, 255, 255))
        bg.paste(img_resized, mask=img_resized.split()[3])
        frames.append(bg)

if frames:
    out_path = os.path.join(assets_dir, 'bakecraft_demo.gif')
    # 1.8s per slide
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=1800,
        loop=0,
        optimize=True
    )
    print(f"Successfully saved {out_path} ({os.path.getsize(out_path)} bytes)")
