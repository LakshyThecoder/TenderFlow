import { NextResponse } from "next/server";
import { initialTenders } from "@/lib/mock-data";
import { computeWinProbability } from "@/lib/engines";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenderId, priceCompetitiveness, riskScore, regionStrength } = body;

    // Use default values if not provided
    const comp = priceCompetitiveness !== undefined ? Number(priceCompetitiveness) : 50;
    const rScore = riskScore !== undefined ? Number(riskScore) : 35;
    const strength = regionStrength !== undefined ? Number(regionStrength) : 60;

    const prob = computeWinProbability({
      priceCompetitiveness: comp,
      riskScore: rScore,
      regionStrength: strength,
    });

    return NextResponse.json({
      winProbability: Math.round(prob),
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
