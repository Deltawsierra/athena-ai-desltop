import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
    
    return () => observer.disconnect();
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
    </div>
  );
}
