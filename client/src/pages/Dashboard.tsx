import { Shield, Bug, Activity, Scan, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import MetricCard from "@/components/MetricCard";
import GlassCard from "@/components/GlassCard";
import ThreatBadge from "@/components/ThreatBadge";
import AnimatedContainer from "@/components/AnimatedContainer";
import TickerTape from "@/components/TickerTape";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

//todo: remove mock functionality
const mockThreatData = [
  { name: "Malware", value: 2 },
  { name: "Malicious", value: 20 },
];

const mockKeywords = [
  { keyword: "ransomware", count: 5 },
  { keyword: "payload", count: 4 },
  { keyword: "trojan", count: 3 },
  { keyword: "worm", count: 2 },
  { keyword: "exploit", count: 2 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const tickerItems = [
  { id: '1', text: 'CVE-2024-0001: Critical vulnerability detected in authentication module', type: 'threat' as const, icon: AlertTriangle },
  { id: '2', text: 'Pentest scan completed - 22 threats identified', type: 'warning' as const, icon: Activity },
  { id: '3', text: 'Security patch applied to database layer', type: 'info' as const, icon: Shield },
  { id: '4', text: 'New malware signature added to detection engine', type: 'info' as const, icon: Shield },
  { id: '5', text: 'Active monitoring - 8 systems under surveillance', type: 'info' as const, icon: Activity },
  { id: '6', text: 'Threat analysis: Ransomware attack vectors increasing', type: 'threat' as const, icon: AlertTriangle },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <TickerTape items={tickerItems} speed={60} />
      <div className="container mx-auto p-6 space-y-8">
        <AnimatedContainer direction="up" delay={0}>
          <div className="space-y-2">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              Welcome to <span className="bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent">Athena AI</span>
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Your central intelligence hub for threat detection and security analytics
            </motion.p>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="metrics-grid">
          <AnimatedContainer direction="up" delay={0.1}>
            <MetricCard
              title="Total Scans"
              value={24}
              icon={Scan}
              trend={{ value: 12, isPositive: true }}
            />
          </AnimatedContainer>
          <AnimatedContainer direction="up" delay={0.2}>
            <MetricCard
              title="Threats Detected"
              value={22}
              icon={Bug}
              trend={{ value: 5, isPositive: false }}
            />
          </AnimatedContainer>
          <AnimatedContainer direction="up" delay={0.3}>
            <MetricCard
              title="Active Monitors"
              value={8}
              icon={Activity}
            />
          </AnimatedContainer>
          <AnimatedContainer direction="up" delay={0.4}>
            <MetricCard
              title="Detection Rate"
              value="98%"
              icon={Shield}
              trend={{ value: 2, isPositive: true }}
            />
          </AnimatedContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedContainer direction="left" delay={0.2}>
            <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Threat Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockThreatData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockThreatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          </AnimatedContainer>

          <AnimatedContainer direction="right" delay={0.2}>
            <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { time: "2 min ago", action: "Pentest scan completed", severity: "high" as const },
                { time: "15 min ago", action: "CVE classification processed", severity: "medium" as const },
                { time: "1 hour ago", action: "Security audit generated", severity: "low" as const },
                { time: "3 hours ago", action: "Threat detection initiated", severity: "high" as const },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <ThreatBadge severity={item.severity} />
                </div>
              ))}
            </div>
          </GlassCard>
          </AnimatedContainer>
        </div>

        <AnimatedContainer direction="up" delay={0.3}>
          <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Top Keywords in Threats</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockKeywords}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="keyword" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px" 
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        </AnimatedContainer>
      </div>
    </div>
  );
}
