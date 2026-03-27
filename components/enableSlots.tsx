"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, isBefore, startOfToday } from "date-fns";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icons
import { CalendarIcon, Clock, CalendarCheck, CheckCircle, CalendarX } from "lucide-react";

export default function EnableSlots() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState("");

  const enableDay = useMutation(api.admin.enableDay);
  const enableHour = useMutation(api.admin.enableHour);
  const disabledSlots = useQuery(api.admin.getAllDisabledSlots);

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

  const handleEnableDay = async () => {
    if (!formattedDate) return;
    await enableDay({ date: formattedDate });
    alert("Kun ochildi!");
  };

  const handleEnableHour = async () => {
    if (!formattedDate || !hour) return;
    await enableHour({ date: formattedDate, hour });
    alert("Soat ochildi!");
  };

  // Filter disabled slots for selected date
  const disabledSlotsForDate = disabledSlots?.filter(slot => slot.date === formattedDate) || [];
  const hasDayDisabled = disabledSlotsForDate.some(slot => slot.type === "day");
  const disabledHours = disabledSlotsForDate.filter(slot => slot.type === "hour").map(slot => slot.hour);

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
                  onSelect={setDate}
                  disabled={(date) => isBefore(date, startOfToday())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* 📊 Current Disabled Slots Info */}
      {date && (
        <Card className="md:col-span-2 border-none bg-info/10">
          <CardHeader>
            <CardTitle className="text-sm">Ushbu kundagi yopiq vaqtlar</CardTitle>
          </CardHeader>
          <CardContent>
            {disabledSlotsForDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bu kun uchun yopiq vaqtlar yo'q</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {hasDayDisabled && (
                  <Badge variant="destructive" className="text-xs">
                    <CalendarX className="h-3 w-3 mr-1" />
                    Butun kun yopilgan
                  </Badge>
                )}
                {disabledHours.map(h => (
                  <Badge key={h} variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {h}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ Full Day Action */}
      <Card className="overflow-hidden border-green-500/20 transition-all hover:shadow-md">
        <div className="h-2 bg-green-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CalendarCheck className="h-5 w-5" /> To'liq kun
          </CardTitle>
          <CardDescription>Belgilangan kunni ochish</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full rounded-lg h-11 font-bold border-green-500 text-green-600 hover:bg-green-50"
            disabled={!date || !hasDayDisabled}
            onClick={handleEnableDay}
          >
            Kunni ochish
          </Button>
        </CardContent>
      </Card>

      {/* ⏰ Specific Hour Action */}
      <Card className="overflow-hidden border-blue-500/20 transition-all hover:shadow-md">
        <div className="h-2 bg-blue-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Clock className="h-5 w-5" /> Ma'lum soat
          </CardTitle>
          <CardDescription>Faqat bitta vaqt oralig'ini ochish</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="time"
            className="h-11 rounded-lg border-2"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
          />
          <Button
            variant="outline"
            className="w-full rounded-lg h-11 font-bold border-blue-500 text-blue-600 hover:bg-blue-50"
            disabled={!date || !hour || !disabledHours.includes(hour)}
            onClick={handleEnableHour}
          >
            Vaqtni ochish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
