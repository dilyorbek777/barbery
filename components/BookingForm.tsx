// components/BookingForm.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import BookingCalendar from "./BookingCalendar";
import { generateTimeSlots } from "@/lib/timeSlots";
import { useUser } from "@clerk/nextjs";

export default function BookingForm() {
    const { user } = useUser();

    const [date, setDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const slots = generateTimeSlots();

    const booked = useQuery(
        api.appointments.getByDate,
        date ? { date } : "skip"
    );

    const createAppointment = useMutation(
        api.appointments.createAppointment
    );

    // convert Date → "YYYY-MM-DD" (using local timezone)
    const handleDateSelect = (d: Date | undefined) => {
        if (!d) return;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;
        setDate(formatted);
        setSelectedTime(null);
    };

    const handleBook = async () => {
        if (!user || !date || !selectedTime) return;

        // 🚫 Validate: prevent booking past times
        const now = new Date();
        const selectedDate = date ? new Date(date) : new Date();
        const [hour, minute] = selectedTime.split(":").map(Number);

        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hour, minute, 0, 0);

        if (slotDateTime <= now) {
            alert("Cannot book appointments in the past!");
            return;
        }

        try {
            await createAppointment({
                userId: user.id,
                date,
                time: selectedTime,
            });

            alert("Booked!");
        } catch (err: any) {
            alert(err.message);
        }
    };

    // fetch disabled slots for selected date
    const disabledSlots = useQuery(
        api.admin.getDisabledSlots,
        date ? { date } : "skip"
    );

    return (
        <div>
            <h2>Book Appointment 💈</h2>

            {/* 📅 Calendar */}
            <BookingCalendar onSelect={handleDateSelect} />

            {/* ⏰ Time Slots */}
            {date && (
                <div>
                    <h3>Select Time</h3>

                    {slots.map((time) => {
                        const isBooked = booked?.some((b) => b.time === time);

                        // 🚫 disable if slot disabled
                        const isDisabled = disabledSlots?.some(
                            (d: any) => d.type === "day" || d.hour === time
                        );

                        // 🚫 block past time (only for today)
                        const now = new Date();
                        const selectedDate = date ? new Date(date) : new Date();

                        const isToday =
                            selectedDate.toDateString() === now.toDateString();

                        let isPastTime = false;

                        if (isToday) {
                            const [hour, minute] = time.split(":").map(Number);

                            const slotDate = new Date(selectedDate);
                            slotDate.setHours(hour, minute, 0);

                            if (slotDate < now) {
                                isPastTime = true;
                            }
                        }

                        return (
                            <button
                                key={time}
                                disabled={isBooked || isPastTime || isDisabled}
                                onClick={() => setSelectedTime(time)}
                                style={{
                                    margin: 5,
                                    background:
                                        selectedTime === time ? "green" : "white",
                                }}
                            >
                                {time} {isDisabled && "🚫"} {isBooked && "❌"} {isPastTime && "⏳"}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ✅ Book Button */}
            <button onClick={handleBook} disabled={!selectedTime}>
                Book Now
            </button>
        </div>
    );
}