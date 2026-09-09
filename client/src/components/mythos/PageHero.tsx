/**
 * The banner every Mythos page opens with: a serif title and a one-line creed
 * over a warm temple ground, with a right-hand rail of the four verbs and the
 * "greater clarity / safer AI" sign-off.
 *
 * The temple itself is drawn, not photographed -- a bank of lit columns in gold
 * on obsidian, with a horizon glow. The reference uses a marble photograph here;
 * this stands in for it and reads as the same room, and a real plate can be
 * dropped behind it later by swapping the background layer.
 */
import { ReactNode } from "react";

function TempleColumns() {
  // Eight fluted columns receding to the right, brightest where the horizon
  // glow sits. Pure SVG so it scales and costs no request.
  const cols = Array.from({ length: 9 }, (_, i) => {
    const x = 60 + i * 88;
    const lit = 0.06 + (i / 9) * 0.14;
    return (
      <g key={i} opacity={lit}>
        <rect x={x} y={20} width={26} height={200} fill="url(#col-grad)" rx={2} />
        {/* flutes */}
        {[0, 1, 2].map((f) => (
          <line
            key={f}
            x1={x + 6 + f * 7}
            y1={24}
            x2={x + 6 + f * 7}
            y2={216}
            stroke="hsl(38 40% 30%)"
            strokeWidth={0.75}
          />
        ))}
        {/* capital + base */}
        <rect x={x - 4} y={14} width={34} height={8} fill="hsl(43 55% 42%)" rx={1} />
        <rect x={x - 4} y={216} width={34} height={7} fill="hsl(38 40% 26%)" rx={1} />
      </g>
    );
  });
  return (
    <svg
      viewBox="0 0 900 240"
      preserveAspectRatio="xMaxYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="col-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(43 60% 46%)" />
          <stop offset="1" stopColor="hsl(35 45% 20%)" />
        </linearGradient>
        <radialGradient id="horizon" cx="72%" cy="58%" r="55%">
          <stop offset="0" stopColor="hsl(44 85% 55% / 0.5)" />
          <stop offset="0.5" stopColor="hsl(40 70% 40% / 0.12)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      {cols}
      <rect x="0" y="0" width="900" height="240" fill="url(#horizon)" />
    </svg>
  );
}

interface PageHeroProps {
  title: string;
  subtitle: string;
  /** The vertical verb rail, e.g. ["Scan","Analyze","Evidence","Deploy"]. */
  verbs?: string[];
  /** The gold sign-off lines, default "Greater / Clarity" + muted "Safer AI". */
  signoff?: { gold: string[]; muted: string };
  children?: ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  verbs,
  signoff = { gold: ["Greater", "Clarity"], muted: "Safer AI" },
  children,
}: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50">
      {/* ground */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background to-surface-1" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 opacity-90">
        <TempleColumns />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />

      <div className="relative flex flex-wrap items-start justify-between gap-6 px-6 py-7 md:px-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[42px] font-semibold leading-none tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">{subtitle}</p>
          {children}
        </div>

        <div className="flex items-start gap-8 pt-1">
          {verbs && (
            <ul className="hidden space-y-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 sm:block">
              {verbs.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
          <div className="space-y-1 border-l border-border/50 pl-8 text-[10px] uppercase tracking-[0.24em]">
            {signoff.gold.map((g) => (
              <p key={g} className="text-gold">
                {g}
              </p>
            ))}
            <p className="pt-1 text-muted-foreground/70">{signoff.muted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
