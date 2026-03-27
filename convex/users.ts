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

// convex/users.ts
export const createTelegramUser = mutation({
  args: {
    chatId: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("telegramUsers", {
      chatId: args.chatId,
      username: args.username,
    });
  },
});