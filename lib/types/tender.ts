export type Region =
  | "Lombardia"
  | "Piemonte"
  | "Veneto"
  | "Lazio"
  | "Campania"
  | "Sicilia";

export type TenderStatus =
  | "draft"
  | "analyzing"
  | "bidding"
  | "won"
  | "lost";

export type BOQItem = {
  id: string;
  category: "excavation" | "concrete" | "steel" | "finishing" | "installations";
  description: string;
  quantity: number;
  unit: string;
  unitPriceEUR: number;
  matchedCode?: string;
  catalogPrice?: number;
  variancePercent?: number;
};

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskItem = {
  id: string;
  code: string;
  level: RiskLevel;
  message: string;
  impactScore: number;
  status: "Flagged" | "Resolved"; // Add status to track resolution in UI
  resolutionHint?: string; // Optional resolution hint for the UI
};

export type SubcontractorBid = {
  id: string;
  subcontractorId: string;
  subcontractorName: string;
  workPackageId: string;
  priceProposed: number;
  deliveryDays: number;
  notes: string;
  isSubmitted: boolean;
};

export type WorkPackage = {
  id: string;
  name: string;
  category: string;
  estimatedBudget: number;
  assignedSubId?: string;
};

export type Subcontractor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  riskScore: "Basso" | "Medio" | "Alto";
  completedProjects: number;
  durcValid: boolean;
  soaCategory: string;
};

export type Tender = {
  id: string;
  title: string;
  region: Region;
  status: TenderStatus;

  budgetEUR: number;
  deadlineISO: string;

  boq: BOQItem[];
  workPackages: WorkPackage[]; // Keep workPackages to coordinate subcontractor bidding

  computed: {
    totalCostEUR: number;
    suggestedBidEUR: number;
    marginPercent: number;
    riskScore: number;
    winProbability: number;
  };

  riskItems: RiskItem[];
  subcontractorBids: SubcontractorBid[];

  createdAt: number;
  cig?: string; // Optional field for compatibility/displays
  stazioneAppaltante?: string; // Optional field for display compatibility
};
