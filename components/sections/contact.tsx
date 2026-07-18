"use client";

import { AlertCircle, Check, Mail, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useId, type FormEvent } from "react";

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

interface ContactTypeField extends ContactFieldText {
  options: ContactTypeOption[];
}

interface ContactMessageField extends ContactFieldText {
  labelOptional: string;
}

interface ContactForm {
  name: ContactFieldText;
  email: ContactFieldText;
  school: ContactFieldText;
  phone: ContactFieldText;
  type: ContactTypeField;
  message: ContactMessageField;
  submit: string;
  submitArrow: string;
  submitting: string;
  responseNote: string;
}

const FIELD_CLS =
  "block w-full border border-border rounded bg-bg-card text-text px-3.5 py-2.5 text-[0.875rem] " +
  "focus:border-accent focus:ring-2 focus:ring-accent-light outline-none transition-colors " +
  "placeholder:text-text-muted";

const LABEL_CLS =
  "block text-[0.72rem] font-mono uppercase tracking-[0.08em] text-text-muted mb-1.5";

export function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale() as "fr" | "en";

  const info = t.raw("info") as ContactInfo;
  const form = t.raw("form") as ContactForm;
  const success = t.raw("success") as { title: string; text: string };
  const error = t.raw("error") as { title: string; text: string };

  const { status, submitContact } = useContactSubmission(locale);
  const errorBannerId = useId();

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void submitContact(e.currentTarget);
    },
    [submitContact],
  );

  const eyebrowLabel = locale === "fr" ? "Contact" : "Contact";

  return (
    <section
      id="contact"
      className="py-section container"
      aria-labelledby="contact-heading"
    >
      {/* Section header — left-aligned */}
      <div>
        <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
          05 · {eyebrowLabel}
        </p>
        <h2
          id="contact-heading"
          className="font-serif font-light text-section-h2 text-accent mb-3"
        >
          {t("title")}
        </h2>
        <p className="text-text-secondary max-w-[42rem]">{t("intro")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 mt-12">
        {/* Left: contact info */}
        <aside
          className="rounded-lg border border-border bg-bg-card p-6 lg:p-8 h-fit"
          aria-label={locale === "fr" ? "Informations pratiques" : "Practical info"}
        >
          <h3 className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-6">
            {locale === "fr" ? "Infos pratiques" : "Practical info"}
          </h3>

          <ul className="space-y-6">
            <li className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex items-center justify-center h-9 w-9 rounded border border-border text-text-secondary shrink-0"
              >
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
                  {info.emailLabel}
                </div>
                <a
                  href={`mailto:${info.email}`}
                  className="text-text hover:text-accent transition-colors text-[0.95rem] break-all"
                >
                  {info.email}
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex items-center justify-center h-9 w-9 rounded border border-border text-text-secondary shrink-0"
              >
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
                  {info.locationLabel}
                </div>
                <span className="text-text text-[0.95rem]">{info.location}</span>
              </div>
            </li>
          </ul>
        </aside>

        {/* Right: form or success */}
        <div className="rounded-lg border border-border bg-bg-card p-6 lg:p-8">
          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-start gap-4 py-6"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent-light text-accent"
              >
                <Check className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <h3 className="font-serif font-light text-2xl text-text">
                {success.title}
              </h3>
              <p className="text-text-secondary">{success.text}</p>
            </div>
          ) : (
            <form
              method="POST"
              action={CONTACT_ENDPOINT}
              onSubmit={onSubmit}
              className="space-y-5"
            >
              <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
              {/* Name + Email row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className={LABEL_CLS}>
                    {form.name.label}
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    placeholder={form.name.placeholder}
                    autoComplete="name"
                    maxLength={CONTACT_FIELD_LIMITS.name}
                    required
                    aria-required="true"
                    className={FIELD_CLS}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={LABEL_CLS}>
                    {form.email.label}
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    placeholder={form.email.placeholder}
                    autoComplete="email"
                    maxLength={CONTACT_FIELD_LIMITS.email}
                    required
                    aria-required="true"
                    className={FIELD_CLS}
                  />
                </div>
              </div>

              {/* School + Phone row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-school" className={LABEL_CLS}>
                    {form.school.label}
                  </label>
                  <input
                    type="text"
                    id="contact-school"
                    name="school"
                    placeholder={form.school.placeholder}
                    autoComplete="organization"
                    maxLength={CONTACT_FIELD_LIMITS.school}
                    required
                    aria-required="true"
                    className={FIELD_CLS}
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className={LABEL_CLS}>
                    {form.phone.label}
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    placeholder={form.phone.placeholder}
                    autoComplete="tel"
                    maxLength={CONTACT_FIELD_LIMITS.phone}
                    className={FIELD_CLS}
                  />
                </div>
              </div>

              {/* School type */}
              <div>
                <label htmlFor="contact-type" className={LABEL_CLS}>
                  {form.type.label}
                </label>
                <select
                  id="contact-type"
                  name="school_type"
                  required
                  aria-required="true"
                  defaultValue=""
                  className={FIELD_CLS + " appearance-none pr-9 bg-no-repeat bg-[right_0.85rem_center] bg-[length:0.85rem]"}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%2364748b' stroke-width='1.5'%3e%3cpath d='M4 6l4 4 4-4'/%3e%3c/svg%3e\")",
                  }}
                >
                  <option value="" disabled>
                    {form.type.placeholder}
                  </option>
                  {form.type.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className={LABEL_CLS}>
                  {form.message.labelOptional}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder={form.message.placeholder}
                  rows={5}
                  maxLength={CONTACT_FIELD_LIMITS.message}
                  className={FIELD_CLS + " min-h-[120px] resize-y"}
                />
              </div>

              {/* Error banner */}
              {status === "error" && (
                <div
                  id={errorBannerId}
                  role="alert"
                  className="flex items-start gap-3 rounded border border-danger/40 bg-danger/5 px-4 py-3 text-[0.875rem]"
                >
                  <AlertCircle
                    className="h-4 w-4 text-danger shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div>
                    <div className="font-medium text-text">{error.title}</div>
                    <div className="text-text-secondary">{error.text}</div>
                  </div>
                </div>
              )}

              {/* Submit row — note left, button right (matches live klassci.com) */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
                <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted order-2 md:order-1">
                  {form.responseNote}
                </p>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  aria-describedby={status === "error" ? errorBannerId : undefined}
                  className={[
                    "inline-flex min-h-11 items-center justify-center gap-2",
                    "bg-accent text-white px-5 py-2.5 rounded text-[0.875rem] font-medium",
                    "border border-accent",
                    "transition-all duration-200 ease-klassci",
                    "hover:bg-accent-hover hover:border-accent-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(4,83,203,0.25)]",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
                    "w-full md:w-auto order-1 md:order-2",
                  ].join(" ")}
                >
                  <span>
                    {status === "submitting" ? form.submitting : form.submit}
                  </span>
                  {status !== "submitting" && (
                    <span aria-hidden className="opacity-80">
                      {form.submitArrow}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none !important;
          }
          button:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
