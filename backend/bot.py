import os
import asyncio
import httpx
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    filters, ContextTypes, ConversationHandler
)
from dotenv import load_dotenv
load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
print(f"Token loaded: {TOKEN[:10] if TOKEN else 'NONE'}")
API_URL = os.getenv("API_URL", "http://localhost:8000")

# Conversation states
USERNAME, PASSWORD, MAIN_MENU, ADD_NAME, ADD_TYPE, ADD_RATING, DELETE_ITEM = range(7)

# Store tokens per telegram user
user_tokens = {}
user_state = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Welcome to Completed Diary Bot!\n\nPlease enter your username:"
    )
    return USERNAME

async def get_username(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["username"] = update.message.text
    await update.message.reply_text("Now enter your password:")
    return PASSWORD

async def get_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    username = context.user_data["username"]
    password = update.message.text
    telegram_id = str(update.effective_user.id)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_URL}/auth/login",
            json={"username": username, "password": password}
        )

    if response.status_code != 200:
        await update.message.reply_text("❌ Invalid username or password. Try /start again.")
        return ConversationHandler.END

    data = response.json()
    token = data["access_token"]
    user_tokens[telegram_id] = token

    # Save telegram_id to user account
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{API_URL}/auth/link-telegram",
            json={"telegram_id": telegram_id},
            headers={"Authorization": f"Bearer {token}"}
        )

    keyboard = [["📋 My List", "➕ Add Item"], ["🤖 AI Recommendations"]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        f"✅ Logged in as *{username}*!\n\nWhat would you like to do?",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )
    return MAIN_MENU


async def main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    telegram_id = str(update.effective_user.id)
    token = user_tokens.get(telegram_id)

    if not token:
        await update.message.reply_text("Please login first with /start")
        return ConversationHandler.END

    if text == "📋 My List":
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_URL}/items/",
                headers={"Authorization": f"Bearer {token}"}
            )
        items = response.json()
        if not items:
            await update.message.reply_text("📭 Your list is empty!")
        else:
            text_list = "\n".join([
                f"{'📚' if i['type'] == 'book' else '🎮'} *{i['name']}* — ⭐{i['rating'] or 'N/A'}"
                for i in items
            ])
            await update.message.reply_text(f"📋 *Your Completed List:*\n\n{text_list}", parse_mode="Markdown")
        return MAIN_MENU

    elif text == "➕ Add Item":
        await update.message.reply_text(
            "Enter the name of the book or game:",
            reply_markup=ReplyKeyboardRemove()
        )
        return ADD_NAME

    elif text == "🗑 Delete Item":
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_URL}/items/",
                headers={"Authorization": f"Bearer {token}"}
            )
        items = response.json()
        if not items:
            await update.message.reply_text("📭 Nothing to delete!")
            return MAIN_MENU

        context.user_data["items_list"] = items
        items_text = "\n".join([
            f"{i + 1}. {'📚' if item['type'] == 'book' else '🎮'} {item['name']}"
            for i, item in enumerate(items)
        ])
        await update.message.reply_text(
            f"Which item to delete? Send the number:\n\n{items_text}",
            reply_markup=ReplyKeyboardRemove()
        )
        return DELETE_ITEM

    elif text == "🤖 AI Recommendations":
        await update.message.reply_text("⏳ Getting recommendations...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{API_URL}/suggestions/ai?filter_type=both",
                headers={"Authorization": f"Bearer {token}"}
            )
        data = response.json()
        intro = data.get("intro", "")
        suggestions = data.get("suggestions", [])

        if not suggestions:
            await update.message.reply_text("No recommendations yet. Add some items first!")
        else:
            text_out = f"_{intro}_\n\n" if intro else ""
            for s in suggestions:
                emoji = "📚" if s["type"] == "book" else "🎮"
                text_out += f"{emoji} *{s['title']}*\n_{s['description']}_\n\n"
            await update.message.reply_text(text_out, parse_mode="Markdown")

        keyboard = [["📋 My List", "➕ Add Item"], ["🗑 Delete Item", "🤖 AI Recommendations"]]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        await update.message.reply_text("What else?", reply_markup=reply_markup)
        return MAIN_MENU

async def add_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["item_name"] = update.message.text
    keyboard = [["📚 Book", "🎮 Game"]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text("What type is it?", reply_markup=reply_markup)
    return ADD_TYPE

async def delete_item(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    token = user_tokens.get(telegram_id)
    items = context.user_data.get("items_list", [])

    try:
        index = int(update.message.text) - 1
        item = items[index]
    except (ValueError, IndexError):
        await update.message.reply_text("❌ Invalid number. Try again.")
        return DELETE_ITEM

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{API_URL}/items/{item['id']}",
            headers={"Authorization": f"Bearer {token}"}
        )

    if response.status_code == 200:
        await update.message.reply_text(f"🗑 *{item['name']}* deleted!", parse_mode="Markdown")
    else:
        await update.message.reply_text("❌ Failed to delete.")

    keyboard = [["📋 My List", "➕ Add Item"], ["🗑 Delete Item", "🤖 AI Recommendations"]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text("What else?", reply_markup=reply_markup)
    return MAIN_MENU

async def add_type(update: Update, context: ContextTypes.DEFAULT_TYPE):
    item_type = "book" if "Book" in update.message.text else "game"
    context.user_data["item_type"] = item_type
    await update.message.reply_text(
        "Enter rating (1-10) or skip:",
        reply_markup=ReplyKeyboardMarkup([["Skip"]], resize_keyboard=True)
    )
    return ADD_RATING


async def add_rating(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.effective_user.id)
    token = user_tokens.get(telegram_id)
    name = context.user_data["item_name"]
    item_type = context.user_data["item_type"]

    rating = None
    if update.message.text != "Skip":
        try:
            rating = int(update.message.text)
        except:
            rating = None

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_URL}/items/",
            json={"name": name, "type": item_type, "rating": rating},
            headers={"Authorization": f"Bearer {token}"}
        )

    if response.status_code == 200:
        await update.message.reply_text(
            f"✅ *{name}* added!" + (f" Rating: {rating}/10" if rating else ""),
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text("❌ Failed to add item.")

    keyboard = [["📋 My List", "➕ Add Item"], ["🗑 Delete Item", "🤖 AI Recommendations"]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text("What else?", reply_markup=reply_markup)
    return MAIN_MENU

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Cancelled.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END


def main():
    app = Application.builder().token(TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            USERNAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_username)],
            PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_password)],
            MAIN_MENU: [MessageHandler(filters.TEXT & ~filters.COMMAND, main_menu)],
            ADD_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_name)],
            ADD_TYPE: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_type)],
            ADD_RATING: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_rating)],
            DELETE_ITEM: [MessageHandler(filters.TEXT & ~filters.COMMAND, delete_item)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    app.add_handler(conv_handler)
    print("Bot is running...")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(app.run_polling())


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, SystemExit):
        print("Bot stopped.")