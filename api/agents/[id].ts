import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDbState } from "../lib/db";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const db = getDbState();
  const agent = db.agents.find(a => a.id === id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  res.status(200).json(agent);
}
