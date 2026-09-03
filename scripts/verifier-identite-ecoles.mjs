/**
 * Vérifie l'identité des établissements, en l'exécutant.
 *
 *   node --experimental-strip-types --conditions=react-server scripts/verifier-identite-ecoles.mjs
 *
 * Même raison que `verifier-amortisseur.mjs` : ce dépôt n'a pas de lanceur de
 * tests, et deux pièces livrées ici décident de choses qu'on ne veut pas
 * découvrir en production.
 *
 * La première est le contraste. La couleur d'une école habille les boutons de
 * son formulaire d'inscription ; si le seuil est faux, le bouton « Envoyer ma
 * demande » devient illisible pour tous ses candidats, et personne chez nous ne
 * le verra — nous ne regardons pas les six écoles chaque matin.
 *
 * La seconde est ce que le module accepte du réseau. Les couleurs finissent
 * dans un attribut `style`, l'adresse d'un logo finit dans une balise `img` :
 * ce module est la dernière frontière avant le navigateur d'un visiteur, et il
 * lit des réponses qu'il ne contrôle pas.
 *
 * `--conditions=react-server` est nécessaire : le registre porte `server-only`,
 * dont la résolution hors serveur refuse l'import. C'est le marqueur qui fait
 * son travail — on lui dit ici qu'on est bien côté serveur.
 *
 * Aucun appel réseau n'est fait : `fetch` est remplacé le temps des
 * vérifications.
 */

import assert from "node:assert/strict";

const {
  rapportContraste,
  accentUtilisable,
  assombrir,
  translucide,
  variablesEtablissement,
  couleursBandeau,
} = await import("../lib/vitrine/couleurs.ts");

const { etablissementsVitrine, identitesParCode } = await import(
  "../lib/vitrine/etablissements.ts"
);

const { etablissementsOuverts, etablissementAvecSecret } = await import(
  "../lib/portail/tenants.ts"
);

/**
 * Le portail d'inscription et le mur d'accueil décidaient séparément de la même
 * chose : le mur écartait l'instance de démonstration, le portail non. Elle
 * s'offrait donc aux familles, sous le nom laissé par la dernière
 * démonstration, entre des écoles réelles.
 */

const verifs = [];
const verifier = (nom, corps) => verifs.push([nom, corps]);

const BLEU_KLASSCI = "#0453cb";

/* ────────────────────────────── Couleurs ────────────────────────────── */

verifier("le rapport de contraste suit la WCAG sur ses deux bornes", () => {
  // Noir sur blanc : 21:1, le maximum. Une couleur contre elle-même : 1:1.
  assert.equal(Math.round(rapportContraste("#000000", "#ffffff")), 21);
  assert.equal(rapportContraste("#7f7f7f", "#7f7f7f"), 1);
  // Les formes à trois chiffres valent les six.
  assert.equal(rapportContraste("#fff", "#000"), rapportContraste("#ffffff", "#000000"));
});

verifier("une couleur qui porte du texte blanc est retenue", () => {
  assert.equal(accentUtilisable(BLEU_KLASSCI), BLEU_KLASSCI);
  // Le bordeaux d'une école : sombre, il tient.
  assert.equal(accentUtilisable("#8b1d3f"), "#8b1d3f");
});

verifier("une couleur trop claire pour du texte blanc est écartée", () => {
  // L'ambre par défaut des accents PDF : parfait en aplat sur du papier,
  // illisible en fond de bouton sous du blanc (≈ 2,1:1).
  assert.ok(rapportContraste("#f59e0b", "#ffffff") < 4.5);
  assert.equal(accentUtilisable("#f59e0b"), BLEU_KLASSCI);
});

verifier("une valeur qui n'est pas une couleur est écartée", () => {
  for (const valeur of ["", "red", "rgb(1,2,3)", "#12345", "#gggggg", "red;background:url(//x)"]) {
    assert.equal(accentUtilisable(valeur), BLEU_KLASSCI, `refusée : ${valeur}`);
  }
});

