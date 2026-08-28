/**
 * Ce que le portail comprend d'une réponse de l'école.
 *
 * La table « code HTTP → écran » existait en trois exemplaires : dans
 * `interpreter` de la réinscription, dans l'effet de la candidature, et dans
 * son envoi. Les trois ne couvraient pas les mêmes cas — l'effet perdait
 * `!ok` et le corps illisible, l'envoi perdait le 400 — et « perdre un cas »
 * veut dire ici : le formulaire reste affiché, sans ses listes, et la
 * candidature part amputée sans qu'un mot ne l'ait dit.
 *
 * Un 401 tombait dans ce silence. Ce n'est pas un cas d'école : le relais lui
 * consacre un paragraphe entier, parce qu'un secret tourné d'un seul côté ou
 * une horloge dérivée ferme le portail d'une école entière — et que sans
 * message, personne ne le sait.
 *
 * Cette fonction est TOTALE : toute réponse ressort classée. C'est ce qui rend
 * le silence impossible, pas la discipline de celui qui écrit le prochain
 * appel. Chaque parcours traduit ensuite le classement dans son propre
 * vocabulaire d'écrans, qui n'est pas le même des deux côtés.
 */

export type Classement =
  | { genre: "ok"; corps: Record<string, unknown> }
  /** L'école n'a pas ouvert le canal, ou la période est passée. */
  | { genre: "ferme" }
  /** L'école a ouvert sans désigner l'année visée : un défaut de paramétrage. */
  | { genre: "nonConfigure" }
  /**
   * 409 : l'état actuel refuse la demande. `code` dit lequel.
   *
   * `corps` est conservé parce que deux de ces refus — ceux qui s'adressent à
   * un dossier déjà accepté — emportent la date d'ouverture des inscriptions
   * sur place, exactement comme la confirmation de dépôt. Sans lui, l'écran
   * disait « présentez-vous sur place » à quelqu'un dont le guichet ouvre dans
   * trois semaines.
   */
  | { genre: "conflit"; code?: string; corps?: Record<string, unknown> }
  /** 422/400 : la saisie est refusée. `champs` porte le détail, s'il y en a. */
  | { genre: "invalide"; champs?: Record<string, string[]> }
  /**
   * 429 : un seuil de débit est atteint. `code` dit LEQUEL, et la nuance n'est
   * pas cosmétique — le seau d'une adresse dit « vous avez trop demandé », le
   * plafond de l'établissement dit « beaucoup de monde en même temps ». Sans
   * ce code, un visiteur qui n'avait rien tenté lisait qu'il avait trop essayé.
   */
  | { genre: "tropDeTentatives"; code?: string }
  /** Tout le reste : panne, instance injoignable, corps illisible, 401, 500. */
  | { genre: "indisponible" };

async function corpsDe(reponse: Response): Promise<Record<string, unknown> | null> {
  return reponse
    .json()
    .then((c) => (c !== null && typeof c === "object" ? (c as Record<string, unknown>) : null))
    .catch(() => null);
}

export async function classer(reponse: Response): Promise<Classement> {
  if (reponse.status === 503) {
    const corps = await corpsDe(reponse);

    // 503 recouvre trois causes qu'il ne faut pas confondre. Le canal fermé se
    // rouvrira à la rentrée ; l'année non configurée est un défaut de
    // paramétrage que le candidat ne résoudra pas en patientant ; l'instance
    // injoignable, elle, mérite bien un « réessayez ».
    if (corps?.ouvert === false) return { genre: "ferme" };
    if (corps?.code === "annee_non_configuree") return { genre: "nonConfigure" };

    return { genre: "indisponible" };
  }

  if (reponse.status === 429) {
    const corps = await corpsDe(reponse);

    return {
      genre: "tropDeTentatives",
      code: typeof corps?.code === "string" ? corps.code : undefined,
    };
  }

  if (reponse.status === 409) {
    const corps = await corpsDe(reponse);

    return {
      genre: "conflit",
      code: typeof corps?.code === "string" ? corps.code : undefined,
      corps: corps ?? undefined,
    };
  }

  if (reponse.status === 422 || reponse.status === 400) {
    const corps = await corpsDe(reponse);
    const champs = corps?.champs;

    return {
      genre: "invalide",
      champs: champs !== null && typeof champs === "object"
        ? (champs as Record<string, string[]>)
        : undefined,
    };
  }

  if (!reponse.ok) return { genre: "indisponible" };

  const corps = await corpsDe(reponse);

  // Un 200 dont le corps est illisible n'est pas un succès : le traiter comme
  // tel afficherait un écran de confirmation sans confirmation derrière.
  return corps === null ? { genre: "indisponible" } : { genre: "ok", corps };
}

