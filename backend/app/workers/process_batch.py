"""ARQ worker for batch processing."""
from arq.connections import RedisSettings

from app.config import settings
from app.services.batch_processor import process_batch


async def process_batch_task(ctx: dict, batch_id: str) -> dict:
    return await process_batch(batch_id)


class WorkerSettings:
    functions = [process_batch_task]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
