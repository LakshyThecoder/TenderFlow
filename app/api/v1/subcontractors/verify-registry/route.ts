import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return NextResponse.json({ error: "Missing MISTRAL_API_KEY environment variable" }, { status: 500 });
    }

    const body = await request.json();
    const { companyName, partitaIva } = body;

    if (!companyName || !partitaIva) {
      return NextResponse.json({ error: "Missing required fields: companyName, partitaIva" }, { status: 400 });
    }

    // Clean PI
    const vat = partitaIva.replace(/\D/g, "");

    const prompt = `You are a compliance officer for Italian public construction procurement (ANAC & INPS auditor).
Review the registry standing of this subcontractor:
- Company Name: ${companyName}
- Partita IVA (VAT): ${vat}

Perform a regulatory compliance check. DURC regularity is mandatory under D.Lgs. 36/2023.
Simulate checking against:
1. INPS/INAIL DURC Registry (Documento Unico di Regolarità Contributiva)
2. ANAC SOA Qualification Registry (Società Organismo di Attestazione)
3. ANAC Preclusion/Suspension List (Casellario Informatico)

Determine if their standing is VALID or EXPIRED.
If the Partita IVA ends in an even number (e.g. 0, 2, 4, 6, 8), consider them fully compliant.
If the Partita IVA ends in an odd number (e.g. 1, 3, 5, 7, 9), consider them as having an EXPIRED DURC or missing SOA classification.

Return ONLY a valid JSON object matching this schema:
{
  "isValid": boolean,
  "soaCategory": "string (e.g., OG11 Classifica III)",
  "durcStatus": "VALID" | "EXPIRED",
  "expirationDate": "YYYY-MM-DD",
  "anacPreclusion": boolean,
  "registryDetails": {
    "vat": "string",
    "lastAuditDate": "YYYY-MM-DD",
    "inpsInspectorCode": "string",
    "findings": "Detailed explanation of findings in Italian, citing D.Lgs. 36/2023 or safety codes where relevant."
  }
}
Do not return markdown blocks or extra text.`;

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
      return NextResponse.json({ error: `Mistral registry verify failed: ${errorText}` }, { status: 502 });
    }

    const json = await res.json();
    const rawContent = json.choices[0].message.content;
    const data = JSON.parse(rawContent);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error in verify-subcontractor API:", error);
    return NextResponse.json({ error: error.message || "Invalid request body" }, { status: 400 });
  }
}