verifier("la teinte de survol est plus sombre, et reste une couleur", () => {
  const survol = assombrir(BLEU_KLASSCI);

  assert.match(survol, /^#[0-9a-f]{6}$/);
  assert.ok(rapportContraste(survol, "#ffffff") > rapportContraste(BLEU_KLASSCI, "#ffffff"));
  // Le noir ne peut pas s'assombrir davantage : pas de débordement sous zéro.
  assert.equal(assombrir("#000000"), "#000000");
});

verifier("le fond léger est un rgba, y compris quand la couleur est illisible", () => {
  assert.equal(translucide(BLEU_KLASSCI, 0.1), "rgba(4, 83, 203, 0.1)");
  assert.match(translucide("pas une couleur"), /^rgba\(4, 83, 203, /);
});

verifier("les variables de thème sont cohérentes entre elles", () => {
  const variables = variablesEtablissement("#8b1d3f");

  assert.equal(variables["--accent"], "#8b1d3f");
  assert.notEqual(variables["--accent-hover"], variables["--accent"]);
  assert.match(variables["--accent-light"], /^rgba\(139, 29, 63, /);

  // Une couleur écartée entraîne TOUTES les variables avec elle : un survol
  // resté sur la couleur de l'école, sous un bouton redevenu bleu, donnerait
  // un bouton qui change de teinte au passage de la souris.
  const repli = variablesEtablissement("#f59e0b");

  assert.equal(repli["--accent"], BLEU_KLASSCI);
  assert.equal(repli["--accent-hover"], assombrir(BLEU_KLASSCI));
  assert.match(repli["--accent-light"], /^rgba\(4, 83, 203, /);
});

/* ────────────────────────── Bandeau d'identité ────────────────────────── */

verifier("un bandeau lisible est servi tel que l'école l'a réglé", () => {
  // Le vert de l'ESBTP Abidjan : franc, il se distingue du fond de page, et
  // l'encre calculée pour le PDF vaut aussi à l'écran.
  const bandeau = couleursBandeau({
    bandeauFond: "#0d6818",
    bandeauTexte: "#ffffff",
    couleurPrincipale: "#0d6818",
  });

  assert.deepEqual(bandeau, { fond: "#0d6818", encre: "#ffffff" });
});

verifier("un bandeau blanc, invisible sur la page, est remplacé", () => {
  // Le blanc est la valeur par défaut des PDF. Sur papier il se lit, la
  // feuille ayant un bord ; à l'écran il ne montre rien.
  assert.ok(rapportContraste("#ffffff", "#f7f6f3") < 1.35);

  const bandeau = couleursBandeau({
    bandeauFond: "#ffffff",
    bandeauTexte: "#000000",
    couleurPrincipale: "#242259",
  });

  assert.equal(bandeau.fond, "#242259");
  // L'encre reçue valait pour un fond blanc ; sur ce bleu nuit elle serait
  // illisible, donc elle est recalculée.
  assert.equal(bandeau.encre, "#ffffff");
  assert.ok(rapportContraste(bandeau.fond, bandeau.encre) >= 4.5);
});

verifier("le bandeau porte la couleur que la page porte, jamais une autre", () => {
  // Le défaut : l'ESBTP Yamoussoukro a réglé un bandeau blanc et un orange
  // comme couleur principale. L'orange est écarté des commandes — du blanc
  // dessus est illisible — donc la page est bleue. En posant l'orange brut
  // sur le bandeau, on obtenait un bandeau orange, des boutons bleus et un
  // pied bleu : la couleur de l'école apparaissait une seule fois, contredite
  // partout ailleurs. Une page porte une couleur d'identité, pas deux.
  const ecole = {
    bandeauFond: "#ffffff",
    bandeauTexte: "#000000",
    couleurPrincipale: "#ea8c34",
  };

  assert.equal(couleursBandeau(ecole).fond, variablesEtablissement(ecole.couleurPrincipale)["--accent"]);
});

verifier("… et cela vaut pour toutes les écoles, quelle que soit leur couleur", () => {
  // La règle générale, dont Yamoussoukro n'était qu'un cas : dès qu'on
  // substitue, le fond du bandeau EST l'accent de la page. Sans cela, chaque
  // nouvelle école dont la couleur est écartée rejouerait le même défaut.
  for (const couleurPrincipale of [
    "#ea8c34", // orange, écarté
    "#f59e0b", // ambre, écarté
    "#0d6818", // vert, retenu
    "#242259", // bleu nuit, retenu
    "#cc0a0a", // rouge, retenu
    "pas une couleur", // refusée : repli sur le bleu KLASSCI
  ]) {
    const bandeau = couleursBandeau({
      bandeauFond: "#ffffff",
      bandeauTexte: "#000000",
      couleurPrincipale,
    });

    assert.equal(
      bandeau.fond,
      variablesEtablissement(couleurPrincipale)["--accent"],
      `couleur : ${couleurPrincipale}`,
    );
    assert.ok(
      rapportContraste(bandeau.fond, bandeau.encre) >= 4.5,
      `texte illisible sur ${bandeau.fond}`,
    );
  }
});

verifier("un fond que l'école a mal réglé n'est pas posé sur la page", () => {
  // Même frontière que partout ailleurs : ce qui vient du réseau est revalidé.
  const bandeau = couleursBandeau({
    bandeauFond: "chartreuse; background-image: url(//pirate.example/x)",
    bandeauTexte: "#ffffff",
    couleurPrincipale: "#0d6818",
  });

  // Non reconnu comme couleur, donc jugé invisible, donc substitué.
  assert.equal(bandeau.fond, "#0d6818");
});

/* ──────────────────────── Ce qu'on accepte du réseau ──────────────────────── */

/** La réponse type d'une instance, dont chaque vérification altère un morceau. */
function identite(surcharges = {}) {
  return {
    code: "esbtp-yakro",
    nom: "ESBTP Yamoussoukro",
    sigle: "ESBTP",
    ville: "Yamoussoukro",
    logo: {
      present: true,
      url: "https://esbtp-yakro.klassci.com/api/public/etablissement/logo",
    },
    identite_visuelle: {
      couleur_principale: "#8b1d3f",
      bandeau_fond: "#8b1d3f",
      bandeau_texte: "#ffffff",
      entete: "Ministère de l'Enseignement Supérieur",
    },
    ...surcharges,
  };
}

/**
 * Installe un registre d'écoles et les réponses qu'elles rendent.
 *
 * `reponses` associe un code à un corps, à un statut, ou à une erreur — de quoi
 * jouer une instance à jour, une qui n'a pas encore reçu le déploiement, et une
 * qui ne répond pas du tout.
 */
function registre(codes, reponses, exclus = "") {
  process.env.REINSCRIPTION_TENANTS = codes.join(",");

  // `null` : la variable n'est pas posée du tout, ce qui n'est pas la même
  // chose que posée vide — c'est le cas qui a publié « AZERTY ».
  if (exclus === null) {
    delete process.env.VITRINE_EXCLUS;
  } else {
    process.env.VITRINE_EXCLUS = exclus;
  }

  for (const code of codes) {
    const suffixe = code.replace(/-/g, "_").toUpperCase();
    process.env[`REINSCRIPTION_BASE_${suffixe}`] = `https://${code}.klassci.com`;
    process.env[`REINSCRIPTION_LABEL_${suffixe}`] = `Libellé ${code}`;
    // Le registre du portail refuse une école sans secret utilisable — à
    // raison : listée sans secret, elle rendrait une erreur au premier envoi.
    process.env[`REINSCRIPTION_SECRET_${suffixe}`] = "x".repeat(64);
  }

  const appels = [];

  globalThis.fetch = async (url) => {
    appels.push(String(url));

    const code = new URL(String(url)).hostname.split(".")[0];
    const reponse = reponses[code];

    if (reponse === undefined || reponse instanceof Error) {
      throw reponse ?? new Error("instance injoignable");
    }

    if (typeof reponse === "number") {
      return { ok: false, status: reponse, json: async () => ({}) };
    }

    return { ok: true, status: 200, json: async () => reponse };
  };

  return appels;
}

verifier("une école qui répond est servie avec son identité", async () => {
  registre(["esbtp-yakro"], { "esbtp-yakro": identite() });

  const [ecole] = await etablissementsVitrine();

  assert.equal(ecole.nom, "ESBTP Yamoussoukro");
  assert.equal(ecole.ville, "Yamoussoukro");
  assert.equal(ecole.logo, "https://esbtp-yakro.klassci.com/api/public/etablissement/logo");
  assert.equal(ecole.identite.couleurPrincipale, "#8b1d3f");
  assert.equal(ecole.identite.entete, "Ministère de l'Enseignement Supérieur");
});

verifier("une école injoignable reste listée, sous son libellé de registre", async () => {
  // Elle disparaissait, autrefois. Cela paraissait prudent et ne l'était pas :
  // ces instances démarrent à froid, et une réponse au-delà du délai retirait
  // l'école du mur pour une heure entière. USAT et ISLG ont disparu ainsi, au
  // hasard du moment de la construction. Or l'inscription en ligne d'une école
  // est ouverte ou non : c'est un fait de configuration, pas de réseau.
  registre(["ephrata", "esbtp-yakro"], { "esbtp-yakro": identite() });

  const servies = await etablissementsVitrine();

  assert.deepEqual(
    servies.map((e) => e.code).sort(),
    ["ephrata", "esbtp-yakro"],
  );

  const injoignable = servies.find((e) => e.code === "ephrata");

  assert.equal(injoignable.nom, "Libellé ephrata", "le libellé du registre prend le relais");
  assert.equal(injoignable.logo, null, "sans réponse, pas de logo : la tuile affiche ses initiales");
  assert.equal(injoignable.ville, "");
});

verifier("une instance qui n'a pas encore reçu le déploiement reste listée, sans identité", async () => {
  // 404 : la route publique n'existe pas encore sur ce serveur. C'est l'état
  // NORMAL entre la fusion et le `klassci pull`, et il ne doit rien casser.
  registre(["ephrata", "esbtp-yakro"], { ephrata: 404, "esbtp-yakro": identite() });

  const servies = await etablissementsVitrine();

  assert.deepEqual(
    servies.map((e) => e.code).sort(),
    ["ephrata", "esbtp-yakro"],
    "elle reste listée : son inscription est ouverte, c'est son identité qui manque",
  );
  assert.equal(servies.find((e) => e.code === "ephrata").logo, null);
});

verifier("l'instance de démonstration est écartée du mur de logos", async () => {
  registre(
    ["presentation", "esbtp-yakro"],
    { presentation: identite({ nom: "Démo" }), "esbtp-yakro": identite() },
    "presentation",
  );

  const servies = await etablissementsVitrine();

  assert.deepEqual(
    servies.map((e) => e.code),
    ["esbtp-yakro"],
  );
});

verifier("l'instance de démonstration reste écartée même sans réglage", async () => {
  // Elle s'est affichée sous le nom « AZERTY » entre deux écoles réelles, sur
  // la page d'accueil, parce que l'exclusion attendait une variable que
  // personne n'avait posée. Un réglage dont l'oubli publie quelque chose de
  // faux est un réglage mal choisi.
  registre(
    ["presentation", "esbtp-yakro"],
    { presentation: identite({ nom: "AZERTY" }), "esbtp-yakro": identite() },
    null,
  );

  const servies = await etablissementsVitrine();

  assert.deepEqual(
    servies.map((e) => e.code),
    ["esbtp-yakro"],
  );
});

verifier("… et une exclusion posée vide n'écarte plus personne", async () => {
  // C'est ainsi qu'on inclurait délibérément la démonstration : la variable
  // reste le mécanisme, le défaut n'est qu'un défaut.
  registre(
    ["presentation", "esbtp-yakro"],
    { presentation: identite({ nom: "Démo" }), "esbtp-yakro": identite() },
    "",
  );

  const servies = await etablissementsVitrine();

  assert.equal(servies.length, 2);
});

verifier("… mais garde son identité sur sa propre page d'inscription", async () => {
  registre(["presentation"], { presentation: identite({ nom: "Démo" }) }, "presentation");

  const parCode = await identitesParCode(["presentation"]);

  assert.equal(parCode.presentation?.nom, "Démo");
});

verifier("une couleur venue du réseau est revalidée ici", async () => {
  registre(["esbtp-yakro"], {
    "esbtp-yakro": identite({
      identite_visuelle: {
        couleur_principale: "red; background-image: url(//pirate.example/x.png)",
        bandeau_fond: "chartreuse",
        bandeau_texte: "#ffffff",
        entete: "",
      },
    }),
  });

  const [ecole] = await etablissementsVitrine();

  assert.equal(ecole.identite.couleurPrincipale, BLEU_KLASSCI);
  assert.equal(ecole.identite.bandeauFond, BLEU_KLASSCI);
});

verifier("un logo hébergé ailleurs que chez l'école est refusé", async () => {
  registre(["esbtp-yakro"], {
    "esbtp-yakro": identite({
      logo: { present: true, url: "https://pirate.example/logo.png" },
    }),
  });

  const [ecole] = await etablissementsVitrine();

  // Refusé, pas remplacé : la page affiche le monogramme de l'école.
  assert.equal(ecole.logo, null);
});

verifier("une école sans logo n'en reçoit pas un par accident", async () => {
  registre(["esbtp-yakro"], {
    "esbtp-yakro": identite({ logo: { present: false, url: null } }),
  });

  const [ecole] = await etablissementsVitrine();

  assert.equal(ecole.logo, null);
});

verifier("une base qui n'est pas en https n'est jamais appelée", async () => {
  const appels = registre(["esbtp-yakro"], { "esbtp-yakro": identite() });
  process.env.REINSCRIPTION_BASE_ESBTP_YAKRO = "http://esbtp-yakro.klassci.com";

  assert.deepEqual(await etablissementsVitrine(), []);
  assert.deepEqual(appels, []);
});

verifier("le mur est trié par nom, pas par ordre de configuration", async () => {
  registre(["zeta", "alpha"], {
    zeta: identite({ nom: "Zeta" }),
    alpha: identite({ nom: "Alpha" }),
  });

  const servies = await etablissementsVitrine();

  assert.deepEqual(
    servies.map((e) => e.nom),
    ["Alpha", "Zeta"],
  );
});

verifier("le nom réglé par l'école prime sur le libellé du registre", async () => {
  registre(["esbtp-yakro"], { "esbtp-yakro": identite({ nom: "" }) });

  const [ecole] = await etablissementsVitrine();

  // Nom vide côté école : on retombe sur le libellé des variables
  // d'environnement plutôt que d'afficher une case anonyme.
  assert.equal(ecole.nom, "Libellé esbtp-yakro");
});

verifier("une école qui ne s'est pas nommée ne s'appelle pas « KLASSCI »", async () => {
  // KLASSCI pose « KLASSCI » comme valeur initiale de `school_name`. La liste
  // a réellement affiché « KLASSCI · Yamoussoukro » entre deux écoles, et
  // personne ne reconnaissait cette ligne — c'était Ephrata.
  for (const pose of ["KLASSCI", "klassci", "  Klassci  "]) {
    registre(["ephrata"], { ephrata: identite({ nom: pose }) });

    const [ecole] = await etablissementsVitrine();

    assert.equal(ecole.nom, "Libellé ephrata", `nom posé : ${JSON.stringify(pose)}`);
  }
});

verifier("… mais une école dont le nom contient KLASSCI garde le sien", async () => {
  // Le repli vise la valeur initiale exacte, pas tout nom qui la contient :
  // renommer une école « Klassci Academy » en « Libellé … » serait la même
  // faute, dans l'autre sens.
  registre(["ephrata"], { ephrata: identite({ nom: "Klassci Academy" }) });

  const [ecole] = await etablissementsVitrine();

  assert.equal(ecole.nom, "Klassci Academy");
});

/* ────────────────────────────── Exécution ────────────────────────────── */

const fetchOrigine = globalThis.fetch;
let echecs = 0;

verifier("l'instance de démonstration n'est pas proposée à l'inscription", async () => {
  registre(["presentation", "esbtp-yakro"], {}, null);

  const ouverts = etablissementsOuverts().map((e) => e.code);

  assert.deepEqual(ouverts, ["esbtp-yakro"]);
});

verifier("… mais elle reste joignable par son adresse directe", async () => {
  registre(["presentation", "esbtp-yakro"], {}, null);

  // Une démonstration du parcours d'inscription doit rester possible. Ce qui
  // est retiré, c'est la PROPOSITION à quelqu'un qui n'est pas venu la
  // chercher, pas l'accès de qui a le lien.
  assert.notEqual(etablissementAvecSecret("presentation"), null);
});

verifier("poser la liste vide inclut délibérément la démonstration", async () => {
  registre(["presentation", "esbtp-yakro"], {}, "");

  assert.deepEqual(
    etablissementsOuverts().map((e) => e.code).sort(),
    ["esbtp-yakro", "presentation"],
  );
});

for (const [nom, corps] of verifs) {
  try {
    await corps();
    console.log(`ok   ${nom}`);
  } catch (erreur) {
    echecs += 1;
    console.error(`ÉCHEC ${nom}\n     ${erreur.message}`);
  }
}

globalThis.fetch = fetchOrigine;

console.log(`\n${verifs.length - echecs}/${verifs.length} vérifications passent.`);
process.exit(echecs === 0 ? 0 : 1);
