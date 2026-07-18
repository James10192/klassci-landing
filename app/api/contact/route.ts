import { NextRequest, NextResponse } from "next/server";

import { CONTACT_FIELD_LIMITS } from "@/lib/contact";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 5 * 60 * 1_000;
const RATE_LIMIT = 5;
const MAX_RATE_BUCKETS = 1_000;
const PROVIDER_TIMEOUT_MS = 8_000;
const ALLOWED_SCHOOL_TYPES = new Set([
  "ecole_primaire",
  "college",
  "lycee",
  "groupe_scolaire",
  "universite",
  "ecole_superieure",
  "centre_formation",
  "autre",
]);

interface ContactPayload {
  name: string;
  email: string;
  school: string;
  phone: string;
  schoolType: string;
  studentCount: string;
  plan: string;
  message: string;
  source: string;
  offer: string;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

interface DeliveryResult {
  ok: boolean;
  provider: "web3forms" | "legacy" | "unconfigured";
  status?: number;
}

const globalRateStore = globalThis as typeof globalThis & {
  klassciContactRateBuckets?: Map<string, RateBucket>;
};
const rateBuckets =
  globalRateStore.klassciContactRateBuckets ?? new Map<string, RateBucket>();
globalRateStore.klassciContactRateBuckets = rateBuckets;

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  if (!isSameOrigin(request)) {
    return json({ ok: false, error: "invalid_origin", requestId }, 403);
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return json({ ok: false, error: "rate_limited", requestId }, 429);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, error: "invalid_form", requestId }, 400);
  }

  if (readField(formData, "botcheck")) {
    return json({ ok: true, requestId }, 200);
  }

  const payload = parsePayload(formData);
  if (!payload) {
    return json({ ok: false, error: "invalid_fields", requestId }, 422);
  }

  try {
    const delivery = await deliverContact(payload);
    if (!delivery.ok) {
      logDeliveryFailure(requestId, delivery);
      return json({ ok: false, error: "provider_unavailable", requestId }, 503);
    }
    return json({ ok: true, requestId }, 200);
  } catch (error) {
    logDeliveryFailure(requestId, { ok: false, provider: getConfiguredProvider() }, error);
    return json({ ok: false, error: "delivery_failed", requestId }, 502);
  }
}

function parsePayload(formData: FormData): ContactPayload | null {
  if (hasOversizedField(formData)) return null;

  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const school = readField(formData, "school");
  const phone = readField(formData, "phone");
  const schoolType = readField(formData, "school_type");
  const studentCount = readField(formData, "student_count");
  const plan = readField(formData, "plan");
  const message = readField(formData, "message");
  const source = readField(formData, "source") || "landing_contact";
  const offer = readField(formData, "offer");

  if (!name || !school || !isValidEmail(email)) return null;
  if (!ALLOWED_SCHOOL_TYPES.has(schoolType)) return null;
  if (studentCount && !isValidStudentCount(studentCount)) return null;

  return { name, email, school, phone, schoolType, studentCount, plan, message, source, offer };
}

async function deliverContact(payload: ContactPayload): Promise<DeliveryResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (accessKey) return deliverWithWeb3Forms(payload, accessKey);

  const legacyEndpoint = process.env.CONTACT_DEMO_URL?.trim();
  if (legacyEndpoint) return deliverToLegacyEndpoint(payload, legacyEndpoint);

  return { ok: false, provider: "unconfigured" };
}

async function deliverWithWeb3Forms(
  payload: ContactPayload,
  accessKey: string,
): Promise<DeliveryResult> {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `Nouvelle demande KLASSCI · ${payload.school}`,
      from_name: "KLASSCI.com",
      name: payload.name,
      email: payload.email,
      telephone: payload.phone || "Non renseigné",
      etablissement: payload.school,
      type_etablissement: payload.schoolType,
      nombre_eleves: payload.studentCount || "Non renseigné",
      formule: payload.plan || "À déterminer",
      offre: payload.offer || "Standard",
      source: payload.source,
      message: payload.message || "Aucun message complémentaire",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    return { ok: false, provider: "web3forms", status: response.status };
  }
  const result = (await response.json()) as { success?: boolean };
  return { ok: result.success === true, provider: "web3forms", status: response.status };
}

async function deliverToLegacyEndpoint(
  payload: ContactPayload,
  endpoint: string,
): Promise<DeliveryResult> {
  const body = new FormData();
  body.set("nom", payload.name);
  body.set("email", payload.email);
  body.set("telephone", payload.phone);
  body.set("etablissement", payload.school);
  body.set("type_etablissement", normaliseLegacySchoolType(payload.schoolType));
  body.set("nombre_etudiants", toLegacyStudentRange(payload.studentCount));
  body.set("message", buildLegacyMessage(payload));

  const response = await fetch(endpoint, {
    method: "POST",
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  return { ok: response.ok, provider: "legacy", status: response.status };
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneRateBuckets(now);
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim();
}

function hasOversizedField(formData: FormData): boolean {
  return Object.entries(CONTACT_FIELD_LIMITS).some(([name, limit]) => {
    const value = formData.get(name);
    return typeof value === "string" && value.trim().length > limit;
  });
}

function pruneRateBuckets(now: number): void {
  if (rateBuckets.size < MAX_RATE_BUCKETS) return;
  for (const [ip, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(ip);
  }

  while (rateBuckets.size >= MAX_RATE_BUCKETS) {
    const oldestIp = rateBuckets.keys().next().value as string | undefined;
    if (!oldestIp) break;
    rateBuckets.delete(oldestIp);
  }
}

function getConfiguredProvider(): DeliveryResult["provider"] {
  if (process.env.WEB3FORMS_ACCESS_KEY?.trim()) return "web3forms";
  if (process.env.CONTACT_DEMO_URL?.trim()) return "legacy";
  return "unconfigured";
}

function logDeliveryFailure(
  requestId: string,
  delivery: DeliveryResult,
  error?: unknown,
): void {
  console.error("[contact] delivery failed", {
    requestId,
    provider: delivery.provider,
    status: delivery.status,
    error: error instanceof Error ? error.name : undefined,
  });
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidStudentCount(value: string): boolean {
  const count = Number(value);
  return Number.isInteger(count) && count >= 1 && count <= 50_000;
}

function normaliseLegacySchoolType(value: string): string {
  return value === "groupe_scolaire" ? "autre" : value;
}

function toLegacyStudentRange(value: string): string {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return "";
  if (count < 100) return "moins_100";
  if (count <= 500) return "100_500";
  if (count <= 1_000) return "500_1000";
  if (count <= 5_000) return "1000_5000";
  return "plus_5000";
}

function buildLegacyMessage(payload: ContactPayload): string {
  return [
    payload.message,
    payload.plan ? `Formule : ${payload.plan}` : "",
    payload.studentCount ? `Effectif : ${payload.studentCount}` : "",
    payload.offer ? `Offre : ${payload.offer}` : "",
    `Source : ${payload.source}`,
  ].filter(Boolean).join("\n");
}

function json(
  body: { ok: boolean; error?: string; requestId: string },
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
