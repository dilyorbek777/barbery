import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ✅ CREATE APPOINTMENT
export const createAppointment = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    // check if slot already taken
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_date_time", (q) =>
        q.eq("date", args.date).eq("time", args.time)
      )
      .filter((q) => q.eq(q.field("status"), "booked"))
      .first();

    if (existing) {
      throw new Error("This time slot is already booked");
    }
    const disabledSlots = await ctx.db
      .query("unavailableSlots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    if (disabledSlots.some(d => d.type === "day")) {
      throw new Error("This day is unavailable");
    }

    if (disabledSlots.some(d => d.hour === args.time)) {
      throw new Error("This hour is unavailable");
    }

    // check if user profile is complete
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .unique();

    if (!user || !user.name || !user.phone) {
      throw new Error("Complete your profile first");
    }

    // create appointment
    return await ctx.db.insert("appointments", {
      ...args,
      status: "booked",
    });
  },
});

// GET USER APPOINTMENTS
export const getUserAppointments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ❌ CANCEL APPOINTMENT
export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);

    if (!appointment) throw new Error("Not found");

    // 🔒 ensure user owns it
    if (appointment.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
    });
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_date_time", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("status"), "booked"))
      .collect();
  },
});

export const getAllAppointments = query({
  handler: async (ctx) => {
    return await ctx.db.query("appointments").collect();
  },
});

export const completeAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Not found");

    await ctx.db.patch(args.appointmentId, {
      status: "completed",
    });
  },
});

export const adminCancelAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Not found");

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
    });
  },
});

export const getAllAppointmentsWithUser = query({
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").collect();

    // add user info
    const result = await Promise.all(
      appointments.map(async (a) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", a.userId))
          .unique();

        return {
          ...a,
          name: user?.name || "Unknown",
          phone: user?.phone || "Unknown",
        };
      })
    );

    return result;
  },
});