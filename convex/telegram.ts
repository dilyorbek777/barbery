// convex/telegram.ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendWelcome = action({
  args: {
    chatId: v.string(),
  },
  handler: async (_, args) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const websiteUrl = process.env.WEBSITE_URL;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: args.chatId,
        text: "💈 Welcome! Book your appointment easily:",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🌐 Open Website",
                url: websiteUrl || "", 
              },
            ],
          ],
        },
      }),
    });
  },
});

export const sendHello = action({
  args: {
    chatId: v.string(),
  },
  handler: async (_, args) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: args.chatId,
        text: "👋 Hello! Welcome to our barbershop.\n\nWhat's your name?",
      }),
    });
  },
});

export const askForPhone = action({
  args: {
    chatId: v.string(),
  },
  handler: async (_, args) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: args.chatId,
        text: "📱 Thanks! Now please share your phone number:",
        reply_markup: {
          keyboard: [
            [
              {
                text: "📞 Share Phone Number",
                request_contact: true,
              },
            ],
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      }),
    });
  },
});

export const sendWebsiteButton = action({
  args: {
    chatId: v.string(),
  },
  handler: async (_, args) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const websiteUrl = process.env.WEBSITE_URL;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: args.chatId,
        text: "✅ Thank you! Your information has been saved.\n\nYou can now book appointments through our website:",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🌐 Open Website",
                web_app: {
                  url: websiteUrl || "",
                },
              },
            ],
          ],
        },
      }),
    });
  },
});