import { NextResponse } from "next/server";
import { initialTenders } from "@/lib/mock-data";
import { calculateTenderPricing } from "@/lib/engines";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenderId, targetMargin } = body;

    if (!tenderId || targetMargin === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: tenderId, targetMargin" },
        { status: 400 }
      );
    }

    const tender = initialTenders.find((t) => t.id === tenderId);
    if (!tender) {
      return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    }

    // Determine region multiplier
    let regionMultiplier = 1.0;
    switch (tender.region) {
      case "Lombardia":
        regionMultiplier = 1.05;
        break;
      case "Veneto":
        regionMultiplier = 1.02;
        break;
      case "Lazio":
        regionMultiplier = 1.04;
        break;
      case "Campania":
        regionMultiplier = 0.98;
        break;
      case "Sicilia":
        regionMultiplier = 0.95;
        break;
      case "Piemonte":
      default:
        regionMultiplier = 1.00;
        break;
    }

    // Run pricing engine calculation
    const pricing = calculateTenderPricing({
      boq: tender.boq,
      regionMultiplier,
      targetMargin: Number(targetMargin),
    });

    return NextResponse.json({
      baseCost: pricing.baseCost,
      adjustedCost: pricing.adjustedCost,
      suggestedBid: pricing.suggestedBid,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
