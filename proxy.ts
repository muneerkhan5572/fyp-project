import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { decrypt, SESSION_COOKIE_NAME } from "@/lib/auth/jwt";
import { LAST_DATASET_COOKIE_NAME } from "@/lib/datasets/constants";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
const datasetPathPattern = /^\/dashboard\/([0-9a-f-]{36})(\/|$)/i;

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  if (!(isProtectedRoute || isAuthRoute)) {
    return NextResponse.next();
  }

  const session = await decrypt(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  const response = NextResponse.next();

  const datasetMatch = session?.userId && path.match(datasetPathPattern);
  const isPrefetch =
    req.headers.has("next-router-prefetch") ||
    req.headers.get("purpose") === "prefetch";

  if (datasetMatch && !isPrefetch) {
    response.cookies.set(LAST_DATASET_COOKIE_NAME, datasetMatch[1], {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
