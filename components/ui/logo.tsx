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
      {/* `priority` posait un `link rel=preload fetchpriority=high` sur toutes
          les pages, en concurrence directe avec la vraie image LCP. Le logo
          reste charge sans attendre le defilement — `loading="eager"` — mais
          il ne prend plus la bande passante du premier rendu.

          `width`/`height` decrivent la taille d'AFFICHAGE (meme rapport que le
          fichier source, 469x179), pas celle du fichier. Ils ne changent rien
          au rendu — c'est `h-7 w-auto` qui le gouverne — mais ils disent a
          l'optimiseur quelle taille produire, et c'est la seule chose qu'il
          regarde.

          Et surtout, plus de `sizes` : sur une image a taille fixe, il fait
          l'inverse de ce qu'on croit. Next publie un `srcset` de deux entrees
          (1x, 2x) quand il est absent, et un `srcset` de TOUTES les largeurs
          configurees — quinze ici — quand il est present. Ce logo est sur
          chaque page du site. */}
      <Image
        src="/img/logo-klassci-full.png"
        alt="KLASSCI"
        width={160}
        height={61}
        loading="eager"
        className={`h-7 w-auto ${filterClass}`}
      />
    </Link>
  );
}
