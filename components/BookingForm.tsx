"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { generateTimeSlots } from "@/lib/timeSlots";
import { useUser } from "@clerk/nextjs";
import { format, isBefore, startOfToday, setHours, setMinutes } from "date-fns";

// Shadcn UI Components
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function BookingForm() {
    const { user } = useUser();
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const formattedDate = date ? format(date, "yyyy-MM-dd") : null;
    const slots = generateTimeSlots();

    const booked = useQuery(api.appointments.getByDate, formattedDate ? { date: formattedDate } : "skip");
    const disabledSlots = useQuery(api.admin.getDisabledSlots, formattedDate ? { date: formattedDate } : "skip");
    const createAppointment = useMutation(api.appointments.createAppointment);

    const handleBook = async () => {
        if (!user || !formattedDate || !selectedTime) return;

        const [hour, minute] = selectedTime.split(":").map(Number);
        const slotDateTime = setMinutes(setHours(new Date(date!), hour), minute);

        if (isBefore(slotDateTime, new Date())) {
            alert("Siz o'tmish vaqtda navbat olishingiz mumkin emas!");
            return;
        }

        try {
            await createAppointment({ userId: user.id, date: formattedDate, time: selectedTime });
            alert("Joy band qilindi!");
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Navbat olish 💈</CardTitle>
                <CardDescription>Qulay sana va vaqtni tanlang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 📅 Shadcn Calendar */}
                <div className="flex justify-center border rounded-md p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setSelectedTime(null); }}
                        disabled={(date) => isBefore(date, startOfToday())}
                        initialFocus
                    />
                </div>

                {/* ⏰ Time Slots */}
                {date && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">Mavjud vaqtlar</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {slots.map((time) => {
                                const isBooked = booked?.some((b) => b.time === time);
                                const isDisabled = disabledSlots?.some((d: any) => d.type === "day" || d.hour === time);
                                
                                // Past time validation
                                const [hour, minute] = time.split(":").map(Number);
                                const slotDate = setMinutes(setHours(new Date(date), hour), minute);
                                const isPastTime = isBefore(slotDate, new Date());

                                return (
                                    <Button
                                        key={time}
                                        variant={selectedTime === time ? "default" : "outline"}
                                        className={cn(
                                            "w-full",
                                            selectedTime === time && "ring-2 ring-primary ring-offset-2"
                                        )}
                                        disabled={isBooked || isPastTime || isDisabled}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                        {isDisabled && " 🚫"}
                                        {isBooked && " ❌"}
                                        {isPastTime && !isBooked && " ⏳"}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleBook} 
                    disabled={!selectedTime}
                >
                    Joyni band qilish
                </Button>
            </CardFooter>
        </Card>
    );
}
