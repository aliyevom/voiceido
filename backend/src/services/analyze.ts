import fs from "fs/promises";
import path from "path";
import { ocrImage } from "./vision.js";
import { chat } from "./openrouter.js";

const PROMPT = `Convert the diagram into clear, minimal documentation.

Rules:
- Only describe what is explicitly shown.
- No assumptions or inferred processes.
- No duplicated explanations.
- Keep language concise and operational.

OUTPUT FORMAT (follow exactly):

--------------------------------
1. IMAGE SUMMARY
--------------------------------
- Image type:
- Orientation:
- Primary purpose:

--------------------------------
2. VISIBLE LABELS
--------------------------------
List all readable labels, titles, and annotations exactly as shown in the image.

--------------------------------
3. WORKFLOW (step-by-step)
--------------------------------
Represent the diagram as an ordered process.
- Use numbered steps
- Preserve decision points and loops
- Keep naming consistent with the diagram
- Only include steps that are explicitly shown

--------------------------------
4. GOVERNING RULES
--------------------------------
Translate the diagram into short, enforceable rules.
- One sentence per rule
- Imperative form
- Derived directly from the diagram
- Suitable for documentation and standards

--------------------------------
5. WHAT IS NOT DEFINED
--------------------------------
List anything that is missing, ambiguous, or not defined in the diagram.
Do NOT resolve these gaps—only document them.

--------------------------------
6. TEXT-ONLY FLOW
--------------------------------
Provide a concise ASCII or linear text version of the diagram flow.
This should be readable without the image.`;

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
};

function getMime(imagePath: string): string {
  return MIME[path.extname(imagePath).toLowerCase()] ?? "image/jpeg";
}

export async function analyzeImage(imagePath: string): Promise<string> {
  console.log("[Analyze] Step 1: OCR with GCP Vision");
  const ocrText = await ocrImage(imagePath, false).catch(() => "No text detected.");
  console.log("[Analyze] Step 2: Sending image + OCR to OpenRouter for diagram analysis");
  const buf = await fs.readFile(imagePath);
  const base64 = buf.toString("base64");
  const mime = getMime(imagePath);

  const enhancedPrompt = `${PROMPT}

ADDITIONAL CONTEXT - OCR Text Extracted:
${ocrText}

Use the OCR text above to help identify labels and text in the diagram, but analyze the visual structure from the image itself.`;

  const content = await chat([
    {
      role: "user",
      content: [
        { type: "text", text: enhancedPrompt },
        { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
      ],
    },
  ]);

  return content ?? "Analysis failed.";
}
