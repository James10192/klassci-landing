import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Le reglage `alternateLinks` vit dans `i18n/routing.ts`, avec le reste de la
// configuration de langue.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
