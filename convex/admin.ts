
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const disableDay = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("unavailableSlots", { type: "day", date: args.date });
  },
});

// Disable specific hour
export const disableHour = mutation({
  args: { date: v.string(), hour: v.string() }, // hour e.g. "14:00"
  handler: async (ctx, args) => {
    return await ctx.db.insert("unavailableSlots", { type: "hour", date: args.date, hour: args.hour });
  },
});

// Query disabled slots for a date
export const getDisabledSlots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("unavailableSlots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});