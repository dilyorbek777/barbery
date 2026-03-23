import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/constants";
import AdminGuard from "@/components/AdminGuard";

// Optional: Initialize a font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Managed via Convex",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider appearance={CLERK_APPEARANCE}>
          <ConvexClientProvider>
            <AdminGuard>
              <main>
                {children}
              </main>
            </AdminGuard>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}