import asyncpg
import asyncio
from os import getenv

DB_HOST = getenv("DB_HOST", "localhost")
connection_pool = None


async def init_tables():
    if connection_pool is None:
        raise ValueError("Connect to db first")
    async with connection_pool.acquire() as connection:
        await connection.execute('''
            CREATE TABLE IF NOT EXISTS users (
            id serial PRIMARY KEY,
            telegram_id int unique,
            score int
            );
        ''')


async def new_user(telegram_id: int):
    if connection_pool is None:
        raise ValueError("Connect to db first")
    async with connection_pool.acquire() as connection:
        try:
            await connection.execute("""
                INSERT INTO users(telegram_id, score) VALUES ($1, 0)
            """, telegram_id)
        except asyncpg.exceptions.UniqueViolationError:
            pass


async def get_user(telegram_id: int) -> dict:
    async with connection_pool.acquire() as connection:
        result = await connection.fetchrow("""
            SELECT * FROM users WHERE telegram_id=$1
        """, telegram_id)
    return dict(result)


async def update_user_score(telegram_id: int, score: int):
    if connection_pool is None:
        raise ValueError("Connect to db first")
    async with connection_pool.acquire() as connection:
        await connection.execute("""
            UPDATE users SET score=$1 WHERE telegram_id=$2
        """, score, telegram_id)


async def _connect():
    for i in range(5):
        try:
            return await asyncpg.create_pool(user="postgres", password="postgres", host=DB_HOST, database="app")
        except asyncpg.InvalidCatalogNameError:
            sys_conn = await asyncpg.connect(
                database='template1',
                user='postgres',
                password="postgres",
                host=DB_HOST
            )
            await sys_conn.execute(
                f'CREATE DATABASE "app" OWNER "postgres"'
            )
            await sys_conn.close()
            continue
        except Exception as e:
            logger.error(e)
            logger.info('Retry in 5 seconds...')
            await asyncio.sleep(5)


async def init_db():
    global connection_pool
    connection_pool = await _connect()
    if connection_pool is None:
        raise ValueError("Unable connect to database.")
    await init_tables()


async def close_db():
    await connection_pool.close()


asyncio.run(init_db())
