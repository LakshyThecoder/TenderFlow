import { NextResponse } from "next/server";
import { initialTenders } from "@/lib/mock-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tender = initialTenders.find((t) => t.id === id);

  if (!tender) {
    return NextResponse.json({ error: "Tender not found" }, { status: 404 });
  }

  return NextResponse.json(tender);
}
