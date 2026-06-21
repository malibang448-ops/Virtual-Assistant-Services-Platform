import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDbState } from "../src/lib/db";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDbState();
  res.status(200).json(db.services);
}
