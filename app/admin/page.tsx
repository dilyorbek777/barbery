"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import DisableSlots from "@/components/disableSlots";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, User, Phone, Calendar, Clock, Users } from "lucide-react";

export default function AdminPanel() {
  const appointmentsData = useQuery(api.appointments.getAllAppointmentsWithUser);
  const complete = useMutation(api.appointments.completeAppointment);
  const cancel = useMutation(api.appointments.adminCancelAppointment);
  const clearNonBooked = useMutation(api.appointments.clearNonBookedAppointments);

  // 🔄 Sort: Newest Date and Latest Time first
  const appointments = appointmentsData ? [...appointmentsData].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
    return dateTimeB - dateTimeA; // Descending order
  }) : null;

  if (!appointments) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Barber Profil 💈</h1>
        <p className="text-muted-foreground text-lg">Barcha ma'lumotlarni boshqaring.</p>
      </header>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-secondary/50 p-1">
          <TabsTrigger value="list">Navbatdagilar</TabsTrigger>
          <TabsTrigger value="settings">Kundalik boshqaruv</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-md overflow-hidden bg-card/50">
            <CardHeader className="bg-muted/30">
              <CardTitle>Navbat</CardTitle>
              <CardDescription>Yangi buyurtmalar yuqorida ko'rsatiladi</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="w-[120px]">Qo'ng'iroqlar</TableHead>
                    <TableHead className="w-[200px]">Mijozlar</TableHead>
                    <TableHead>Vaqt va Sana</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Tahrirlash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                        Hozircha navbatlar yo'q.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((a) => (
                      <TableRow key={a._id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-primary text-primary"
                            onClick={() => window.location.href = `tel:${a.phone}`}
                          >
                            <Phone className="h-3 w-3 mr-1" /> 
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-primary" /> {a.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" /> {a.peopleCount} {a.peopleCount === 1 ? 'kishi' : 'kishi'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-0.5">
                            <div className="flex items-center gap-2 font-medium">
                              <Calendar className="h-3.5 w-3.5 opacity-60 text-primary" /> {a.date}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> {a.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              a.status === "booked" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                a.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                                  "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {a.status === "booked" ? "Band" : a.status === "completed" ? "Bajarildi" : "Bekor qilindi"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {a.status === "booked" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700"
                                onClick={() => complete({ appointmentId: a._id as Id<"appointments"> })}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Finish
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => cancel({ appointmentId: a._id as Id<"appointments"> })}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Boshqaruv</CardTitle>
              <CardDescription>Ma'lum soatlarni yoki kunlarni band qilish.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div>
                  <h3 className="font-medium">Tozalash</h3>
                  <p className="text-sm text-muted-foreground">Barcha "Band" bo'lmagan uchrashuvlarni o'chirish</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (confirm("Barcha 'Band' bo'lmagan uchrashuvlarni o'chirishga ishonchingiz komilmi?")) {
                      const deletedCount = await clearNonBooked();
                      alert(`${deletedCount} ta uchrashuv o'chirildi`);
                    }
                  }}
                >
                  Band bo'lmaganlarni tozalash
                </Button>
              </div>
              <DisableSlots />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
