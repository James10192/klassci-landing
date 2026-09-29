import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://www.klassci.com/fr/inscription/universite/presentation";
const OUT = ".playwright-live";
const TEST_EMAIL = "djedjelipatrick@gmail.com";
const TEST_PHONE = "0141540178";
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

async function lireReponse(reponse) {
  const texte = await reponse.text();
  let corps = texte;
  try { corps = JSON.parse(texte); } catch {}
  return { status: reponse.status(), ok: reponse.ok(), corps };
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

    const lookupPromise = page.waitForResponse(
      (r) => r.url().includes("/api/reinscription/presentation/lookup") && r.request().method() === "POST",
      { timeout: 45000 },
    );
    await actions.nth(idx).click();
    const lookup = await lookupPromise;
    rapport.reinscription.lookup = await lireReponse(lookup);
    await page.waitForTimeout(800);
    await capture(page, "11-reinscription-confirmation-live");

    const checkbox = page.locator('main input[type="checkbox"]:visible').first();
    if (await checkbox.count()) {
      await checkbox.check();
      const boutons2 = page.locator("main button:visible");
      const textes2 = await boutons2.allTextContents();
      const idx2 = textes2.findIndex((t) => /(confirmer|réinscri|envoyer)/i.test(t));
      if (idx2 >= 0) {
        const submitPromise = page.waitForResponse(
          (r) => r.url().includes("/api/reinscription/presentation/submit") && r.request().method() === "POST",
          { timeout: 45000 },
        );
        await boutons2.nth(idx2).click();
        const submit = await submitPromise;
        rapport.reinscription.submit = await lireReponse(submit);
        await page.waitForTimeout(1000);
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
    rapport.reinscription.texte_final = (await page.locator("main").innerText()).slice(0, 5000).catch(() => "");
    await capture(page, "19-reinscription-erreur-live");
  } finally {
    await page.close();
  }
}

// --- Nouvelle candidature réelle sur presentation, avec les contacts de test validés ---
{
  const page = await ouvrir();
  try {
    rapport.candidature.porte = await cliquerPorte(page, /(nouvel|nouveau|nouvelle|candidat|bachelier)/i);

    const choix = await page.waitForResponse(
      (r) => r.url().includes("/api/inscription/presentation/choix") && r.request().method() === "POST",
      { timeout: 45000 },
    ).catch(() => null);
    if (choix) rapport.candidature.choix = await lireReponse(choix);

    await page.waitForTimeout(700);
    await capture(page, "20-candidature-formulaire-live");

    const nom = page.locator('input[autocomplete="family-name"]');
    const prenoms = page.locator('input[autocomplete="given-name"]');
    await nom.fill("TESTE2E");
    await prenoms.fill(`PORTAIL ${horodatage().slice(-6)}`);

    const dateInputs = page.locator('input[placeholder="15"], input[placeholder="03"], input[placeholder="2007"]');
    if ((await dateInputs.count()) >= 3) {
      await dateInputs.nth(0).fill("12");
      await dateInputs.nth(1).fill("04");
      await dateInputs.nth(2).fill("2004");
    }

    const tel = page.locator('input[type="tel"]:visible').first();
    if (await tel.count()) await tel.fill(TEST_PHONE);

    const email = page.locator('input[type="email"]:visible').first();
    if (await email.count()) await email.fill(TEST_EMAIL);

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

    const submitPromise = page.waitForResponse(
      (r) => r.url().includes("/api/inscription/presentation/submit") && r.request().method() === "POST",
      { timeout: 45000 },
    );
    await boutons.nth(idx).click();
    const submit = await submitPromise;
    rapport.candidature.submit = await lireReponse(submit);
    rapport.candidature.envoi = submit.ok();
    await page.waitForTimeout(1000);
    await capture(page, "22-candidature-apres-envoi-live");
    rapport.candidature.texte_final = (await page.locator("main").innerText()).slice(0, 5000);
  } catch (e) {
    rapport.candidature.erreur = String(e);
    rapport.candidature.texte_final = (await page.locator("main").innerText()).slice(0, 5000).catch(() => "");
    await capture(page, "29-candidature-erreur-live");
  } finally {
    await page.close();
  }
}

await writeFile(`${OUT}/rapport.json`, JSON.stringify(rapport, null, 2));
await browser.close();
console.log(JSON.stringify(rapport, null, 2));
