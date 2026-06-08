import { NextResponse } from "next/server";
import { BOQItem } from "@/lib/types/tender";

export async function POST(request: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;
    const llamaKey = process.env.LLAMAPARSE_API_KEY;

    if (!mistralKey) {
      return NextResponse.json({ error: "Missing MISTRAL_API_KEY environment variable" }, { status: 500 });
    }

    const contentType = request.headers.get("content-type") || "";

    // 1. Check if user uploaded a real PDF/XLSX file via FormData
    if (contentType.includes("multipart/form-data")) {
      if (!llamaKey) {
        return NextResponse.json({ error: "Missing LLAMAPARSE_API_KEY environment variable" }, { status: 500 });
      }

      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded in the form data" }, { status: 400 });
      }

      // Step A: Upload file to LlamaParse
      const uploadFormData = new FormData();
      uploadFormData.append("file", file, file.name);

      const uploadRes = await fetch("https://api.llamaindex.ai/v1/parsing/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${llamaKey}`
        },
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        return NextResponse.json({ error: `LlamaParse upload failed: ${errorText}` }, { status: 502 });
      }

      const uploadJson = await uploadRes.json();
      const jobId = uploadJson.id;

      // Step B: Poll LlamaParse job status (timeout after 40 attempts / 40s)
      let status = "PENDING";
      let attempts = 0;
      while ((status === "PENDING" || status === "RUNNING") && attempts < 40) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const pollRes = await fetch(`https://api.llamaindex.ai/v1/parsing/job/${jobId}`, {
          headers: {
            "Authorization": `Bearer ${llamaKey}`
          }
        });
        if (pollRes.ok) {
          const pollJson = await pollRes.json();
          status = pollJson.status;
        }
        attempts++;
      }

      if (status !== "SUCCESS") {
        return NextResponse.json({ error: "LlamaParse parsing timeout or failed" }, { status: 504 });
      }

      // Step C: Retrieve parsed Markdown table content
      const resultRes = await fetch(`https://api.llamaindex.ai/v1/parsing/job/${jobId}/result/markdown`, {
        headers: {
          "Authorization": `Bearer ${llamaKey}`
        }
      });

      if (!resultRes.ok) {
        return NextResponse.json({ error: "Failed to fetch markdown results from LlamaParse" }, { status: 502 });
      }

      const markdownText = await resultRes.text();

      // Step D: Feed markdown table to Mistral to extract clean structured JSON items
      const mistralPrompt = `You are a professional Italian construction quantity surveyor (computista).
Below is the raw Markdown text containing Bill of Quantities (Computo Metrico) tables extracted from a PDF.
Analyze the tables and extract each row as a structured item in a JSON array.

Markdown Content:
---
${markdownText}
---

Each item in the output array MUST follow this JSON schema:
{
  "id": "A unique item code, prefer code from table if available (e.g. NP.01.010, OG.02.04) otherwise generate one",
  "category": "Strictly one of: 'excavation', 'concrete', 'steel', 'finishing', 'installations'",
  "description": "The item description in Italian",
  "quantity": A numeric value (quantity),
  "unit": "The unit of measurement (e.g., mc, mq, kg, cad, m)",
  "unitPriceEUR": A numeric value for the unit price
}

Map items to categories strictly based on description keywords:
- excavation: scavi, sbancamento, movimento terra, rinterro
- concrete: calcestruzzo, cemento, fondazioni, travi, solai
- steel: acciaio, armature, barre, rete elettrosaldata
- finishing: intonaco, pittura, piastrelle, cartongesso, finiture
- installations: impianti elettrici, termici, speciali, condizionamento, idraulici

Ensure the response is ONLY a valid JSON object with the structure:
{
  "items": [...]
}
Do not output markdown block wrappers or extra text.`;

      const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralKey}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [{ role: "user", content: mistralPrompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!mistralRes.ok) {
        const errorText = await mistralRes.text();
        return NextResponse.json({ error: `Mistral AI completion failed: ${errorText}` }, { status: 502 });
      }

      const mistralJson = await mistralRes.json();
      const rawText = mistralJson.choices[0].message.content;
      const parsedData = JSON.parse(rawText);

      return NextResponse.json({ items: parsedData.items || [] });
    }

    // 2. Fallback: If no file uploaded, generate mock items using Mistral based on keyword parameters
    const body = await request.json();
    const { fileText } = body;

    const keywords = fileText || "scavo calcestruzzo acciaio intonaco impianto";

    const generatorPrompt = `You are a professional Italian construction quantity surveyor (computista).
Generate a highly realistic, detailed Bill of Quantities (Computo Metrico Estimativo) containing 5-8 items in JSON format based on the following keywords or project context: "${keywords}".
Make the items realistic for Italian public procurement bids.

Each item in the output array MUST follow this JSON schema:
{
  "id": "A unique item code starting with 'NP.' (e.g., NP.01.010, NP.02.04)",
  "category": "Strictly one of: 'excavation', 'concrete', 'steel', 'finishing', 'installations'",
  "description": "Detailed item description in Italian",
  "quantity": A numeric value (quantity),
  "unit": "The unit of measurement (e.g., mc, mq, kg, cad, m)",
  "unitPriceEUR": A numeric value for the unit price
}

Map items to categories strictly based on description keywords:
- excavation: scavi, sbancamento, movimento terra, rinterro
- concrete: calcestruzzo, cemento, fondazioni, travi, solai
- steel: acciaio, armature, barre, rete elettrosaldata
- finishing: intonaco, pittura, piastrelle, cartongesso, finiture
- installations: impianti elettrici, termici, speciali, condizionamento, idraulici

Ensure the response is ONLY a valid JSON object with the structure:
{
  "items": [...]
}
Do not output markdown block wrappers or extra text.`;

    const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: generatorPrompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!mistralRes.ok) {
      const errorText = await mistralRes.text();
      return NextResponse.json({ error: `Mistral AI generator failed: ${errorText}` }, { status: 502 });
    }

    const mistralJson = await mistralRes.json();
    const rawText = mistralJson.choices[0].message.content;
    const parsedData = JSON.parse(rawText);

    return NextResponse.json({ items: parsedData.items || [] });

  } catch (error: any) {
    console.error("Error in parse API:", error);
    return NextResponse.json({ error: error.message || "Invalid request body" }, { status: 400 });
  }
}
