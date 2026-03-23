// components/BookingCalendar.tsx
"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useState } from "react";

export default function BookingCalendar({ onSelect }: any) {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div>
      <DayPicker
        mode="single"
        selected={date}
        onSelect={(d) => {
          setDate(d);
          onSelect(d);
        }}
      />
    </div>
  );
}