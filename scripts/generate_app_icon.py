#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import shutil
import subprocess
import tempfile
import uuid

root = Path.cwd()
resources = root / "Resources"
svg = resources / "AppIcon.svg"
iconset = resources / "AppIcon.iconset"

with tempfile.TemporaryDirectory(prefix=f"zipax-icon-{uuid.uuid4()}-") as tmp:
    tmp_path = Path(tmp)
    subprocess.run(
        ["/usr/bin/qlmanage", "-t", "-s", "1024", "-o", str(tmp_path), str(svg)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    rendered = tmp_path / f"{svg.name}.png"
    image = Image.open(rendered).convert("RGB")

    pixels = image.load()
    width, height = image.size
    bounds = [width, height, 0, 0]
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            if not (r > 245 and g > 245 and b > 245):
                bounds[0] = min(bounds[0], x)
                bounds[1] = min(bounds[1], y)
                bounds[2] = max(bounds[2], x)
                bounds[3] = max(bounds[3], y)

    if bounds[0] > bounds[2] or bounds[1] > bounds[3]:
        cropped = image
    else:
        padding = 0
        left = max(0, bounds[0] - padding)
        top = max(0, bounds[1] - padding)
        right = min(width, bounds[2] + padding + 1)
        bottom = min(height, bounds[3] + padding + 1)
        cropped = image.crop((left, top, right, bottom))

    if iconset.exists():
        shutil.rmtree(iconset)
    iconset.mkdir(parents=True)

    outputs = [
        (16, "icon_16x16.png"),
        (32, "icon_16x16@2x.png"),
        (32, "icon_32x32.png"),
        (64, "icon_32x32@2x.png"),
        (128, "icon_128x128.png"),
        (256, "icon_128x128@2x.png"),
        (256, "icon_256x256.png"),
        (512, "icon_256x256@2x.png"),
        (512, "icon_512x512.png"),
        (1024, "icon_512x512@2x.png"),
    ]

    for size, name in outputs:
        cropped.resize((size, size), Image.Resampling.LANCZOS).save(iconset / name)

    cropped.resize((1024, 1024), Image.Resampling.LANCZOS).save(resources / "AppIcon-preview.png")
