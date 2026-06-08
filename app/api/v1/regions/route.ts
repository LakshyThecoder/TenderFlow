import { NextResponse } from "next/server";

export async function GET() {
  const regions = [
    {
      id: "lombardia",
      name: "Lombardia",
      tenderCount: 42,
      pipelineEUR: 120000000,
      riskIndex: 35
    },
    {
      id: "piemonte",
      name: "Piemonte",
      tenderCount: 18,
      pipelineEUR: 48000000,
      riskIndex: 25
    },
    {
      id: "veneto",
      name: "Veneto",
      tenderCount: 24,
      pipelineEUR: 65000000,
      riskIndex: 10
    },
    {
      id: "lazio",
      name: "Lazio",
      tenderCount: 31,
      pipelineEUR: 89000000,
      riskIndex: 45
    },
    {
      id: "campania",
      name: "Campania",
      tenderCount: 28,
      pipelineEUR: 74000000,
      riskIndex: 55
    },
    {
      id: "sicilia",
      name: "Sicilia",
      tenderCount: 15,
      pipelineEUR: 32000000,
      riskIndex: 60
    }
  ];

  return NextResponse.json(regions);
}
