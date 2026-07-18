"""Content-based image validation.

Uploaded bytes are checked against real JPEG/PNG magic numbers before they
are ever handed to PIL/torch — image decoders are a known attack surface,
so we refuse to parse anything that isn't provably one of the two formats
the model was trained on.
"""

JPEG_MAGIC = b"\xff\xd8\xff"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def sniff_image_format(data: bytes) -> str | None:
    """Return 'jpeg' or 'png' if the bytes start with a real image
    signature, else None."""
    if data.startswith(JPEG_MAGIC):
        return "jpeg"
    if data.startswith(PNG_MAGIC):
        return "png"
    return None
