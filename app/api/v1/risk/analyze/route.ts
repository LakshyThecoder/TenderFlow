import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return NextResponse.json({ error: "Missing MISTRAL_API_KEY environment variable" }, { status: 500 });
    }

    const body = await request.json();
    const { tenderId, boq } = body;

    if (!tenderId || !boq) {
      return NextResponse.json({ error: "Missing required fields: tenderId, boq" }, { status: 400 });
    }

    const auditPrompt = `You are a professional Italian public construction compliance auditor (esperto di contratti pubblici ed edilizia).
Audit these Bill of Quantities (BOQ) items for an Italian public procurement tender (gara d'appalto, CIG context).
Analyze the items and identify any regulatory compliance risks, cost omissions, safety anomalies, or delivery timeframe risks.

BOQ Items:
${JSON.stringify(boq)}

Evaluate compliance based on:
- D.Lgs. 36/2023 (Codice dei Contratti Pubblici)
- D.Lgs. 81/2008 (Testo Unico Sicurezza, costi della sicurezza non soggetti a ribasso)
- Qualifications (SOA classifications for structural OG1 / MEP OG11 works over 150k Euro)

Identify risks and assign one of the following codes:
1. DURC_EXPIRED: Serious lack of contributor regularity in subcontractors.
2. SOA_REQUIRED: Missing or insufficient SOA category classifications.
3. SAFETY_COSTS_NON_REDUCIBLE: Omission or incorrect discount application on non-reducible safety costs.
4. DELIVERY_DELAY: MEP or excavation schedules that are highly unrealistic or lack safety buffers.
5. ENVIRONMENTAL_CONSTRAINT: Works in areas with historical, landscape, or hydrogeological restrictions.

Calculate an aggregate riskScore (0 to 100, where 0 is zero warnings, 100 is critical disqualification blockers).

Return ONLY a valid JSON object matching this schema:
{
  "riskScore": number,
  "items": [
    {
      "id": "A unique risk ID (e.g. risk-1, risk-2)",
      "code": "DURC_EXPIRED" | "SOA_REQUIRED" | "DELIVERY_DELAY" | "SAFETY_COSTS_NON_REDUCIBLE" | "ENVIRONMENTAL_CONSTRAINT",
      "level": "critical" | "high" | "warning",
      "message": "Detailed description in Italian explaining the regulatory issue and the exact article code of Italian law",
      "resolutionHint": "Clear path to resolve the anomaly in Italian",
      "status": "Flagged"
    }
  ]
}
Do not output markdown code blocks or extra conversational text.`;

    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: auditPrompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!mistralRes.ok) {
      const errorText = await mistralRes.text();
      return NextResponse.json({ error: `Mistral AI compliance audit failed: ${errorText}` }, { status: 502 });
    }

    const mistralJson = await mistralRes.json();
    const rawText = mistralJson.choices[0].message.content;
    const parsedData = JSON.parse(rawText);

    return NextResponse.json({
      riskScore: parsedData.riskScore ?? 25,
      items: parsedData.items || []
    });

  } catch (error: any) {
    console.error("Error in risk analyze API:", error);
    return NextResponse.json({ error: error.message || "Invalid request body" }, { status: 400 });
  }
}
