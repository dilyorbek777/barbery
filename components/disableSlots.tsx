// /app/admin/disableSlots.tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DisableSlots() {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");

  const disableDay = useMutation(api.admin.disableDay);
  const disableHour = useMutation(api.admin.disableHour);

  return (
    <div>
      <h2>Disable Slots</h2>

      <div>
        <label>Date (YYYY-MM-DD):</label>
        <input value={date} type="date" onChange={(e) => setDate(e.target.value)} />
        <button onClick={() => disableDay({ date })}>Disable Full Day</button>
      </div>

      <div>
        <label>Hour (optional, e.g., 14:00):</label>
        <input type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
        <button onClick={() => disableHour({ date, hour })}>Disable Hour</button>
      </div>
    </div>
  );
}