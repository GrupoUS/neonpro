"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import FloatingChatButton from './floating-chat-button';
import AIChatContainer from '@/components/organisms/ai-chat-container';

interface FloatingAIChatProps {
  className?: string;
  // Healthcare-specific props
  context?: 'scheduling' | 'procedures' | 'aftercare' | 'emergency';
  patientId?: string;
  userRole?: 'admin' | 'professional' | 'coordinator';
  lgpdCompliant?: boolean;
  onAuditLog?: (action: string, details?: Record<string, any>) => void;
  onEmergencyDetected?: (severity: 'low' | 'medium' | 'high') => void;
}

/**
 * Floating AI Chat Component for NeonPro
 * Combines the floating button with the chat container in a modal-like interface
 */
export default function FloatingAIChat({
  className,
  context = 'procedures',
  patientId,
  userRole = 'professional',
  lgpdCompliant = true,
  onAuditLog,
  onEmergencyDetected,
}: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread count when opening
    }
    
    // Audit log for chat interactions
    if (onAuditLog && lgpdCompliant) {
      onAuditLog('ai_chat_toggled', {
        action: isOpen ? 'closed' : 'opened',
        context,
        patientId,
        userRole,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <FloatingChatButton
        isOpen={isOpen}
        onClick={handleToggleChat}
        unreadCount={unreadCount}
        className={className}
      />

      {/* Chat Modal/Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
            />

            {/* Chat Container */}
            <motion.div
              className={cn(
                "fixed bottom-24 right-6 z-50",
                "w-96 h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)]",
                "md:w-96 md:h-[600px]",
                "sm:w-[calc(100vw-2rem)] sm:right-4 sm:bottom-20"
              )}
              initial={{ 
                opacity: 0, 
                scale: 0.8, 
                y: 20,
                transformOrigin: "bottom right" 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: 20 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
            >
              <div className="relative h-full">
                {/* Shadow/Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#294359]/10 to-[#AC9469]/10 rounded-lg blur-xl" />
                
                {/* Chat Container */}
                <div className="relative h-full bg-white rounded-lg shadow-2xl border border-[#D2D0C8] overflow-hidden">
                  <AIChatContainer
                    context={context}
                    patientId={patientId}
                    userRole={userRole}
                    lgpdCompliant={lgpdCompliant}
                    onAuditLog={onAuditLog}
                    onEmergencyDetected={onEmergencyDetected}
                    className="h-full border-0 rounded-lg"
                    showVoiceControls={true}
                    showSearchSuggestions={true}
                  />
                </div>

                {/* Mobile close indicator */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 md:hidden">
                  <div className="w-8 h-1 bg-gray-300 rounded-full" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
