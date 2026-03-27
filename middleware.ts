import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; // ✅ Add this import

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/telegram(.*)",
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

  // 2. Admin route safety - redirect non-authenticated users to sign-in
  if (isAdminRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Note: Role-based access control is handled client-side in AdminGuard component
  // because middleware doesn't have access to Convex user data
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api/telegram).*)", // ✅ exclude telegram
  ],
};
