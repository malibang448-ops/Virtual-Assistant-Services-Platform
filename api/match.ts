import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleMatchRequest } from "./lib/match";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, type, voiceDataMimeType, voiceDataBase64 } = req.body;
  if (!query && !voiceDataBase64) {
    return res.status(400).json({ error: "Request query or audio attachment is required" });
  }

  try {
    const result = await handleMatchRequest(query, type, voiceDataMimeType, voiceDataBase64);
    res.status(200).json(result);
  } catch (error) {
    console.error("Assistant matching failed:", error);
    res.status(500).json({ error: "Intelligence match engine encountered a state failure" });
  }
}
