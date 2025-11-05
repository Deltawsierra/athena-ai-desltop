import ThreatBadge from '../ThreatBadge';

export default function ThreatBadgeExample() {
  return (
    <div className="p-8 bg-background space-y-4">
      <div className="flex flex-wrap gap-3">
        <ThreatBadge severity="critical" />
        <ThreatBadge severity="high" />
        <ThreatBadge severity="medium" />
        <ThreatBadge severity="low" />
        <ThreatBadge severity="info" />
      </div>
    </div>
  );
}
