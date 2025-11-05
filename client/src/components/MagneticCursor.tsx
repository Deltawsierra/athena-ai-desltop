import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // Faster, more responsive spring config
  const springConfig = { damping: 15, stiffness: 500, mass: 0.3 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  const dotXSpring = useSpring(dotX, { damping: 10, stiffness: 700, mass: 0.2 });
  const dotYSpring = useSpring(dotY, { damping: 10, stiffness: 700, mass: 0.2 });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const interactiveElements = document.querySelectorAll(
      'button, a, input, textarea, select, [role="button"], [data-magnetic], label'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      {/* Outer ring */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full border-2 transition-colors"
          animate={{
            width: isHovering ? 48 : 32,
            height: isHovering ? 48 : 32,
            borderColor: isHovering ? 'rgb(236, 72, 153)' : 'rgb(6, 182, 212)',
            opacity: isHovering ? 0.8 : 1,
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Center dot */}
      <motion.div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: dotXSpring,
          y: dotYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full transition-colors"
          animate={{
            width: isHovering ? 8 : 6,
            height: isHovering ? 8 : 6,
            backgroundColor: isHovering ? 'rgb(236, 72, 153)' : 'rgb(6, 182, 212)',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </motion.div>
    </>
  );
}
