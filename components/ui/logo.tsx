import { Link } from "@/i18n/navigation";

export function Logo({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "footer";
}) {
  const colorClass =
    variant === "footer" ? "text-footer-text" : "text-text";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="KLASSCI"
    >
      <span
        aria-hidden
        className={`font-serif font-medium tracking-tight text-[1.15rem] leading-none ${colorClass}`}
        style={{ letterSpacing: "-0.02em" }}
      >
        KLASSCI
      </span>
    </Link>
  );
}
