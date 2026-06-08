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
    const { itemDescription, quantity, unit, region, category, historicalPrices } = body;

    if (!itemDescription || !quantity || !unit || !region) {
      return NextResponse.json(
        { error: "Missing required fields: itemDescription, quantity, unit, region" },
        { status: 400 }
      );
    }

    const predictionPrompt = `You are an expert Italian construction cost estimator with deep knowledge of regional prezzari (Lombardia, Veneto, Lazio, Campania, Sicilia, Piemonte).

Analyze this BOQ item and provide a smart price prediction:

Item: ${itemDescription}
Quantity: ${quantity} ${unit}
Region: ${region}
Category: ${category || "general"}
${historicalPrices ? `Historical prices in region: ${JSON.stringify(historicalPrices)}` : ""}

Consider:
1. Regional cost variations (labor rates, material transport)
2. Market conditions (inflation, supply chain)
3. Item complexity and specialization required
4. Current season impact on pricing

Return ONLY a valid JSON object:
{
  "suggestedPrice": number,
  "confidence": "high" | "medium" | "low",
  "confidenceScore": number (0-100),
  "marketRange": {
    "min": number,
    "max": number
  },
  "variance": number (percentage from market average),
  "factors": [
    {
      "name": string,
      "impact": "positive" | "negative" | "neutral",
      "description": string
    }
  ],
  "reasoning": string (brief explanation in Italian)
}

Base prices reference (€/unit):
- Excavation: 15-45€/m³
- Concrete: 80-150€/m³  
- Steel reinforcement: 1.2-2.5€/kg
- Finishing: 25-80€/m²
- Installations: 40-120€/m²

Do not output markdown or extra text.`;

    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: predictionPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!mistralRes.ok) {
      const errorText = await mistralRes.text();
      return NextResponse.json(
        { error: `AI prediction failed: ${errorText}` },
        { status: 502 }
      );
    }

    const mistralJson = await mistralRes.json();
    const rawText = mistralJson.choices[0].message.content;
    const prediction = JSON.parse(rawText);

    return NextResponse.json({
      suggestedPrice: prediction.suggestedPrice || 0,
      confidence: prediction.confidence || "medium",
      confidenceScore: prediction.confidenceScore || 70,
      marketRange: prediction.marketRange || { min: 0, max: 0 },
      variance: prediction.variance || 0,
      factors: prediction.factors || [],
      reasoning: prediction.reasoning || "",
    });
  } catch (error: any) {
    console.error("Error in price prediction API:", error);
    return NextResponse.json(
      { error: error.message || "Invalid request" },
      { status: 400 }
    );
  }
}
