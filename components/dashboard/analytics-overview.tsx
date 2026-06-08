"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  DollarSign,
  AlertTriangle,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useLanguage } from "@/lib/LanguageContext";

const winLossData = [
  { month: "Gen", submitted: 12, won: 5, lost: 4, pending: 3 },
  { month: "Feb", submitted: 15, won: 7, lost: 5, pending: 3 },
  { month: "Mar", submitted: 10, won: 4, lost: 4, pending: 2 },
  { month: "Apr", submitted: 18, won: 9, lost: 6, pending: 3 },
  { month: "Mag", submitted: 14, won: 6, lost: 5, pending: 3 },
  { month: "Giu", submitted: 20, won: 11, lost: 6, pending: 3 },
];

const regionData = [
  { name: "Lombardia", value: 35, color: "#3f3f46" },
  { name: "Veneto", value: 25, color: "#52525b" },
  { name: "Lazio", value: 20, color: "#71717a" },
  { name: "Campania", value: 12, color: "#a1a1aa" },
  { name: "Altre", value: 8, color: "#d4d4d8" },
];

const categoryPerformance = [
  { category: "Scavo", winRate: 72, avgMargin: 15 },
  { category: "Calcestruzzo", winRate: 68, avgMargin: 12 },
  { category: "Acciaio", winRate: 55, avgMargin: 10 },
  { category: "Finiture", winRate: 81, avgMargin: 18 },
  { category: "Impianti", winRate: 63, avgMargin: 14 },
];

export function AnalyticsOverview() {
  const { t } = useLanguage();
  const tenders = useAppStore((state) => state.tenders);
  const metrics = useAppStore((state) => state.metrics);

  const totalWon = 42;
  const totalLost = 28;
  const totalSubmitted = totalWon + totalLost + 15;
  const overallWinRate = ((totalWon / (totalWon + totalLost)) * 100).toFixed(1);

  const kpiCards = [
    {
      title: "Win Rate",
      value: `${overallWinRate}%`,
      change: "+5.2%",
      trend: "up",
      icon: Target,
      color: "emerald",
    },
    {
      title: "Pipeline Value",
      value: `€${(metrics.pipelineValueEUR / 1000000).toFixed(2)}M`,
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Avg Margin",
      value: `${metrics.avgMarginPercent}%`,
      change: "+1.3%",
      trend: "up",
      icon: TrendingUp,
      color: "amber",
    },
    {
      title: "Active Tenders",
      value: metrics.activeTenders,
      change: "+3",
      trend: "neutral",
      icon: Calendar,
      color: "zinc",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
              <span
                className={`text-xs font-medium ${
                  kpi.trend === "up"
                    ? "text-emerald-400"
                    : kpi.trend === "down"
                    ? "text-red-400"
                    : "text-zinc-500"
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
            <div className="text-xs text-zinc-500">{kpi.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Win/Loss Trend */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-400" />
            Win/Loss Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={winLossData}>
                <defs>
                  <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#52525b" fontSize={12} />
                <YAxis stroke="#52525b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Area
                  type="monotone"
                  dataKey="won"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorWon)"
                  name="Won"
                />
                <Area
                  type="monotone"
                  dataKey="lost"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorLost)"
                  name="Lost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            Regional Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {regionData.map((region) => (
              <div key={region.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <span className="text-zinc-400">
                  {region.name} ({region.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-zinc-400" />
          Performance by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#52525b" fontSize={12} />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#52525b"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="winRate" name="Win Rate %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="avgMargin" name="Avg Margin %" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
