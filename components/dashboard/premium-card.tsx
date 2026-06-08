"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "amber" | "violet" | "emerald" | "cyan" | "zinc";
  header?: {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    badge?: ReactNode;
  };
  hover?: boolean;
  onClick?: () => void;
}

const glowColors = {
  amber: "from-amber-500/20 via-orange-500/10 to-amber-500/20",
  violet: "from-violet-500/20 via-purple-500/10 to-violet-500/20",
  emerald: "from-emerald-500/20 via-green-500/10 to-emerald-500/20",
  cyan: "from-cyan-500/20 via-blue-500/10 to-cyan-500/20",
  zinc: "from-zinc-500/10 via-zinc-600/5 to-zinc-500/10",
};

const borderColors = {
  amber: "border-amber-500/20 hover:border-amber-500/40",
  violet: "border-violet-500/20 hover:border-violet-500/40",
  emerald: "border-emerald-500/20 hover:border-emerald-500/40",
  cyan: "border-cyan-500/20 hover:border-cyan-500/40",
  zinc: "border-zinc-800 hover:border-zinc-700",
};

export function PremiumCard({
  children,
  className,
  glowColor = "zinc",
  header,
  hover = true,
  onClick,
}: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-zinc-900 to-zinc-950",
        "border",
        borderColors[glowColor],
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={cn(
            "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br",
            glowColors[glowColor]
          )}
        />
      </div>

      {/* Content */}
      <div className="relative">
        {header && (
          <div className="p-5 border-b border-zinc-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {header.icon && (
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br",
                    glowColors[glowColor],
                    "border",
                    borderColors[glowColor]
                  )}>
                    {header.icon}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{header.title}</h3>
                  {header.subtitle && (
                    <p className="text-[10px] text-zinc-500">{header.subtitle}</p>
                  )}
                </div>
              </div>
              {header.badge}
            </div>
          </div>
        )}

        <div className="p-5">
          {children}
        </div>
      </div>

      {/* Hover Glow Effect */}
      {hover && (
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div 
            className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-r",
              glowColors[glowColor]
            )}
            style={{ 
              padding: '1px', 
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', 
              maskComposite: 'exclude' 
            }} 
          />
        </div>
      )}
    </motion.div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: ReactNode;
  color: "emerald" | "blue" | "amber" | "violet" | "red" | "zinc";
  delay?: number;
}

const kpiColors = {
  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
  violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400",
  red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
  zinc: "from-zinc-500/10 to-zinc-600/5 border-zinc-700 text-zinc-400",
};

export function KPICard({ title, value, change, trend, icon, color, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative rounded-xl p-5 overflow-hidden",
        "bg-gradient-to-br",
        kpiColors[color],
        "border",
        "cursor-pointer"
      )}
    >
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={cn(
            "absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl bg-gradient-to-br",
            kpiColors[color]
          )}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-black/20 backdrop-blur-sm">
            {icon}
          </div>
          {change && (
            <span className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-emerald-400" : 
              trend === "down" ? "text-red-400" : "text-zinc-500"
            )}>
              {change}
            </span>
          )}
        </div>

        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-xs text-zinc-500 mt-1">{title}</div>
      </div>
    </motion.div>
  );
}
