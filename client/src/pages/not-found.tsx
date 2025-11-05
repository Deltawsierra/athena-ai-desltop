import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple/10" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      <GlassCard className="max-w-md text-center relative z-10">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-2xl font-semibold mb-2">Page Not Found</p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link href="/">
          <Button className="gap-2" data-testid="link-home">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </GlassCard>
    </div>
  );
}
