export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/contracts/:path*", "/vendors/:path*", "/settings/:path*"],
};
