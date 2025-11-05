import AnimatedContainer from '../AnimatedContainer';
import GlassCard from '../GlassCard';

export default function AnimatedContainerExample() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <AnimatedContainer direction="up" delay={0}>
        <GlassCard>
          <h2 className="text-2xl font-bold">Animated from bottom</h2>
          <p className="text-muted-foreground">This card slides up on scroll</p>
        </GlassCard>
      </AnimatedContainer>
      
      <AnimatedContainer direction="left" delay={0.1}>
        <GlassCard>
          <h2 className="text-2xl font-bold">Animated from right</h2>
          <p className="text-muted-foreground">This card slides from the right</p>
        </GlassCard>
      </AnimatedContainer>
    </div>
  );
}
