"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarX, Clock, Calendar } from "lucide-react";

export default function ShowDisabledSlots() {
  const disabledSlots = useQuery(api.admin.getAllDisabledSlots);

  if (disabledSlots === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = disabledSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof disabledSlots>);

  // Sort dates
  const sortedDates = Object.keys(slotsByDate).sort();

  if (disabledSlots.length === 0) {
    return (
      <Card className="border-none bg-green-50/50">
        <CardContent className="pt-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-green-600 mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">Barcha vaqtlar ochiq</h3>
          <p className="text-green-600">Hozircha hech qanday yopiq vaqtlar yo'q</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CalendarX className="h-5 w-5 text-destructive" />
          Yopiq vaqtlar ({disabledSlots.length})
        </h3>
      </div>

      {sortedDates.map((date) => {
        const slots = slotsByDate[date];
        const hasDayDisabled = slots.some(slot => slot.type === "day");
        const hourSlots = slots.filter(slot => slot.type === "hour");

        return (
          <Card key={date} className="overflow-hidden border-destructive/20">
            <CardHeader className="bg-destructive/5">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(date), "PPP")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {hasDayDisabled && (
                  <Badge variant="destructive" className="text-xs px-2 py-1">
                    <CalendarX className="h-3 w-3 mr-1" />
                    Butun kun yopilgan
                  </Badge>
                )}
                {hourSlots.map((slot) => (
                  <Badge key={slot._id} variant="secondary" className="text-xs px-2 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {slot.hour}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
