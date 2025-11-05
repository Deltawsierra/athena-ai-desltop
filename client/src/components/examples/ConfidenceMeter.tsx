import ConfidenceMeter from '../ConfidenceMeter';

export default function ConfidenceMeterExample() {
  return (
    <div className="p-8 bg-background space-y-6 max-w-md">
      <ConfidenceMeter value={95} label="High Confidence" />
      <ConfidenceMeter value={75} label="Good Confidence" />
      <ConfidenceMeter value={45} label="Medium Confidence" />
      <ConfidenceMeter value={20} label="Low Confidence" />
    </div>
  );
}
