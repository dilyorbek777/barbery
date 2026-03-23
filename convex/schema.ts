import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),
  unavailableSlots: defineTable({
    type: v.union(v.literal("day"), v.literal("hour")),
    date: v.string(),  // "YYYY-MM-DD"
    hour: v.optional(v.string()), // only if type === "hour"
  })
    .index("by_date", ["date"]),
  appointments: defineTable({
    userId: v.string(), // clerkId
    date: v.string(),   // "2026-03-25"
    time: v.string(),   // "14:00"
    status: v.union(
      v.literal("booked"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
  })
    .index("by_date_time", ["date", "time"])
    .index("by_user", ["userId"]),
});

