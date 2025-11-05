import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

import Navigation from "@/components/Navigation";
import TokenRefresher from "@/components/TokenRefresher";
import HolographicBackground from "@/components/HolographicBackground";
import MagneticCursor from "@/components/MagneticCursor";
import CursorGlow from "@/components/CursorGlow";
import SmoothScroll from "@/components/SmoothScroll";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PentestScan from "@/pages/PentestScan";
import CVEClassifier from "@/pages/CVEClassifier";
import AdminPage from "@/pages/AdminPage";
import AuditLogs from "@/pages/AuditLogs";
import Clients from "@/pages/Clients";
import Tests from "@/pages/Tests";
import Documents from "@/pages/Documents";
import AIHealth from "@/pages/AIHealth";
import NotFound from "@/pages/not-found";
import { getAccess, isTokenValid, clearTokens } from "@/utils/auth";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccess();
    const valid = !!token && isTokenValid(token);
    setIsAuthenticated(valid);
    if (!valid) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Component /> : null;
}

function Router({ isAuthenticated, onLogout }: { isAuthenticated: boolean; onLogout: () => void }) {
  return (
    <>
      {isAuthenticated && <Navigation onLogout={onLogout} isAuthenticated={isAuthenticated} />}
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/clients">
          <ProtectedRoute component={Clients} />
        </Route>
        <Route path="/tests">
          <ProtectedRoute component={Tests} />
        </Route>
        <Route path="/documents">
          <ProtectedRoute component={Documents} />
        </Route>
        <Route path="/pentest">
          <ProtectedRoute component={PentestScan} />
        </Route>
        <Route path="/classify-cve">
          <ProtectedRoute component={CVEClassifier} />
        </Route>
        <Route path="/ai-health">
          <ProtectedRoute component={AIHealth} />
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={AdminPage} />
        </Route>
        <Route path="/audit-logs">
          <ProtectedRoute component={AuditLogs} />
        </Route>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccess();
      setIsAuthenticated(!!token && isTokenValid(token));
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setLocation("/login");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScroll>
          <HolographicBackground />
          <MagneticCursor />
          <CursorGlow />
          <TokenRefresher />
          <Toaster />
          <Router isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
