"use client";

import { useCallback, useState } from "react";

import { track } from "@/lib/analytics/track";

export const CONTACT_ENDPOINT = "/api/contact";

export type ContactStatus = "idle" | "submitting" | "success" | "error";

interface SubmissionOptions {
  fields?: Record<string, string>;
}

export function useContactSubmission(locale: "fr" | "en") {
  const [status, setStatus] = useState<ContactStatus>("idle");

  const reset = useCallback(() => setStatus("idle"), []);

  const submitContact = useCallback(
    async (form: HTMLFormElement, options: SubmissionOptions = {}) => {
      const formData = new FormData(form);
      Object.entries(options.fields ?? {}).forEach(([name, value]) => {
        formData.set(name, value);
      });

      const phone = String(formData.get("phone") ?? "").trim();
      const message = String(formData.get("message") ?? "").trim();
      track("contact_submit", {
        school_type: String(formData.get("school_type") ?? "") || "unspecified",
        has_phone: phone.length > 0,
        has_message: message.length > 0,
        locale,
      });

      setStatus("submitting");

      try {
        const response = await fetch(CONTACT_ENDPOINT, { method: "POST", body: formData });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setStatus("success");
        track("contact_submit_success", { locale });
      } catch {
        setStatus("error");
        track("contact_submit_error", { locale });
      }
    },
    [locale],
  );

  return { status, reset, submitContact };
}
