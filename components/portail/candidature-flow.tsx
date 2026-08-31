"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import type { EtablissementVisible } from "@/lib/portail/tenants";

import {
  ChampsCandidature,
  type Choix,
  type ChoixPublies,
  type Formulaire,
  type Option,
} from "./candidature-champs";
import {
  CandidatureTransmise,
  EcranEtat,
  ecranDu,
  type CleEtat,
} from "./candidature-ecrans";
import {
  DEJA_PUBLIE,
  corpsAEnvoyer,
  refusStable,
  type Physiques,
  type ReponseChoix,
} from "./candidature-echanges";
import { classer } from "./reponses";
import {
  Alerte,
  BoutonPrincipal,
  Carte,
  Erreurs,
  dateNaissanceValide,
  entree,
} from "./pieces";

/**
 * La candidature d'un NOUVEL étudiant : ce qui se passe autour des champs.
 *
 * Rien à retrouver ici, contrairement à la réinscription : le candidat n'a pas
 * de dossier, et pas de matricule — il en recevra un quand l'école l'inscrira
 * pour de bon. Le formulaire ne demande donc que ce qui sert à le rappeler et
 * à préparer son dossier ; les pièces se remettent sur place.
 *
 * Conséquence sur les messages : ici on peut dire franchement ce qui ne va
 * pas. La discipline de réponse uniforme protège la réinscription contre
 * l'énumération des matricules ; sans dossier à énumérer, elle n'aurait ici
 * aucun objet et n'apporterait que de la confusion à un bachelier.
 *
 * Les champs eux-mêmes vivent dans candidature-champs, les deux écrans de fin
 * dans candidature-ecrans. Ce fichier-ci ne garde que ce qui bouge : l'état,
 * les appels à l'école, et la traduction d'un refus en écran.
 *
 * Les rangs d'animation sont partagés avec candidature-champs, qui prend 1 à
 * 6 : ce fichier garde 0 pour l'en-tête et 7-8 pour le consentement et le
 * bouton. Deux blocs au même rang apparaîtraient ensemble au lieu de
 * s'enchaîner.
 */

