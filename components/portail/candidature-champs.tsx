"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  CaseDate,
  Champ,
  champ,
  ChoixBinaire,
  Erreurs,
  Liste,
  Section,
  entree,
} from "./pieces";

/**
 * Les champs de la candidature, et rien d'autre.
 *
 * Séparés du parcours parce qu'ils ne posent pas la même question. Ici : quoi
 * demander, dans quel ordre, avec quelles bornes. À côté, dans
 * candidature-flow : quand appeler l'école, que faire d'un refus, qu'afficher
 * une fois le dossier parti. Les deux tenaient dans un seul fichier de cinq
 * cent soixante lignes où il fallait défiler pour retrouver l'une ou l'autre.
 *
 * Les rangs d'animation sont partagés : ce fichier prend 1 à 6, le parcours
 * garde 0 pour l'en-tête et 7-8 pour le consentement et le bouton. Deux blocs
 * au même rang apparaîtraient ensemble au lieu de s'enchaîner.
 */

export type Choix = { id: number; nom: string };

/**
 * Une valeur à envoyer, et le libellé à montrer.
 *
 * Les deux viennent de l'école, et c'est ce qui compte : le portail n'écrit ni
 * les valeurs accentuées ni leurs traductions. Les statuts d'affectation
 * passaient auparavant par une clé ASCII indexant une table de traduction
 * locale — le jour où une école obtient un quatrième statut, le menu déroulant
 * public aurait affiché « inscription.formulaire.affectations.boursier » en
 * toutes lettres, sans qu'aucun compilateur ni aucun test des deux dépôts ne
 * puisse le voir.
 */
export type Option = { valeur: string; libelle: string };

/** L'état du formulaire, tel que le parcours le détient. */
export type Formulaire = {
  nom: string;
  prenoms: string;
  jour: string;
  mois: string;
  annee: string;
  lieu_naissance: string;
  sexe: string;
  nationalite: string;
  telephone: string;
  email: string;
  ville: string;
  commune: string;
  filiere_id: string;
  niveau_id: string;
  voeu_libre: string;
  serie_bac: string;
  etablissement_origine: string;
  annee_bac: string;
  affectation_status: string;
  /** Seul booléen du formulaire : il commande l'affichage du bloc suivant. */
  est_transfert: boolean;
  etablissement_sup_origine: string;
  formation_origine: string;
  niveau_atteint_origine: string;
  annee_derniere_inscription: string;
  motif_transfert: string;
  tuteur_nom: string;
  tuteur_lien: string;
  tuteur_telephone: string;
  tuteur_profession: string;
  message: string;
};

/** Un formulaire vide, avant toute saisie. */
export const FORMULAIRE_VIDE: Formulaire = {
  nom: "", prenoms: "", jour: "", mois: "", annee: "",
  lieu_naissance: "", sexe: "", nationalite: "",
  telephone: "", email: "", ville: "", commune: "",
  filiere_id: "", niveau_id: "", voeu_libre: "",
  serie_bac: "", etablissement_origine: "", annee_bac: "", affectation_status: "",
  est_transfert: false,
  etablissement_sup_origine: "", formation_origine: "", niveau_atteint_origine: "",
  annee_derniere_inscription: "", motif_transfert: "",
  tuteur_nom: "", tuteur_lien: "", tuteur_telephone: "", tuteur_profession: "",
  message: "",
};

/**
 * Les champs que ce formulaire sait montrer en faute.
 *
 * Un 422 ne peut être imputé au candidat que s'il désigne au moins l'un
 * d'eux. Le contrat porte un champ que le formulaire ne dessine pas —
 * `ip_client`, injecté par le relais : un 422 sur lui seul afficherait
 * « vérifiez les champs signalés » sans en signaler aucun, et le candidat
 * corrigerait au hasard indéfiniment, pour une cause qui n'a rien à voir avec
 * lui.
 *
 * Dérivé de `FORMULAIRE_VIDE` plutôt qu'écrit à la main : un champ ajouté au
 * formulaire entre ici tout seul. Les trois cases de date valent pour le
 * `date_naissance` du serveur, et le consentement n'est pas dans l'état du
 * formulaire mais porte bien une marque.
 */
export const CHAMPS_MONTRABLES: ReadonlySet<string> = new Set([
  ...Object.keys(FORMULAIRE_VIDE).filter((c) => !["jour", "mois", "annee"].includes(c)),
  "date_naissance",
  "consentement",
  // `voeu` n'est pas un champ mais la section entière : la contrainte porte sur
  // filière OU niveau OU texte libre, et le serveur nomme son erreur ainsi pour
  // qu'elle s'affiche là plutôt que sous le dernier des trois.
  "voeu",
]);

