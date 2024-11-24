import sys
import asyncio
from os import getenv
from loguru import logger
from contextlib import asynccontextmanager

from fastapi import FastAPI

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums.parse_mode import ParseMode
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.types import Message
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

from db import init_db, new_user, close_db
from router import router

TOKEN = getenv("BOT_TOKEN")

markup = InlineKeyboardMarkup(
    row_width=1,
    inline_keyboard=[
        [
            InlineKeyboardButton(text='Start', web_app=WebAppInfo(url='https://eramir.ru/game'))
        ]
    ]
)


async def on_startup(bot: Bot):
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Open Menu", web_app=WebAppInfo(url=f"https://eramir.ru/game"))
    )
    await init_db()


async def on_shutdown(bot: Bot):
    await close_db()


async def init_bot():
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dispatcher = Dispatcher()

    @dispatcher.message(CommandStart())
    async def cmd_start_help(message: Message):
        logger.info(f"User telegram_id={message.from_user.id} start")
        await new_user(message.from_user.id)
        await message.answer(
            "Нажми на кнопку чтобы начать игру",
            reply_markup=markup
        )

    dispatcher.startup.register(on_startup)
    dispatcher.shutdown.register(on_shutdown)
    
    await bot.delete_webhook()
    logger.info("Bot started")
    asyncio.create_task(dispatcher.start_polling(bot))


@asynccontextmanager
async def lifespan(app):
    await init_bot()
    yield


def main():
    app = FastAPI(lifespan=lifespan)
    app.include_router(router)
    return app
    

fastapi_app = main()
