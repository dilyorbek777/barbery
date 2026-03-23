"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Shadcn UI & Icons
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, CalendarCheck2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const { user, isLoaded } = useUser();

  // Fetch appointments for this user
  const appointments = useQuery(
    api.appointments.getUserAppointments,
    user ? { userId: user.id } : "skip"
  );

  // Mutation for cancelling (ensure this exists in your convex/appointments.ts)
  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  const handleCancel = async (id: Id<"appointments">) => {
    const confirm = window.confirm("Rostdan ham bekor qilmoqchimisiz?");
    if (confirm) {
      try {
        await cancelAppointment({
          appointmentId: id,
          userId: user?.id || ""
        });
      } catch (err) {
        console.error("Xatolik:", err);
      }
    }
  };

  if (!isLoaded || appointments === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl my-20 mx-auto p-4 md:p-8 space-y-6">

      <h3 className="text-5xl font-bold mb-5 dark:text-white bg-clip-text text-primary " >Manzil: </h3>
      
      <iframe
        className="h-[300px] rounded-xl dark:invert-100"
        width="100%"
        height="100%"
        title="map"
        scrolling="no"
        src="https://maps.google.com/maps?q=39.634892,66.913756&ll=39.634892,66.913756&z=16&output=embed"

      ></iframe>
      <br />
      <br />
      <h3 className="text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-foreground/50" >Sizning Qabulingiz: </h3>

      {appointments?.length === 0 && <p>Sizda hozircha qabul mavjud emas...</p>}


      {!appointments || appointments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-3">
            <CalendarCheck2 className="h-12 w-12 text-muted-foreground opacity-50" />
            <div className="text-center">
              <p className="font-medium">Hozircha buyurtmalar yo'q</p>
              <p className="text-sm text-muted-foreground">Yangi vaqt band qilish uchun asosiy sahifaga o'ting.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="gap-4 flex flex-col w-full">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="w-full flex justify-between bg-accent/50 hover:bg-accent transition-colors items-center py-4 px-6 rounded-xl border"
            >
              <div className="w-3/5 space-y-1">
                <h3 className="text-xl font-bold tracking-tight">{apt.date}</h3>
                <div className="flex items-center gap-2 text-foreground/80">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-lg">
                    <span className="font-semibold text-primary dark:text-white">Vaqti: </span>
                    {apt.time}
                  </p>
                </div>
              </div>

              <div className="w-2/5 flex justify-end">
                {apt.status === "booked" && (
                  <Button
                    onClick={() => handleCancel(apt._id)}
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-32 hover:bg-destructive/90 shadow-sm"
                  >
                    Bekor qilish
                  </Button>
                )}

                {apt.status === "cancelled" && (
                  <Button
                    disabled
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-32 opacity-70 italic"
                  >
                    Bekor qilindi
                  </Button>
                )}

                {apt.status === "completed" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full sm:w-32 bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                  >
                    Tugallangan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

