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