/**
 * Comment un genre de réponse devient un écran.
 *
 * `codes` traduit les codes connus ; `sansCode` dit ce qu'on affiche quand le
 * serveur n'en a pas envoyé. Ce second champ est une DÉCISION par genre, et
 * non une hypothèse partagée : pour un 429, l'absence de code est l'ancien
 * serveur et le repli historique est légitime ; pour un 409, aucune version
 * déployée n'en a jamais rendu — il n'y a pas d'historique à ménager, il n'y a
 * qu'un futur, et affirmer « une inscription existe déjà pour ce numéro » sur
 * un refus qu'on ne comprend pas enverrait un bachelier changer de téléphone
 * pour un fait qui n'a jamais eu lieu.
 */
export type RegleEcran<E extends string> = {
  codes?: Readonly<Record<string, E>>;
  sansCode: E;
};

/**
 * Les refus de candidature que l'école sait rendre, en 409.
 *
 * Copie de `AppEnumsRefusCandidature` côté KLASSCI, moins
 * `annee_non_configuree` qui sort en 503. Une copie parce que les deux dépôts
 * se déploient séparément et qu'aucun ne peut lire l'autre à la compilation.
 *
 * Elle existe pour rendre l'oubli BRUYANT. Un sixième refus a été ajouté côté
 * serveur avec sa phrase, ses tests et son commentaire ; le site, lui, ne le
 * connaissait pas, et le rendait donc comme « service momentanément
 * indisponible, réessayez dans quelques minutes » — faux sur la cause, et
 * prescrivant un geste qui ne réussira jamais. Le repli existe pour l'instance
 * PLUS RÉCENTE que ce site, pas pour un code qu'on a soi-même écrit la veille.
 *
 * Typer la table en `Record<CodeRefusCandidature, ...>` transforme donc
 * l'oubli en erreur de compilation. Ajouter un cas ici sans son écran ne
 * compile pas ; en ajouter un côté serveur sans passer ici reste possible, et
 * c'est la couture qu'il faut surveiller à chaque ajout.
 */
export type CodeRefusCandidature =
  | "deja_inscrit"
  | "autre_personne"
  | "deja_traitee"
  | "acceptee_pour_un_autre"
  | "etat_inattendu";

/**
 * Le classement, traduit dans le vocabulaire d'écrans d'un parcours.
 *
 * Une seule fonction pour les deux parcours, chacun avec sa table. Elles
 * l'écrivaient chacune à la main — un `switch` d'un côté, un ternaire à quatre
 * niveaux de l'autre — et avaient déjà divergé sur la règle du code inconnu.
 *
 * Un code PRÉSENT mais absent de la table donne `defaut` : les deux dépôts se
 * déploient séparément, une instance plus récente peut émettre un code que ce
 * site ne connaît pas, et le seul écran honnête est alors celui qui n'affirme
 * rien sur le dossier du visiteur.
 */
export function ecranDe<E extends string>(
  classement: Classement,
  regles: Partial<Record<Classement["genre"], RegleEcran<E>>>,
  defaut: E,
): E {
  const regle = regles[classement.genre];

  if (regle === undefined) return defaut;

  const code = "code" in classement ? classement.code : undefined;

  if (code === undefined) return regle.sansCode;

  return regle.codes?.[code] ?? defaut;
}
