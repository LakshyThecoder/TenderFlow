"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  Award,
  Shield,
  Bell,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "tender_created" | "bid_submitted" | "risk_flagged" | "price_updated" | "win" | "margin_changed" | "audit_complete";
  message: string;
  timestamp: Date;
  user?: string;
  tenderName?: string;
  value?: string;
  priority?: "high" | "medium" | "low";
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "bid_submitted",
    message: "New bid submitted for",
    tenderName: "Parco Nord - Lavori Edili",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: "Marco Rossi",
    value: "€1.2M",
    priority: "high",
  },
  {
    id: "2",
    type: "risk_flagged",
    message: "Risk anomaly detected in",
    tenderName: "Metro M4 - Tratta T3",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    value: "SOA Required",
    priority: "high",
  },
  {
    id: "3",
    type: "win",
    message: "Tender won!",
    tenderName: "Ospedale San Raffaele - Ampliamento",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    value: "€850K",
    priority: "high",
  },
  {
    id: "4",
    type: "price_updated",
    message: "AI price suggestion applied",
    tenderName: "Scuola Elementare - Ristrutturazione",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    value: "€45.50 → €52.30",
    priority: "medium",
  },
  {
    id: "5",
    type: "margin_changed",
    message: "Margin adjusted for",
    tenderName: "Centro Commerciale - Fondazioni",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    value: "12% → 15%",
    priority: "low",
  },
  {
    id: "6",
    type: "audit_complete",
    message: "Compliance audit completed",
    tenderName: "Ponte Vecchio - Restauro",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    value: "3 issues found",
    priority: "medium",
  },
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "bid_submitted":
      return <FileText className="w-4 h-4" />;
    case "risk_flagged":
      return <AlertCircle className="w-4 h-4" />;
    case "win":
      return <Award className="w-4 h-4" />;
    case "price_updated":
      return <DollarSign className="w-4 h-4" />;
    case "margin_changed":
      return <TrendingUp className="w-4 h-4" />;
    case "audit_complete":
      return <Shield className="w-4 h-4" />;
    default:
      return <Zap className="w-4 h-4" />;
  }
};

const getActivityColors = (type: Activity["type"], priority: Activity["priority"]) => {
  const baseColors = {
    bid_submitted: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    risk_flagged: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    win: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    price_updated: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    margin_changed: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400",
    audit_complete: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400",
    tender_created: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 text-zinc-400",
  };

  return baseColors[type] || baseColors.tender_created;
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("it-IT");
};

export function ActivityFeedV2() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => [...prev]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-zinc-900 to-zinc-950",
        "border border-zinc-800/80"
      )}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl bg-cyan-500/10"
        />
      </div>

      {/* Header */}
      <div className="relative p-5 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-cyan-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-md"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Live Activity</h3>
              <p className="text-[10px] text-zinc-500">Real-time updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="relative p-4">
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {activities.map((activity, idx) => {
              const colors = getActivityColors(activity.type, activity.priority);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredId(activity.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "group relative p-3 rounded-xl border cursor-pointer transition-all duration-300",
                    "bg-gradient-to-r",
                    colors,
                    hoveredId === activity.id ? "scale-[1.02] shadow-lg" : "hover:scale-[1.01]"
                  )}
                >
                  {/* Priority Indicator */}
                  {activity.priority === "high" && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-zinc-900" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="relative">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        "bg-black/20 backdrop-blur-sm"
                      )}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {activity.message}{" "}
                        <span className="font-semibold text-zinc-100">
                          {activity.tenderName}
                        </span>
                      </p>
                      
                      {activity.value && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs font-mono mt-1 font-bold"
                        >
                          {activity.value}
                        </motion.p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2">
                        {activity.user && (
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <User className="w-3 h-3" />
                            {activity.user}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow on hover */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: hoveredId === activity.id ? 1 : 0, x: hoveredId === activity.id ? 0 : -10 }}
                      className="text-zinc-500"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "w-full mt-4 py-3 rounded-xl text-xs font-medium",
            "bg-zinc-900/50 border border-zinc-800/50",
            "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
            "transition-all duration-300"
          )}
        >
          View All Activity
        </motion.button>
      </div>
    </motion.div>
  );
}
