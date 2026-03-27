// app/api/telegram/route.ts
import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.json();

  const chatId = body.message?.chat?.id?.toString();
  const username = body.message?.from?.username;

  if (!chatId) return new Response("ok");

  // 💾 Save user in DB
  await convex.mutation(api.users.createTelegramUser, {
    chatId,
    username,
  });

  // 📩 Send welcome message with button
  await convex.action(api.telegram.sendWelcome, { chatId });

  return new Response("ok");
}