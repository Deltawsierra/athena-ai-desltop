import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import athenaLogo from "@assets/generated_images/Athena_AI_owl_shield_logo_3eda4960.png";
import { login } from "@/utils/auth";
import type { PublicUser } from "@shared/schema";

interface LoginProps {
  onAuthenticated: (user: PublicUser) => void;
}

export default function Login({ onAuthenticated }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(username, password);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <GlassCard className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={athenaLogo} alt="" width={64} height={64} className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent mb-2">
            Athena AI
          </h1>
          <p className="text-sm text-muted-foreground">Cybersecurity Intelligence Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              data-testid="text-login-error"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
              required
              data-testid="input-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              data-testid="input-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} data-testid="button-signin">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
