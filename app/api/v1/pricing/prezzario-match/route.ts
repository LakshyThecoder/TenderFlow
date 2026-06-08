import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return NextResponse.json({ error: "Missing MISTRAL_API_KEY environment variable" }, { status: 500 });
    }

    const body = await request.json();
    const { items, region } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required field: items (array)" }, { status: 400 });
    }

    const targetRegion = region || "Lombardia";

    const prompt = `You are a professional Italian quantity surveyor (computista metrico).
Analyze these construction BOQ items and align them with the official Regional Price Catalog ("Prezzario Regionale") of the region: "${targetRegion}".

For each item, identify:
1. An official, realistic catalog code matching standard Italian bulletins (e.g., "01.A02.B01.005", "12.04.012", etc.).
2. The standard catalog unit price in EUR (which should be highly realistic and close to but slightly different from the provided unit price).
3. The percentage variance calculated as: ((providedUnitPrice - catalogPrice) / catalogPrice) * 100.

Input BOQ Items:
${JSON.stringify(items, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "matches": [
    {
      "id": "matching the unique ID of the input item",
      "matchedCode": "string (e.g. 02.A12.C04.010)",
      "catalogPrice": number,
      "variancePercent": number
    }
  ]
}
Do not return markdown formatting blocks or extra text.`;

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: `Mistral API catalog match failed: ${errorText}` }, { status: 502 });
    }

    const json = await res.json();
    const rawContent = json.choices[0].message.content;
    const data = JSON.parse(rawContent);

    return NextResponse.json({ matches: data.matches || [] });

  } catch (error: any) {
    console.error("Error in prezzario-match API:", error);
    return NextResponse.json({ error: error.message || "Invalid request body" }, { status: 400 });
  }
}
