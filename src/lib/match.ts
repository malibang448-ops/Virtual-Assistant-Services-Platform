import { GoogleGenAI } from "@google/genai";
import { getDbState, setDbState } from "./db";
import type { Agent, ServiceOffering } from "../types";

export async function handleMatchRequest(query: string, type?: string, voiceDataMimeType?: string, voiceDataBase64?: string) {
  const apiKeyExist = !!process.env.GEMINI_API_KEY;
  let matchPrediction: any = null;
  let finalQueryText = query;

  if (apiKeyExist) {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const db = getDbState();
    const contextPrompt = `
      You are an expert matchmaking system for Vesta, a high-end Virtual Assistant agency.
      Our available Services are:
      ${JSON.stringify(db.services.map(s => ({ id: s.id, name: s.name, description: s.description, requiredSkills: s.skillsRequired, assignedAgentId: s.assignedAgentId })), null, 2)}

      Our current Human Assistants and their current status:
      ${JSON.stringify(db.agents.map(a => ({ id: a.id, name: a.name, bio: a.bio, skills: a.skills, rating: a.rating, maxCapacity: a.maxCapacity, currentLoad: a.currentLoad, isAvailable: a.isAvailable })), null, 2)}

      Client Input Query: "${finalQueryText}"

      YOUR GOAL:
      Identify the most appropriate Service category that matches the client's needs.
      Determine the assigned agent of that service. If the assigned agent's rating, availability, or load makes another agent with overlapping skills a better candidate, you may pick an alternative agent, but prioritize matching the service's assignedAgentId first. Ensure the matched agent is currently active/available (isAvailable is true) and has capacity (currentLoad < maxCapacity).

      Return a strict JSON response containing the properties:
      1. 'matchedServiceId': string, one of the available service IDs.
      2. 'matchedAgentId': string, one of the agent IDs.
      3. 'confidenceScore': number, value between 0.0 and 1.0.
      4. 'skillsExtracted': array of strings containing keys or technologies extracted from the query.
      5. 'reasoningText': string, a warm summary explaining the credentials of this matched person.

      Do not include any styling, markdown code block identifiers like \`\`\`json, or outer text wrapper. Return raw JSON.
    `;

    let response;
    if (type === "voice" && voiceDataBase64 && voiceDataMimeType) {
      const voicePart = { inlineData: { mimeType: voiceDataMimeType, data: voiceDataBase64 } };
      const voicePromptPart = {
        text: `
          Analyze this voice recording from a client looking for a virtual assistant.
          1. Transcribe/determine what assistance services they need.
          2. Match them based on the same agency dataset principles below.

          Vesta Services catalog:
          ${JSON.stringify(db.services.map(s => ({ id: s.id, name: s.name, description: s.description, requiredSkills: s.skillsRequired })), null, 2)}

          Vesta Agents:
          ${JSON.stringify(db.agents.map(a => ({ id: a.id, name: a.name, bio: a.bio, skills: a.skills, isAvailable: a.isAvailable, currentLoad: a.currentLoad })), null, 2)}

          Produce a JSON output containing:
          - 'transcribedText': string of the client voice transcription.
          - 'matchedServiceId': matched service id.
          - 'matchedAgentId': matched agent id.
          - 'confidenceScore': number (0.0 to 1.0).
          - 'skillsExtracted': array.
          - 'reasoningText': string explanation.
        `
      };
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [voicePart, voicePromptPart] },
        config: { responseMimeType: "application/json" }
      });
      const textOutput = response.text || "";
      console.log("Voice analysis output:", textOutput);
      const parsed = JSON.parse(textOutput.trim());
      finalQueryText = parsed.transcribedText || "Audio Voice Submission Request";
      matchPrediction = {
        matchedServiceId: parsed.matchedServiceId,
        matchedAgentId: parsed.matchedAgentId,
        confidenceScore: parsed.confidenceScore || 0.9,
        skillsExtracted: parsed.skillsExtracted || [],
        reasoningText: parsed.reasoningText || ""
      };
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contextPrompt,
        config: { responseMimeType: "application/json" }
      });
      const textOutput = response.text || "";
      console.log("Text match output:", textOutput);
      matchPrediction = JSON.parse(textOutput.trim());
    }
  }

  // Fallback matching if no API key
  const db = getDbState();
  if (!matchPrediction?.matchedServiceId || !matchPrediction?.matchedAgentId) {
    const normalizedQuery = finalQueryText.toLowerCase();
    let matchedServiceId = "admin-support";

    if (normalizedQuery.includes("wordpress") || normalizedQuery.includes("zapier") || normalizedQuery.includes("html") || normalizedQuery.includes("api") || normalizedQuery.includes("website") || normalizedQuery.includes("tech") || normalizedQuery.includes("shopify")) {
      matchedServiceId = "tech-ops";
    } else if (normalizedQuery.includes("customer") || normalizedQuery.includes("ticket") || normalizedQuery.includes("zendesk") || normalizedQuery.includes("support") || normalizedQuery.includes("chat") || normalizedQuery.includes("email ticket")) {
      matchedServiceId = "customer-support";
    } else if (normalizedQuery.includes("instagram") || normalizedQuery.includes("linkedin") || normalizedQuery.includes("social") || normalizedQuery.includes("marketing") || normalizedQuery.includes("canva") || normalizedQuery.includes("facebook")) {
      matchedServiceId = "digital-marketing";
    } else if (normalizedQuery.includes("lead") || normalizedQuery.includes("outreach") || normalizedQuery.includes("sales") || normalizedQuery.includes("prospect") || normalizedQuery.includes("cold email")) {
      matchedServiceId = "sales-leads";
    } else if (normalizedQuery.includes("write") || normalizedQuery.includes("spanish") || normalizedQuery.includes("translate") || normalizedQuery.includes("copy") || normalizedQuery.includes("blog") || normalizedQuery.includes("article")) {
      matchedServiceId = "content-creation";
    }

    const targetService = db.services.find(s => s.id === matchedServiceId) || db.services[0];
    const matchedAgentId = targetService.assignedAgentId;
    const skillsExtracted = targetService.skillsRequired.slice(0, 3);
    matchPrediction = {
      matchedServiceId,
      matchedAgentId,
      confidenceScore: 0.85,
      skillsExtracted,
      reasoningText: `Our rule matches determined you require assistance in ${targetService.name}. We connected you directly with ${db.agents.find(a => a.id === matchedAgentId)?.name || "our assigned agent"} who holds verified credentials.`
    };
  }

  // Find best available agent
  let finalAgent = db.agents.find(a => a.id === matchPrediction.matchedAgentId && a.isAvailable && a.currentLoad < a.maxCapacity);
  if (!finalAgent) {
    finalAgent = db.agents.find(a => a.isAvailable && a.currentLoad < a.maxCapacity) || db.agents[0];
  }

  // Create match log
  const directLinkToken = "vesta_token_" + Math.random().toString(36).substring(2, 10) + "_" + Math.random().toString(36).substring(2, 6);
  const newLog = {
    id: "req_" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    queryText: finalQueryText,
    queryType: type || "text",
    matchedServiceId: matchPrediction.matchedServiceId || "admin-support",
    matchedAgentId: finalAgent.id,
    confidenceScore: matchPrediction.confidenceScore || 0.95,
    skillsExtracted: matchPrediction.skillsExtracted || ["Administrative Control"],
    agentLoadAfterMatch: `${finalAgent.currentLoad}/${finalAgent.maxCapacity}`,
    directLinkToken
  };

  // Initialize chat
  const newChat = {
    token: directLinkToken,
    agentId: finalAgent.id,
    messages: [
      {
        id: "msg_init_1",
        sender: "agent" as const,
        content: `Hello! I am ${finalAgent.name}. Based on the Vesta AI System analysis, I was matched to support you with your specialized service needs. Let's make an impact together!`,
        timestamp: new Date().toISOString()
      }
    ],
    created: new Date().toISOString()
  };

  // Save new state
  const newDb = {
    ...db,
    matchLogs: [...db.matchLogs, newLog],
    chats: { ...db.chats, [directLinkToken]: newChat }
  };
  setDbState(newDb);

  return {
    success: true,
    logEntry: newLog,
    service: db.services.find(s => s.id === newLog.matchedServiceId),
    agent: finalAgent,
    directLink: `/match/verify?token=${directLinkToken}`,
    token: directLinkToken,
    reasoning: matchPrediction.reasoningText || `Highly recommended match based on verified competencies in ${matchPrediction.skillsExtracted ? matchPrediction.skillsExtracted.join(', ') : 'this category'}.`
  };
}
