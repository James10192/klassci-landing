"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics/track";

// TODO: videos/testimonial.mp4 not yet copied from KLASSCIv2 — falls back to broken state
// until Phase 2 image/video compression. Use ffmpeg to compress 12MB → ~2MB before shipping prod.

export function VideoTestimonial() {
  const t = useTranslations("video");
  const locale = useLocale() as "fr" | "en";

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasTrackedRef = useRef<boolean>(false);
  const sourceAttachedRef = useRef<boolean>(false);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const src = t("src");

  const eyebrowLabel = locale === "fr" ? "Témoignage" : "Testimonial";

  // Lazy-load: attach <source> only when the video enters viewport (≈ saves 12 MB on initial weight).
  useEffect(() => {
    const target = sectionRef.current;
    const video = videoRef.current;
    if (!target || !video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (!hasTrackedRef.current) {
              hasTrackedRef.current = true;
              track("video_play", { locale });
            }
          })
          .catch(() => {
            // Autoplay rejected (e.g. low-power mode) — wait for user click.
          });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !sourceAttachedRef.current) {
            sourceAttachedRef.current = true;
            const source = document.createElement("source");
            source.src = src;
            source.type = "video/mp4";
            video.appendChild(source);
            video.load();
            video.addEventListener("canplay", handleCanPlay, { once: true });
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [src, locale]);

  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    if (video.paused) {
      video.muted = false;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (!hasTrackedRef.current) {
              hasTrackedRef.current = true;
              track("video_play", { locale });
            }
          })
          .catch(() => {
            // Browser blocked playback — keep state as paused.
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isLoaded, locale]);

  return (
    <section
      ref={sectionRef}
      className="py-section container"
      aria-labelledby="video-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text column */}
        <div>
          <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted mb-4">
            07 — {eyebrowLabel}
          </p>
          <h2
            id="video-heading"
            className="font-serif font-light text-section-h2 text-accent mb-6"
          >
            {t("title")}
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-[42ch]">
            {t("description")}
          </p>
        </div>

        {/* Video column */}
        <div
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={t("playAria")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleClick();
            }
          }}
          className="relative rounded-lg overflow-hidden border border-border bg-bg-alt cursor-pointer aspect-[9/16] max-h-[640px] w-full mx-auto max-w-[360px]"
        >
          {/* Live badge — top-left */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-danger text-white font-mono uppercase tracking-[0.08em] text-[0.65rem] font-bold px-2.5 py-1 rounded-full">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-white animate-video-pulse motion-reduce:animate-none"
            />
            {t("badge")}
          </div>

          {/* Video element — <source> attached lazily via IntersectionObserver */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="none"
            aria-label={t("playAria")}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Play overlay — fades out once playback starts */}
          <div
            aria-hidden
            className={[
              "absolute inset-0 flex items-center justify-center bg-black/30",
              "pointer-events-none transition-opacity duration-300 ease-klassci",
              isPlaying ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 text-accent translate-x-[2px]"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
