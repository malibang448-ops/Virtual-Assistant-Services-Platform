import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser limits to allow for base64 sound files
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Import our shared DB logic
import { getDbState, setDbState } from "./src/lib/db";
import { handleMatchRequest } from "./src/lib/match";

// Re-add API endpoints for local server (so npm run dev still works locally!)
app.get("/api/services", (req, res) => {
  const db = getDbState();
  res.json(db.services);
});
app.get("/api/agents", (req, res) => {
  const db = getDbState();
  res.json(db.agents);
});
app.get("/api/agents/:id", (req, res) => {
  const db = getDbState();
  const agent = db.agents.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  res.json(agent);
});
app.post("/api/agents/:id/status", (req, res) => {
  const { isAvailable, currentLoad, maxCapacity } = req.body;
  const db = getDbState();
  const index = db.agents.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Agent not found" });
  }
  const newAgents = [...db.agents];
  if (isAvailable !== undefined) newAgents[index] = { ...newAgents[index], isAvailable };
  if (currentLoad !== undefined) newAgents[index] = { ...newAgents[index], currentLoad: Math.min(newAgents[index].maxCapacity, Number(currentLoad)) };
  if (maxCapacity !== undefined) newAgents[index] = { ...newAgents[index], maxCapacity: Number(maxCapacity) };
  setDbState({ agents: newAgents });
  res.json({ success: true, agent: newAgents[index] });
});
app.get("/api/bookings", (req, res) => {
  const db = getDbState();
  res.json(db.bookings);
});
app.post("/api/bookings", (req, res) => {
  const { agentId, serviceId, clientName, clientEmail, dateTime, notes } = req.body;
  if (!agentId || !clientName || !clientEmail || !dateTime) {
    return res.status(400).json({ error: "Required details missing" });
  }
  const db = getDbState();
  const agent = db.agents.find(a => a.id === agentId);
  const service = db.services.find(s => s.id === serviceId);
  const newBooking = {
    id: "bk_" + Math.random().toString(36).substring(2, 9),
    agentId,
    serviceId: serviceId || "direct-consultation",
    serviceName: service ? service.name : "Direct Consultation Session",
    agentName: agent ? agent.name : "Assigned Agent",
    clientName,
    clientEmail,
    dateTime,
    notes: notes || "",
    status: "scheduled" as const
  };
  const newAgents = [...db.agents];
  const agentIndex = newAgents.findIndex(a => a.id === agentId);
  if (agentIndex !== -1 && newAgents[agentIndex].currentLoad < newAgents[agentIndex].maxCapacity) {
    newAgents[agentIndex] = { ...newAgents[agentIndex], currentLoad: newAgents[agentIndex].currentLoad + 1 };
  }
  setDbState({ bookings: [...db.bookings, newBooking], agents: newAgents });
  res.status(201).json({ success: true, booking: newBooking });
});
app.get("/api/chats/:token", (req, res) => {
  const { token } = req.params;
  const db = getDbState();
  const chat = db.chats[token];
  if (!chat) {
    return res.status(201).json({ messages: [], active: false });
  }
  res.json(chat);
});
app.post("/api/chats/:token/messages", (req, res) => {
  const { token } = req.params;
  const { sender, content, file } = req.body;
  const db = getDbState();
  if (!db.chats[token]) {
    const matchingLog = db.matchLogs.find(l => l.directLinkToken === token);
    const agentId = matchingLog ? matchingLog.matchedAgentId : "agent-1";
    db.chats[token] = { token, agentId, messages: [], created: new Date().toISOString() };
  }
  const newMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    sender,
    content,
    timestamp: new Date().toISOString(),
    file
  };
  const newChatMessages = [...db.chats[token].messages, newMessage];
  const newChats = { ...db.chats, [token]: { ...db.chats[token], messages: newChatMessages } };

  if (sender === "client") {
    const agent = db.agents.find(a => a.id === db.chats[token].agentId);
    const agentFirstName = agent ? agent.name.split(" ")[0] : "Agent";
    let replyContent = `Hi! This is ${agentFirstName} here. Thank you for connecting through Vesta's Intelligent Matching portal. I have received your details! Let's arrange our kickoff consultation. Feel free to book direct in my scheduler or drop any files/templates here!`;
    if (content.toLowerCase().includes("pricing") || content.toLowerCase().includes("cost")) {
      replyContent = `Absolutely! I can take a look at your budget tier. Based on our match logs, we can coordinate our starter hours, standard retaining, or execute on an hourly scope. What works best for your initial scale?`;
    } else if (content.toLowerCase().includes("meeting") || content.toLowerCase().includes("call") || content.toLowerCase().includes("zoom")) {
      replyContent = `I am completely free during the available times listed on my calendar panel! Go ahead and select a slot in the Booking Scheduler block and we'll jump on a secure line right away.`;
    }
    setTimeout(() => {
      const currentDb = getDbState();
      const updatedChatMessages = [...currentDb.chats[token].messages, {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender: "agent" as const,
        content: replyContent,
        timestamp: new Date().toISOString()
      }];
      setDbState({ chats: { ...currentDb.chats, [token]: { ...currentDb.chats[token], messages: updatedChatMessages } } });
    }, 1500);
  }

  setDbState({ chats: newChats });
  res.json(newMessage);
});
app.get("/api/admin/stats", (req, res) => {
  const db = getDbState();
  res.json({ stats: calculateStats(db), logs: db.matchLogs, agents: db.agents });
});
app.post("/api/admin/override", (req, res) => {
  const { logId, newAgentId } = req.body;
  if (!logId || !newAgentId) {
    return res.status(400).json({ error: "Missing override variables" });
  }
  const db = getDbState();
  const logIndex = db.matchLogs.findIndex(l => l.id === logId);
  const agentExists = db.agents.some(a => a.id === newAgentId);
  if (logIndex === -1 || !agentExists) {
    return res.status(404).json({ error: "Match log or target agent missing" });
  }
  const newLogs = [...db.matchLogs];
  newLogs[logIndex] = { ...newLogs[logIndex], matchedAgentId: newAgentId };
  setDbState({ matchLogs: newLogs });
  res.json({ success: true, updatedLog: newLogs[logIndex] });
});
app.post("/api/match", async (req, res) => {
  const { query, type, voiceDataMimeType, voiceDataBase64 } = req.body;
  try {
    const result = await handleMatchRequest(query, type, voiceDataMimeType, voiceDataBase64);
    res.json(result);
  } catch (error) {
    console.error("Assistant matching failed:", error);
    res.status(500).json({ error: "Intelligence match engine encountered a state failure" });
  }
});

