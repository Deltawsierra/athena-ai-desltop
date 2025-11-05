import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface TickerItem {
  id: string;
  text: string;
  type: 'threat' | 'info' | 'warning';
  icon?: typeof Shield;
}

interface TickerTapeProps {
  items: TickerItem[];
  speed?: number;
}

export default function TickerTape({ items, speed = 50 }: TickerTapeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const duplicatedItems = [...items, ...items];

  useEffect(() => {
    const measureWidth = () => {
      if (contentRef.current) {
        const width = contentRef.current.scrollWidth / 2;
        setContentWidth(width);
      }
    };

    measureWidth();

    const observer = new ResizeObserver(measureWidth);
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, [items]);

  const duration = contentWidth > 0 ? contentWidth / speed : 30;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-card/30 via-card/50 to-card/30 border-y border-card-border backdrop-blur-sm">
      <div className="relative flex">
        <motion.div
          ref={contentRef}
          className="flex gap-8 py-3 pr-8"
          animate={{
            x: contentWidth > 0 ? [0, -contentWidth] : [0, -1920],
          }}
          transition={{
            x: {
              duration,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
          style={{
            willChange: 'transform',
          }}
        >
          {duplicatedItems.map((item, index) => {
            const IconComponent = item.icon || 
              (item.type === 'threat' ? AlertTriangle : 
               item.type === 'warning' ? Activity : Shield);

            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <IconComponent 
                  className={`w-4 h-4 ${
                    item.type === 'threat' ? 'text-destructive' :
                    item.type === 'warning' ? 'text-yellow-500' :
                    'text-cyan'
                  }`}
                />
                <span className="text-sm font-mono text-foreground/80">
                  {item.text}
                </span>
                <span className="text-muted-foreground">•</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
