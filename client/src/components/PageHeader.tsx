/**
 * The top of every screen.
 *
 * A meander under the title, which is the one overtly Greek thing in the app
 * and earns its place by being drawn from the same straight lines as the rest
 * of it -- no marble, no laurel, no serifs. The reference has to survive
 * sitting above a severity table, and the way it survives is by being
 * geometry.
 *
 * Shared because eleven screens each wrote their own heading block, which is
 * how the same product ends up with four different title sizes.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** One sentence on what this screen is for. */
  description?: ReactNode;
  /** An icon, at 8x8, sitting inside the title. */
  icon?: ReactNode;
  /** Buttons or filters, aligned to the right of the title. */
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          {icon}
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="athena-meander max-w-xs" aria-hidden="true" />
      {description && (
        <p className="text-muted-foreground max-w-3xl">{description}</p>
      )}
    </header>
  );
}
