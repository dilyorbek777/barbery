import { SignIn } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/constants";

export default function Page() {
  return <div className="w-full h-screen flex items-center justify-center">
    <SignIn appearance={CLERK_APPEARANCE} />
  </div>;
}