import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Message bundles are modular: the large université namespace lives in
  // `<locale>.json`, and each edition (welcome splash, collège, lms) ships its
  // own file so the flagship JSON stays untouched. They merge into one flat
  // catalogue for next-intl.
  const [base, welcome, college, lms] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/welcome.${locale}.json`),
    import(`../messages/college.${locale}.json`),
    import(`../messages/lms.${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...base.default,
      ...welcome.default,
      ...college.default,
      ...lms.default,
    },
  };
});
