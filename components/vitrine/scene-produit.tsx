"use client";

import Image from "next/image";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useCallback, type PointerEvent } from "react";

/**
 * La démonstration du produit, en haut de la page d'accueil.
 *
 * Trois écrans réels de KLASSCI, posés en perspective : le pilotage du
 * supérieur, la caisse d'un collège, et l'application telle qu'un parent la
 * tient dans la main. C'est la seule chose de cette page qui prouve que le
 * produit existe.
 *
 * Deux choix expliquent la forme :
 *
 * 1. **Au repos, elle ne bouge pas.** Elle tournait auparavant en boucle, sans
 *    fin et sans raison : une capture d'écran, un aperçu de partage ou un
 *    visiteur qui lit le titre attrapaient la composition au milieu d'un
 *    mouvement, donc de travers. Le relief est posé une fois, franchement, et
 *    il tient.
 * 2. **Elle répond au curseur.** Le mouvement devient une réponse à l'intérêt
 *    du visiteur plutôt qu'un tic permanent — et il suffit d'un geste pour
 *    comprendre que les écrans ont de la profondeur. Il n'y a pas de curseur
 *    sur un téléphone : la scène y reste simplement posée, ce qui est le bon
 *    comportement plutôt qu'une animation qu'on ne peut pas déclencher.
 *
 * Les étiquettes font le reste du travail. Trois écrans sans légende, c'est de
 * la décoration ; nommés, ils disent en une seconde ce que le produit couvre.
 */

/** L'inclinaison au repos, en degrés. Assez pour le relief, pas au point de gêner la lecture. */
const REPOS = { x: 7, y: -8 };

/** L'amplitude ajoutée par le curseur, de part et d'autre du repos. */
const AMPLITUDE = { x: 5, y: 7 };

const RESSORT = { stiffness: 140, damping: 20, mass: 0.6 } as const;

export type EtiquettesScene = {
  pilotage: string;
  caisse: string;
  mobile: string;
};

function Etiquette({ children, className }: { children: string; className: string }) {
  return (
    <span
      className={`absolute z-10 rounded-full border border-border bg-bg-card/95 px-3 py-1.5 text-[0.7rem] font-medium text-text-secondary shadow-[0_8px_24px_rgba(15,23,42,0.10)] backdrop-blur-sm ${className}`}
    >
      {children}
    </span>
  );
}

export function SceneProduit({ etiquettes }: { etiquettes: EtiquettesScene }) {
  const mouvementReduit = useReducedMotion();

  // -0.5 à 0.5, la position du curseur rapportée à la scène.
  const positionX = useMotionValue(0);
  const positionY = useMotionValue(0);

  const doux = { x: useSpring(positionX, RESSORT), y: useSpring(positionY, RESSORT) };

  const rotateX = useTransform(doux.y, [-0.5, 0.5], [REPOS.x + AMPLITUDE.x, REPOS.x - AMPLITUDE.x]);
  const rotateY = useTransform(doux.x, [-0.5, 0.5], [REPOS.y - AMPLITUDE.y, REPOS.y + AMPLITUDE.y]);

  const suivre = useCallback(
    (evenement: PointerEvent<HTMLDivElement>) => {
      // Le doigt n'a pas à faire tourner la scène : sur un écran tactile, le
      // même geste sert à faire défiler la page, et la scène partirait de
      // travers à chaque défilement.
      if (mouvementReduit || evenement.pointerType !== "mouse") return;

      const cadre = evenement.currentTarget.getBoundingClientRect();

      positionX.set((evenement.clientX - cadre.left) / cadre.width - 0.5);
      positionY.set((evenement.clientY - cadre.top) / cadre.height - 0.5);
    },
    [mouvementReduit, positionX, positionY],
  );

  const relacher = useCallback(() => {
    positionX.set(0);
    positionY.set(0);
  }, [positionX, positionY]);

  return (
    <div
      className="relative min-h-[34rem] [perspective:1200px]"
      onPointerMove={suivre}
      onPointerLeave={relacher}
    >
      <m.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={
          mouvementReduit
            ? { transform: `rotateX(${REPOS.x}deg) rotateY(${REPOS.y}deg)` }
            : { rotateX, rotateY }
        }
      >
        <Image
          src="/img/dashboard/01-dashboard.png"
          alt=""
          width={1200}
          height={760}
          priority
          className="absolute left-10 top-4 w-[80%] rounded-lg border border-border bg-bg-card shadow-[0_30px_80px_rgba(4,83,203,0.18)]"
        />
        <Etiquette className="left-6 top-0">{etiquettes.pilotage}</Etiquette>

        <Image
          src="/img/college/current-dashboard.png"
          alt=""
          width={1200}
          height={760}
          className="absolute bottom-8 right-0 w-[74%] rounded-lg border border-border bg-bg-card shadow-[0_24px_70px_rgba(26,26,26,0.16)]"
        />
        <Etiquette className="bottom-2 right-2">{etiquettes.caisse}</Etiquette>

        <div className="absolute bottom-1 left-3 h-64 w-32 rounded-[1.5rem] border-[8px] border-[#111827] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <Image
            src="/img/college/current-mobile-dashboard.png"
            alt=""
            width={390}
            height={844}
            className="h-full w-full rounded-[1rem] object-cover object-top"
          />
        </div>
        <Etiquette className="bottom-[17rem] left-0">{etiquettes.mobile}</Etiquette>
      </m.div>
    </div>
  );
}
