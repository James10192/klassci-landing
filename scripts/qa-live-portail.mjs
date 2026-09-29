import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://www.klassci.com/fr/inscription/universite/presentation";
const OUT = ".playwright-live";
const TEST_EMAIL = "djedjelipatrick@gmail.com";
const TEST_PHONE = "0141540178";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const rapport = { base: BASE, candidature: {} };

async function capture(nom) {
  await page.screenshot({ path: `${OUT}/${nom}.png`, fullPage: true });
}
async function lire(reponse) {
  const texte = await reponse.text();
  let corps = texte;
  try { corps = JSON.parse(texte); } catch {}
  return { status: reponse.status(), ok: reponse.ok(), corps };
}

try {
  const nav = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  rapport.http = nav?.status() ?? null;
  await capture("30-candidature-portail-live");

  const choixPromise = page.waitForResponse(
    (r) => r.url().includes("/api/inscription/presentation/choix") && r.request().method() === "POST",
    { timeout: 45000 },
  );

  const portes = page.locator("main button");
  const textesPortes = await portes.allTextContents();
  const idxPorte = textesPortes.findIndex((t) => /(nouvel|nouveau|nouvelle|candidat|bachelier)/i.test(t));
  if (idxPorte < 0) throw new Error(`Porte nouvel étudiant introuvable: ${JSON.stringify(textesPortes)}`);
  await portes.nth(idxPorte).click();

  rapport.candidature.choix = await lire(await choixPromise);
  if (!rapport.candidature.choix.ok) throw new Error(`Choix indisponibles: HTTP ${rapport.candidature.choix.status}`);
  await page.waitForTimeout(500);
  await capture("31-candidature-formulaire-live");

  await page.locator('input[autocomplete="family-name"]').fill("TESTE2E");
  await page.locator('input[autocomplete="given-name"]').fill(`PORTAIL ${Date.now().toString().slice(-6)}`);
  const dates = page.locator('input[placeholder="15"], input[placeholder="03"], input[placeholder="2007"]');
  await dates.nth(0).fill("12");
  await dates.nth(1).fill("04");
  await dates.nth(2).fill("2004");
  await page.locator("#candidature-telephone").fill(TEST_PHONE);
  await page.locator("#candidature-email").fill(TEST_EMAIL);

  const filiere = page.getByLabel(/fili[eè]re/i).first();
  if (await filiere.count()) {
    const n = await filiere.locator("option").count();
    if (n > 1) await filiere.selectOption({ index: 1 });
  }

  const checks = page.locator('main input[type="checkbox"]:visible');
  const nChecks = await checks.count();
  if (nChecks > 0) await checks.nth(nChecks - 1).check();
  await capture("32-candidature-remplie-live");

  const boutons = page.locator("main button:visible");
  const textes = await boutons.allTextContents();
  const idx = textes.findIndex((t) => /(envoyer|candidature|déposer|transmettre)/i.test(t));
  if (idx < 0) throw new Error(`Bouton envoi introuvable: ${JSON.stringify(textes)}`);

  const submitPromise = page.waitForResponse(
    (r) => r.url().includes("/api/inscription/presentation/submit") && r.request().method() === "POST",
    { timeout: 45000 },
  );
  await boutons.nth(idx).click();
  rapport.candidature.submit = await lire(await submitPromise);
  rapport.candidature.envoi = rapport.candidature.submit.ok;
  await page.waitForTimeout(1200);
  rapport.candidature.texte = (await page.locator("main").innerText()).slice(0, 5000);
  await capture("33-candidature-apres-envoi-live");
} catch (e) {
  rapport.candidature.erreur = String(e);
  try { rapport.candidature.texte = (await page.locator("main").innerText()).slice(0, 5000); } catch {}
  await capture("39-candidature-erreur-live").catch(() => {});
} finally {
  await writeFile(`${OUT}/rapport.json`, JSON.stringify(rapport, null, 2));
  await page.close();
  await browser.close();
  console.log(JSON.stringify(rapport, null, 2));
}
