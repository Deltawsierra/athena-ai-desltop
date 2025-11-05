import HolographicBackground from '../HolographicBackground';

export default function HolographicBackgroundExample() {
  return (
    <div className="relative min-h-screen">
      <HolographicBackground />
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold">3D Holographic Background</h1>
        <p className="text-muted-foreground mt-2">Toggle theme to see different backgrounds</p>
      </div>
    </div>
  );
}
