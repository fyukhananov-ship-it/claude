"""File storage abstraction — supports local disk and S3 (Yandex Object Storage)."""
import asyncio
import uuid
from pathlib import Path
from typing import Optional

import aiofiles
import boto3
from botocore.client import Config as BotoConfig

from app.config import settings


def _build_public_url(key: str) -> str:
    """Construct a public URL for an S3 object."""
    if settings.S3_PUBLIC_BASE_URL:
        base = settings.S3_PUBLIC_BASE_URL.rstrip("/")
        return f"{base}/{key}"
    # Fallback: virtual-hosted style against Yandex endpoint
    bucket = settings.S3_BUCKET_UPLOADS
    return f"https://{bucket}.storage.yandexcloud.net/{key}"


# Lazy boto3 client — created on first use, reused across requests
_s3_client = None


def _get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            region_name=settings.S3_REGION,
            aws_access_key_id=settings.YC_ACCESS_KEY,
            aws_secret_access_key=settings.YC_SECRET_KEY,
            config=BotoConfig(signature_version="s3v4", s3={"addressing_style": "virtual"}),
        )
    return _s3_client


async def _save_s3(content: bytes, original_filename: str, subdir: str, content_type: Optional[str]) -> str:
    """Upload bytes to S3 and return public URL."""
    ext = Path(original_filename).suffix.lower() or ".jpg"
    key_parts = [p for p in (subdir, f"{uuid.uuid4().hex}{ext}") if p]
    key = "/".join(key_parts)

    client = _get_s3_client()

    def _put():
        extra = {"ACL": "public-read"}
        if content_type:
            extra["ContentType"] = content_type
        # Public-read so CDN/Browser can fetch directly
        client.put_object(
            Bucket=settings.S3_BUCKET_UPLOADS,
            Key=key,
            Body=content,
            **extra,
        )

    # boto3 is sync — run in thread pool so we don't block the event loop
    await asyncio.to_thread(_put)
    return _build_public_url(key)


async def _save_local(content: bytes, original_filename: str, subdir: str) -> str:
    """Save to local disk and return relative path."""
    upload_dir = Path(settings.UPLOAD_DIR)
    target_dir = upload_dir / subdir if subdir else upload_dir
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(original_filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = target_dir / filename

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    # Return URL relative to FastAPI static mount at /uploads
    rel = str(filepath).replace("\\", "/")
    if rel.startswith(f"{settings.UPLOAD_DIR}/"):
        return "/" + rel  # e.g. /uploads/offers/xxx.jpg
    return str(filepath)


async def save_upload(
    content: bytes,
    original_filename: str,
    subdir: str = "",
    content_type: Optional[str] = None,
) -> str:
    """Save uploaded bytes and return a URL (S3) or path (local)."""
    if settings.STORAGE_BACKEND == "s3":
        return await _save_s3(content, original_filename, subdir, content_type)
    return await _save_local(content, original_filename, subdir)
