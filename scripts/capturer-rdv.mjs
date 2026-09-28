import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = "http://127.0.0.1:3100/fr/inscription/universite/presentation/rendez-vous";
const DOSSIER = ".playwright-mcp";

await mkdir(DOSSIER, { recursive: true });

const browser = await chromium.launch({ headless: true });

const creneaux = [
  { id: 101, date: "2026-10-02", heure_debut: "09:00", heure_fin: "09:20", etat: "disponible" },
  { id: 102, date: "2026-10-02", heure_debut: "09:30", heure_fin: "09:50", etat: "disponible" },
  { id: 103, date: "2026-10-03", heure_debut: "10:00", heure_fin: "10:20", etat: "complet" },
];

function reservation(canal, fallback = false) {
  return {
    date: "2026-10-02",
    heure_debut: "09:00",
    heure_fin: "09:20",
    statut: "confirmee",
    convocation_url: "https://presentation.klassci.com/convocation-rdv/demo-signe",
    convocation: {
      statut: "envoyee",
      canal,
      destination: canal === "whatsapp" ? "+225 07 ** ** ** 54" : "m***@gmail.com",
      message_id: "capture-demo",
      tentatives: fallback ? 2 : 1,
      fallback_utilise: fallback,
      envoyee_at: "2026-09-28T16:00:00Z",
      delivree_at: null,
      erreur: null,
    },
  };
}

async function preparerPage(viewport, canal = "email", fallback = false) {
  const page = await browser.newPage({ viewport });
  const rdv = reservation(canal, fallback);

  await page.route("**/api/rendez-vous/presentation/creneaux", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ creneaux }) });
  });
  await page.route("**/api/rendez-vous/presentation/consulter", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ trouve: true, reservation: rdv, peut_modifier: true }) });
  });
  await page.route("**/api/rendez-vous/presentation/renvoyer", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reservation: rdv }) });
  });
  await page.route("**/api/rendez-vous/presentation/annuler", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ enregistre: true }) });
  });

  return page;
}

async function remplirIdentite(page) {
  const inputs = page.locator("input");
  await inputs.nth(0).fill("RDV-PRESENTATION-2026");
  await inputs.nth(1).fill("15");
  await inputs.nth(2).fill("7");
  await inputs.nth(3).fill("2002");
}

async function consulter(page) {
  // Le portail contient aussi des boutons de navigation dans l'habillage.
  // Le bouton principal du flux RDV est le seul bouton pleine largeur.
  const bouton = page.locator("button.w-full");
  await bouton.waitFor({ state: "visible" });
  await bouton.click();
  await page.getByRole("button", { name: /Renvoyer la convocation/i }).waitFor({ state: "visible" });
}

// 1. Écran d'entrée + créneaux, desktop.
{
  const page = await preparerPage({ width: 1440, height: 1000 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${DOSSIER}/rdv-presentation-01-entree-desktop.png`, fullPage: true });
  await page.close();
}

// 2. Rendez-vous confirmé par e-mail, desktop.
{
  const page = await preparerPage({ width: 1440, height: 1000 }, "email", false);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await remplirIdentite(page);
  await consulter(page);
  await page.screenshot({ path: `${DOSSIER}/rdv-presentation-02-confirme-email-desktop.png`, fullPage: true });
  await page.close();
}

// 3. Fallback WhatsApp, mobile.
{
  const page = await preparerPage({ width: 390, height: 844 }, "whatsapp", true);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await remplirIdentite(page);
  await consulter(page);
  await page.screenshot({ path: `${DOSSIER}/rdv-presentation-03-whatsapp-mobile.png`, fullPage: true });
  await page.close();
}

// 4. Confirmation après renvoi, desktop : le rendez-vous reste le même.
{
  const page = await preparerPage({ width: 1440, height: 1000 }, "whatsapp", true);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await remplirIdentite(page);
  await consulter(page);
  await page.getByRole("button", { name: /Renvoyer la convocation/i }).click();
  await page.getByText(/Aucun nouveau rendez-vous n.a été créé/i).waitFor({ state: "visible" });
  await page.screenshot({ path: `${DOSSIER}/rdv-presentation-04-renvoi-desktop.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log("Captures RDV presentation générées dans .playwright-mcp/");
