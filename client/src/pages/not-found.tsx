import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

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
