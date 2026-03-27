import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message) return new Response("OK");

    const chatId = message.chat?.id?.toString();
    const username = message.from?.username || "unknown";
    const text = message.text;
    const contact = message.contact;

    if (!chatId) return new Response("OK");

    // 1. Ensure user exists and get current state
    let user = await convex.query(api.users.getTelegramUser, { chatId });
    
    if (!user) {
      await convex.mutation(api.users.createTelegramUser, { chatId, username });
      user = await convex.query(api.users.getTelegramUser, { chatId });
    }

    if (!user) return new Response("Error: Could not sync user", { status: 500 });

    // 2. Handle Commands (/start)
    if (text === "/start") {
      await convex.mutation(api.users.updateTelegramUserState, {
        chatId,
        conversationState: "awaiting_name",
      });
      // Call the action to send the first message
      await convex.action(api.telegram.sendHello, { chatId });
      return new Response("OK");
    }

    // 3. Handle Flow: Awaiting Name -> Ask for Phone
    if (user.conversationState === "awaiting_name" && text) {
      await convex.mutation(api.users.updateTelegramUserState, {
        chatId,
        conversationState: "awaiting_phone",
        name: text,
      });
      await convex.action(api.telegram.askForPhone, { chatId });
      return new Response("OK");
    }

    // 4. Handle Flow: Awaiting Phone -> Completion
    if (user.conversationState === "awaiting_phone") {
      const phoneNumber = contact?.phone_number || text;
      
      if (phoneNumber) {
        await convex.mutation(api.users.updateTelegramUserState, {
          chatId,
          conversationState: "completed",
          phone: phoneNumber,
        });
        await convex.action(api.telegram.sendWebsiteButton, { chatId });
      }
      return new Response("OK");
    }

    return new Response("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Internal Error", { status: 500 });
  }
}