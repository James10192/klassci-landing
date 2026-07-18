"use client";

import { AlertCircle, Check, Mail, MapPin, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, type FormEvent, type MouseEvent } from "react";

import { CONTACT_ENDPOINT, WEB3FORMS_ACCESS_KEY, useContactSubmission } from "@/hooks/use-contact-submission";
import { CONTACT_FIELD_LIMITS } from "@/lib/contact";

interface ContactInfo {
  email: string;
  location: string;
  emailLabel: string;
  locationLabel: string;
}

interface ContactFieldText {
  label: string;
  placeholder: string;
}

interface ContactTypeOption {
  value: string;
  label: string;
}

interface ContactForm {
  name: ContactFieldText;
  email: ContactFieldText;
  school: ContactFieldText;
  phone: ContactFieldText;
  type: ContactFieldText & { options: ContactTypeOption[] };
  message: ContactFieldText & { labelOptional: string };
  submit: string;
  submitArrow: string;
  submitting: string;
  responseNote: string;
}

interface UniverseContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const fieldClass =
  "block min-h-11 w-full rounded border border-border bg-bg-card px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent-light";

const labelClass = "mb-1.5 block font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted";

export function UniverseContactDialog({ open, onClose }: UniverseContactDialogProps) {
  const t = useTranslations("contact");
  const nav = useTranslations("nav");
  const locale = useLocale() as "fr" | "en";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorBannerId = useId();
  const { status, reset, submitContact } = useContactSubmission(locale);

  const info = t.raw("info") as ContactInfo;
  const form = t.raw("form") as ContactForm;
  const success = t.raw("success") as { title: string; text: string };
  const error = t.raw("error") as { title: string; text: string };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      reset();
      dialog.showModal();
    }
    if (!open && dialog.open) {
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
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = useCallback(() => {
    if (status !== "submitting") dialogRef.current?.close();
  }, [status]);

  const handleBackdropClick = useCallback((event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      close();
    }
  }, [close]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitContact(event.currentTarget);
    },
    [submitContact],
  );

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        if (status === "submitting") event.preventDefault();
      }}
      onClick={handleBackdropClick}
      aria-labelledby="hub-contact-title"
      className="m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-4 md:p-6">
        <div
          className="relative grid max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-border bg-bg-card shadow-[0_28px_90px_rgba(0,0,0,0.22)] lg:grid-cols-[0.78fr_1.22fr]"
          onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={close}
            disabled={status === "submitting"}
            aria-label={nav("menuClose")}
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded border border-border bg-bg-card/90 text-text-secondary backdrop-blur-sm transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <aside className="relative overflow-hidden border-b border-border p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,83,203,0.10),rgba(245,130,32,0.10)_65%,transparent)]" />
            <div className="relative">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">Contact KLASSCI</p>
              <h2 id="hub-contact-title" className="mt-4 font-serif text-4xl font-light leading-tight text-accent">
                {t("title")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{t("intro")}</p>

              <div className="mt-8 space-y-5">
                <a href={`mailto:${info.email}`} className="flex items-start gap-3 text-text transition-colors hover:text-accent">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-bg-card">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">{info.emailLabel}</span>
                    <span className="break-all text-sm">{info.email}</span>
                  </span>
                </a>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-bg-card">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">{info.locationLabel}</span>
                    <span className="text-sm text-text">{info.location}</span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="p-6 lg:p-8">
            {status === "success" ? (
              <div className="flex min-h-[28rem] flex-col items-start justify-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                  <Check className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-serif text-3xl font-light text-text">{success.title}</h3>
                <p className="max-w-xl leading-relaxed text-text-secondary">{success.text}</p>
              </div>
            ) : (
              <form method="POST" action={CONTACT_ENDPOINT} onSubmit={onSubmit} className="space-y-5">
                <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="hub-contact-name" className={labelClass}>{form.name.label}</label>
                    <input id="hub-contact-name" name="name" required maxLength={CONTACT_FIELD_LIMITS.name} autoComplete="name" placeholder={form.name.placeholder} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="hub-contact-email" className={labelClass}>{form.email.label}</label>
                    <input id="hub-contact-email" name="email" type="email" required maxLength={CONTACT_FIELD_LIMITS.email} autoComplete="email" placeholder={form.email.placeholder} className={fieldClass} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="hub-contact-school" className={labelClass}>{form.school.label}</label>
                    <input id="hub-contact-school" name="school" required maxLength={CONTACT_FIELD_LIMITS.school} autoComplete="organization" placeholder={form.school.placeholder} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="hub-contact-phone" className={labelClass}>{form.phone.label}</label>
                    <input id="hub-contact-phone" name="phone" type="tel" maxLength={CONTACT_FIELD_LIMITS.phone} autoComplete="tel" placeholder={form.phone.placeholder} className={fieldClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="hub-contact-type" className={labelClass}>{form.type.label}</label>
                  <select id="hub-contact-type" name="school_type" required defaultValue="" className={fieldClass}>
                    <option value="" disabled>{form.type.placeholder}</option>
                    {form.type.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="hub-contact-message" className={labelClass}>{form.message.labelOptional}</label>
                  <textarea id="hub-contact-message" name="message" rows={4} maxLength={CONTACT_FIELD_LIMITS.message} placeholder={form.message.placeholder} className={`${fieldClass} min-h-[112px] resize-y`} />
                </div>

                {status === "error" && (
                  <div id={errorBannerId} role="alert" className="flex items-start gap-3 rounded border border-danger/40 bg-danger/5 px-4 py-3 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                    <div>
                      <p className="font-medium text-text">{error.title}</p>
                      <p className="text-text-secondary">{error.text}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
                  <p className="order-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-text-muted md:order-1">{form.responseNote}</p>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    aria-describedby={status === "error" ? errorBannerId : undefined}
                    className="order-1 inline-flex min-h-11 items-center justify-center gap-2 rounded border border-accent bg-accent px-5 text-sm font-medium text-white transition-all hover:-translate-y-px hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 md:order-2"
                  >
                    {status === "submitting" ? form.submitting : form.submit}
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
