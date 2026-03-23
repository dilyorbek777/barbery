import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await convex.query(api.users.getUser, {
    clerkId: userId,
  });

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <h1>Admin Panel 🔐</h1>
      <p>Only barber can see this</p>
    </div>
  );
}