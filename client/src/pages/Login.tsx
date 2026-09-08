import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import athenaLogo from "@assets/generated_images/athena-mark.png";
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
    // The horizon grid, which is the brand art's floor. In CSS rather than a
    // canvas: this screen renders before anything is signed in, and a WebGL
    // context is a lot to ask of a machine for the two seconds somebody spends
    // typing a password.
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden athena-horizon">
      <GlassCard className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          {/* The plinth: the lit disc the brand art stands its constellation
              on, which is a column base seen from above. */}
          <div className="flex justify-center mb-6 athena-plinth">
            <img
              src={athenaLogo}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20"
            />
          </div>
          {/* The mark's own gradient -- cobalt through indigo into gold --
              rather than the cyan-to-purple this had, which is in the logo
              nowhere. */}
          <h1
            className="text-3xl font-bold mb-2 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(100deg, hsl(var(--primary)), " +
                "hsl(var(--accent-violet)) 38%, hsl(var(--gold)) 78%)",
              // Both spellings. Tailwind's bg-clip-text sets the prefixed one
              // and an inline backgroundImage on the same element does not
              // inherit it, so the heading rendered as transparent text over
              // nothing -- an invisible title on the first screen.
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            Athena AI
          </h1>
          <div className="athena-meander w-32 mx-auto mb-3" aria-hidden="true" />
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
