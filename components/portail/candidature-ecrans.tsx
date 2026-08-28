"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

import { CHAMPS_MONTRABLES } from "./candidature-champs";
import { BoutonPrincipal, Carte, RESSORT, entree } from "./pieces";
import { ecranDe, type Classement, type CodeRefusCandidature, type RegleEcran } from "./reponses";

/**
 * Les écrans qui remplacent le formulaire au lieu de l'accompagner.
 *
 * Ils sortent du parcours pour la même raison que les champs : ce sont des
 * fins, pas des étapes. Les laisser dans le fichier du parcours obligeait à
 * traverser deux retours anticipés avant d'arriver à la logique d'envoi.
 */

/**
 * Le vocabulaire d'écrans de ce parcours.
 *
 * Il vit avec les écrans, et non avec la logique d'appel : c'est ce qui permet
 * à `EcranEtat` de l'accepter en entier plutôt que de recevoir un
 * sous-ensemble filtré par une ternaire — ce filtre écrasait en silence la
 * moitié des états et laissait un « Chargement… » sans issue.
 */
export type CleEtat =
  | "ferme"
  | "nonConfigure"
  | "dejaInscrit"
  | "autrePersonne"
  /** L'école a déjà accepté ce dossier : il ne se renvoie plus. */
  | "dejaTraitee"
  /** Une acceptation sous un AUTRE nom porte ce numéro. */
  | "accepteePourUnAutre"
  /** Le dossier est dans un état que le serveur ne sait pas rouvrir. */
  | "etatInattendu"
  | "invalide"
  /** Local : le formulaire n'est pas complet, rien n'est parti. */
  | "incomplet"
  | "tropDeTentatives"
  | "affluence"
  | "indisponible";

/**
 * Ce que chaque genre de réponse donne comme écran, ici.
 *
 * Une table, pas un `switch` : le repli « le serveur n'a pas envoyé de code »
 * devient une décision explicite par genre, et non une hypothèse partagée.
 *
 * Le 429 retombe sur « trop de tentatives » parce qu'un serveur antérieur à ce
 * lot en renvoyait sans code : il y a là un historique à ménager.
 *
 * Le 409, lui, n'en a aucun — aucune version déployée n'a jamais rendu de 409
 * sur ce canal — et son repli se choisit donc uniquement sur ce qu'il est
 * honnête de dire quand on ne comprend pas le refus. Ni « une inscription
 * existe déjà pour ce numéro », qui enverrait un bachelier changer de téléphone
 * pour un fait qui n'a jamais eu lieu ; ni « service indisponible », qui
 * prescrirait de réessayer plus tard une demande qu'un conflit refusera
 * toujours. « État inattendu » n'affirme que ce qu'un 409 garantit : une
 * candidature existe pour ce numéro, elle ne peut pas être renvoyée,
 * contactez l'établissement.
 */
const ECRANS: Partial<Record<Classement["genre"], RegleEcran<CleEtat>>> = {
  ferme: { sansCode: "ferme" },
  nonConfigure: { sansCode: "nonConfigure" },
  invalide: { sansCode: "invalide" },
  conflit: {
    // 409 recouvre deux faits qu'il ne faut surtout pas confondre : une
    // inscription qui existe vraiment, et une candidature décidée sous un autre
    // nom sur le même numéro. Dire « une inscription existe » au cadet dont
    // l'aînée a été REFUSÉE lui ferait croire que la place est prise.
    // Un écran par refus. Les confondre coûte cher dans les deux sens :
    // « déjà inscrit » dirait à un candidat accepté qu'il n'a plus rien à
    // faire, et « indisponible » lui dirait de réessayer plus tard, un geste
    // qui ne réussira jamais puisque rien ne rouvre un dossier accepté depuis
    // le portail.
    codes: {
      autre_personne: "autrePersonne",
      deja_inscrit: "dejaInscrit",
      deja_traitee: "dejaTraitee",
      acceptee_pour_un_autre: "accepteePourUnAutre",
      etat_inattendu: "etatInattendu",
    } satisfies Record<CodeRefusCandidature, CleEtat>,
    // Le repli, argumenté dans l'en-tête de cette table. Il ne sert que le jour
    // où une instance rendra un 409 sans code, ou avec un code que ce site ne
    // connaît pas encore : c'est-à-dire le jour où l'hypothèse « le serveur en
    // envoie toujours un » cessera d'être vraie.
    sansCode: "etatInattendu",
  },
  tropDeTentatives: {
    // Deux seaux, deux phrases. Celui d'une adresse dit vrai en parlant de
    // tentatives ; le plafond de l'établissement se remplit du trafic de tout
    // le monde — accuser ce visiteur-ci d'avoir trop essayé serait faux, et lui
    // dire de patienter ne le débloquerait pas.
    codes: {
      affluence: "affluence",
      trop_de_tentatives: "tropDeTentatives",
      // Pas d'`identification_bloquee` ici : ce seau est celui du matricule, et
      // ce parcours n'en porte pas — le BFF ne relaie pas ce champ. Un code que
      // le canal ne peut pas produire tombe sur `indisponible`, comme tout code
      // inconnu, plutot que d'ouvrir un ecran mort avec ses traductions.
    },
    sansCode: "tropDeTentatives",
  },
};

