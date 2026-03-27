"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Phone, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfileCompletePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateUser = useMutation(api.users.updateUserProfile);

  // Sync Clerk data once loaded
  useEffect(() => {
    if (isLoaded && user) {
      setName(user.fullName || "");
      setPhone(user.primaryPhoneNumber?.phoneNumber || "");
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError("Iltimos, ism va telefon raqamingizni kiriting");
      return;
    }

    // Phone validation: must start with +998 and have exactly 9 digits after
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("Telefon raqami +998 bilan boshlanishi va 9 ta raqamdan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateUser({ clerkId: user!.id, name, phone });
      router.push("/"); // Home sahifasiga qaytish
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/20">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Profilni yakunlash</CardTitle>
          <CardDescription>
            Xizmatlardan foydalanish uchun ma'lumotlaringizni tasdiqlang.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">To'liq ismingiz</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Ali Valiyev"
                  className="pl-10 h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Telefon raqamingiz</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  className="pl-10 h-11"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
          <br />
          <CardFooter className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold transition-all hover:shadow-lg hover:shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              Saqlash va Davom etish
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
