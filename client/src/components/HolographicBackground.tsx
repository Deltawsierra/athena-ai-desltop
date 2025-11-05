import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import darkBg from "@assets/generated_images/Dark_mode_3D_holographic_background_bc80ede4.png";
import lightBg from "@assets/generated_images/Light_mode_3D_holographic_background_5e232446.png";

const FloatingParticle = ({ index }: { index: number }) => {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomSize = 2 + Math.random() * 4;
  const randomDuration = 8 + Math.random() * 12;
  const randomDelay = Math.random() * 5;

  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-cyan/40 to-magenta/40 blur-sm"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [1, 1.2, 0.8, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "easeInOut",
      }}
    />
  );
};

const GeometricShape = ({ index }: { index: number }) => {
  const shapes = ["square", "circle", "triangle"];
  const shape = shapes[index % shapes.length];
  const randomX = 10 + Math.random() * 80;
  const randomY = 10 + Math.random() * 80;
  const randomSize = 20 + Math.random() * 60;
  const randomRotation = Math.random() * 360;
  const randomDuration = 15 + Math.random() * 15;

  const getShapeClasses = () => {
    if (shape === "circle") return "rounded-full";
    if (shape === "triangle") return "clip-triangle";
    return "rounded-md";
  };

  return (
    <motion.div
      className={`absolute border border-primary/20 ${getShapeClasses()}`}
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        rotate: randomRotation,
      }}
      animate={{
        rotate: [randomRotation, randomRotation + 360],
        scale: [1, 1.1, 1],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// Sound bar visualizer in bottom left
const SoundVisualizer = () => {
  const bars = Array.from({ length: 5 }, (_, i) => {
    const randomDelay = i * 0.1;
    const randomDuration = 0.5 + Math.random() * 0.5;
    
    return (
      <motion.div
        key={i}
        className="bg-gradient-to-t from-cyan/60 to-cyan/20 rounded-t-sm"
        style={{
          width: '8px',
          minHeight: '4px',
        }}
        animate={{
          height: [
            `${10 + Math.random() * 10}px`,
            `${30 + Math.random() * 40}px`,
            `${10 + Math.random() * 10}px`,
          ],
        }}
        transition={{
          duration: randomDuration,
          repeat: Infinity,
          delay: randomDelay,
          ease: "easeInOut",
        }}
      />
    );
  });

  return (
    <div className="absolute bottom-8 left-8 flex items-end gap-1.5 opacity-40">
      {bars}
    </div>
  );
};

// Spinning circular rings in top left
const SpinningRings = () => {
  return (
    <div className="absolute top-8 left-8 opacity-30">
      {/* Outer ring - clockwise */}
      <motion.div
        className="absolute inset-0 w-24 h-24 rounded-full border-2 border-cyan/40"
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          borderStyle: 'dashed',
          borderSpacing: '4px',
        }}
      />
      
      {/* Middle ring - counter-clockwise */}
      <motion.div
        className="absolute inset-0 w-24 h-24 rounded-full border border-magenta/40"
        animate={{ rotate: -360 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transform: 'scale(0.7)',
          borderStyle: 'dotted',
        }}
      />
      
      {/* Inner ring - clockwise fast */}
      <motion.div
        className="absolute inset-0 w-24 h-24 rounded-full border border-primary/40"
        animate={{ rotate: 360 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transform: 'scale(0.4)',
        }}
      />
      
      {/* Center dot pulse */}
      <motion.div
        className="absolute inset-0 w-24 h-24 flex items-center justify-center"
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-cyan/60"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

// AI Brain mapping - responds to cursor and scroll
const AIBrainMap = ({ scrollY }: { scrollY: any }) => {
  const nodes = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 80;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y, index: i };
  });

  // Cursor tracking
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll-based movement
  const scrollOffsetX = useTransform(scrollY, [0, 1000], [0, 30]);
  const scrollOffsetY = useTransform(scrollY, [0, 1000], [0, -20]);
  
  // Cursor-based parallax (subtle movement toward cursor)
  const cursorParallaxX = useSpring(
    (cursorPosition.x / window.innerWidth - 0.5) * 30,
    { stiffness: 100, damping: 20 }
  );
  const cursorParallaxY = useSpring(
    (cursorPosition.y / window.innerHeight - 0.5) * 30,
    { stiffness: 100, damping: 20 }
  );
  
  // Glow scale based on cursor
  const glowScale = useSpring(
    0.9 + (cursorPosition.x / window.innerWidth) * 0.4,
    { stiffness: 150, damping: 25 }
  );

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 opacity-20 pointer-events-none"
      style={{
        x: scrollOffsetX,
        y: scrollOffsetY,
      }}
    >
      <motion.div
        style={{
          x: cursorParallaxX,
          y: cursorParallaxY,
        }}
      >
      <svg width="400" height="400" viewBox="-200 -200 400 400" className="overflow-visible">
        {/* Neural connections */}
        {nodes.map((node, i) => (
          nodes.slice(i + 1).map((target, j) => (
            <motion.line
              key={`connection-${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={target.x}
              y2={target.y}
              stroke="url(#brainGradient)"
              strokeWidth="0.5"
              animate={{
                opacity: [0.1, 0.3, 0.1],
                strokeWidth: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))
        ))}
        
        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g key={`node-${i}`}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3"
              fill="currentColor"
              className="text-cyan"
              animate={{
                r: [3, 5, 3],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
            
            {/* Pulse rings */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-magenta"
              animate={{
                r: [3, 12, 3],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          </motion.g>
        ))}
        
        {/* Center brain core */}
        <motion.circle
          cx="0"
          cy="0"
          r="8"
          fill="url(#coreGradient)"
          animate={{
            r: [8, 12, 8],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <defs>
          <linearGradient id="brainGradient">
            <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.4" />
          </radialGradient>
        </defs>
      </svg>
      
        {/* Glow effect responding to cursor and scroll */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px]"
          style={{
            scale: glowScale,
          }}
          animate={{
            background: [
              'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default function HolographicBackground() {
  const [isDark, setIsDark] = useState(true);
  const { scrollY } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);
  const gridY = useTransform(scrollY, [0, 1000], [0, 150]);
  const orbY = useTransform(scrollY, [0, 1000], [0, -100]);
  const particlesY = useTransform(scrollY, [0, 1000], [0, 50]);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${isDark ? darkBg : lightBg})`,
          opacity: isDark ? 0.4 : 0.3,
          y: backgroundY,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
      
      <motion.div 
        className="absolute inset-0"
        style={{ y: gridY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple/10 via-transparent to-transparent" />
      </motion.div>
      
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{ y: orbY }}
      >
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
      
      <motion.div
        className="absolute inset-0"
        style={{ y: particlesY }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <FloatingParticle key={`particle-${i}`} index={i} />
        ))}
      </motion.div>
      
      <motion.div 
        className="absolute inset-0"
        style={{ y: gridY }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <GeometricShape key={`shape-${i}`} index={i} />
        ))}
      </motion.div>
      
      <motion.svg 
        className="absolute inset-0 w-full h-full opacity-20" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ y: gridY }}
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <motion.path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              className="text-primary/30"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </pattern>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </motion.svg>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* New interactive elements */}
      <SoundVisualizer />
      <SpinningRings />
      <AIBrainMap scrollY={scrollY} />
    </div>
  );
}
