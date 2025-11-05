import { Link, useLocation } from "wouter";
import { Shield, Activity, Bug, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import athenaLogo from "@assets/generated_images/Athena_AI_owl_shield_logo_3eda4960.png";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Activity },
  { path: "/pentest", label: "Pentest", icon: Shield },
  { path: "/classify-cve", label: "CVE Classifier", icon: Bug },
  { path: "/admin", label: "Admin", icon: Settings },
];

export default function Navigation({ onLogout, isAuthenticated = true }: NavigationProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple/5 to-primary/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan-line" style={{ height: '2px' }} />
        </div>
        
        <div className="container relative flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 hover-elevate p-2 rounded-lg transition-all" data-testid="link-home">
              <img src={athenaLogo} alt="Athena AI" className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent">
                  Athena AI
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Intelligence Platform
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.path;
                return (
                  <Link key={link.path} href={link.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-2 relative",
                        isActive && "text-primary"
                      )}
                      data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" data-testid="link-login">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
