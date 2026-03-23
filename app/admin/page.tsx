// /app/admin/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import DisableSlots from "@/components/disableSlots";

export default function AdminPanel() {
  const appointments = useQuery(api.appointments.getAllAppointmentsWithUser);

  const complete = useMutation(api.appointments.completeAppointment);
  const cancel = useMutation(api.appointments.adminCancelAppointment);

  if (!appointments) return <p>Loading...</p>;

  return (
    <div>
      <h1>Admin Panel 💈</h1>

      <br />
      <DisableSlots />
      <br />

      {appointments.map((a) => (
        <div key={a._id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <p><b>User:</b> {a.name}</p>
          <p><b>Phone:</b> {a.phone}</p>
          <p><b>Date:</b> {a.date}</p>
          <p><b>Time:</b> {a.time}</p>
          <p><b>Status:</b> {a.status}</p>

          {a.status === "booked" && (
            <>
              <button onClick={() => complete({ appointmentId: a._id })}>
                Complete ✅
              </button>
              <button onClick={() => cancel({ appointmentId: a._id })}>
                Cancel ❌
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}