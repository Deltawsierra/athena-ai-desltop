import MetricCard from '../MetricCard';
import { Shield, Bug, Activity, Scan } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Scans"
          value="24"
          icon={Scan}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Threats Detected"
          value="22"
          icon={Bug}
          trend={{ value: 5, isPositive: false }}
        />
        <MetricCard
          title="Active Monitors"
          value="8"
          icon={Activity}
        />
        <MetricCard
          title="System Health"
          value="98%"
          icon={Shield}
          trend={{ value: 2, isPositive: true }}
        />
      </div>
    </div>
  );
}
