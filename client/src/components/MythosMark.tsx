/**
 * The Mythos wordmark's glyph: an angular capital M built from the same
 * straight strokes as the rest of the HUD -- two outer columns and a valley
 * that meets at a point, so it reads as a mountain, a temple front, and the
 * letter at once. Drawn as one gold gradient because the mark is a single
 * continuous line, and stroked rather than filled so it sits on a dark ground
 * like an engraving rather than a sticker.
 */
interface MythosMarkProps {
  className?: string;
  title?: string;
}

export default function MythosMark({ className, title = "Mythos" }: MythosMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <defs>
        <linearGradient id="mythos-mark-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(44 90% 70%)" />
          <stop offset="0.55" stopColor="hsl(43 85% 58%)" />
          <stop offset="1" stopColor="hsl(38 60% 40%)" />
        </linearGradient>
      </defs>
      {/* The M as a single polyline: up the left column, down into the valley,
          back up to the peak, down the right column. */}
      <path
        d="M6 40 V12 L24 30 L42 12 V40"
        stroke="url(#mythos-mark-gold)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* A plinth line under the columns -- the temple's stylobate, and the
          thing that stops the M floating. */}
      <path
        d="M4 43 H44"
        stroke="hsl(43 45% 40%)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