/**
 * Le classement partagé, traduit dans le vocabulaire d'écrans d'ici.
 *
 * `classer` connaît les codes HTTP et rien d'autre ; ce qu'on en montre est
 * propre à ce parcours — la réinscription, elle, a ses propres clés. La
 * fonction est totale des deux côtés, donc aucune réponse ne peut ressortir
 * sans écran.
 */
export function ecranDu(classement: Classement): CleEtat {
  // « Vérifiez les champs signalés » n'a de sens que si l'on peut en signaler
  // un. Deux cas tombent donc ici, et ils passent par la MÊME condition :
  //
  // 1. Un 422 qui ne nomme que des champs invisibles. Le contrat porte
  //    `ip_client`, injecté par le relais et que ce formulaire ne dessine pas :
  //    un 422 sur lui seul enverrait le candidat corriger au hasard,
  //    indéfiniment, une saisie qui n'est pas en cause — et cela pour tous les
  //    candidats de l'école.
  // 2. Un 422 qui ne nomme AUCUN champ, faute de clé `champs`. C'est le cas des
  //    refus locaux du relais (`consentement_requis`, `champs_manquants`,
  //    `corps_invalide`), qu'aucun parcours par le formulaire ne peut atteindre
  //    — le blocage local intervient avant l'envoi — et qui ne se rencontrent
  //    donc que par un appel direct à l'API.
  //
  // C'est aussi pourquoi ce garde précède `ecranDe` au lieu de vivre dans la
  // table : `ECRANS.invalide.sansCode` vaut « invalide », et raisonner sur la
  // table seule laisse croire que ces réponses affichent des marques de champ.
  if (
    classement.genre === "invalide" &&
    !Object.keys(classement.champs ?? {}).some((c) => CHAMPS_MONTRABLES.has(c))
  ) {
    return "indisponible";
  }

  return ecranDe(classement, ECRANS, "indisponible");
}

/**
 * L'écran qui remplace le formulaire au lieu de l'accompagner.
 *
 * Un seul composant pour toutes ces fins, parce qu'elles ont toutes la même
 * forme : un titre, une phrase, et parfois de quoi réessayer. Deux composants
 * jumeaux dont l'un ajoutait un bouton conditionnel se seraient mis à diverger
 * sur une marge ou un rang d'animation, sans que rien ne le signale.
 *
 * Un écran plutôt qu'une alerte sous le bouton : montrer vingt-cinq champs
 * qu'on refusera ferait remplir un formulaire pour rien. Et sans lui, une
 * candidature partait AMPUTÉE — quand /choix échoue, les filières, les niveaux,
 * les nationalités et les statuts d'affectation manquent tous, mais le
 * formulaire s'affichait quand même, listes vides, bouton actif, sous un
 * bandeau qui disait « réessayez » alors que rien, dans la page, ne réessayait.
 *
 * `etat` à `null` est l'attente du premier appel : le même écran sans bouton,
 * plutôt qu'un formulaire dont les listes se rempliraient sous les doigts du
 * visiteur.
 *
 * `onReessayer` absent quand redemander ne servirait à rien : un canal fermé
 * ou mal paramétré ne s'ouvrira pas parce qu'on insiste.
 */
export function EcranEtat({
  etat,
  onReessayer,
}: {
  etat: CleEtat | null;
  onReessayer?: () => void;
}) {
  const t = useTranslations("inscription");
  const cle = etat ?? "chargement";

  return (
    <Carte>
      <m.h2 {...entree(0)} className="text-balance text-center text-xl font-semibold tracking-tight">
        {t(`etats.${cle}.titre`)}
      </m.h2>
      <m.p {...entree(1)} className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary">
        {t(`etats.${cle}.texte`)}
      </m.p>
      {etat !== null && onReessayer && (
        <m.div {...entree(2)} className="mt-5">
          <BoutonPrincipal onClick={onReessayer}>{t("formulaire.reessayer")}</BoutonPrincipal>
        </m.div>
      )}
    </Carte>
  );
}

/**
 * La candidature est partie.
 *
 * `suiteDuParcours` dit ce qui se passe ensuite — déposer en ligne ne finit
 * rien, les pièces et le paiement se remettent sur place. Le texte est résolu
 * par le parcours, qui seul connaît la date que l'école a annoncée.
 */
export function CandidatureTransmise({ suiteDuParcours }: { suiteDuParcours: string }) {
  const t = useTranslations("inscription");

  return (
    <Carte>
      <m.div
        initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={RESSORT}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-light"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
             strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-accent" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </m.div>
      <m.h2 {...entree(1)} className="mt-5 text-balance text-center text-xl font-semibold tracking-tight">
        {t("succes.titre")}
      </m.h2>
      <m.p {...entree(2)} className="mt-2 text-pretty text-center text-sm leading-relaxed text-text-secondary">
        {t("succes.texte")}
      </m.p>
      <m.p {...entree(3)} className="mt-4 text-pretty text-center text-sm leading-relaxed text-text-secondary">
        {suiteDuParcours}
      </m.p>
      <m.p {...entree(4)} className="mt-4 rounded-xl bg-bg-alt p-3 text-pretty text-center text-xs leading-relaxed text-text-muted">
        {t("succes.rappel")}
      </m.p>
    </Carte>
  );
}
