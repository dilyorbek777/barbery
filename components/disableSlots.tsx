"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, isBefore, startOfToday } from "date-fns";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Icons
import { CalendarIcon, Clock, CalendarX, Ban } from "lucide-react";

export default function DisableSlots() {
  // const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);



  const disableDay = useMutation(api.admin.disableDay);
  const disableHour = useMutation(api.admin.disableHour);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const handleDisableDay = async () => {
    if (!formattedDate) return;
    await disableDay({ date: formattedDate });
    alert("Kun yopildi!");
  };

  const handleDisableHour = async () => {
    if (!formattedDate || !hour) return;
    await disableHour({ date: formattedDate, hour });
    alert("Soat yopildi!");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 🗓 Date Picker Card */}
      <Card className="md:col-span-2 border-none bg-secondary/20 shadow-none">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label className="text-xs uppercase font-bold text-muted-foreground">Sana tanlang</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl border-2",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Sana tanlang...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}

                  onSelect={(d) => { setDate(d); setSelectedTime(null); }}
                  disabled={(date) => isBefore(date, startOfToday())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* 🚫 Full Day Action */}
      <Card className="overflow-hidden border-destructive/20 transition-all hover:shadow-md">
        <div className="h-2 bg-destructive" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <CalendarX className="h-5 w-5" /> To'liq kun
          </CardTitle>
          <CardDescription>Belgilangan kunni butunlay yopish</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full rounded-lg h-11 font-bold"
            disabled={!date}
            onClick={handleDisableDay}
          >
            Kunni yopish
          </Button>
        </CardContent>
      </Card>

      {/* ⏳ Specific Hour Action */}
      <Card className="overflow-hidden border-primary/20 transition-all hover:shadow-md">
        <div className="h-2 bg-primary" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" /> Ma'lum soat
          </CardTitle>
          <CardDescription>Faqat bitta vaqt oralig'ini yopish</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="time"
            className="h-11 rounded-lg border-2"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
          />
          <Button
            className="w-full rounded-lg h-11 font-bold"
            disabled={!date || !hour}
            onClick={handleDisableHour}
          >
            Vaqtni yopish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
