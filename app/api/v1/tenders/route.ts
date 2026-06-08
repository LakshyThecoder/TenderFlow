import { NextResponse } from "next/server";
import { initialTenders } from "@/lib/mock-data";
import { Region } from "@/lib/types/tender";

// We will keep a simple in-memory cache of tenders for the demo
let tendersStore = [...initialTenders];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionParam = searchParams.get("region");

  if (regionParam) {
    const matchedTenders = tendersStore.filter(
      (t) => t.region.toLowerCase() === regionParam.toLowerCase()
    );
    return NextResponse.json(matchedTenders);
  }

  return NextResponse.json(tendersStore);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, region, budgetEUR } = body;

    if (!title || !region || !budgetEUR) {
      return NextResponse.json(
        { error: "Missing required fields: title, region, budgetEUR" },
        { status: 400 }
      );
    }

    // Capitalize region correctly
    const formattedRegion = (region.charAt(0).toUpperCase() +
      region.slice(1).toLowerCase()) as Region;

    const newTender = {
      id: `tender-${Date.now()}`,
      title,
      region: formattedRegion,
      status: "draft" as const,
      budgetEUR: Number(budgetEUR),
      deadlineISO: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      boq: [],
      workPackages: [],
      computed: {
        totalCostEUR: 0,
        suggestedBidEUR: 0,
        marginPercent: 10,
        riskScore: 0,
        winProbability: 70,
      },
      riskItems: [],
      subcontractorBids: [],
      createdAt: Date.now(),
      cig: `CIG: ${Math.floor(1000000 + Math.random() * 9000000)}${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}${Math.floor(10 + Math.random() * 90)}`,
      stazioneAppaltante: "Ente Appaltante di Riferimento",
    };

    tendersStore = [newTender, ...tendersStore];

    return NextResponse.json(newTender);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
