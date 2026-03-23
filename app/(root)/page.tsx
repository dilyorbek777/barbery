"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import BookingForm from "@/components/BookingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function BookButton() {
  const { user } = useUser();
  const createAppointment = useMutation(api.appointments.createAppointment);

  const handleBook = async () => {
    if (!user) return;

    try {
      await createAppointment({
        userId: user.id,
        date: "2026-03-25",
        time: "14:00",
      });

      alert("Booked!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return <button onClick={handleBook}>Book 14:00</button>;
}

const Home = () => {
  const { user } = useUser();
  const appointments = useQuery(
    api.appointments.getUserAppointments,
    user ? { userId: user.id } : "skip"
  );
  const cancel = useMutation(api.appointments.cancelAppointment);

  const handleCancel = async (appointmentId: Id<"appointments">) => {
    if (!user) return;

    try {
      await cancel({
        appointmentId,
        userId: user.id,
      });
      alert("Cancelled!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full p-5 ">
      <div className="flex items-center  gap-2 justify-between mb-5 inset-shadow shadow-2xs">
        {user?.fullName && <p className="text-2xl">Xush kelibsiz, <span className="font-bold tracking-wide">{user.fullName}</span>!</p>}
        {user?.imageUrl && <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full" />}
      </div>
      <h3 className="text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-primary to-white" >Sizning Qabulingiz: </h3>

      {!appointments && <p>Sizda hozircha qabul mavjud emas...</p>}
      {appointments && (
        <div className="gap-3 flex flex-col w-full  space-y-2">
          {appointments.map((apt) => (
            <div key={apt._id} className="w-full flex justify-between bg-accent items-center py-2 px-4 rounded-lg">
              <div className="w-3/5">
                <h3 className="text-2xl font-bold ">{apt.date}</h3>
                <p className="text-xl text-foreground">
                  <span className="font-bold text-primary dark:text-white">Vaqti: </span>
                  {apt.time}
                </p>
              </div>

              <div className="bg-transparent w-2/5 border-none">
                {apt.status === "booked" && (

                  <Button onClick={() => handleCancel(apt._id)} variant="destructive" size="sm" className="w-full hover:bg-destructive/80 px-2 py-4">
                    Bekor qilish
                  </Button>
                )}
                {apt.status === "cancelled" && (
                  <Button disabled variant="destructive" size="sm" className="w-full hover:bg-destructive/80 cursor-pointer px-2 py-4">
                    Bekor qilindi
                  </Button>
                )}
                {apt.status === "completed" && (
                  <Button variant="default" size="sm" className="w-full hover:shadow-2xl hover:shadow-primary transition-all duration-300 px-2 py-4">
                    Completed
                  </Button>
                )}

              </div>
            </div>

          ))}
        </div>
      )}


      <br /><br />
      <BookingForm />
    </div>
  )
}

export default Home