"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Shadcn UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDays,
    Scissors,
    Sparkles
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const Topbar = () => {
    const { user, isLoaded } = useUser();

    // Fetch only the latest upcoming appointment for the badge
    const appointments = useQuery(
        api.appointments.getUserAppointments,
        user ? { userId: user.id } : "skip"
    );

    const upcomingCount = appointments?.filter(a => a.status === "booked").length || 0;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center  ">
            <div className="w-full max-w-4xl bg-background/60 backdrop-blur-xl border border-primary/20 rounded-b-2xl md:rounded-full shadow-2xl shadow-primary/5 px-4 py-2 md:px-6 flex items-center justify-between transition-all duration-300">

                {/* 💈 Logo/Brand Section */}
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl md:rounded-full hidden sm:flex shadow-lg shadow-primary/20">
                        <Scissors className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        {!isLoaded ? (
                            <Skeleton className="h-4 w-24 mb-1" />
                        ) : (
                            <p className="text-sm md:text-base font-medium flex items-center gap-1.5 leading-none">
                                Salom, <span className="font-bold text-primary">{user?.firstName || "Mehmon"}</span>!
                                <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
                            </p>
                        )}
                        <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">
                            Barber Shop 💈
                        </p>
                    </div>
                </div>

                {/* 👤 User Actions Section */}
                <div className="flex items-center gap-3 md:gap-5">
                    {/* Quick Stats Badge (Only if they have appointments) */}
                    {upcomingCount > 0 && (
                        <Badge variant="outline" className="hidden md:flex gap-1.5 bg-primary/5 border-primary/20 py-1 px-3">
                            <CalendarDays className="h-3 w-3 text-primary" />
                            <span className="text-xs font-bold text-primary">{upcomingCount} Navbat</span>
                        </Badge>
                    )}

                    {/* User Profile / Clerk Button */}
                    <div className="flex items-center gap-2 border-l pl-3 md:pl-5 border-border/50">
                        {!isLoaded ? (
                            <Skeleton className="h-10 w-10 rounded-full" />
                        ) : (
                            <div className="hover:scale-105 transition-transform duration-200">
                                {/* Using Clerk's UserButton for built-in profile/signout management */}
                                <UserButton
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "h-10 w-10 border-2 border-primary/20 shadow-sm"
                                        }
                                    }}
                                />
                            </div>
                        )}

                        <ModeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
