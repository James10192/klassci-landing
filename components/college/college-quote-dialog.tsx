"use client";

import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Check from "lucide-react/dist/esm/icons/check";
import Mail from "lucide-react/dist/esm/icons/mail";
import Send from "lucide-react/dist/esm/icons/send";
import X from "lucide-react/dist/esm/icons/x";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, type FormEvent, type MouseEvent, type ReactNode } from "react";

import { CONTACT_ENDPOINT, WEB3FORMS_ACCESS_KEY, useContactSubmission } from "@/hooks/use-contact-submission";
import type { CollegePlanKey } from "@/lib/college-pricing";
import { CONTACT_FIELD_LIMITS } from "@/lib/contact";

interface InstitutionType {
  value: string;
  label: string;
}

interface CollegeQuoteDialogProps {
  open: boolean;
  plan: CollegePlanKey | null;
  studentCount: number;
  onClose: () => void;
}

const PLAN_KEYS: CollegePlanKey[] = ["essentielle", "pro", "elite", "partenaire"];
const fieldClass =
  "min-h-11 w-full rounded border border-border bg-bg-card px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent-light";
const labelClass = "mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.07em] text-text-muted";

export function CollegeQuoteDialog({ open, plan, studentCount, onClose }: CollegeQuoteDialogProps) {
  const t = useTranslations("college.sales.form");
  const calculator = useTranslations("college.sales.calculator");
  const locale = useLocale() as "fr" | "en";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorId = useId();
  const { status, reset, submitContact } = useContactSubmission(locale);
  const institutionTypes = t.raw("types") as InstitutionType[];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      reset();
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, reset]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = useCallback(() => {
    if (status !== "submitting") dialogRef.current?.close();
  }, [status]);

  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitContact(event.currentTarget, {
      fields: {
        source: "college_quote_dialog",
        offer: "college_launch_30_first_year_first_50",
      },
    });
  }, [submitContact]);

  const selectedPlanLabel = plan ? calculator(`plans.${plan}`) : t("planDefault");

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        if (status === "submitting") event.preventDefault();
      }}
      onClick={(event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === dialogRef.current) close();
      }}
      aria-labelledby="college-quote-title"
      className="m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/45 backdrop:backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div
          className="relative grid max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-border bg-bg-card shadow-[0_28px_90px_rgba(0,0,0,0.24)] lg:grid-cols-[0.76fr_1.24fr]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={close}
            disabled={status === "submitting"}
            aria-label={t("close")}
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded border border-border bg-bg-card text-text-secondary transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <aside className="relative overflow-hidden border-b border-border bg-[#0a3d8f] p-6 text-white lg:border-b-0 lg:border-r lg:p-8">
            <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-brand-orange" />
            <div className="relative pr-10">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white/60">{t("eyebrow")}</p>
              <h2 id="college-quote-title" className="mt-4 font-serif text-4xl font-light leading-tight text-white">{t("title")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80">{t("intro")}</p>

              <dl className="mt-8 space-y-4 border-t border-white/20 pt-6 text-sm">
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-white/50">{t("plan")}</dt>
                  <dd className="mt-1 font-semibold text-white">{selectedPlanLabel}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-white/50">{t("students")}</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-white">{studentCount}</dd>
                </div>
              </dl>

              <a href="mailto:contact@klassci.com" className="mt-8 inline-flex items-center gap-2 text-sm text-white/75 hover:text-white">
                <Mail className="h-4 w-4" aria-hidden />
                contact@klassci.com
              </a>
            </div>
          </aside>

          <div className="p-5 sm:p-7 lg:p-8">
            {status === "success" ? (
              <div className="flex min-h-[30rem] flex-col items-start justify-center gap-4" role="status" aria-live="polite">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                  <Check className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-serif text-3xl font-light text-text">{t("successTitle")}</h3>
                <p className="max-w-xl leading-relaxed text-text-secondary">{t("successText")}</p>
              </div>
            ) : (
              <form key={`${plan ?? "none"}-${studentCount}`} method="POST" action={CONTACT_ENDPOINT} onSubmit={submit} className="space-y-5">
                <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
                <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="college-quote-name" label={t("name")}>
                    <input id="college-quote-name" name="name" required maxLength={CONTACT_FIELD_LIMITS.name} autoComplete="name" placeholder={t("namePlaceholder")} className={fieldClass} />
                  </Field>
                  <Field id="college-quote-email" label={t("email")}>
                    <input id="college-quote-email" name="email" type="email" required maxLength={CONTACT_FIELD_LIMITS.email} autoComplete="email" placeholder={t("emailPlaceholder")} className={fieldClass} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="college-quote-school" label={t("school")}>
                    <input id="college-quote-school" name="school" required maxLength={CONTACT_FIELD_LIMITS.school} autoComplete="organization" placeholder={t("schoolPlaceholder")} className={fieldClass} />
                  </Field>
                  <Field id="college-quote-phone" label={t("phone")}>
                    <input id="college-quote-phone" name="phone" type="tel" maxLength={CONTACT_FIELD_LIMITS.phone} autoComplete="tel" placeholder={t("phonePlaceholder")} className={fieldClass} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="college-quote-type" label={t("type")}>
                    <select id="college-quote-type" name="school_type" required defaultValue="college" className={fieldClass}>
                      {institutionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </Field>
                  <Field id="college-quote-students" label={t("students")}>
                    <input id="college-quote-students" name="student_count" type="number" min={1} max={50_000} defaultValue={studentCount} required className={fieldClass} />
                  </Field>
                </div>
                <Field id="college-quote-plan" label={t("plan")}>
                  <select id="college-quote-plan" name="plan" defaultValue={plan ?? ""} className={fieldClass}>
                    <option value="">{t("planDefault")}</option>
                    {PLAN_KEYS.map((key) => <option key={key} value={key}>{calculator(`plans.${key}`)}</option>)}
                  </select>
                </Field>
                <Field id="college-quote-message" label={t("message")}>
                  <textarea id="college-quote-message" name="message" rows={3} maxLength={CONTACT_FIELD_LIMITS.message} placeholder={t("messagePlaceholder")} className={`${fieldClass} min-h-24 resize-y`} />
                </Field>

                {status === "error" && (
                  <div id={errorId} role="alert" className="flex items-start gap-3 rounded border border-danger/35 bg-danger/5 p-4 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                    <div>
                      <p className="font-semibold text-text">{t("errorTitle")}</p>
                      <p className="mt-1 text-text-secondary">{t("errorText")}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="order-2 font-mono text-[0.68rem] uppercase tracking-[0.07em] text-text-muted sm:order-1">{t("responseNote")}</p>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    aria-describedby={status === "error" ? errorId : undefined}
                    className="order-1 inline-flex min-h-11 items-center justify-center gap-2 rounded bg-brand-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                  >
                    {status === "submitting" ? t("submitting") : t("submit")}
                    {status !== "submitting" && <Send className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
