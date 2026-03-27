import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE APPOINTMENT
export const createAppointment = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    time: v.string(),
    service: v.union(
      v.literal("haircut"),
      v.literal("haircut_beard")
    ),
    peopleCount: v.number(),
  },
  handler: async (ctx, args) => {
    // duration
    const baseDuration =
      args.service === "haircut" ? 40 : 60;

    const totalDuration = baseDuration * args.peopleCount;

    // calculate end time
    const [h, m] = args.time.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + totalDuration);

    const endTime = end.toTimeString().slice(0, 5);

    // prevent past booking (using local timezone UTC+05:00)
    const now = new Date();
    const localNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const selected = new Date(`${args.date}T${args.time}`);
    if (selected < localNow) {
      throw new Error("Cannot book past time");
    }

    // disabled slots
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

    // user validation
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .unique();

    if (!user || !user.name || !user.phone) {
      throw new Error("Complete your profile first");
    }

    // CHECK IF USER HAS ACTIVE APPOINTMENT
    const hasActive = await ctx.db
      .query("appointments")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("status"), "booked")
        )
      )
      .first();

    if (hasActive) {
      throw new Error("Sizda allaqachon faol navbat bor. Admin navbatni tugatgandan so'ng yangi navbat olishingiz mumkin.");
    }

    // CHECK OVERLAPPING APPOINTMENTS
    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("status"), "booked"))
      .collect();

    const newStart = start.getTime();
    const newEnd = end.getTime();

    for (const appt of existingAppointments) {
      const [sh, sm] = appt.time.split(":").map(Number);
      const [eh, em] = appt.endTime.split(":").map(Number);

      const apptStart = new Date();
      apptStart.setHours(sh, sm, 0);

      const apptEnd = new Date();
      apptEnd.setHours(eh, em, 0);

      const existingStart = apptStart.getTime();
      const existingEnd = apptEnd.getTime();

      // overlap condition
      if (newStart < existingEnd && newEnd > existingStart) {
        throw new Error("Time overlaps with another appointment");
      }
    }

    // create appointment
    return await ctx.db.insert("appointments", {
      userId: args.userId,
      date: args.date,
      time: args.time,
      endTime,
      service: args.service,
      peopleCount: args.peopleCount,
      status: "booked",
    });
  },
});

// GET AVAILABLE SLOTS
export const getAvailableSlots = query({
  args: {
    date: v.string(),
    service: v.union(
      v.literal("haircut"),
      v.literal("haircut_beard")
    ),
    peopleCount: v.number(),
  },
  handler: async (ctx, args) => {
    const baseDuration =
      args.service === "haircut" ? 40 : 60;

    const totalDuration = baseDuration * args.peopleCount;

    // Check for disabled slots first
    const disabledSlots = await ctx.db
      .query("unavailableSlots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    if (disabledSlots.some(d => d.type === "day")) {
      return []; // Return empty if entire day is disabled
    }

    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("status"), "booked"))
      .collect();

    const slots: string[] = [];

    // ⏰ working hours
    let current = new Date();
    current.setHours(9, 0, 0);

    const endDay = new Date();
    endDay.setHours(21, 0, 0);

    // 🚫 Filter out past times for today (using local timezone UTC+05:00)
    const now = new Date();
    // Convert to local timezone (UTC+05:00)
    const localNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const localToday = localNow.toISOString().split('T')[0];
    const isToday = args.date === localToday;
    
    if (isToday && current < localNow) {
      current = new Date(localNow);
      // Round up to next 10-minute interval
      current.setMinutes(Math.ceil(current.getMinutes() / 10) * 10);
      current.setSeconds(0);
      current.setMilliseconds(0);
    }

    while (current < endDay) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);

      // ❌ if exceeds working hours
      if (slotEnd > endDay) break;

      const newStart = slotStart.getTime();
      const newEnd = slotEnd.getTime();

      let conflict = false;

      for (const appt of existing) {
        const [sh, sm] = appt.time.split(":").map(Number);
        const [eh, em] = appt.endTime.split(":").map(Number);

        const aStart = new Date();
        aStart.setHours(sh, sm, 0);

        const aEnd = new Date();
        aEnd.setHours(eh, em, 0);

        if (
          newStart < aEnd.getTime() &&
          newEnd > aStart.getTime()
        ) {
          conflict = true;
          break;
        }
      }

      // Check if this slot is disabled
      const slotTime = slotStart.toTimeString().slice(0, 5);
      if (disabledSlots.some(d => d.hour === slotTime)) {
        conflict = true;
      }

      if (!conflict) {
        slots.push(slotTime);
      }

      // ⏩ move in 10-min steps (better UX)
      current.setMinutes(current.getMinutes() + 10);
    }

    return slots;
  },
});

// CHECK IF USER HAS ACTIVE APPOINTMENT
export const hasActiveAppointment = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const activeAppointment = await ctx.db
      .query("appointments")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("status"), "booked")
        )
      )
      .first();
    
    return !!activeAppointment;
  },
});

// GET USER APPOINTMENTS
export const getUserAppointments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
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
      .withIndex("by_date", (q) => q.eq("date", args.date))
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

export const clearNonBookedAppointments = mutation({
  handler: async (ctx) => {
    const nonBookedAppointments = await ctx.db
      .query("appointments")
      .filter((q) => q.neq(q.field("status"), "booked"))
      .collect();

    for (const appointment of nonBookedAppointments) {
      await ctx.db.delete(appointment._id);
    }

    return nonBookedAppointments.length;
  },
});