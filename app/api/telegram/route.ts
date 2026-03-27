// app/api/telegram/route.ts
import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("TELEGRAM BODY:", body); // 🔥 IMPORTANT

    const message = body.message || body.edited_message;

    if (!message) {
      console.log("No message found");
      return new Response("ok");
    }

    const chatId = message.chat?.id?.toString();
    const username = message.from?.username;

    if (!chatId) {
      console.log("No chatId");
      return new Response("ok");
    }

    console.log("Chat ID:", chatId);

    // 💾 Save user
    await convex.mutation(api.users.createTelegramUser, {
      chatId,
      username,
    });

    // 📩 Send message
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ Bot is working!",
        }),
      }
    );

    return new Response("ok");
  } catch (err) {
    console.error("ERROR:", err);
    return new Response("error", { status: 500 });
  }
}