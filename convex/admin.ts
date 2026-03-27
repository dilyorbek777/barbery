
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

// Query all disabled slots
export const getAllDisabledSlots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("unavailableSlots").collect();
  },
});

// Enable a specific day (remove day disable)
export const enableDay = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("unavailableSlots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("type"), "day"))
      .collect();
    
    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }
  },
});

// Enable a specific hour (remove hour disable)
export const enableHour = mutation({
  args: { date: v.string(), hour: v.string() },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("unavailableSlots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.and(q.eq(q.field("type"), "hour"), q.eq(q.field("hour"), args.hour)))
      .collect();
    
    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }
  },
});