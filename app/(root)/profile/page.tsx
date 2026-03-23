"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phoneNumbers[0]?.phoneNumber || "");
  const [error, setError] = useState("");

  const updateUser = useMutation(api.users.updateUserProfile); // we'll create this

  const handleSubmit = async () => {
    if (!name || !phone) {
      setError("Please enter both name and phone");
      return;
    }

    try {
      await updateUser({ clerkId: user!.id, name, phone });
      router.push("/"); // go to home after completion
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Complete Your Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>Phone:</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}