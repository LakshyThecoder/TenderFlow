import { create } from "zustand";
import { Region, TenderStatus, Tender, Subcontractor, SubcontractorBid } from "../types/tender";
import { initialTenders, mockSubcontractors, mockSubBids } from "../mock-data";

export type AppState = {
  activeRegion: Region;
  activeTenderId: string | null;

  // Domain State (Single Source of Truth)
  tenders: Tender[];
  subcontractors: Subcontractor[];
  subBids: SubcontractorBid[];

  ui: {
    sidebarOpen: boolean;
    commandPaletteOpen: boolean;
    copilotOpen: boolean;
    loadingGlobal: boolean;
  };

  metrics: {
    pipelineValueEUR: number;
    avgWinRate: number;
    avgMarginPercent: number;
    activeTenders: number;
    riskIndexGlobal: number; // 0-100
  };

  realtime: {
    wsConnected: boolean;
    lastSync: number;
  };

  actions: {
    setRegion: (r: Region) => void;
    setTender: (id: string | null) => void;
    setTenders: (tenders: Tender[]) => void;
    updateTender: (id: string, updated: Partial<Tender>) => void;
    addTender: (tender: Tender) => void;
    setSubcontractors: (subs: Subcontractor[]) => void;
    setSubBids: (bids: SubcontractorBid[]) => void;
    toggleSidebar: () => void;
    toggleCommandPalette: () => void;
    toggleCopilot: () => void;
    setLoading: (v: boolean) => void;
    updateMetrics: (m: Partial<AppState["metrics"]>) => void;
    recalculateGlobalMetrics: () => void;
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  activeRegion: "Lombardia",
  activeTenderId: "tender-1",

  tenders: initialTenders,
  subcontractors: mockSubcontractors,
  subBids: mockSubBids,

  ui: {
    sidebarOpen: true,
    commandPaletteOpen: false,
    copilotOpen: false,
    loadingGlobal: false,
  },

  metrics: {
    pipelineValueEUR: initialTenders.reduce((acc, t) => acc + t.budgetEUR, 0),
    avgWinRate: 65,
    avgMarginPercent: 10,
    activeTenders: initialTenders.length,
    riskIndexGlobal: 35,
  },

  realtime: {
    wsConnected: true,
    lastSync: Date.now(),
  },

  actions: {
    setRegion: (r: Region) => {
      set({ activeRegion: r });
      get().actions.recalculateGlobalMetrics();
    },

    setTender: (id: string | null) => {
      set({ activeTenderId: id });
    },

    setTenders: (tenders: Tender[]) => {
      set({ tenders });
      get().actions.recalculateGlobalMetrics();
    },

    updateTender: (id: string, updated: Partial<Tender>) => {
      set((state) => ({
        tenders: state.tenders.map((t) =>
          t.id === id ? { ...t, ...updated, computed: { ...t.computed, ...(updated.computed || {}) } } : t
        ),
      }));
      get().actions.recalculateGlobalMetrics();
    },

    addTender: (tender: Tender) => {
      set((state) => ({
        tenders: [tender, ...state.tenders],
        activeTenderId: tender.id,
        activeRegion: tender.region,
      }));
      get().actions.recalculateGlobalMetrics();
    },

    setSubcontractors: (subcontractors: Subcontractor[]) => {
      set({ subcontractors });
    },

    setSubBids: (subBids: SubcontractorBid[]) => {
      set({ subBids });
    },

    toggleSidebar: () => {
      set((state) => ({ ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } }));
    },

    toggleCommandPalette: () => {
      set((state) => ({ ui: { ...state.ui, commandPaletteOpen: !state.ui.commandPaletteOpen } }));
    },

    toggleCopilot: () => {
      set((state) => ({ ui: { ...state.ui, copilotOpen: !state.ui.copilotOpen } }));
    },

    setLoading: (v: boolean) => {
      set((state) => ({ ui: { ...state.ui, loadingGlobal: v } }));
    },

    updateMetrics: (m: Partial<AppState["metrics"]>) => {
      set((state) => ({ metrics: { ...state.metrics, ...m } }));
    },

    recalculateGlobalMetrics: () => {
      const { tenders } = get();
      if (tenders.length === 0) {
        set({
          metrics: {
            pipelineValueEUR: 0,
            avgWinRate: 0,
            avgMarginPercent: 0,
            activeTenders: 0,
            riskIndexGlobal: 0,
          },
        });
        return;
      }

      const pipelineValueEUR = tenders.reduce((acc, t) => acc + t.budgetEUR, 0);
      const avgWinRate = Math.round(
        tenders.reduce((acc, t) => acc + t.computed.winProbability, 0) / tenders.length
      );
      const avgMarginPercent = Math.round(
        tenders.reduce((acc, t) => acc + t.computed.marginPercent, 0) / tenders.length
      );
      const activeTenders = tenders.filter((t) => t.status !== "won" && t.status !== "lost").length;
      const riskIndexGlobal = Math.round(
        tenders.reduce((acc, t) => acc + t.computed.riskScore, 0) / tenders.length
      );

      set({
        metrics: {
          pipelineValueEUR,
          avgWinRate,
          avgMarginPercent,
          activeTenders,
          riskIndexGlobal,
        },
        realtime: {
          wsConnected: true,
          lastSync: Date.now(),
        },
      });
    },
  },
}));
