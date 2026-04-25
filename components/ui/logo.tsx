import Image from "next/image";

import { Link } from "@/i18n/navigation";

export function Logo({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "footer";
}) {
  // Footer variant: invert the wordmark to white via CSS filter — the source PNG
  // is bicolor (orange K + blue LASSCI on transparent), and on the dark blue
  // footer background the orange would clash. brightness(0)+invert(1) flattens
  // it to a clean white wordmark.
  const filterClass =
    variant === "footer"
      ? "[filter:brightness(0)_invert(1)] opacity-90"
      : "";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="KLASSCI"
    >
      <Image
        src="/img/logo-klassci-full.png"
        alt="KLASSCI"
        width={469}
        height={179}
        priority
        className={`h-7 w-auto ${filterClass}`}
      />
    </Link>
  );
}
