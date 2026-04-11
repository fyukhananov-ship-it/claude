"""Lightweight Redis/Valkey cache helper."""
import json
import functools
from typing import Any, Callable, Optional

import redis.asyncio as aioredis

from app.config import settings

_redis: Optional[aioredis.Redis] = None


def get_redis() -> aioredis.Redis:
    """Lazy-initialized Redis/Valkey client."""
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
            health_check_interval=30,
        )
    return _redis


async def cache_get(key: str) -> Optional[Any]:
    if not settings.CACHE_ENABLED:
        return None
    try:
        raw = await get_redis().get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> None:
    if not settings.CACHE_ENABLED:
        return
    try:
        await get_redis().set(
            key,
            json.dumps(value, default=str),
            ex=ttl or settings.CACHE_TTL_SECONDS,
        )
    except Exception:
        pass


async def cache_delete(*keys: str) -> None:
    if not settings.CACHE_ENABLED or not keys:
        return
    try:
        await get_redis().delete(*keys)
    except Exception:
        pass


async def cache_delete_pattern(pattern: str) -> None:
    """Delete all keys matching a pattern (e.g. 'offers:*')."""
    if not settings.CACHE_ENABLED:
        return
    try:
        client = get_redis()
        async for key in client.scan_iter(match=pattern, count=100):
            await client.delete(key)
    except Exception:
        pass


def cached(key_builder: Callable[..., str], ttl: Optional[int] = None):
    """Decorator that caches the JSON-serializable result of an async function.

    Usage:
        @cached(lambda phone_hash: f"client:{phone_hash}:offers", ttl=60)
        async def list_offers(phone_hash: str): ...
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            key = key_builder(*args, **kwargs)
            cached_value = await cache_get(key)
            if cached_value is not None:
                return cached_value
            result = await func(*args, **kwargs)
            await cache_set(key, result, ttl=ttl)
            return result
        return wrapper
    return decorator
