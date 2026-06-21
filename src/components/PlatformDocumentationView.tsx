import React, { useState } from "react";
import { Cpu, FileText, Database, Users } from "lucide-react";

export default function PlatformDocumentationView() {
  const [activeDocTab, setActiveDocTab] = useState<"algorithm" | "maintenance" | "client" | "agent">("algorithm");

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-blue-400 uppercase tracking-widest text-[10px] font-bold font-mono tracking-wider block mb-1">Knowledge Hub</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          System Documentation & Manuals
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Comprehensive review of Vesta's modern NLP parsing matching logic, server rules, and administrator guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1.5 shrink-0">
          <button
            onClick={() => setActiveDocTab("algorithm")}
            className={`w-full text-left text-xs p-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeDocTab === "algorithm" ? "bg-blue-500/10 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>AI Match Logic</span>
          </button>

          <button
            onClick={() => setActiveDocTab("maintenance")}
            className={`w-full text-left text-xs p-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeDocTab === "maintenance" ? "bg-blue-500/10 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>System Maintenance</span>
          </button>

          <button
            onClick={() => setActiveDocTab("client")}
            className={`w-full text-left text-xs p-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeDocTab === "client" ? "bg-blue-500/10 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Client Manual</span>
          </button>

          <button
            onClick={() => setActiveDocTab("agent")}
            className={`w-full text-left text-xs p-3 rounded-xl font-medium transition flex items-center gap-2 ${
              activeDocTab === "agent" ? "bg-blue-500/10 text-blue-400 font-bold border-l-2 border-blue-500" : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Agent Handbook</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="md:col-span-3 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
          {/* Doc: Alogorithm */}
          {activeDocTab === "algorithm" && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>AI Matching Algorithm Standards</span>
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                Vesta deploys high-fidelity intent mapping utilizing modern LLM models. The processing routing occurs exclusively on the backend server, shielding sensitive credentials.
              </p>

              <h4 className="font-display font-medium text-xs text-slate-200 pt-2 uppercase">Execution Pipeline:</h4>
              <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2 leading-relaxed">
                <li>
                  <strong>Ingress:</strong> Client records vocal inputs (WebM 16kHz PCM stream) or types details.
                </li>
                <li>
                  <strong>multimodal analysis:</strong> The server-side code triggers Gemini. If audio resides in the body, it uses multimodal parameters directly to extract transcribed objectives.
                </li>
                <li>
                  <strong>Constraint Ranking:</strong> Identifies service match and priorities, filters core team by:
                  <div className="bg-slate-950 p-3 text-[10px] font-mono rounded-lg border border-slate-800 text-blue-400 mt-1 font-semibold leading-relaxed">
                    MATCH_STRENGTH = (Agent.skills intersect Extracted.skills) * Availability * (1 - (CurrentLoad / MaxCapacity))
                  </div>
                </li>
                <li>
                  <strong>Lock Gate:</strong> If optimal match has zero capacity, the algorithmic router selects overlapping specialists, updates persistent catalogs, and maps unique links.
                </li>
              </ol>
            </div>
          )}

          {/* Doc: Maintenance */}
          {activeDocTab === "maintenance" && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span>System Administration & Maintenance</span>
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                Vesta uses a self-contained, zero-coldstart database store loaded on boot. This ensures maximum efficiency and speeds, achieving a LCP score sub-300ms.
              </p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4.5 text-xs text-amber-300 leading-relaxed">
                <strong>Data File:</strong> Seed databases are loaded from and persistent to <code>/src/data_store.json</code>. You can back up this file to copy configurations securely.
              </div>

              <h4 className="font-display font-medium text-xs text-slate-200 pt-2 uppercase">Troubleshooting Scenarios:</h4>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <li>
                  <strong>"Missing API key error":</strong> Ensure your environment configuration file has <code>GEMINI_API_KEY</code> defined. If absent, the server fails gracefully into local keyword match matching rules.
                </li>
                <li>
                  <strong>Clearing Storage:</strong> Delete <code>/src/data_store.json</code> and restart the development server. This triggers automatic re-seeding of default assistants and services catalog.
                </li>
              </ul>
            </div>
          )}

          {/* Doc: Client Manual */}
          {activeDocTab === "client" && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Client Workspace Guide</span>
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                Welcome to Vesta. Follow these three steps to successfully locate, lock down, and collaborate with your matched human agent:
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-slate-955/65 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">1. Run the matcher</h4>
                  <p className="text-[11px] text-slate-400">Go to AI matching portal. Speak or write out your exact needs. Let the system process your objectives.</p>
                </div>
                <div className="bg-slate-955/65 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">2. Secure Matched Link</h4>
                  <p className="text-[11px] text-slate-400">Never lose the matching secure link! The SSL gate is authenticated. It unlocks chat buffers and direct hiring structures.</p>
                </div>
                <div className="bg-slate-955/65 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">3. Arrange Kickoffs</h4>
                  <p className="text-[11px] text-slate-400">Coordinate and select consultation times. You can share assets and run WebRTC direct video meetings inside the hub.</p>
                </div>
              </div>
            </div>
          )}

          {/* Doc: Agent Guidelines */}
          {activeDocTab === "agent" && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Human Assistants Standard Operations</span>
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                Guidelines for agents profiled on Vesta:
              </p>

              <h4 className="font-display font-medium text-xs text-slate-200 uppercase pt-2">Daily SLAs:</h4>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-2 leading-relaxed">
                <li>
                  Maintain real-time capacity loads inside the Admin console. Overrunning capacity prompts routing overrides to secure high service quality.
                </li>
                <li>
                  Check secure private direct link chats daily. Unanswered client leads can decrease profile visibility ratings.
                </li>
                <li>
                  Conduct 30-min introduction meetings using the WebRTC secure line features directly in-app, aligning parameters before contract starts.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
