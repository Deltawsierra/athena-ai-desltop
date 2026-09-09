/**
 * The Mythos ornament kit: gold-on-obsidian brasswork -- dividers, ring frames,
 * badges, a corner piece and a compass star -- drawn as transparent plates and
 * exposed here so every page draws from the same set.
 *
 * The images carry their own bevel and shadow, so they sit on the warm ground
 * as struck metal. Keep them sparing: one divider to close a hero, a frame
 * around a single figure -- not chrome on every card.
 */
import divKey from "@assets/mythos/divider-key.png";
import divLaurel from "@assets/mythos/divider-laurel.png";
import divAstrolabe from "@assets/mythos/divider-astrolabe.webp";
import frameRing from "@assets/mythos/frame-ring.webp";
import frameLaurel from "@assets/mythos/frame-laurel.webp";
import markMedallion from "@assets/mythos/mark-medallion.webp";
import owlMedallion from "@assets/mythos/owl-medallion.webp";
import helmet from "@assets/mythos/helmet.webp";
import star from "@assets/mythos/star.webp";
import corner from "@assets/mythos/corner.png";
import { cn } from "@/lib/utils";

export const ORNAMENTS = {
  markMedallion,
  owlMedallion,
  helmet,
  star,
  corner,
  frameRing,
  frameLaurel,
} as const;

const DIVIDERS = { key: divKey, laurel: divLaurel, astrolabe: divAstrolabe };

/** A horizontal brass rule to close a section or a hero. */
export function Divider({
  variant = "astrolabe",
  className,
}: {
  variant?: keyof typeof DIVIDERS;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center", className)} aria-hidden="true">
      <img
        src={DIVIDERS[variant]}
        alt=""
        className="h-auto w-full max-w-3xl select-none opacity-90"
      />
    </div>
  );
}

/** A round brass badge -- the M mark, the owl, or the helmet -- at a set size. */
export function Emblem({
  kind,
  size = 40,
  className,
}: {
  kind: "markMedallion" | "owlMedallion" | "helmet" | "star";
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={ORNAMENTS[kind]}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
}

/**
 * Wrap a round figure -- a dial, a donut -- in a brass ring. The child sits in
 * the open center; the ring is inset padding so the figure keeps its size.
 */
export function RingFrame({
  variant = "ring",
  children,
  className,
}: {
  variant?: "ring" | "laurel";
  children: React.ReactNode;
  className?: string;
}) {
  const src = variant === "laurel" ? frameLaurel : frameRing;
  return (
    <div className={cn("relative", className)}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
      />
      {/* the frame's brass rim is ~18% of the plate on each side */}
      <div className="relative flex items-center justify-center p-[18%]">{children}</div>
    </div>
  );
}
