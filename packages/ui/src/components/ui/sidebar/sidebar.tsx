/**
 * Sidebar Component for NEONPRO
 * 
 * Responsive sidebar with aesthetic clinic navigation
 * Mobile-first design with accessibility features
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: SidebarItem[];
  onClick?: () => void;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
  defaultExpanded?: boolean;
  onItemClick?: (item: SidebarItem) => void;
  userInfo?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export function Sidebar({
  items,
  className,
  defaultExpanded = false,
  onItemClick,
  userInfo
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      toggleItemExpanded(item.id);
    } else {
      onItemClick?.(item);
      item.onClick?.();
    }
  };

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 72 }
  };

  const itemVariants = {
    expanded: { 
      x: 0,
      opacity: 1,
      transition: { delay: 0.1 }
    },
    collapsed: { 
      x: -10,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const renderSidebarItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <motion.button
          className={cn(
            "flex w-full items-center rounded-lg p-3 text-left transition-all duration-200",
            "hover:bg-neonpro-accent/10 hover:text-neonpro-primary",
            "focus:outline-none focus:ring-2 focus:ring-neonpro-primary/20",
            depth > 0 && "ml-4 border-l border-neonpro-accent/20 pl-4"
          )}
          onClick={() => handleItemClick(item)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex-shrink-0 text-neonpro-primary">
            {item.icon}
          </span>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="ml-3 flex-1 text-sm font-medium"
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {hasChildren && isExpanded && (
            <motion.span
              className="ml-auto text-neonpro-primary/60"
              animate={{ rotate: isItemExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} />
            </motion.span>
          )}
        </motion.button>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isItemExpanded && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {item.children?.map(child => renderSidebarItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      className={cn(
        "flex h-full flex-col border-r border-neonpro-accent/20 bg-card shadow-lg",
        className
      )}
      variants={sidebarVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neonpro-accent/20 p-4">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center gap-3"
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neonpro-primary to-neonpro-accent" />
              <span className="text-lg font-bold text-neonpro-deep-blue">
                NEONPRO
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="rounded-lg p-2 text-neonpro-primary hover:bg-neonpro-accent/10"
          onClick={toggleExpanded}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {items.map(item => renderSidebarItem(item))}
      </nav>

      {/* User info */}
      {userInfo && (
        <div className="border-t border-neonpro-accent/20 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neonpro-primary to-neonpro-accent flex items-center justify-center text-white font-medium">
              {userInfo.name.charAt(0).toUpperCase()}
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="flex-1"
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <p className="text-sm font-medium text-neonpro-deep-blue">
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-neonpro-primary/60">
                    {userInfo.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Sidebar;