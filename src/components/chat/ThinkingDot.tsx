import { motion } from 'framer-motion';

export function ThinkingDot() {
  return (
    <span className="inline-flex items-center gap-1.5 ml-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </span>
  );
}
