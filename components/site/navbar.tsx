
import { Show, SignInButton, UserButton } from "@clerk/nextjs"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import { Calendar, House, User } from "lucide-react"

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between p-4 mx-auto absolute bottom-0 left-0 w-4xl">
            <Link href={'/'} className="flex flex-col items-center gap-1">
                <House />Bosh sahifa
            </Link>

            <Link href={'/appointments'} className="flex flex-col items-center gap-1">
                <Calendar />Taqvim
            </Link>

            <Link href={'/profile'} className="flex flex-col items-center gap-1">
                <User />
                Profil
            </Link>
            
        </nav>
    )
}

export default Navbar