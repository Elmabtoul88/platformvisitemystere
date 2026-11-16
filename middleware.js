// middleware.js
import { NextResponse } from "next/server";

const PUBLIC_PAGES = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/dashboard",
  "/forgot-password",
  "/reset-password",
];
const AUTH_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ignorer les appels API internes, les assets statiques et images
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Lecture du cookie d'authentification compatible SSR / Edge Runtime
  const authCookie = request.cookies.get("missionViewAuth")?.value;
  let token = null;
  let userRole = null;

  if (authCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie));
      token = parsed.token || null;
      userRole = parsed.user?.role || null;
    } catch (e) {
      token = authCookie;
    }
  }

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isPublicPage = PUBLIC_PAGES.some((page) => pathname === page || pathname.startsWith(page + "/"));

  // 1. Utilisateur connecté tentant d'accéder à /login ou /signup uniquement -> Rediriger vers son espace
  const isLoginOrSignup = pathname.startsWith("/login") || pathname.startsWith("/signup");
  if (token && isLoginOrSignup) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userRole === "client") {
      return NextResponse.redirect(new URL("/client", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Utilisateur non connecté tentant d'accéder à une page privée
  if (!token && !isPublicPage && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Contrôle de rôle : Seuls les admins accèdent à /admin/*
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Contrôle de rôle : Seuls les clients et admins accèdent à /client/*
  if (pathname.startsWith("/client") && userRole !== "client" && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.ico).*)",
  ],
};
