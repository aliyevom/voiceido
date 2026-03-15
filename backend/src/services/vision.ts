import vision from "@google-cloud/vision";
import { config } from "../config.js";
import fs from "fs/promises";

let client: vision.ImageAnnotatorClient | null = null;

function getClient(): vision.ImageAnnotatorClient {
  if (!client) {
    client = config.gcpCredentialsPath
      ? new vision.ImageAnnotatorClient({ keyFilename: config.gcpCredentialsPath })
      : new vision.ImageAnnotatorClient(); // Use Application Default Credentials on GCE/Cloud
  }
  return client;
}

export async function ocrImage(imagePath: string, preserveLayout = false): Promise<string> {
  const c = getClient();
  const content = await fs.readFile(imagePath);
  console.log("[Vision] Calling GCP Vision API", preserveLayout ? "(document/layout)" : "(text detection)");
  const [result] = preserveLayout
    ? await c.documentTextDetection({ image: { content } })
    : await c.textDetection({ image: { content } });

  const err = (result as { error?: { message?: string } }).error;
  if (err?.message) throw new Error(`Vision API: ${err.message}`);

  if (preserveLayout && result.fullTextAnnotation?.text) {
    return result.fullTextAnnotation.text;
  }
  const det = result.textAnnotations?.[0];
  return det?.description ?? "";
}
