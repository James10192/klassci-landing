"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Le logo d'un établissement, ou ses initiales s'il ne se charge pas.
 *
 * Un logo qui échoue laissait une tuile blanche vide : la famille ne savait
 * plus quelle école elle regardait. L'image est servie telle quelle
 * (`unoptimized`) : elle vient de `/api/logo/[ecole]`, déjà en cache un an et
 * déjà petite, et ne dépend ainsi plus de l'optimiseur d'images du serveur —
 * c'est lui qui ne rapportait plus rien depuis le changement d'hébergement.
 */
export function ImageLogo({
  src,
  alt,
  width,
  height,
  loading,
  initiales,
  classeInitiales,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: "lazy" | "eager";
  initiales: string;
  classeInitiales: string;
}) {
  const [echec, setEchec] = useState(false);

  if (echec) {
    return <span aria-hidden className={classeInitiales}>{initiales}</span>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      unoptimized
      onError={() => setEchec(true)}
      className="h-full w-full object-contain"
    />
  );
}
