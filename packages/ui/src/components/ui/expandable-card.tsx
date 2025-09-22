"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { cn } from "../../utils";

const ExpandableCardContext = createContext<{
  id: string | null;
  expandedCard: string | null;
  setExpandedCard: (id: string | null) => void;
}>({
  id: null,
  expandedCard: null,
  setExpandedCard: () => {}
});

export const useExpandableCard = () => {
  const context = useContext(ExpandableCardContext);
  if (!context) {
    throw new Error(
      "useExpandableCard must be used within ExpandableCardProvider",
    );
  }
  return context;
};

interface ExpandableCardProviderProps {
  children: React.ReactNode;
  className?: string;
}

export function ExpandableCardProvider({
  children,
  className
}: ExpandableCardProviderProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <ExpandableCardContext.Provider
      value={{ id: null, expandedCard, setExpandedCard }}
    >
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          className,
        )}
      >
        {children}
      </div>
    </ExpandableCardContext.Provider>
  );
}

interface ExpandableCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  expandedContent?: React.ReactNode;
}

export function ExpandableCard({
  id,
  children,
  className,
  expandedContent
}: ExpandableCardProps) {
  const { expandedCard, setExpandedCard } = useExpandableCard();
  const cardRef = useRef<HTMLDivElement>(null);
  const isExpanded = expandedCard === id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setExpandedCard(null);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
    // Return nothing when not expanded
    return undefined;
  }, [isExpanded, setExpandedCard]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(isExpanded ? null : id);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={cn(
          "relative cursor-pointer bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow duration-200",
          isExpanded && "z-50",
          className,
        )}
        onClick={handleCardClick}
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedCard(null)}
            />

            {/* Expanded Card */}
            <motion.div
              className="fixed inset-4 md:inset-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xl z-50 overflow-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">{children}</div>
                  <button
                    className="ml-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    onClick={() => setExpandedCard(null)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {expandedContent && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    {expandedContent}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
