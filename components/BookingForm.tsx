"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { format, isBefore, startOfToday } from "date-fns";

// Shadcn UI
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function BookingForm() {
  const { user } = useUser();

  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // 🆕 NEW STATES
  const [service, setService] = useState<"haircut" | "haircut_beard">("haircut");
  const [peopleCount, setPeopleCount] = useState(1);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : null;

  // 🤖 AUTO SLOTS
  const slots = useQuery(
    api.appointments.getAvailableSlots,
    formattedDate
      ? { date: formattedDate, service, peopleCount }
      : "skip"
  );

  // 🔍 CHECK ACTIVE APPOINTMENT
  const hasActiveAppointment = useQuery(
    api.appointments.hasActiveAppointment,
    user ? { userId: user.id } : "skip"
  );

  const createAppointment = useMutation(
    api.appointments.createAppointment
  );

  const handleBook = async () => {
    if (!user || !formattedDate || !selectedTime) return;

    try {
      await createAppointment({
        userId: user.id,
        date: formattedDate,
        time: selectedTime,
        service,
        peopleCount,
      });

      alert("Joy band qilindi!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Navbat olish 💈</CardTitle>
        <CardDescription>
          Sana, xizmat va odamlar sonini tanlang
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ⚠️ Active Appointment Warning */}
        {hasActiveAppointment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Faol navbat mavjud
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  Sizda allaqachon faol navbat bor. Admin navbatni tugatgandan so'ng yangi navbat olishingiz mumkin.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📅 Calendar */}
        <div className={cn("flex justify-center border rounded-md p-2", hasActiveAppointment && "opacity-50 pointer-events-none")}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setSelectedTime(null);
            }}
            disabled={(date) => isBefore(date, startOfToday())}
            initialFocus
          />
        </div>

        {/* ✂️ Service */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Xizmat</label>
          <select
            className="w-full border rounded-md p-2"
            value={service}
            onChange={(e) =>
              setService(e.target.value as any)
            }
            disabled={hasActiveAppointment}
            required
          >
            <option value="haircut">Soch </option>
            <option value="haircut_beard">
              Soch + Soqol
            </option>
          </select>
        </div>

        {/* 👥 People Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Odamlar soni
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
              <Button
                key={num}
                variant={peopleCount === num ? "default" : "outline"}
                className={cn(
                  "w-full",
                  peopleCount === num && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => setPeopleCount(num)}
                disabled={hasActiveAppointment}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* ⏰ Available Slots */}
        {date && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Mavjud vaqtlar
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {slots?.length === 0 && (
                <p className="col-span-3 text-center text-sm text-muted-foreground">
                  Bo'sh vaqt yo'q 😔
                </p>
              )}

              {slots?.map((time) => (
                <Button
                  key={time}
                  variant={
                    selectedTime === time
                      ? "default"
                      : "outline"
                  }
                  className={cn(
                    "w-full",
                    selectedTime === time &&
                      "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setSelectedTime(time)}
                  disabled={hasActiveAppointment}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleBook}
          disabled={!selectedTime || hasActiveAppointment}
        >
          Joyni band qilish
        </Button>
      </CardFooter>
    </Card>
  );
}