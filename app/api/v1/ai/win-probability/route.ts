import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return NextResponse.json(
        { error: "Missing MISTRAL_API_KEY environment variable" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      tenderTitle,
      budgetEUR,
      marginPercent,
      riskScore,
      region,
      boqComplexity,
      competitorCount,
      companyExperience,
      pastWinRate,
    } = body;

    const analysisPrompt = `You are an expert Italian public procurement strategist. Analyze the win probability for this tender bid.

Tender Details:
- Title: ${tenderTitle}
- Budget: €${budgetEUR?.toLocaleString()}
- Region: ${region}
- Our Margin: ${marginPercent}%
- Risk Score: ${riskScore}/100
- BOQ Complexity: ${boqComplexity || "medium"}
- Estimated Competitors: ${competitorCount || "unknown"}
- Company Experience: ${companyExperience || "medium"} (projects completed)
- Historical Win Rate: ${pastWinRate || 50}%

Analyze factors:
1. Margin competitiveness (lower margin = higher win chance but lower profit)
2. Risk level impact (high risk deters competitors)
3. Regional expertise (local knowledge advantage)
4. Complexity barrier (complex projects filter out weak competitors)
5. Competition intensity (more competitors = lower probability)
6. Track record credibility

Return ONLY a valid JSON object:
{
  "winProbability": number (0-100),
  "confidence": "high" | "medium" | "low",
  "factorBreakdown": [
    {
      "factor": string,
      "impact": number (-20 to +20),
      "weight": number (0-1),
      "explanation": string (in Italian)
    }
  ],
  "recommendations": [
    {
      "action": string,
      "impact": string ("high" | "medium" | "low"),
      "description": string (in Italian)
    }
  ],
  "optimalMargin": number (suggested margin % for best win chance),
  "scenarioAnalysis": {
    "conservative": { "margin": number, "winProbability": number },
    "balanced": { "margin": number, "winProbability": number },
    "aggressive": { "margin": number, "winProbability": number }
  }
}

Do not output markdown or extra text.`;

    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: analysisPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!mistralRes.ok) {
      const errorText = await mistralRes.text();
      return NextResponse.json(
        { error: `AI analysis failed: ${errorText}` },
        { status: 502 }
      );
    }

    const mistralJson = await mistralRes.json();
    const rawText = mistralJson.choices[0].message.content;
    const analysis = JSON.parse(rawText);

    return NextResponse.json({
      winProbability: analysis.winProbability || 50,
      confidence: analysis.confidence || "medium",
      factorBreakdown: analysis.factorBreakdown || [],
      recommendations: analysis.recommendations || [],
      optimalMargin: analysis.optimalMargin || marginPercent,
      scenarioAnalysis: analysis.scenarioAnalysis || {
        conservative: { margin: marginPercent - 3, winProbability: Math.min(95, analysis.winProbability + 15) },
        balanced: { margin: marginPercent, winProbability: analysis.winProbability },
        aggressive: { margin: marginPercent + 3, winProbability: Math.max(10, analysis.winProbability - 15) },
      },
    });
  } catch (error: any) {
    console.error("Error in win probability API:", error);
    return NextResponse.json(
      { error: error.message || "Invalid request" },
      { status: 400 }
    );
  }
}
