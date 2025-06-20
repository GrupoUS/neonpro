"use client";

import { useMobileViewport } from "@/hooks/use-touch-gestures";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Home, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

interface BottomNavProps {
  className?: string;
  hideOnScroll?: boolean;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "add", label: "Add", icon: Plus, href: "#" },
  { id: "team", label: "Team", icon: Users, href: "/team" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function BottomNav({ className, hideOnScroll = true }: BottomNavProps) {
  const pathname = usePathname();
  const { isMobile, isTablet } = useMobileViewport();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Handle scroll to hide/show nav
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, hideOnScroll]);

  // Only show on mobile/tablet
  if (!isMobile && !isTablet) return null;

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/") return true;
    return pathname.startsWith(href) && href !== "#";
  };

  const handleAddClick = () => {
    setShowAddMenu(!showAddMenu);
  };

  return (
    <>
      {/* Add Menu Overlay */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddMenu(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-strong rounded-2xl p-4 space-y-2">
                {["New Project", "New Task", "New Team"].map((item, i) => (
                  <motion.button
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full p-3 text-left rounded-xl hover:bg-white/10 transition-colors"
                    onClick={() => {
                      setShowAddMenu(false);
                      // Handle action
                    }}
                  >
                    <span className="text-white">{item}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "safe-area-bottom", // For iPhone notch
          className
        )}
      >
        <div className="px-4 pb-2">
          <div className="glass-strong rounded-2xl shadow-xl">
            <div className="flex items-center justify-around px-2 py-1">
              {navItems.map((item) => {
                const isItemActive = isActive(item.href);
                const isAddButton = item.id === "add";

                if (isAddButton) {
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAddClick}
                      className="relative p-3"
                    >
                      <motion.div
                        animate={{ rotate: showAddMenu ? 45 : 0 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-grupous-secondary rounded-full blur-lg opacity-50" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-grupous-secondary rounded-full flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                      </motion.div>
                    </motion.button>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="relative flex-1"
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-full flex flex-col items-center gap-1 p-3 rounded-xl transition-colors"
                    >
                      {/* Active Indicator */}
                      <AnimatePresence>
                        {isItemActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-white/10 rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <div className="relative">
                        <item.icon
                          className={cn(
                            "w-5 h-5 transition-colors",
                            isItemActive
                              ? "text-primary drop-shadow-[0_0_8px_rgba(172,148,105,0.5)]"
                              : "text-gray-400"
                          )}
                        />

                        {/* Badge */}
                        {item.badge && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <span className="text-[10px] text-white font-medium">
                              {item.badge}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={cn(
                          "text-[10px] transition-colors",
                          isItemActive ? "text-primary" : "text-gray-400"
                        )}
                      >
                        {item.label}
                      </span>
                    </motion.button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}

// Safe area helper component
export function MobileBottomSpacer() {
  const { isMobile, isTablet } = useMobileViewport();

  if (!isMobile && !isTablet) return null;

  return <div className="h-20 safe-area-bottom" />;
}
