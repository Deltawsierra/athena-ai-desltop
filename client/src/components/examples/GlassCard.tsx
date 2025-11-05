import GlassCard from '../GlassCard';

export default function GlassCardExample() {
  return (
    <div className="p-8 bg-background">
      <GlassCard hover>
        <h3 className="text-lg font-semibold mb-2">Glassmorphism Card</h3>
        <p className="text-muted-foreground text-sm">
          Futuristic card with blur effect and gradient overlay
        </p>
      </GlassCard>
    </div>
  );
}
