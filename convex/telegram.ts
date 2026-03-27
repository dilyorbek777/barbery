"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Helper to handle fetch and errors
async function sendTelegramMessage(chatId: string, payload: object) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  console.log("Sending message to chat:", chatId);
  console.log("Token exists:", !!token);
  
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set in Convex Dashboard");

  const fullPayload = {
    chat_id: chatId,
    ...payload,
  };
  
  console.log("Full payload:", JSON.stringify(fullPayload, null, 2));

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullPayload),
  });

  const result = await response.json();
  console.log("Telegram API response:", result);
  
  if (!result.ok) {
    console.error("Telegram API Error:", result);
    throw new Error(`Telegram Error: ${result.description}`);
  }
  return result;
}

export const sendHello = action({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    await sendTelegramMessage(args.chatId, {
      text: "👋 Hello! Welcome to our barbershop.\n\nWhat's your name?",
    });
  },
});

export const askForPhone = action({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    await sendTelegramMessage(args.chatId, {
      text: "📱 Thanks! Now please share your phone number using the button below:",
      reply_markup: {
        keyboard: [[{ text: "📞 Share Phone Number", request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
  },
});

export const sendWebsiteButton = action({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const websiteUrl = process.env.WEBSITE_URL || "https://mybarbery.vercel.app";
    await sendTelegramMessage(args.chatId, {
      text: "✅ Thank you! Your information has been saved.\n\nYou can now book appointments through our website:",
      reply_markup: {
        inline_keyboard: [[{ 
          text: "🌐 Open Website", 
          web_app: { url: websiteUrl }
        }]],
      },
    });
  },
});