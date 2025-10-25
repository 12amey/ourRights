"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface LoadingLogoProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const LoadingLogo = ({ size = "md", message }: LoadingLogoProps) => {
  const sizes = {
    sm: { icon: "h-8 w-8", container: "gap-2", text: "text-sm" },
    md: { icon: "h-12 w-12", container: "gap-3", text: "text-base" },
    lg: { icon: "h-16 w-16", container: "gap-4", text: "text-lg" }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center ${currentSize.container}`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className={`${currentSize.icon} rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500`} />
        </motion.div>

        {/* Inner pulsing ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <div className={`${currentSize.icon} rounded-full border-2 border-transparent border-b-pink-500 border-l-cyan-500`} />
        </motion.div>

        {/* Animated Shield Logo */}
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Shield 
            className={`${currentSize.icon} bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg`}
            style={{
              filter: "drop-shadow(0 0 10px rgba(147, 51, 234, 0.5))"
            }}
          />
        </motion.div>

        {/* Glowing pulse effect */}
        <motion.div
          className={`absolute inset-0 ${currentSize.icon} bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-pink-500/30 rounded-full blur-xl`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {message && (
        <motion.p
          className={`${currentSize.text} font-medium text-muted-foreground text-center`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};
