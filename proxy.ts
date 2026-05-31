import { NextResponse, type NextRequest } from "next/server";
import { decryptSession } from "@/lib/auth/session";

const PROTECTED_PREFIXES = ["/merchant", "/developer", "/admin"];

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  const session = await decryptSession(token);
  if (!session?.userId) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("next", path);
    return NextResponse.redirect(signIn);
  }

  if (path.startsWith("/merchant") && session.role !== "MERCHANT") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/developer") && session.role !== "DEVELOPER") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (path.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/merchant/:path*", "/developer/:path*", "/admin/:path*"],
};
