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
} from "lucide-react";

interface Activity {
  id: string;
  type: "tender_created" | "bid_submitted" | "risk_flagged" | "price_updated" | "win" | "margin_changed";
  message: string;
  timestamp: Date;
  user?: string;
  tenderName?: string;
  value?: string;
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
  },
  {
    id: "2",
    type: "risk_flagged",
    message: "Risk anomaly detected in",
    tenderName: "Metro M4 - Tratta T3",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    value: "SOA Required",
  },
  {
    id: "3",
    type: "win",
    message: "Tender won!",
    tenderName: "Ospedale San Raffaele - Ampliamento",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    value: "€850K",
  },
  {
    id: "4",
    type: "price_updated",
    message: "AI price suggestion applied",
    tenderName: "Scuola Elementare - Ristrutturazione",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    value: "€45.50 → €52.30",
  },
  {
    id: "5",
    type: "margin_changed",
    message: "Margin adjusted for",
    tenderName: "Centro Commerciale - Fondazioni",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    value: "12% → 15%",
  },
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "bid_submitted":
      return <FileText className="w-4 h-4 text-blue-400" />;
    case "risk_flagged":
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case "win":
      return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    case "price_updated":
      return <DollarSign className="w-4 h-4 text-amber-400" />;
    case "margin_changed":
      return <CheckCircle className="w-4 h-4 text-zinc-400" />;
    default:
      return <User className="w-4 h-4 text-zinc-400" />;
  }
};

const getActivityColor = (type: Activity["type"]) => {
  switch (type) {
    case "bid_submitted":
      return "bg-blue-500/10 border-blue-500/20";
    case "risk_flagged":
      return "bg-red-500/10 border-red-500/20";
    case "win":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "price_updated":
      return "bg-amber-500/10 border-amber-500/20";
    case "margin_changed":
      return "bg-zinc-500/10 border-zinc-500/20";
    default:
      return "bg-zinc-800 border-zinc-700";
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("it-IT");
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, this would fetch from WebSocket/API
      setActivities((prev) => [...prev]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          Activity Feed
        </h3>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${getActivityColor(
                activity.type
              )} transition-all hover:scale-[1.02]`}
            >
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activity.message}{" "}
                  <span className="font-medium text-zinc-100">
                    {activity.tenderName}
                  </span>
                </p>
                {activity.value && (
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {activity.value}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {activity.user && (
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-600">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="w-full mt-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors border-t border-zinc-800 pt-3">
        View All Activity
      </button>
    </div>
  );
}
