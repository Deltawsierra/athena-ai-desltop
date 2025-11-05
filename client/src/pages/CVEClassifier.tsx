import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/GlassCard";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import { Search, Shield } from "lucide-react";

export default function CVEClassifier() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    label: string;
    confidence: number;
    keywords: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    //todo: remove mock functionality
    console.log("Classifying CVE:", text);
    
    setTimeout(() => {
      setResult({
        label: "SQL Injection",
        confidence: 92,
        keywords: ["injection", "sql", "database", "query", "authentication"],
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            CVE Classifier
          </h1>
          <p className="text-muted-foreground">
            AI-powered vulnerability classification using advanced NLP models
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cve-text">CVE or Vulnerability Description</Label>
                <Textarea
                  id="cve-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter detailed description of the vulnerability or CVE..."
                  rows={8}
                  required
                  data-testid="input-cve-text"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2"
                data-testid="button-classify"
              >
                <Search className="w-4 h-4" />
                {loading ? "Analyzing..." : "Classify Vulnerability"}
              </Button>
            </form>

            {result && (
              <div className="mt-8 space-y-6 animate-count-up" data-testid="classification-result">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-purple/10 border border-primary/20">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
                        Classification
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent">
                        {result.label}
                      </p>
                    </div>

                    <ConfidenceMeter value={result.confidence} />

                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
                        Top Keywords
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((keyword, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="px-3 py-1 text-sm"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">Example Inputs</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium mb-1">SQL Injection</p>
                  <p className="text-xs text-muted-foreground">
                    Input validation bypass allowing database queries
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium mb-1">XSS Attack</p>
                  <p className="text-xs text-muted-foreground">
                    Script injection in web application forms
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium mb-1">Buffer Overflow</p>
                  <p className="text-xs text-muted-foreground">
                    Memory corruption through unchecked input
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Include technical details for better accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Mention affected systems or protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Describe the attack vector or exploit method</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
