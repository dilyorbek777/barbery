import { dark } from '@clerk/themes';
import { Calendar, House, User } from 'lucide-react';
export const CLERK_APPEARANCE = {
  baseTheme: dark,
  variables: {
    colorPrimary: "oklch(0.508 0.118 165.612)",
    borderRadius: "0.625rem",
  },
  elements: {
    card: "bg-transparent shadow-none border-0",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
    socialButtonsBlockButton: "border border-input hover:bg-accent text-white",
    socialButtonsBlockButtonText: "font-medium",
    footer: "hidden",
  }
}

export const navLinks = [
  {
    label: "Bosh sahifa",
    href: "/",
    icon: House
  },
  {
    label: "Taqvim",
    href: "/appointments",
    icon: Calendar
  },
  {
    label: "Profil",
    href: "/profile",
    icon: User
  },
]