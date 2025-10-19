import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
export const TypingIndicator: React.FC = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 justify-start"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary" />
      </div>
      <div className="max-w-md lg:max-w-xl px-4 py-3 rounded-2xl bg-muted text-foreground rounded-bl-none flex items-center gap-1.5">
        <motion.div
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-2 h-2 bg-muted-foreground rounded-full"
        />
        <motion.div
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-2 h-2 bg-muted-foreground rounded-full"
          style={{ animationDelay: '0.1s' }}
        />
        <motion.div
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-2 h-2 bg-muted-foreground rounded-full"
          style={{ animationDelay: '0.2s' }}
        />
      </div>
    </motion.div>
  );
};