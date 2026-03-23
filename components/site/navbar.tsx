
import { Show, SignInButton, UserButton } from "@clerk/nextjs"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between p-4">
            Navbar
            <ModeToggle />
            <div className="flex items-center justify-center gap-5">
                <Show when="signed-out">
                    <Link href={'/sign-in'}>
                        <button className="border border-white backdrop-blur-sm hover:backdrop-blur-2xl font-semibold  text-white 
                            hover:border-primary
                             flex items-center justify-center gap-2 rounded-sd text-lg cursor-pointer text-[16px] px-8 py-3  hover:bg-primary hover:text-white transition-all  ">Sign In</button>

                    </Link>
                    <Link href={'/sign-up'}>
                        <button className=" text-[16px] px-8 py-3 bg-primary cursor-pointer hover:bg-primary-700 transition-all  font-semibold rounded-sd">Sign Up</button>

                    </Link>

                </Show>
                <Show when="signed-in">
                    <UserButton />
                </Show>
            </div>
        </nav>
    )
}

export default Navbar