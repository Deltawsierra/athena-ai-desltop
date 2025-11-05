import { useQuery } from "@tanstack/react-query";
import { Brain, Cpu, Database, TrendingUp, Activity, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import GlassCard from "@/components/GlassCard";
import AnimatedContainer from "@/components/AnimatedContainer";
import MetricCard from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AIHealthMetric } from "@shared/schema";

export default function AIHealth() {
  const { data: latestMetric, isLoading } = useQuery<AIHealthMetric>({
    queryKey: ["/api/ai-health/latest"],
  });

  const { data: metricsHistory = [] } = useQuery<AIHealthMetric[]>({
    queryKey: ["/api/ai-health"],
  });

  const getHealthStatus = (metric: AIHealthMetric | undefined) => {
    if (!metric) return { status: "unknown", color: "secondary" as const };
    if (metric.successRate >= 95 && metric.detectionAccuracy >= 90) {
      return { status: "excellent", color: "default" as const };
    }
    if (metric.successRate >= 85 && metric.detectionAccuracy >= 80) {
      return { status: "good", color: "default" as const };
    }
    if (metric.successRate >= 70 && metric.detectionAccuracy >= 70) {
      return { status: "fair", color: "secondary" as const };
    }
    return { status: "needs attention", color: "destructive" as const };
  };

  const healthStatus = getHealthStatus(latestMetric);

  const performanceData = metricsHistory.slice(0, 24).reverse().map((metric, index) => ({
    time: format(new Date(metric.timestamp), "HH:mm"),
    cpu: metric.cpuUsage,
    memory: metric.memoryUsage,
    responseTime: metric.averageResponseTime,
  }));

  const accuracyData = metricsHistory.slice(0, 24).reverse().map((metric) => ({
    time: format(new Date(metric.timestamp), "HH:mm"),
    accuracy: metric.detectionAccuracy,
    successRate: metric.successRate,
    falsePositive: metric.falsePositiveRate,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-8">
        <AnimatedContainer direction="up" delay={0}>
          <div className="space-y-2">
            <motion.h1
              className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <Brain className="w-10 h-10 text-primary" />
              AI Health <span className="bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent">Monitoring</span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              Real-time monitoring of Athena AI performance, accuracy, and system health
            </motion.p>
          </div>
        </AnimatedContainer>

        {latestMetric && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedContainer direction="up" delay={0.1}>
                <MetricCard
                  title="System Status"
                  value={healthStatus.status.toUpperCase()}
                  icon={CheckCircle}
                  trend={{ value: latestMetric.successRate, isPositive: latestMetric.successRate >= 85 }}
                />
              </AnimatedContainer>
              <AnimatedContainer direction="up" delay={0.2}>
                <MetricCard
                  title="Active Scans"
                  value={latestMetric.activeScans}
                  icon={Activity}
                />
              </AnimatedContainer>
              <AnimatedContainer direction="up" delay={0.3}>
                <MetricCard
                  title="Scans Today"
                  value={latestMetric.totalScansToday}
                  icon={TrendingUp}
                />
              </AnimatedContainer>
              <AnimatedContainer direction="up" delay={0.4}>
                <MetricCard
                  title="Avg Response"
                  value={`${latestMetric.averageResponseTime}ms`}
                  icon={Clock}
                />
              </AnimatedContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedContainer direction="left" delay={0.2}>
                <GlassCard>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    System Resources
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <Badge variant="outline" data-testid="badge-cpu-usage">
                          {latestMetric.cpuUsage}%
                        </Badge>
                      </div>
                      <Progress value={latestMetric.cpuUsage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {latestMetric.cpuUsage < 70 ? "Normal" : latestMetric.cpuUsage < 85 ? "Moderate" : "High"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <Badge variant="outline" data-testid="badge-memory-usage">
                          {latestMetric.memoryUsage}%
                        </Badge>
                      </div>
                      <Progress value={latestMetric.memoryUsage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {latestMetric.memoryUsage < 70 ? "Normal" : latestMetric.memoryUsage < 85 ? "Moderate" : "High"}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedContainer>

              <AnimatedContainer direction="right" delay={0.2}>
                <GlassCard>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Performance Metrics
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Detection Accuracy</span>
                        <Badge variant="default" data-testid="badge-accuracy">
                          {latestMetric.detectionAccuracy}%
                        </Badge>
                      </div>
                      <Progress value={latestMetric.detectionAccuracy} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <Badge variant="default" data-testid="badge-success-rate">
                          {latestMetric.successRate}%
                        </Badge>
                      </div>
                      <Progress value={latestMetric.successRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">False Positive Rate</span>
                        <Badge variant={latestMetric.falsePositiveRate < 5 ? "default" : "destructive"} data-testid="badge-false-positive">
                          {latestMetric.falsePositiveRate}%
                        </Badge>
                      </div>
                      <Progress value={latestMetric.falsePositiveRate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {latestMetric.falsePositiveRate < 5 ? "Excellent" : latestMetric.falsePositiveRate < 10 ? "Good" : "Needs Improvement"}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedContainer>
            </div>

            <AnimatedContainer direction="up" delay={0.3}>
              <GlassCard>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Resource Usage Over Time
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fill="url(#cpuGradient)" name="CPU %" />
                      <Area type="monotone" dataKey="memory" stroke="hsl(var(--chart-2))" fill="url(#memoryGradient)" name="Memory %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </AnimatedContainer>

            <AnimatedContainer direction="up" delay={0.4}>
              <GlassCard>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  AI Accuracy Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Detection Accuracy %" />
                      <Line type="monotone" dataKey="successRate" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Success Rate %" />
                      <Line type="monotone" dataKey="falsePositive" stroke="hsl(var(--destructive))" strokeWidth={2} name="False Positive %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </AnimatedContainer>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedContainer direction="left" delay={0.5}>
                <GlassCard>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Models & Training
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Loaded Models</p>
                      <div className="flex flex-wrap gap-2">
                        {latestMetric.modelsLoaded && latestMetric.modelsLoaded.length > 0 ? (
                          latestMetric.modelsLoaded.map((model, index) => (
                            <Badge key={index} variant="outline" data-testid={`badge-model-${index}`}>
                              {model}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">No models loaded</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Last Training Session</p>
                      <p className="font-medium" data-testid="text-last-training">
                        {latestMetric.lastTrainingDate
                          ? format(new Date(latestMetric.lastTrainingDate), "MMM dd, yyyy 'at' HH:mm")
                          : "Never trained"}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedContainer>

              <AnimatedContainer direction="right" delay={0.5}>
                <GlassCard>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    System Alerts
                  </h3>
                  <div className="space-y-3">
                    {latestMetric.cpuUsage > 85 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">High CPU Usage</p>
                          <p className="text-xs text-muted-foreground">CPU usage is above 85%. Consider optimizing workload.</p>
                        </div>
                      </div>
                    )}
                    {latestMetric.memoryUsage > 85 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">High Memory Usage</p>
                          <p className="text-xs text-muted-foreground">Memory usage is above 85%. System may slow down.</p>
                        </div>
                      </div>
                    )}
                    {latestMetric.falsePositiveRate > 10 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">High False Positive Rate</p>
                          <p className="text-xs text-muted-foreground">
                            False positive rate is {latestMetric.falsePositiveRate}%. Model retraining recommended.
                          </p>
                        </div>
                      </div>
                    )}
                    {latestMetric.cpuUsage <= 85 &&
                      latestMetric.memoryUsage <= 85 &&
                      latestMetric.falsePositiveRate <= 10 && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">All Systems Operational</p>
                            <p className="text-xs text-muted-foreground">No alerts at this time. AI is performing optimally.</p>
                          </div>
                        </div>
                      )}
                  </div>
                </GlassCard>
              </AnimatedContainer>
            </div>
          </>
        )}

        {!latestMetric && !isLoading && (
          <AnimatedContainer direction="up" delay={0.2}>
            <GlassCard>
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Health Data Available</h3>
                <p className="text-muted-foreground">
                  AI health metrics will appear here once the system starts collecting data.
                </p>
              </div>
            </GlassCard>
          </AnimatedContainer>
        )}
      </div>
    </div>
  );
}
