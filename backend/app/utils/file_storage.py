"""Simple local file storage for MVP."""
import os
import uuid
from pathlib import Path

import aiofiles

from app.config import settings

UPLOAD_DIR = Path(settings.UPLOAD_DIR)


async def save_upload(content: bytes, original_filename: str, subdir: str = "") -> str:
    """Save uploaded file and return relative path."""
    target_dir = UPLOAD_DIR / subdir
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(original_filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    filepath = target_dir / filename

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    return str(filepath)
