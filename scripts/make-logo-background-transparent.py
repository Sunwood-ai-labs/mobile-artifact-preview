#!/usr/bin/env python3
"""Make generated logo assets usable as transparent PNG app/theme icons."""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "docs/images/mobile-artifact-preview-logo.png",
    ROOT / "docs/images/nextcloud-custom-logo.png",
    ROOT / "docs/images/nextcloud-custom-favicon.png",
]
PREVIEW = ROOT / "docs/images/nextcloud-custom-logo-transparent-preview.png"


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return 1.0 if value >= edge1 else 0.0
    t = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)


def transparentize(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            max_channel = max(r, g, b)
            min_channel = min(r, g, b)
            saturation = max_channel - min_channel

            # Generated backgrounds are almost-black navy. Use brightness as
            # the main matte and saturation as a small guard for colored glows.
            matte = smoothstep(12, 86, max_channel)
            glow_guard = smoothstep(20, 95, saturation)
            alpha = max(matte, glow_guard * 0.72)

            # Keep bright rim-light pixels crisp, fade only the dark field.
            if max_channel >= 120:
                alpha = 1.0

            pixels[x, y] = (r, g, b, int(round(alpha * 255)))

    image.save(path)


def make_checker_preview(source: Path, output: Path) -> None:
    image = Image.open(source).convert("RGBA")
    tile = 32
    light = (232, 238, 246, 255)
    dark = (120, 134, 154, 255)
    board = Image.new("RGBA", image.size)
    pixels = board.load()
    for y in range(image.height):
        for x in range(image.width):
            pixels[x, y] = light if ((x // tile) + (y // tile)) % 2 == 0 else dark
    board.alpha_composite(image)
    board.save(output)


def main() -> None:
    for target in TARGETS:
        transparentize(target)
    make_checker_preview(ROOT / "docs/images/nextcloud-custom-logo.png", PREVIEW)


if __name__ == "__main__":
    main()
