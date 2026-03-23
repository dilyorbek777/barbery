"use client"
import Link from "next/link"
import { navLinks } from "@/constants"
import { usePathname } from "next/navigation"

const Navbar = () => {
    const pathname = usePathname()
    return (
        <nav className="flex z-50 items-center backdrop-blur-lg justify-between p-4 mx-auto fixed bottom-0 left-0 right-0  bg-primary rounded-t-2xl max-w-4xl w-full">
            {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`flex flex-col items-center  gap-1 w-1/3 ${link.href === pathname ? 'bg-white  rounded-full p-2 text-primary' : 'text-white'}`}>
                    {<link.icon />}
                    {link.label}
                </Link>
            ))}
            
            
        </nav>
    )
}

export default Navbar