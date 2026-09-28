import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://www.klassci.com";
const OUT = "live-e2e-presentation";
await mkdir(OUT, { recursive: true });

const report = { startedAt: new Date().toISOString(), base: BASE, api: [], steps: [] };
const browser = await chromium.launch({ headless: true });

function observe(page, context) {
  page.on("console", (m) => console.log(`${context} console ${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => console.log(`${context} pageerror: ${e.message}`));
  page.on("response", async (r) => {
    if (!r.url().includes("/api/")) return;
    const entry = { context, status: r.status(), method: r.request().method(), url: r.url() };
    try { entry.body = (await r.text()).slice(0, 5000); } catch {}
    report.api.push(entry);
    console.log("API", JSON.stringify(entry));
  });
}

async function clickMatching(page, pattern, fallbackIndex = 0) {
  const buttons = page.locator("main button:visible");
  for (let i = 0; i < await buttons.count(); i++) {
    const button = buttons.nth(i);
    const text = ((await button.innerText().catch(() => "")) || "").trim();
    if (pattern.test(text)) { await button.click(); return; }
  }
  await buttons.nth(fallbackIndex).click();
}

async function snapshot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  const state = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    text: document.querySelector("main")?.innerText?.slice(0, 7000) ?? "",
    inputs: [...document.querySelectorAll("main input")].map((e) => ({ label: e.labels?.[0]?.textContent?.trim() ?? null, type: e.type, value: e.value })),
    selects: [...document.querySelectorAll("main select")].map((e) => ({ label: e.labels?.[0]?.textContent?.trim() ?? null, value: e.value, options: [...e.options].map((o) => ({ value: o.value, text: o.textContent?.trim() })) })),
  }));
  report.steps.push({ name, ...state });
  console.log(`STATE ${name}`, JSON.stringify(state));
  return state;
}

// Nouvelle candidature : vraie requête vers production, aucun stub réseau.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(page, "new");
  try {
    await page.goto(`${BASE}/fr/inscription/universite/presentation`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1000);
    await snapshot(page, "01-portail-live");

    const choices = page.waitForResponse((r) => r.url().includes("/api/inscription/presentation/choix") && r.request().method() === "POST", { timeout: 30000 });
    await clickMatching(page, /nouvel étudiant/i, 0);
    const choicesResponse = await choices;
    report.choices = { status: choicesResponse.status(), body: (await choicesResponse.text()).slice(0, 5000) };

    await page.getByLabel(/^Nom$/i).waitFor({ state: "visible", timeout: 20000 });
    await snapshot(page, "02-nouvelle-inscription-formulaire-live");

    await page.getByLabel(/^Nom$/i).fill("TEST DEPLOIEMENT");
    await page.getByLabel(/^Prénoms$/i).fill("Validation Live");
    await page.getByLabel(/^Jour$/i).fill("15");
    await page.getByLabel(/^Mois$/i).fill("07");
    await page.getByLabel(/^Année$/i).fill("2002");
    await page.getByLabel(/^Téléphone/i).first().fill("2732797523");
    await page.getByLabel(/^Adresse e-mail$/i).fill("contact@klassci.com");

    const filiere = page.getByLabel(/Filière/i).first();
    const filiereValues = await filiere.locator("option").evaluateAll((opts) => opts.map((o) => o.value).filter(Boolean));
    if (filiereValues.length) await filiere.selectOption(filiereValues[0]);

    const niveau = page.getByLabel(/Niveau/i).first();
    const niveauValues = await niveau.locator("option").evaluateAll((opts) => opts.map((o) => o.value).filter(Boolean));
    if (niveauValues.length) await niveau.selectOption(niveauValues[0]);

    const consent = page.getByLabel(/J'autorise la transmission de ces informations à l'établissement/i);
    await consent.check();
    await snapshot(page, "03-nouvelle-inscription-remplie-live");

    const submit = page.waitForResponse((r) => r.url().includes("/api/inscription/presentation/submit") && r.request().method() === "POST", { timeout: 30000 });
    await clickMatching(page, /envoyer ma candidature/i, 0);
    const submitResponse = await submit;
    report.newApplication = { status: submitResponse.status(), body: (await submitResponse.text()).slice(0, 5000) };
    console.log("SUBMIT", JSON.stringify(report.newApplication));
    await page.waitForTimeout(1800);
    await snapshot(page, "04-nouvelle-inscription-apres-envoi-live");
  } catch (error) {
    report.newApplication = { ...(report.newApplication ?? {}), error: String(error?.stack ?? error) };
    console.error("NEW ERROR", error);
    await snapshot(page, "04-nouvelle-inscription-erreur-live").catch(() => {});
  } finally {
    await page.close();
  }
}

// Réinscription : vrai lookup sur le dossier démo, sans déclencher de notification vers ses contacts synthétiques.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  observe(page, "reinscription");
  try {
    await page.goto(`${BASE}/fr/inscription/universite/presentation`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(900);
    await clickMatching(page, /déjà étudiant/i, 1);
    await page.waitForTimeout(600);
    await snapshot(page, "05-reinscription-identification-live");

    await page.getByLabel(/Matricule/i).fill("DEMO90001");
    await page.getByLabel(/^Jour$/i).fill("25");
    await page.getByLabel(/^Mois$/i).fill("08");
    await page.getByLabel(/^Année$/i).fill("2005");

    const lookup = page.waitForResponse((r) => r.url().includes("/api/reinscription/presentation/lookup") && r.request().method() === "POST", { timeout: 30000 });
    await clickMatching(page, /retrouver mon dossier/i, 0);
    const lookupResponse = await lookup;
    report.reinscription = { status: lookupResponse.status(), body: (await lookupResponse.text()).slice(0, 5000) };
    await page.getByText(/Bonjour BRICE/i).waitFor({ state: "visible", timeout: 12000 });
    await snapshot(page, "06-reinscription-dossier-retrouve-live");
  } catch (error) {
    report.reinscription = { ...(report.reinscription ?? {}), error: String(error?.stack ?? error) };
    console.error("REINSCRIPTION ERROR", error);
    await snapshot(page, "06-reinscription-erreur-live").catch(() => {});
  } finally {
    await page.close();
  }
}

// Route rendez-vous réelle : confirme aussi que le backend déployé répond après migration.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  observe(page, "rdv");
  try {
    const slots = page.waitForResponse((r) => r.url().includes("/api/rendez-vous/presentation/creneaux"), { timeout: 30000 });
    await page.goto(`${BASE}/fr/inscription/universite/presentation/rendez-vous`, { waitUntil: "domcontentloaded", timeout: 45000 });
    const slotsResponse = await slots;
    report.rendezVous = { status: slotsResponse.status(), body: (await slotsResponse.text()).slice(0, 5000) };
    await page.waitForTimeout(800);
    await snapshot(page, "07-rendez-vous-live");
  } catch (error) {
    report.rendezVous = { ...(report.rendezVous ?? {}), error: String(error?.stack ?? error) };
    console.error("RDV ERROR", error);
  } finally {
    await page.close();
  }
}

report.finishedAt = new Date().toISOString();
await writeFile(`${OUT}/rapport.json`, JSON.stringify(report, null, 2));
console.log("REPORT", JSON.stringify(report));
await browser.close();
