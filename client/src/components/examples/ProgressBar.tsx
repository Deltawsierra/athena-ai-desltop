import ProgressBar from '../ProgressBar';

export default function ProgressBarExample() {
  return (
    <div className="p-8 bg-background space-y-6 max-w-md">
      <ProgressBar value={85} label="Scanning Progress" />
      <ProgressBar value={60} label="Analysis Complete" />
      <ProgressBar value={30} label="Processing Data" />
      <ProgressBar value={100} label="Scan Complete" />
    </div>
  );
}