export function CandidatureFlow({
  etablissement,
  saisie,
  onAboutir,
}: {
  etablissement: EtablissementVisible;
  /**
   * Signale au portail que le parcours a abouti.
   *
   * Il n'affiche « Ce n'est pas mon cas » que tant qu'on peut encore s'être
   * trompé de porte. Une fois la candidature transmise, ce bouton proposerait
   * d'annuler ce qui ne s'annule pas.
   */
  onAboutir?: (abouti: boolean) => void;
  /**
   * La saisie, tenue par le composant du dessus.
   *
   * Le bouton « Ce n'est pas mon cas » est posé juste sous « Envoyer ma
   * candidature », au bas d'un formulaire qu'on parcourt au pouce. Revenir au
   * choix démonte ce composant : si la saisie vivait ici, un effleurement
   * effacerait vingt-quatre champs — état civil, résidence, parcours, tuteur —
   * sans un mot. Sur une page dont tout le propos est de ne pas faire
   * ressaisir, c'était la seule perte de données silencieuse du parcours.
   */
  saisie: {
    form: Formulaire;
    setForm: Dispatch<SetStateAction<Formulaire>>;
    consentement: boolean;
    setConsentement: Dispatch<SetStateAction<boolean>>;
  };
}) {
  const t = useTranslations("inscription");
  const locale = useLocale();

  // Un seul état : les quatre listes arrivent ensemble, se lisent ensemble et
  // ne sont jamais écrites séparément. Les tenir à part obligeait à démonter
  // l'objet reçu puis à le remonter à chaque lecture du cache.
  //
  // `null` veut dire « l'école n'a pas encore répondu », et c'est un état à
  // part entière, pas une valeur par défaut. Un objet aux quatre listes vides
  // aurait la forme de données valides : le formulaire s'affichait, ses
  // sélecteurs vides, son bouton actif, et laissait partir une candidature
  // sans filière ni nationalité quand /choix avait échoué.
  const [choix, setChoix] = useState<ChoixPublies | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const [physiques, setPhysiques] = useState<Physiques | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [etat, setEtat] = useState<CleEtat | null>(null);
  const [champsFautifs, setChampsFautifs] = useState<Record<string, string[]>>({});
  /**
   * A-t-on déjà essayé d'envoyer ?
   *
   * Un booléen, et non la liste de ce qui manquait : cette liste-là était un
   * instantané, écrit à l'appui et jamais relu. Le candidat corrigeait ses six
   * champs et gardait ses six marques rouges, à l'identique — on aurait
   * remplacé « un bouton gris qui ne dit rien » par « six messages qui disent
   * faux ». Ce qui manque se recalcule à chaque rendu ; ce drapeau dit
   * seulement s'il faut le montrer.
   */
  const [aTenteEnvoi, setATenteEnvoi] = useState(false);
  const demande = useRef(0);
  const { form, setForm, consentement, setConsentement } = saisie;

  // `string | boolean` depuis que le formulaire porte un choix binaire
  // (`est_transfert`). Élargir ici plutôt qu'ajouter un second setter : la
  // signature suit la forme réelle de `Formulaire`, et un composant qui
  // n'accepte qu'une chaîne reste servi sans changement.
  const set = (cle: keyof Formulaire) => (valeur: string | boolean) =>
    setForm((f) => ({ ...f, [cle]: valeur }));

  /**
   * Ce qui manque, et non « est-ce complet ».
   *
   * Un booléen ne permettait que de griser le bouton, sans dire lequel des six
   * champs requis faisait défaut — et rien, dans la page, ne le disait non
   * plus : le formulaire marque les champs FACULTATIFS, mais « Lieu de
   * naissance », « Ville » ou « Commune » ne portent aucune marque et sont
   * facultatifs eux aussi, donc l'absence de marque n'apprend rien. Le cas
   * ordinaire est celui-ci : le candidat tape « 07 » dans la case Année, le
   * bouton devient gris, aucun message, aucune bordure — et sur un téléphone,
   * à la rentrée, il abandonne.
   *
   * Le bouton reste donc actif, et c'est l'appui qui explique.
   */
  const manquants = [
    form.nom.trim() === "" ? { champ: "nom", cle: "formulaire.requis" } : null,
    form.prenoms.trim() === "" ? { champ: "prenoms", cle: "formulaire.requis" } : null,
    // Deux états, deux phrases. « Cette information est nécessaire » sur trois
    // cases remplies — « 15 / 03 / 07 » — laisse le candidat regarder sa saisie,
    // la voir complète, et réappuyer : l'impasse exacte que ce bloc existe pour
    // supprimer, avec une phrase fausse en plus.
    dateNaissanceValide(form.jour, form.mois, form.annee)
      ? null
      : {
          champ: "date_naissance",
          cle:
            form.jour === "" || form.mois === "" || form.annee === ""
              ? "formulaire.requis"
              : "formulaire.champInvalide",
        },
    form.telephone.trim() === "" ? { champ: "telephone", cle: "formulaire.requis" } : null,
    // Sous « voeu », et non sous `voeu_libre` : la contrainte porte sur les
    // trois champs ensemble — filière OU niveau OU texte libre. Accrochée au
    // troisième, elle affichait « Cette information est nécessaire » juste
    // sous un libellé qui commence par « Ou », et envoyait décrire à la main
    // une formation qu'il suffisait de choisir dans la liste au-dessus.
    form.filiere_id === "" && form.niveau_id === "" && form.voeu_libre.trim() === ""
      ? { champ: "voeu", cle: "formulaire.voeuRequis" }
      : null,
    consentement ? null : { champ: "consentement", cle: "formulaire.requis" },
  ].filter((m): m is { champ: string; cle: string } => m !== null);

  /**
   * Les messages du serveur sont en français, toujours.
   *
   * KLASSCI parle français à ses écoles, et ses messages de validation le
   * sont : « Le champ email doit être une adresse e-mail valide ». Les
   * afficher tels quels sous des libellés anglais donnerait un formulaire
   * bilingue par accident. Sur les autres langues, on garde ce qui compte
   * vraiment — QUEL champ est en cause — avec une phrase traduite.
   */
  const messagesDe = (champ: string): string[] | undefined => {
    if (aTenteEnvoi) {
      const manque = manquants.find((m) => m.champ === champ);

      if (manque) return [t(manque.cle)];
    }

    const brut = champsFautifs[champ];

    if (!brut?.length) return undefined;

    return locale === "fr" ? brut : [t("formulaire.champInvalide")];
  };

  // Résolu ici, où l'espace de messages est écrit en dur : c'est la seule
  // façon pour next-intl de vérifier que la clé existe vraiment.
  // « Il manque quelques informations » s'efface dès qu'il ne manque plus
  // rien : c'est la même exigence que pour les marques sous les champs, et
  // laisser le bandeau derrière rendrait l'écran menteur au moment précis où
  // le candidat vient de finir.
  const etatAffiche = etat === "incomplet" && manquants.length === 0 ? null : etat;

  /**
   * Ce qu'on dit au candidat une fois sa candidature transmise.
   *
   * Déposer en ligne ne finit rien : les pièces et le paiement se remettent à
   * l'établissement. Trois cas, et trois phrases différentes — l'école n'a pas
   * annoncé de date, elle en a annoncé une à venir, ou le guichet est ouvert.
   * Sans cela, la seule chose que la famille pouvait faire était téléphoner
   * pour demander « je viens quand ? ».
   */
  const suiteDuParcours = (() => {
    if (physiques === null || physiques.debut === null) {
      return t("succes.surPlace");
    }

    if (physiques.ouvertes) {
      return t("succes.surPlaceOuvert");
    }

    return t("succes.surPlaceDate", {
      date: new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${physiques.debut}T00:00:00`)),
    });
  })();

  /**
   * La même information que `suiteDuParcours`, énoncée et non prescrite.
   *
   * Un constat se lit juste pour les deux lecteurs d'un refus ; un impératif,
   * non.
   */
  const dateSurPlace =
    physiques !== null && physiques.debut !== null && !physiques.ouvertes
      ? t("etats.surPlaceDate", {
          date: new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(`${physiques.debut}T00:00:00`)),
        })
      : t("etats.surPlaceOuvert");

  /**
   * Les deux refus qui envoient SUR PLACE, et qui méritent donc la date.
   *
   * Ils s'adressent à quelqu'un dont le dossier est déjà accepté — l'audience
   * exacte de cette date. Le serveur la joint à ces deux réponses-là et à
   * aucune autre ; la liste est ici pour que l'ajout d'un troisième se voie.
   */
  const REFUS_SUR_PLACE: readonly CleEtat[] = ["dejaTraitee", "accepteePourUnAutre"];

  const messageEtat = etatAffiche
    ? {
        cle: etatAffiche,
        titre: t(`etats.${etatAffiche}.titre`),
        // La phrase de suite n'est ajoutée que si l'école a annoncé une date :
        // sinon elle répéterait « présentez-vous sur place », déjà dit au-dessus.
        // La date, mais SANS l'impératif de l'écran de confirmation.
        //
        // Là-bas, le lecteur est sans ambiguïté le titulaire du dossier, et
        // « rendez-vous à l'établissement avec vos pièces » lui est adressé.
        // Ici, ces deux refus parlent à deux personnes : celle dont c'est le
        // dossier, et le cadet qui emprunte le téléphone du foyer. Ajouter
        // l'impératif enverrait le second se déplacer pour rien, trois mots
        // après lui avoir dit d'utiliser un autre numéro — le déplacement
        // même que ces refus existent pour éviter.
        texte:
          REFUS_SUR_PLACE.includes(etatAffiche) && physiques !== null && physiques.debut !== null
            ? `${t(`etats.${etatAffiche}.texte`)} ${dateSurPlace}`
            : t(`etats.${etatAffiche}.texte`),
      }
    : null;


  /**
   * Les choix viennent de l'école, jamais d'une liste écrite ici.
   *
   * Les filières et les niveaux parce que chaque établissement a les siens.
   * Les statuts d'affectation et les nationalités pour une autre raison :
   * leurs valeurs portent des accents et doivent arriver en base exactement
   * telles quelles — c'est sur elles que le barème de frais se décide, et
   * c'est à l'identique que le formulaire d'inscription de l'école les
   * compare. Les écrire ici en ferait une seconde source de vérité, dans un
   * dépôt qui ne saurait jamais que l'autre a changé.
   *
   * Un canal fermé se dit ici, au premier rendu, et pas après vingt-cinq
   * champs remplis : /choix passe par le même garde que l'envoi et répond
   * déjà 503 quand l'école n'a pas ouvert.
   */
  const chargerChoix = useCallback(() => {
    const connu = DEJA_PUBLIE.get(etablissement.code);

    if (connu !== undefined) {
      if ("refus" in connu) {
        setEtat(connu.refus);
      } else {
        setChoix(connu.publie);
      }

      return;
    }

    // Un numéro par appel, plutôt qu'un drapeau : le bouton « Réessayer » peut
    // partir alors que le premier appel n'a pas répondu, et c'est la dernière
    // demande qui doit décider de l'écran. Le démontage incrémente aussi ce
    // compteur, ce qui périme tout ce qui volait encore.
    const mienne = (demande.current += 1);

    setEtat(null);

    fetch(`/api/inscription/${etablissement.code}/choix`, { method: "POST" })
      .then(classer)
      .then((classement) => {
        if (mienne !== demande.current) return;

        if (classement.genre !== "ok") {
          const refus = ecranDu(classement);

          if (refusStable(refus)) {
            DEJA_PUBLIE.set(etablissement.code, { refus });
          }

          setEtat(refus);

          return;
        }

        const publie: ChoixPublies = {
          filieres: (classement.corps.filieres as Choix[]) ?? [],
          niveaux: (classement.corps.niveaux as Choix[]) ?? [],
          affectations: (classement.corps.affectations as Option[]) ?? [],
          liens_tuteur: (classement.corps.liens_tuteur as Option[]) ?? [],
          nationalites: (classement.corps.nationalites as Option[]) ?? [],
        };

        DEJA_PUBLIE.set(etablissement.code, { publie });
        setChoix(publie);
      })
      .catch(() => {
        // Le réseau lui-même a lâché : `classer` n'a rien eu à classer.
        if (mienne === demande.current) setEtat("indisponible");
      });
  }, [etablissement.code]);

  useEffect(() => {
    chargerChoix();

    return () => {
      demande.current += 1;
    };
  }, [chargerChoix]);


  const envoyer = useCallback(async () => {
    if (enCours) return;

    setATenteEnvoi(true);

    if (manquants.length > 0) {
      setEtat("incomplet");

      return;
    }

    setEnCours(true);
    setEtat(null);
    setChampsFautifs({});

    try {
      const reponse = await fetch(`/api/inscription/${etablissement.code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpsAEnvoyer(form, consentement)),
      });

      const classement = await classer(reponse);

      if (classement.genre === "invalide") {
        setChampsFautifs(classement.champs ?? {});
      }

      if (classement.genre !== "ok") {
        // Deux refus s'adressent à un dossier DÉJÀ ACCEPTÉ et disent
        // « présentez-vous sur place ». Le serveur y joint la date d'ouverture,
        // comme il le fait sur la confirmation — et pour la même raison : sans
        // elle, la famille se déplace le jour même quand le guichet ouvre dans
        // trois semaines.
        if (classement.genre === "conflit" && classement.corps) {
          setPhysiques((classement.corps.inscriptions_physiques as Physiques) ?? null);
        }

        setEtat(ecranDu(classement));

        return;
      }

      setPhysiques((classement.corps.inscriptions_physiques as Physiques) ?? null);
      setEnvoye(true);
      // La candidature est partie : « Ce n'est pas mon cas » n'a plus de sens
      // sous cet écran, et repasser par l'autre porte ne l'annulerait pas.
      onAboutir?.(true);
    } catch {
      setEtat("indisponible");
    } finally {
      setEnCours(false);
    }
  }, [consentement, enCours, etablissement.code, form, manquants, onAboutir]);

  if (etat === "ferme" || etat === "nonConfigure") {
    // Pas de « Réessayer » ici : un canal fermé ou mal paramétré ne s'ouvrira
    // pas parce qu'on insiste.
    return <EcranEtat etat={etat} />;
  }

  if (envoye) {
    return <CandidatureTransmise suiteDuParcours={suiteDuParcours} />;
  }

  // Tant que l'école n'a pas donné ses listes, pas de formulaire. Les afficher
  // vides laissait déposer sans filière ni nationalité, sous un bandeau qui
  // invitait à réessayer alors que rien ne réessayait.
  // L'état est passé TEL QUEL, sans filtre. Une ternaire y écrasait tout ce
  // qui n'était pas `indisponible` ou `tropDeTentatives` : `ecranDu` étant
  // total, un `invalide` ou un `dejaInscrit` venu de /choix serait devenu
  // `null` et aurait affiché « Chargement des formations… », sans bouton, pour
  // toujours. Message faux, aucune sortie — dans l'écran même qui a été ajouté
  // pour supprimer un repli silencieux. `/choix` ne peut pas produire ces
  // codes aujourd'hui, mais rien dans le type ne le disait.
  if (choix === null) {
    return <EcranEtat etat={etat} onReessayer={chargerChoix} />;
  }

  return (
    <Carte>
      <m.div {...entree(0)}>
        <h2 className="text-balance text-xl font-semibold tracking-tight">{t("formulaire.titre")}</h2>
        <p className="mt-1.5 text-pretty text-sm text-text-secondary">{t("formulaire.aide")}</p>
      </m.div>

      <ChampsCandidature form={form} set={set} messagesDe={messagesDe} choix={choix} />

      {/* Signalé comme les autres quand il manque : l'alerte parle des « champs
          signalés », et le consentement en est un. Le laisser seul sans marque
          rendait cette phrase fausse pour l'unique cas où le candidat a tout
          rempli sauf la case. */}
      <m.div {...entree(7)}>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-accent-light">
          <input type="checkbox" checked={consentement} onChange={(e) => setConsentement(e.target.checked)}
                 className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-border-strong text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
          <span className="text-pretty text-sm leading-relaxed text-text-secondary">
            {t("formulaire.consentement")}
          </span>
        </label>
        <div className="px-3">
          <Erreurs messages={messagesDe("consentement")} />
        </div>
      </m.div>

      <Alerte etat={messageEtat} />

      <m.div {...entree(8)} className="mt-5">
        <BoutonPrincipal onClick={envoyer} disabled={enCours} occupe={enCours}>
          {enCours ? t("formulaire.chargement") : t("formulaire.action")}
        </BoutonPrincipal>
      </m.div>
    </Carte>
  );
}
