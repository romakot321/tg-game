import logging
import sys
from os import getenv
import asyncio

from aiohttp.web import run_app
from aiohttp.web_app import Application

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums.parse_mode import ParseMode
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.types import Message
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

TOKEN = getenv("BOT_TOKEN")

ikb_donate = InlineKeyboardMarkup(
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


async def main():
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dispatcher = Dispatcher()

    @dispatcher.message(CommandStart())
    async def cmd_start_help(message: Message):
        await message.answer(
            "Это сообщение со справкой",
            reply_markup=ikb_donate
        )

    dispatcher.startup.register(on_startup)
    
    await bot.delete_webhook()
    print("Bot started")
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
