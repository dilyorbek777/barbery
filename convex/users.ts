import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return existing;

    return await ctx.db.insert("users", args);
  },
});


export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return await ctx.db.patch(user._id, {
      name: args.name,
      phone: args.phone,
    });
  },
});

export const getUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const createTelegramUser = mutation({
  args: {
    chatId: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("telegramUsers")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();

    if (existing) return existing;

    return await ctx.db.insert("telegramUsers", {
      chatId: args.chatId,
      username: args.username,
      conversationState: "awaiting_start",
    });
  },
});

export const updateTelegramUserState = mutation({
  args: {
    chatId: v.string(),
    conversationState: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("telegramUsers")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();
    
    if (!user) {
      throw new Error("Telegram user not found");
    }
    
    const updateData: any = {
      conversationState: args.conversationState,
    };
    
    if (args.name) updateData.name = args.name;
    if (args.phone) updateData.phone = args.phone;
    
    return await ctx.db.patch(user._id, updateData);
  },
});

export const getTelegramUser = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telegramUsers")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();
  },
});