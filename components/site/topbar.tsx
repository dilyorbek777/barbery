"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";



const Topbar = () => {
    const { user } = useUser();
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
        <div className="flex z-50 backdrop-blur-lg rounded-b-2xl border-b border-primary items-center justify-between p-4 mx-auto fixed top-0 left-0 right-0 max-w-4xl w-full">
            {user?.fullName && <p className="text-2xl">Xush kelibsiz, <span className="font-bold tracking-wide">{user.fullName}</span>!</p>}
            {user?.imageUrl && <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full" />}
        </div>

    )
}

export default Topbar