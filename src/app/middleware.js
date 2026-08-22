import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect halaman Root (/) ke dashboard atau login
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Proteksi Halaman Dashboard (Harus ada token dan nilai token tidak kosong)
  const isDashboardRoute = pathname.startsWith("/dashboard");
  if (isDashboardRoute && (!token || token.trim() === "")) {
    const loginUrl = new URL("/login", request.url);
    // Simpan URL asal agar bisa di-redirect balik setelah login nanti
    loginUrl.searchParams.set("callbackUrl", pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 3. Jika sudah login, cegah akses halaman Auth (/login, /register)
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute && token && token.trim() !== "") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Set Header Anti-Cache untuk Route Dashboard
  const response = NextResponse.next();
  if (isDashboardRoute) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  // Hanya jalankan middleware pada rute yang relevan untuk performa optimal
  matcher: ["/", "/dashboard/:path*", "/login"],
};