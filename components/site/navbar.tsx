"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navLinks } from "@/constants"
import { cn } from "@/lib/utils" // Shadcn helper for conditional classes

const Navbar = () => {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
            <nav className="flex items-center justify-around w-full max-w-lg h-16 bg-primary/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 pointer-events-auto transition-all duration-300">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    
                    return (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            className="relative flex flex-col items-center justify-center w-full h-full group"
                        >
                            {/* 💡 Active Indicator (The pill behind the icon) */}
                            <div className={cn(
                                "absolute inset-0 mx-auto w-22 h-12 my-auto rounded-xl transition-all duration-500 ease-in-out",
                                isActive ? "bg-white scale-100 opacity-100" : "bg-white/0 scale-50 opacity-0"
                            )} />

                            {/* 🎨 Icon & Label */}
                            <div className={cn(
                                "z-10 flex flex-col items-center gap-0.5 transition-all duration-300",
                                isActive ? "text-primary -translate-y-1" : "text-white/70 group-hover:text-white"
                            )}>
                                <link.icon className={cn(
                                    "h-5 w-5 transition-transform",
                                    isActive ? "scale-110" : "scale-100"
                                )} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">
                                    {link.label}
                                </span>
                            </div>

                            {/* ✨ Small dot indicator for active tab */}
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

export default Navbar