// Helper function for stats
function calculateStats(db: ReturnType<typeof getDbState>) {
  const activeCount = db.agents.filter(a => a.isAvailable).length;
  const totalMax = db.agents.reduce((acc, a) => acc + (a.isAvailable ? a.maxCapacity : 0), 0) || 1;
  const currentTotal = db.agents.reduce((acc, a) => acc + (a.isAvailable ? a.currentLoad : 0), 0);
  const rawUtil = Math.round((currentTotal / totalMax) * 100);
  const totalConfs = db.matchLogs.length || 1;
  const countHighConf = db.matchLogs.filter(l => l.confidenceScore >= 0.7).length;
  const successRate = Math.round((countHighConf / totalConfs) * 100) || 96;
  return {
    totalRequests: db.matchLogs.length,
    matchSuccessRate: Math.max(90, successRate),
    avgRating: 4.9,
    agentUtilisation: Math.min(100, Math.max(10, rawUtil)),
    activeAgentsCount: activeCount,
    totalServicesCount: db.services.length
  };
}

// Start server after connecting and binding
async function startServer() {
  // Vite integration as middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not on Vercel
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`=== Vesta Platform Express Server Running on http://0.0.0.0:${PORT} ===`);
    });
  }
}

startServer();

// Export app for Vercel
export default app;
