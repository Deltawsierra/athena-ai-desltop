import GlassCard from "@/components/GlassCard";
import StatusIndicator from "@/components/StatusIndicator";
import { FileText } from "lucide-react";

//todo: remove mock functionality
const mockLogs = [
  {
    timestamp: "2025-11-05 14:32:15",
    type: "Pentest Report",
    recipient: "admin@example.com",
    subject: "Security Scan #24 Results",
    status: "sent" as const,
    error: null,
  },
  {
    timestamp: "2025-11-05 13:15:42",
    type: "CVE Classification",
    recipient: "security@example.com",
    subject: "High Severity Alert",
    status: "sent" as const,
    error: null,
  },
  {
    timestamp: "2025-11-05 12:08:33",
    type: "Threat Detection",
    recipient: "analyst@example.com",
    subject: "Malware Detection Report",
    status: "failed" as const,
    error: "SMTP connection timeout",
  },
];

export default function AuditLogs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">
            Track all cybersecurity audits and report deliveries
          </p>
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Recipient
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockLogs.map((log, i) => (
                  <tr key={i} className="border-b border-border hover-elevate">
                    <td className="py-3 px-4 text-sm font-mono">{log.timestamp}</td>
                    <td className="py-3 px-4 text-sm font-medium">{log.type}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{log.recipient}</td>
                    <td className="py-3 px-4 text-sm">{log.subject}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator
                        status={log.status === "sent" ? "online" : "error"}
                        label={log.status === "sent" ? "Sent" : "Failed"}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-destructive">{log.error || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
