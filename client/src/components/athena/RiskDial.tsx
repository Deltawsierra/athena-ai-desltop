/**
 * The risk score as a 3/4 arc gauge. The number is the headline; the arc is
 * there so a glance lands in the right band before the digits are read. The
 * arc's colour tracks the band -- gold for a moderate estate, and the severity
 * red only once the score has earned it -- because a dial that is the same
 * colour at 20 and 90 is decoration, not a reading.
 */
import { motion, useReducedMotion } from "framer-motion";

function bandColor(score: number): string {
  if (score >= 80) return "hsl(var(--sev-critical))";
  if (score >= 60) return "hsl(var(--sev-medium))";
  if (score >= 35) return "hsl(var(--primary))";
  return "hsl(var(--sev-low))";
}

export default function RiskDial({
  score,
  band,
}: {
  score: number;
  band: string;
}) {
  const still = useReducedMotion();
  const size = 116;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sweep = 0.75; // three-quarter dial
  const track = c * sweep;
  const value = (score / 100) * track;
  const color = bandColor(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        style={{ transform: "rotate(135deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(40 20% 30% / 0.35)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${track} ${c}`}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${value} ${c}`}
          initial={{ strokeDasharray: still ? `${value} ${c}` : `0 ${c}` }}
          animate={{ strokeDasharray: `${value} ${c}` }}
          transition={{ duration: still ? 0 : 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="athena-figure text-[26px] font-semibold leading-none text-foreground">
          {score}
        </span>
        <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Risk Score
        </span>
      </div>
    </div>
  );
}
