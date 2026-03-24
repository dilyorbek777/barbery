import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/site/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { CLERK_APPEARANCE } from "@/constants";
import AuthSync from "@/components/AuthSync";
import ProfileGuard from "@/components/ProfileGuard";
import Topbar from "@/components/site/topbar";
// import { uzUZ } from "@clerk/localizations";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barbery",
  description: "Barbery - Your trusted barber shop",
  manifest: "/manifest.json",
};

const uzbekTranslation = {
  signUp: {
    start: {
      title: "Hisob yaratish",
      subtitle: "Xush kelibsiz! Boshlash uchun Ro'yxatdan o'ting",
      actionText: "Avvalroq ro'yxatdan o'tganmisiz?",
      actionLink: "Kirish",
    },
    socialButtonsBlockButton: " {{provider|titleize}} orqali davom etish",
  },
  // If you also use the Sign In form, add this:
  signIn: {
    start: {
      title: "Tizimga kirish",
      subtitle: "Davom etish uchun hisobingizga kiring",
      actionText: "Hisobingiz yo'qmi?",
      actionLink: "Ro'yxatdan o'tish",
    },
  },
  footerAction__signIn: "Kirish",
  footerAction__signUp: "Ro'yxatdan o'tish",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col max-w-4xl mx-auto relative overflow-x-auto" >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider appearance={CLERK_APPEARANCE} localization={uzbekTranslation} afterSignOutUrl="/">
            <ConvexClientProvider>

              <ProfileGuard>
                <AuthSync />
                <Topbar />

                {children}
                <Navbar />
              </ProfileGuard>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