/**
 * Les bornes de saisie, alignées sur les règles du serveur.
 *
 * Un formulaire public qui refuse au dernier moment ce qu'il a laissé taper
 * met le candidat dans une impasse : il reçoit « vérifiez les champs » sans
 * savoir lequel. Borner la frappe supprime la question.
 */
/**
 * Les bornes des champs, copiées de `PortailCandidatureRequest` côté KLASSCI.
 *
 * Elles ne servent qu'au confort : l'attribut `maxLength` arrête la frappe
 * avant l'envoi, plutôt que de laisser le serveur refuser un formulaire déjà
 * rempli. C'est bien le serveur qui décide — celui-ci n'est qu'une copie, et
 * une copie trop LARGE laisse passer une saisie que le serveur refusera.
 *
 * Ces bornes suivent elles-mêmes celles du formulaire d'inscription de l'école,
 * pas l'inverse : une valeur acceptée ici et refusée là-bas ressort chez un
 * agent, sur un champ qu'il n'a pas tapé, sans indication d'où elle vient.
 */
const LONGUEURS = {
  nom: 100,
  prenoms: 100,
  lieu_naissance: 100,
  telephone: 30,
  email: 100,
  ville: 100,
  commune: 100,
  voeu_libre: 255,
  serie_bac: 60,
  etablissement_origine: 150,
  etablissement_sup_origine: 150,
  formation_origine: 150,
  niveau_atteint_origine: 60,
  motif_transfert: 1000,
  tuteur_nom: 100,
  tuteur_telephone: 30,
  tuteur_profession: 120,
} as const;

/** Les listes que l'école publie. Toutes vides tant que /choix n'a pas répondu. */
export type ChoixPublies = {
  filieres: Choix[];
  niveaux: Choix[];
  affectations: Option[];
  /**
   * Les liens de parenté que l'école accepte pour un tuteur.
   *
   * Publiés par l'école, pas écrits ici : son formulaire d'inscription n'en
   * accepte que quatre, et le champ était libre côté portail. « Grand-père »
   * ou « oncle » arrivaient donc dans un menu déroulant qui ne les connaît
   * pas, et il fallait deviner lequel des quatre ils voulaient dire.
   */
  liens_tuteur: Option[];
  nationalites: Option[];
};

export type ProprietesChamps = {
  form: Formulaire;
  set: (cle: keyof Formulaire) => (valeur: string | boolean) => void;
  /** Les messages d'erreur du serveur pour un champ, déjà localisés. */
  messagesDe: (champ: string) => string[] | undefined;
  choix: ChoixPublies;
};

