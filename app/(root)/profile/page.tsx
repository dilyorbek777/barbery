"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarDays, LogOut, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const appointments = useQuery(
    api.appointments.getUserAppointments, 
    user ? { userId: user.id } : "skip"
  );

  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  const handleCancel = async (id: Id<"appointments">) => {
    if (!user) return;
    if (confirm("Rostdan ham bekor qilmoqchimisiz?")) {
      await cancelAppointment({ appointmentId: id, userId: user.id });
    }
  };

  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return <div className="text-center p-10">Iltimos, tizimga kiring</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 md:py-20 space-y-10">
      {/* 👤 Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-secondary/30 p-8 rounded-3xl border border-secondary">
        <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="text-2xl">{user.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-black tracking-tight">{user.fullName}</h1>
          <p className="text-muted-foreground font-medium">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="flex justify-center md:justify-start gap-2 pt-1">
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              Mijoz
            </Badge>
          </div>
        </div>

        <SignOutButton>
          <Button variant="destructive" size="sm" className="gap-2 px-6 rounded-full shadow-lg shadow-destructive/20">
            <LogOut className="h-4 w-4" /> Chiqish
          </Button>
        </SignOutButton>
      </div>

      {/* 🗂 Navigation Tabs */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 h-12 p-1 bg-secondary">
          <TabsTrigger value="appointments" className="rounded-md data-[state=active]:shadow-sm">
            <CalendarDays className="h-4 w-4 mr-2" /> Buyurtmalar
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-md data-[state=active]:shadow-sm">
            <UserIcon className="h-4 w-4 mr-2" /> Profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {!appointments ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
          ) : appointments.length === 0 ? (
            <Card className="border-dashed py-12 text-center">
              <p className="text-muted-foreground">Hozircha buyurtmalar mavjud emas.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((apt: any) => (
                <Card key={apt._id} className="overflow-hidden border-none shadow-sm bg-accent/30 hover:bg-accent/50 transition-all">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sana va vaqt</p>
                        <h3 className="text-xl font-bold">{apt.date}</h3>
                        <p className="text-lg font-medium text-primary">{apt.time}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {apt.status === "booked" && (
                          <>
                            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Kutilmoqda</Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancel(apt._id)}
                              className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                            >
                              Bekor qilish
                            </Button>
                          </>
                        )}
                        {apt.status === "cancelled" && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 italic">
                            <XCircle className="h-3 w-3 mr-1" /> Bekor qilindi
                          </Badge>
                        )}
                        {apt.status === "completed" && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Tugallangan
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profil Ma'lumotlari</CardTitle>
              <CardDescription>Hisobingiz ma'lumotlarini Clerk orqali boshqarishingiz mumkin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-muted-foreground">Ism:</div>
                  <div className="font-medium">{user.firstName}</div>
                  <div className="text-muted-foreground">Familiya:</div>
                  <div className="font-medium">{user.lastName}</div>
                  <div className="text-muted-foreground">Email:</div>
                  <div className="font-medium">{user.primaryEmailAddress?.emailAddress}</div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
