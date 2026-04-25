import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import {
  Check,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Link2,
  Pencil,
  Play,
  Plus,
  PlusCircle,
  Save,
  Settings,
  Star,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

// Inline icon component for MDX docs. Avoids emojis (which render
// inconsistently across platforms and look out of place against the prose
// font). Picks from lucide-react to match the rest of klassci-landing UI.
const ICONS: Record<string, LucideIcon> = {
  check: Check,
  eye: Eye,
  "file-text": FileText,
  globe: Globe,
  "graduation-cap": GraduationCap,
  link: Link2,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  "plus-circle": PlusCircle,
  save: Save,
  settings: Settings,
  star: Star,
  trash: Trash2,
  users: Users,
  x: X,
};

interface IconProps {
  name: keyof typeof ICONS | string;
  className?: string;
}

function Icon({ name, className = "" }: IconProps) {
  const Component = ICONS[name];
  if (!Component) return null;
  return (
    <Component
      className={`inline-block size-[1em] align-[-0.15em] ${className}`}
      aria-hidden
    />
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Icon,
    ...components,
  };
}
