import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Settings, Users, Database, FileText } from "lucide-react";

export default function AdminPage() {
  const [content] = useState<string>(
    //todo: remove mock functionality - replace with actual admin dashboard data
    `<div class="space-y-6">
      <h2 class="text-2xl font-bold">System Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-muted/30 rounded-lg">
          <h3 class="font-semibold mb-2">Active Users</h3>
          <p class="text-3xl font-bold">127</p>
        </div>
        <div class="p-4 bg-muted/30 rounded-lg">
          <h3 class="font-semibold mb-2">Total Scans</h3>
          <p class="text-3xl font-bold">1,543</p>
        </div>
      </div>
    </div>`
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System administration and management controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard hover className="cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">User Management</p>
                <p className="text-sm text-muted-foreground">Manage access</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover className="cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Database</p>
                <p className="text-sm text-muted-foreground">View metrics</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover className="cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Reports</p>
                <p className="text-sm text-muted-foreground">Generate reports</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </GlassCard>
      </div>
    </div>
  );
}
