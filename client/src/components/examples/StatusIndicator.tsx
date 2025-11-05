import StatusIndicator from '../StatusIndicator';

export default function StatusIndicatorExample() {
  return (
    <div className="p-8 bg-background space-y-4">
      <StatusIndicator status="online" />
      <StatusIndicator status="running" label="Scan in Progress" />
      <StatusIndicator status="pending" />
      <StatusIndicator status="error" label="Connection Failed" />
      <StatusIndicator status="offline" />
    </div>
  );
}
