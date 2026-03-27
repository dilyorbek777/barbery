"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarDays, LogOut, User as UserIcon, CheckCircle2, XCircle, Mail, ShieldCheck, Phone, Pencil } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const appointmentsData = useQuery(
    api.appointments.getUserAppointments,
    user ? { userId: user.id } : "skip"
  );

  const userData = useQuery(
    api.users.getUser,
    user ? { clerkId: user.id } : "skip"
  );

  // Sort appointments newest first
  const appointments = appointmentsData ? [...appointmentsData].sort((a, b) => {
    return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
  }) : null;

  const cancelAppointment = useMutation(api.appointments.cancelAppointment);
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  const handleCancel = async (id: Id<"appointments">) => {
    if (!user) return;
    if (confirm("Rostdan ham bekor qilmoqchimisiz?")) {
      await cancelAppointment({ appointmentId: id, userId: user.id });
    }
  };

  const handleEditPhone = () => {
    setPhoneNumber(userData?.phone || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdatePhone = async () => {
    if (!user) return;
    await updateUserProfile({
      clerkId: user.id,
      name: user.fullName || "",
      phone: phoneNumber,
    });
    setIsEditDialogOpen(false);
  };

  if (!isLoaded) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  if (!user) return <div className="text-center p-10 font-medium">Iltimos, tizimga kiring</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 my-22 space-y-6 md:space-y-10">

      {/* 👤 Header Section - Responsive Layout */}
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6 bg-secondary/30 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-secondary shadow-sm">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="text-2xl">{user.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left space-y-3 w-full">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">{user.fullName}</h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm md:text-base font-medium">
              <Mail className="h-4 w-4" /> {user.primaryEmailAddress?.emailAddress}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm md:text-base font-medium">
              <Phone className="h-4 w-4" /> 
              <span>{userData?.phone || "Telefon raqam kiritilmagan"}</span>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={handleEditPhone}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Telefon raqamini tahrirlash</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefon raqami</Label>
                      <Input
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+998 XX XXX-XX-XX"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Bekor qilish
                    </Button>
                    <Button onClick={handleUpdatePhone}>
                      Saqlash
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-1">
            <Badge variant="secondary" className="px-3 py-1 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Mijoz
            </Badge>
            <SignOutButton>
              <Button variant="ghost" size="sm" className="md:hidden text-destructive hover:bg-destructive/10 gap-2">
                <LogOut className="h-4 w-4" /> Chiqish
              </Button>
            </SignOutButton>
          </div>
        </div>

        <SignOutButton>
          <Button variant="destructive" size="sm" className="hidden md:flex gap-2 px-6 rounded-full shadow-lg shadow-destructive/10">
            <LogOut className="h-4 w-4" /> Chiqish
          </Button>
        </SignOutButton>
      </div>

      {/* 🗂 Navigation Tabs */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-secondary/50 rounded-xl">
          <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:shadow-sm">
            <CalendarDays className="h-4 w-4 mr-2" /> Buyurtmalar
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:shadow-sm">
            <UserIcon className="h-4 w-4 mr-2" /> Ma'lumotlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4 outline-none">
          {!appointments ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : appointments.length === 0 ? (
            <Card className="border-dashed py-16 text-center bg-transparent">
              <div className="flex flex-col items-center gap-3">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium text-sm">Hozircha buyurtmalar mavjud emas.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {appointments.map((apt: any) => (
                <Card key={apt._id} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-all">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                      {/* Left: Date/Time */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="bg-primary/10 p-3 rounded-xl hidden xs:block">
                          <CalendarDays className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-lg md:text-xl font-bold">{apt.date}</h3>
                          <p className="text-base font-bold text-primary">{apt.time}</p>
                        </div>
                      </div>

                      {/* Right: Status & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0">
                        {apt.status === "booked" && (
                          <>
                            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/10">Kutilmoqda</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(apt._id)}
                              className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-colors"
                            >
                              Bekor qilish
                            </Button>
                          </>
                        )}
                        {apt.status === "cancelled" && (
                          <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 italic">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Bekor qilindi
                          </Badge>
                        )}
                        {apt.status === "completed" && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Tugallangan
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

        <TabsContent value="settings" className="outline-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="text-lg">Profil Ma'lumotlari</CardTitle>
              <CardDescription>Clerk orqali boshqariladigan shaxsiy ma'lumotlar.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 text-sm">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground font-medium">Ism:</span>
                  <span className="font-bold">{user.firstName}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground font-medium">Familiya:</span>
                  <span className="font-bold">{user.lastName}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground font-medium">Email:</span>
                  <span className="font-bold break-all ml-4 text-right">{user.primaryEmailAddress?.emailAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
