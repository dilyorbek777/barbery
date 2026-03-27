// app/api/telegram/route.ts
import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.json();

  const chatId = body.message?.chat?.id?.toString();
  const username = body.message?.from?.username;
  const text = body.message?.text;
  const contact = body.message?.contact;

  if (!chatId) return new Response("ok");

  // Get or create user in DB
  let user = await convex.query(api.users.getTelegramUser, { chatId });
  
  if (!user) {
    await convex.mutation(api.users.createTelegramUser, {
      chatId,
      username,
    });
    user = await convex.query(api.users.getTelegramUser, { chatId });
  }

  // If user still doesn't exist, return
  if (!user) return new Response("ok");

  // Handle /start command
  if (text === "/start") {
    await convex.mutation(api.users.updateTelegramUserState, {
      chatId,
      conversationState: "awaiting_name",
    });
    await convex.action(api.telegram.sendHello, { chatId });
    return new Response("ok");
  }

  // Handle conversation states
  if (user.conversationState === "awaiting_name" && text && text !== "/start") {
    await convex.mutation(api.users.updateTelegramUserState, {
      chatId,
      conversationState: "awaiting_phone",
      name: text,
    });
    await convex.action(api.telegram.askForPhone, { chatId });
    return new Response("ok");
  }

  // Handle phone number (either from contact button or text)
  if (user.conversationState === "awaiting_phone") {
    const phoneNumber = contact?.phone_number || text;
    
    if (phoneNumber) {
      await convex.mutation(api.users.updateTelegramUserState, {
        chatId,
        conversationState: "completed",
        phone: phoneNumber,
      });
      await convex.action(api.telegram.sendWebsiteButton, { chatId });
    } else {
      // Send message asking for valid phone number
      const token = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "❌ Please provide a valid phone number using the button or by typing it.",
        }),
      });
    }
    return new Response("ok");
  }

  return new Response("ok");
}