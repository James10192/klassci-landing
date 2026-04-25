import Image from "next/image";
import { useTranslations } from "next-intl";

export function ImageBanner() {
  const t = useTranslations("imageBanner");

  const alt = t("alt");
  const src = t("image");

  return (
    <section className="py-12" aria-label={alt}>
      <Image
        src={src}
        alt={alt}
        width={2476}
        height={1390}
        sizes="100vw"
        className="w-full h-auto"
        loading="lazy"
        priority={false}
      />
    </section>
  );
}
