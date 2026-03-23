import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; // ✅ Add this import

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Not logged in → redirect to sign-up
  if (!userId && !isPublicRoute(req)) {
    // ✅ Use NextResponse instead of Response
    return NextResponse.redirect(
      new URL(`/sign-up?redirect_url=${req.url}`, req.url)
    );
  }

  // 2. Admin route safety
  if (isAdminRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