export function ChampsCandidature({
  form,
  set,
  messagesDe,
  choix: { filieres, niveaux, affectations, liens_tuteur, nationalites },
}: ProprietesChamps) {
  const t = useTranslations("inscription");

  return (
    <>
      <m.div {...entree(1)}>
        <Section titre={t("formulaire.identite")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Champ label={t("formulaire.nom")} value={form.nom} onChange={set("nom")}
                 maxLength={LONGUEURS.nom} erreurs={messagesDe("nom")} autoComplete="family-name" />
          <Champ label={t("formulaire.prenoms")} value={form.prenoms} onChange={set("prenoms")}
                 maxLength={LONGUEURS.prenoms} erreurs={messagesDe("prenoms")} autoComplete="given-name" />
        </div>

        <div className="mt-3">
          <span className="block text-sm font-medium">{t("formulaire.naissance")}</span>
          <div className="mt-1 grid grid-cols-[1fr_1fr_1.4fr] gap-2">
            <CaseDate label={t("formulaire.jour")} value={form.jour} onChange={set("jour")} max={2} placeholder="15" />
            <CaseDate label={t("formulaire.mois")} value={form.mois} onChange={set("mois")} max={2} placeholder="03" />
            <CaseDate label={t("formulaire.annee")} value={form.annee} onChange={set("annee")} max={4} placeholder="2007" />
          </div>
          <Erreurs messages={messagesDe("date_naissance")} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Champ label={t("formulaire.lieuNaissance")} value={form.lieu_naissance}
                 onChange={set("lieu_naissance")} maxLength={LONGUEURS.lieu_naissance}
                 erreurs={messagesDe("lieu_naissance")} />
          {/* La nationalité est un vocabulaire fermé servi par l'école : tant
              qu'elle n'a pas répondu, mieux vaut ne rien proposer qu'un champ
              libre dont la valeur ne correspondrait à aucune de ses options. */}
          {nationalites.length > 0 ? (
            <Liste label={t("formulaire.nationalite")} vide={t("formulaire.choisir")}
                   options={nationalites} value={form.nationalite}
                   onChange={set("nationalite")} erreurs={messagesDe("nationalite")} />
          ) : (
            <div />
          )}
        </div>

        <div className="mt-3">
          <Liste label={t("formulaire.sexe")} vide={t("formulaire.nonPrecise")}
                 value={form.sexe} onChange={set("sexe")} erreurs={messagesDe("sexe")}
                 options={[
                   { valeur: "M", libelle: t("formulaire.masculin") },
                   { valeur: "F", libelle: t("formulaire.feminin") },
                 ]} />
        </div>
      </m.div>

      <m.div {...entree(2)}>
        <Section titre={t("formulaire.contact")} />
        <Champ label={t("formulaire.telephone")} value={form.telephone} onChange={set("telephone")}
               aide={t("formulaire.telephoneAide")} inputMode="tel"
               maxLength={LONGUEURS.telephone} erreurs={messagesDe("telephone")} autoComplete="tel" />
        <div className="mt-3">
          <Champ label={t("formulaire.email")} value={form.email} onChange={set("email")}
                 type="email" inputMode="email" maxLength={LONGUEURS.email}
                 erreurs={messagesDe("email")} autoComplete="email" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Champ label={t("formulaire.ville")} value={form.ville} onChange={set("ville")}
                 maxLength={LONGUEURS.ville} erreurs={messagesDe("ville")} autoComplete="address-level2" />
          <Champ label={t("formulaire.commune")} value={form.commune} onChange={set("commune")}
                 maxLength={LONGUEURS.commune} erreurs={messagesDe("commune")} autoComplete="address-level3" />
        </div>
      </m.div>

      <m.div {...entree(3)}>
        <Section titre={t("formulaire.voeu")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Liste label={t("formulaire.filiere")} vide={t("formulaire.choisir")}
                 options={filieres.map((f) => ({ valeur: String(f.id), libelle: f.nom }))}
                 value={form.filiere_id} onChange={set("filiere_id")}
                 erreurs={messagesDe("filiere_id")} />
          <Liste label={t("formulaire.niveau")} vide={t("formulaire.choisir")}
                 options={niveaux.map((n) => ({ valeur: String(n.id), libelle: n.nom }))}
                 value={form.niveau_id} onChange={set("niveau_id")}
                 erreurs={messagesDe("niveau_id")} />
        </div>
        <div className="mt-3">
          <Champ label={t("formulaire.voeuLibre")} value={form.voeu_libre} onChange={set("voeu_libre")}
                 maxLength={LONGUEURS.voeu_libre} erreurs={messagesDe("voeu_libre")} />
        </div>
        {/* La contrainte porte sur les trois champs ENSEMBLE : filière ou
            niveau ou texte libre. Elle se signale donc au niveau de la
            section. Accrochée au dernier champ, elle affichait « Cette
            information est nécessaire » juste sous un libellé qui commence
            par « Ou », et envoyait décrire à la main une formation qu'il
            suffisait de choisir dans la liste au-dessus. */}
        <Erreurs messages={messagesDe("voeu")} />
      </m.div>

      <m.div {...entree(4)}>
        <Section titre={t("formulaire.parcours")} />

        {/* La question vient AVANT le bac, parce qu'elle décide de la suite.
            Posée après, le candidat transféré aurait déjà rempli trois champs
            de lycée en se demandant s'il était au bon endroit.

            C'est aussi la question que le formulaire de l'école ne peut pas
            poser ici : là-bas elle se déduit de la classe choisie, et le
            candidat ne choisit pas de classe — il exprime un vœu. La
            déclaration directe est donc la seule source, et c'est la
            meilleure : personne ne connaît mieux son parcours que lui. */}
        <ChoixBinaire
          label={t("formulaire.provenance")}
          value={form.est_transfert}
          onChange={set("est_transfert")}
          erreurs={messagesDe("est_transfert")}
          options={[
            { valeur: false, libelle: t("formulaire.provenanceLycee"), aide: t("formulaire.provenanceLyceeAide") },
            { valeur: true, libelle: t("formulaire.provenanceTransfert"), aide: t("formulaire.provenanceTransfertAide") },
          ]}
        />

        {/* Le bac reste demandé dans les deux cas : un transféré en a un, et
            c'est la pièce que l'école vérifie en premier. */}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Champ label={t("formulaire.serieBac")} value={form.serie_bac} onChange={set("serie_bac")}
                 maxLength={LONGUEURS.serie_bac} erreurs={messagesDe("serie_bac")} />
          <Champ label={t("formulaire.anneeBac")} value={form.annee_bac} onChange={set("annee_bac")}
                 inputMode="numeric" chiffresSeulement maxLength={4}
                 erreurs={messagesDe("annee_bac")} />
          <Champ label={t("formulaire.etablissementOrigine")} value={form.etablissement_origine}
                 onChange={set("etablissement_origine")} maxLength={LONGUEURS.etablissement_origine}
                 erreurs={messagesDe("etablissement_origine")} />
        </div>
        {/* Valeurs ET libellés viennent de l'école : rien de tout cela n'est
            écrit ici, donc rien ne peut diverger. */}
        {affectations.length > 0 && (
          <div className="mt-3">
            <Liste label={t("formulaire.affectation")} vide={t("formulaire.affectationInconnue")}
                   value={form.affectation_status} onChange={set("affectation_status")}
                   aide={t("formulaire.affectationAide")} erreurs={messagesDe("affectation_status")}
                   options={affectations} />
          </div>
        )}

        {/* Rendu conditionnel, et non masqué en CSS : les champs d'un
            transfert n'ont pas de sens pour un bachelier, et les garder
            montés les laisserait dans l'état du formulaire après un
            changement d'avis. Le serveur les efface aussi de son côté — ce
            point d'entrée est public, l'interface ne peut pas en être la
            seule garante. */}
        {form.est_transfert && (
          <div className="mt-4 rounded-xl border border-border bg-bg-subtle/60 p-4">
            <p className="mb-3 text-xs leading-relaxed text-text-muted">
              {t("formulaire.transfertAide")}
            </p>
            <Champ label={t("formulaire.etablissementSup")} value={form.etablissement_sup_origine}
                   onChange={set("etablissement_sup_origine")}
                   maxLength={LONGUEURS.etablissement_sup_origine}
                   erreurs={messagesDe("etablissement_sup_origine")} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Champ label={t("formulaire.formationOrigine")} value={form.formation_origine}
                     onChange={set("formation_origine")} maxLength={LONGUEURS.formation_origine}
                     erreurs={messagesDe("formation_origine")} />
              <Champ label={t("formulaire.niveauAtteint")} value={form.niveau_atteint_origine}
                     onChange={set("niveau_atteint_origine")} maxLength={LONGUEURS.niveau_atteint_origine}
                     erreurs={messagesDe("niveau_atteint_origine")} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Champ label={t("formulaire.anneeDerniereInscription")}
                     value={form.annee_derniere_inscription}
                     onChange={set("annee_derniere_inscription")}
                     inputMode="numeric" chiffresSeulement maxLength={4}
                     erreurs={messagesDe("annee_derniere_inscription")} />
              <Champ label={t("formulaire.motifTransfert")} value={form.motif_transfert}
                     onChange={set("motif_transfert")} maxLength={LONGUEURS.motif_transfert}
                     erreurs={messagesDe("motif_transfert")} />
            </div>
          </div>
        )}
      </m.div>

      <m.div {...entree(5)}>
        <Section titre={t("formulaire.tuteur")} />
        <p className="-mt-1 mb-2 text-pretty text-xs leading-relaxed text-text-muted">
          {t("formulaire.tuteurAide")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Champ label={t("formulaire.tuteurNom")} value={form.tuteur_nom} onChange={set("tuteur_nom")}
                 maxLength={LONGUEURS.tuteur_nom} erreurs={messagesDe("tuteur_nom")} />
          {/* Masqué si l'école ne publie pas la liste : une liste déroulante
              vide ne se remplit pas, et ce champ est facultatif. Même garde que
              pour l'affectation, juste au-dessus. */}
          {liens_tuteur.length > 0 && (
            <Liste label={t("formulaire.tuteurLien")} vide={t("formulaire.choisir")}
                   value={form.tuteur_lien} onChange={set("tuteur_lien")}
                   erreurs={messagesDe("tuteur_lien")} options={liens_tuteur} />
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {/* Pas d'indice de remplissage sur ce téléphone-ci : le tuteur est une
              autre personne, proposer le numéro du candidat serait à côté. */}
          <Champ label={t("formulaire.tuteurTelephone")} value={form.tuteur_telephone}
                 onChange={set("tuteur_telephone")} inputMode="tel"
                 maxLength={LONGUEURS.tuteur_telephone} erreurs={messagesDe("tuteur_telephone")} />
          <Champ label={t("formulaire.tuteurProfession")} value={form.tuteur_profession}
                 onChange={set("tuteur_profession")} maxLength={LONGUEURS.tuteur_profession}
                 erreurs={messagesDe("tuteur_profession")} />
        </div>
      </m.div>

      <m.div {...entree(6)} className="mt-4">
        <label className="block">
          <span className="block text-sm font-medium">{t("formulaire.message")}</span>
          <textarea rows={3} value={form.message} onChange={(e) => set("message")(e.target.value)}
                    className={champ} maxLength={2000} />
          <Erreurs messages={messagesDe("message")} />
        </label>
      </m.div>
    </>
  );
}
