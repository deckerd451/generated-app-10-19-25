import React from 'react';
import { motion } from 'framer-motion';
export const FullScreenLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <h1 className="text-6xl font-display text-primary">CYNQ</h1>
      </motion.div>
      <motion.h2
        className="mt-6 text-3xl font-display text-primary"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        CYNQ
      </motion.h2>
    </div>
  );
};