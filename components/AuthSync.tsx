"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isAdminEmail } from "@/lib/admin";

export default function AuthSync() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    console.log("AuthSync running...");
    console.log("isLoaded:", isLoaded);
    console.log("user:", user);

    if (!isLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    console.log("email:", email);

    if (!email) return;

    const role = isAdminEmail(email) ? "admin" : "user";

    console.log("Creating user with role:", role);

    createUser({
      clerkId: user.id,
      email,
      role,
    });
  }, [user, isLoaded, createUser]);

  return null;
}