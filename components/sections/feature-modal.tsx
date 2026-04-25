"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, type MouseEvent } from "react";

export type FeatureKey =
  | "notes"
  | "finance"
  | "planning"
  | "presences"
  | "lmd"
  | "personnel";

interface ModalPayload {
  title: string;
  image: string;
  intro: string;
  bullets: string[];
  outro: string;
}

interface FeatureModalProps {
  openKey: FeatureKey | null;
  onClose: () => void;
}

export function FeatureModal({ openKey, onClose }: FeatureModalProps) {
  const t = useTranslations("features.modals");
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive native <dialog> imperatively from the controlled openKey prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openKey && !dialog.open) {
      dialog.showModal();
    } else if (!openKey && dialog.open) {
      dialog.close();
    }
  }, [openKey]);

  // Native <dialog> emits "close" on Escape, dialog.close(), and form method="dialog" submit.
  // Bridge that to the parent so state stays in sync.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Body scroll lock while modal is open.
  useEffect(() => {
    if (openKey) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [openKey]);

  // Close when user clicks the dim backdrop area (outside the card).
  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        dialogRef.current?.close();
      }
    },
    [],
  );

  const handleCtaClick = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Pull modal payload only when a key is set; t.raw is locale-aware.
  const data = openKey ? (t.raw(openKey) as ModalPayload) : null;
  const titleId = "feature-modal-title";
  const introId = "feature-modal-intro";

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      aria-describedby={introId}
      className="feature-modal-dialog p-0 bg-transparent border-0 max-w-none max-h-none w-full h-full m-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      {data && (
        <div className="min-h-full w-full flex items-center justify-center p-4 md:p-6">
          <div
            className="relative w-full max-w-[720px] max-h-[90vh] overflow-y-auto bg-bg-card border border-border rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            // Stop click propagation so backdrop handler doesn't catch inner clicks.
            onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={t("close")}
              className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-9 w-9 rounded border border-border bg-bg-card/80 backdrop-blur-sm text-text-secondary hover:text-text hover:border-border-strong transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg border-b border-border bg-bg-alt">
              <Image
                src={data.image}
                alt={data.title}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            </div>

            <div className="p-6 md:p-8">
              <h3
                id={titleId}
                className="font-serif font-light text-2xl leading-tight text-text mb-4"
                style={{ letterSpacing: "-0.02em" }}
              >
                {data.title}
              </h3>

              <p
                id={introId}
                className="text-text-secondary leading-relaxed mb-5"
              >
                {data.intro}
              </p>

              <ul className="flex flex-col gap-2.5 mb-5">
                {data.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="flex-shrink-0 mt-[0.15rem] text-accent font-medium"
                    >
                      ✓
                    </span>
                    <span className="text-text-secondary leading-relaxed text-[0.95rem]">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>

              {data.outro && (
                <p className="text-text-secondary leading-relaxed mb-6">
                  {data.outro}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <a
                  href="#contact"
                  onClick={handleCtaClick}
                  className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded text-[0.875rem] font-medium border border-accent transition-all duration-200 ease-klassci hover:bg-accent-hover hover:border-accent-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(4,83,203,0.25)]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {t("ctaPrimary")}
                </a>
                <a
                  href="#tarifs"
                  onClick={handleCtaClick}
                  className="inline-flex items-center gap-2 bg-bg-card text-text px-5 py-2.5 rounded text-[0.875rem] font-medium border border-border transition-all duration-200 ease-klassci hover:border-border-strong hover:-translate-y-px"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {t("ctaSecondary")}
                  <span aria-hidden className="text-text-muted">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .feature-modal-dialog::backdrop {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
        }
        :global(html.dark) .feature-modal-dialog::backdrop {
          background: rgba(0, 0, 0, 0.6);
        }
        @media (prefers-reduced-motion: no-preference) {
          .feature-modal-dialog[open] {
            animation: featureModalIn 200ms cubic-bezier(0.22, 1, 0.36, 1);
          }
        }
        @keyframes featureModalIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </dialog>
  );
}
