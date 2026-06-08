import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return NextResponse.json({ error: "Missing MISTRAL_API_KEY environment variable" }, { status: 500 });
    }

    const body = await request.json();
    const { tenderTitle, cig, region, riskMessage, riskCode, resolutionHint } = body;

    if (!riskMessage || !riskCode) {
      return NextResponse.json({ error: "Missing required fields: riskMessage, riskCode" }, { status: 400 });
    }

    const prompt = `You are a legal counsel specializing in Italian public contracts law (Dossier Gare / Diritto Amministrativo).
Draft a formal, high-fidelity legal appeal document ("Memoria per Soccorso Istruttorio" or "Ricorso in Autotutela al T.A.R.") in Italian.

Project context:
- Tender/Gara: ${tenderTitle || "Appalto Opere Pubbliche"}
- CIG Code: ${cig || "N/A"}
- Region: ${region || "Lazio"}
- Anomaly Found: ${riskMessage}
- Code identifier: ${riskCode}
- AI Mitigation Path: ${resolutionHint || "N/A"}

Your draft MUST:
1. Cite relevant Italian laws (primarily D.Lgs. 36/2023 - the new Italian Public Procurement Code, e.g. Art. 101 for Soccorso Istruttorio or Art. 94 for DURC exclusions, or D.Lgs. 81/2008 for safety plans).
2. Follow professional administrative legal style in Italian, beginning with a formal address to the Stazione Appaltante or the Tribunale Amministrativo Regionale (TAR).
3. Include sections for:
   - OGGETTO: (Subject showing CIG and Gara)
   - IN FATTO: (The facts of the case, detailing the compliance warning flagged by the system)
   - IN DIRITTO: (The legal grounds of defense, arguing for the right of rectification under Soccorso Istruttorio or presenting a justification)
   - CONCLUSIONI: (Formal requests to admit the bid or clear the anomaly)
4. Format the output with clear line-breaks, spacing, and legal paragraphs, mimicking a physical judicial document.

Return ONLY a valid JSON object matching this schema:
{
  "appealText": "The entire legal draft in Italian"
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
      return NextResponse.json({ error: `Mistral legal appeal failed: ${errorText}` }, { status: 502 });
    }

    const json = await res.json();
    const rawContent = json.choices[0].message.content;
    const data = JSON.parse(rawContent);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error in legal-appeal API:", error);
    return NextResponse.json({ error: error.message || "Invalid request body" }, { status: 400 });
  }
}
