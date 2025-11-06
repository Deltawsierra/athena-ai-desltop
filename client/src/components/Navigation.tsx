import { Link, useLocation } from "wouter";
import { Shield, Activity, Bug, Settings, LogOut, Users, Brain, FileText, ListChecks, FolderOpen, MessageSquare, Trash2, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import athenaLogo from "@assets/generated_images/Athena_AI_owl_shield_logo_3eda4960.png";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

const testsDropdownItems = [
  { path: "/pentest", label: "Pentest", icon: Shield },
  { path: "/tests", label: "Tests", icon: ListChecks },
  { path: "/documents", label: "Documents", icon: FolderOpen },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/classifiers", label: "Classifiers", icon: Brain },
  { path: "/audit-logs", label: "Audit Logs", icon: FileText },
];

const adminDropdownItems = [
  { path: "/admin", label: "User Management", icon: Users },
  { path: "/ai-health", label: "AI Health", icon: Activity },
  { path: "/ai-control", label: "AI Control Panel", icon: Settings },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/deletion", label: "Deletion Management", icon: Trash2 },
];

export default function Navigation({ onLogout, isAuthenticated = true }: NavigationProps) {
  const [location] = useLocation();

  const isTestsMenuActive = testsDropdownItems.some(item => location === item.path);
  const isAdminMenuActive = adminDropdownItems.some(item => location === item.path);

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
              {/* Dashboard Link */}
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 relative",
                    location === "/dashboard" && "text-primary"
                  )}
                  data-testid="link-dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                  {location === "/dashboard" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                </Button>
              </Link>

              {/* Tests & Documents Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 relative",
                      isTestsMenuActive && "text-primary"
                    )}
                    data-testid="dropdown-tests-documents"
                  >
                    <Shield className="w-4 h-4" />
                    Tests & Documents
                    <ChevronDown className="w-3 h-3" />
                    {isTestsMenuActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {testsDropdownItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link href={item.path}>
                          <div className={cn(
                            "flex items-center gap-2 w-full cursor-pointer",
                            isActive && "text-primary font-semibold"
                          )}
                            data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* CVE Classifier Link */}
              <Link href="/classify-cve">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 relative",
                    location === "/classify-cve" && "text-primary"
                  )}
                  data-testid="link-cve-classifier"
                >
                  <Bug className="w-4 h-4" />
                  CVE Classifier
                  {location === "/classify-cve" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                </Button>
              </Link>

              {/* Admin Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 relative",
                      isAdminMenuActive && "text-primary"
                    )}
                    data-testid="dropdown-admin"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                    <ChevronDown className="w-3 h-3" />
                    {isAdminMenuActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {adminDropdownItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link href={item.path}>
                          <div className={cn(
                            "flex items-center gap-2 w-full cursor-pointer",
                            isActive && "text-primary font-semibold"
                          )}
                            data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
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
