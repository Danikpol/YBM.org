import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Ваш токен бота
BOT_TOKEN = "YOUR_BOT_TOKEN"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start"""
    await update.message.reply_text(
        "👋 Привет! Я бот для приема заявок с сайта МБД.\n\n"
        "Заявки будут приходить сюда автоматически."
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /help"""
    await update.message.reply_text(
        "📋 Справка:\n\n"
        "Этот бот автоматически получает заявки с сайта МБД.\n"
        "Никаких дополнительных команд не требуется."
    )

def main() -> None:
    """Запуск бота"""
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))

    print("🤖 Бот для приема заявок с сайта МБД запущен...")
    application.run_polling()

if __name__ == "__main__":
    main()
