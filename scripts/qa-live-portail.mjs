import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://www.klassci.com/fr/inscription/universite/presentation";
const OUT = ".playwright-live";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const rapport = { base: BASE, reinscription: {}, candidature: {} };

function horodatage() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

async function capture(page, nom) {
  await page.screenshot({ path: `${OUT}/${nom}.png`, fullPage: true });
}

async function ouvrir() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const reponse = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  rapport.http = reponse?.status() ?? null;
  await capture(page, "00-portail-live");
  return page;
}

async function cliquerPorte(page, regex) {
  const boutons = page.locator("main button");
  const textes = await boutons.allTextContents();
  const idx = textes.findIndex((t) => regex.test(t));
  if (idx === -1) {
    throw new Error(`Porte introuvable pour ${regex}. Boutons: ${JSON.stringify(textes)}`);
  }
  await boutons.nth(idx).click();
  await page.waitForTimeout(800);
  return textes[idx];
}

// --- Réinscription réelle sur un étudiant démo de la promotion précédente ---
{
  const page = await ouvrir();
  try {
    rapport.reinscription.porte = await cliquerPorte(page, /(déjà|ancien|réinscri)/i);
    await capture(page, "10-reinscription-identification-live");

    const inputs = page.locator("main input");
    const count = await inputs.count();
    if (count < 4) throw new Error(`Identification: ${count} inputs seulement`);

    await inputs.nth(0).fill("DEMO90001");
    await inputs.nth(1).fill("25");
    await inputs.nth(2).fill("08");
    await inputs.nth(3).fill("2005");

    const actions = page.locator("main button:visible");
    const textes = await actions.allTextContents();
    const idx = textes.findIndex((t) => /(retrouver|continuer|vérifier|rechercher|voir)/i.test(t));
    if (idx === -1) throw new Error(`Action identification introuvable: ${JSON.stringify(textes)}`);
    await actions.nth(idx).click();
    await page.waitForTimeout(1800);
    await capture(page, "11-reinscription-confirmation-live");

    const checkbox = page.locator('main input[type="checkbox"]:visible').first();
    if (await checkbox.count()) {
      await checkbox.check();
      const boutons2 = page.locator("main button:visible");
      const textes2 = await boutons2.allTextContents();
      const idx2 = textes2.findIndex((t) => /(confirmer|réinscri|envoyer)/i.test(t));
      if (idx2 >= 0) {
        await boutons2.nth(idx2).click();
        await page.waitForTimeout(2200);
        await capture(page, "12-reinscription-apres-envoi-live");
        rapport.reinscription.envoi = true;
      } else {
        rapport.reinscription.envoi = false;
        rapport.reinscription.boutons_confirmation = textes2;
      }
    } else {
      rapport.reinscription.envoi = false;
      rapport.reinscription.etat = "aucune confirmation/checkbox visible";
    }

    rapport.reinscription.texte_final = (await page.locator("main").innerText()).slice(0, 5000);
  } catch (e) {
    rapport.reinscription.erreur = String(e);
    await capture(page, "19-reinscription-erreur-live");
  } finally {
    await page.close();
  }
}

// --- Nouvelle candidature réelle sur presentation ---
{
  const page = await ouvrir();
  try {
    rapport.candidature.porte = await cliquerPorte(page, /(nouveau|candidat|bachelier)/i);
    await page.waitForTimeout(1500);
    await capture(page, "20-candidature-formulaire-live");

    const nom = page.locator('input[autocomplete="family-name"]');
    const prenoms = page.locator('input[autocomplete="given-name"]');
    await nom.fill("TESTE2E");
    await prenoms.fill(`PORTAIL ${horodatage().slice(-6)}`);

    const dateInputs = page.locator('input[placeholder="15"], input[placeholder="03"], input[placeholder="2007"]');
    if (await dateInputs.count() >= 3) {
      await dateInputs.nth(0).fill("12");
      await dateInputs.nth(1).fill("04");
      await dateInputs.nth(2).fill("2004");
    }

    const tel = page.locator('input[type="tel"]:visible').first();
    if (await tel.count()) await tel.fill("0700001234");

    const email = page.locator('input[type="email"]:visible').first();
    if (await email.count()) {
      await email.fill(`djedjelipatrick+klassci-e2e-${Date.now()}@gmail.com`);
    }

    const filiere = page.getByLabel(/fili[eè]re/i).first();
    if (await filiere.count()) {
      const options = await filiere.locator("option").count();
      if (options > 1) await filiere.selectOption({ index: 1 });
    } else {
      const voeu = page.getByLabel(/v[œo]u|formation souhait/i).first();
      if (await voeu.count()) await voeu.fill("BTS Informatique de Gestion");
    }

    const checks = page.locator('main input[type="checkbox"]:visible');
    const nChecks = await checks.count();
    if (nChecks > 0) await checks.nth(nChecks - 1).check();

    await capture(page, "21-candidature-remplie-live");

    const boutons = page.locator("main button:visible");
    const textes = await boutons.allTextContents();
    const idx = textes.findIndex((t) => /(envoyer|candidature|déposer|transmettre)/i.test(t));
    if (idx === -1) throw new Error(`Bouton envoi candidature introuvable: ${JSON.stringify(textes)}`);
    await boutons.nth(idx).click();
    await page.waitForTimeout(2600);
    await capture(page, "22-candidature-apres-envoi-live");

    rapport.candidature.envoi = true;
    rapport.candidature.texte_final = (await page.locator("main").innerText()).slice(0, 5000);
  } catch (e) {
    rapport.candidature.erreur = String(e);
    await capture(page, "29-candidature-erreur-live");
  } finally {
    await page.close();
  }
}

await writeFile(`${OUT}/rapport.json`, JSON.stringify(rapport, null, 2));
await browser.close();
console.log(JSON.stringify(rapport, null, 2));
