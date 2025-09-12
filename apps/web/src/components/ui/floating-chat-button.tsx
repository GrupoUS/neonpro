"use client";

// React import not needed with new JSX transform
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  unreadCount?: number;
}

/**
 * Floating Chat Button Component for NeonPro
 * Displays a floating button in the bottom-right corner to open/close AI chat
 */
export default function FloatingChatButton({
  isOpen,
  onClick,
  className,
  unreadCount = 0,
}: FloatingChatButtonProps) {
  return (
    <motion.div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
    >
      <motion.button
        onClick={onClick}
        className={cn(
          "relative group flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-[#294359] to-[#AC9469]",
          "hover:from-[#1e3147] hover:to-[#9a8157]",
          "transition-all duration-300 ease-in-out",
          "focus:outline-none focus:ring-4 focus:ring-[#AC9469]/20",
          "active:scale-95"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Fechar chat AI" : "Abrir chat AI"}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#294359] to-[#AC9469] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
        
        {/* Icon container */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6 text-white" />
                
                {/* AI sparkle indicator */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <Sparkles className="w-3 h-3 text-[#AC9469]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unread messages indicator */}
        {unreadCount > 0 && !isOpen && (
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* Pulse animation when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5 }}
          >
            Assistente NeonPro AI
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
