import React, { useState, useEffect } from "react";
import { Agent, ClientRequestLog, PlatformStats, ServiceOffering } from "../types";
import { Activity, ShieldAlert, Cpu, Hammer, TrendingUp, AlertTriangle, ToggleLeft, ToggleRight, Settings } from "lucide-react";

interface AdminDashboardViewProps {
  agents: Agent[];
  services: ServiceOffering[];
  onRefreshData: () => void;
}

export default function AdminDashboardView({
  agents,
  services,
  onRefreshData
}: AdminDashboardViewProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [logs, setLogs] = useState<ClientRequestLog[]>([]);
  const [isUpdatingAgentId, setIsUpdatingAgentId] = useState<string | null>(null);
  const [overridingLogId, setOverridingLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to load admin stats node", e);
    }
  };

  const handleUpdateAgentStatus = async (agentId: string, payload: Partial<Agent>) => {
    setIsUpdatingAgentId(agentId);
    try {
      const response = await fetch(`/api/agents/${agentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchAdminData();
        onRefreshData();
      }
    } catch (err) {
      console.error("Capacity modification failed", err);
    } finally {
      setIsUpdatingAgentId(null);
    }
  };

  const handleManualOverride = async (logId: string, newAgentId: string) => {
    setOverridingLogId(logId);
    try {
      const response = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, newAgentId })
      });
      if (response.ok) {
        await fetchAdminData();
        onRefreshData();
      }
    } catch (err) {
      console.error("Assignment override error", err);
    } finally {
      setOverridingLogId(null);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intro Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-blue-400 uppercase tracking-widest text-xs font-bold font-mono block mb-1">Administrative Node</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Agency Operations Console
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real-time control node to audit AI log extractions, alter capacities, and override matching assignments.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-display font-medium py-2 px-4 rounded-lg transition"
        >
          Force Stats Sync
        </button>
      </div>

      {/* Global telemetry block */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold">Total AI Requests</span>
              <span className="font-display text-xl font-bold text-white">{stats.totalRequests} logs</span>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400 opacity-80" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold">Match Success SLA</span>
              <span className="font-display text-xl font-bold text-blue-400">{stats.matchSuccessRate}% accuracy</span>
            </div>
            <Cpu className="w-8 h-8 text-cyan-400 opacity-80" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold">Overall Utilisation</span>
              <span className="font-display text-xl font-bold text-white">{stats.agentUtilisation}% loaded</span>
            </div>
            <Activity className="w-8 h-8 text-purple-400 opacity-80" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-bold">Active Core Team</span>
              <span className="font-display text-xl font-bold text-white">{stats.activeAgentsCount} assistants</span>
            </div>
            <Hammer className="w-8 h-8 text-amber-500 opacity-80" />
          </div>
        </div>
      )}

      {/* Grid: Left column (Agent Capacity Control) / Right column (Audits Logs & Overrides) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core human assistants load gating */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5">
            <h3 className="font-display font-medium text-white text-sm mb-1.5">Core Capacity Controls</h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-5">
              Instantly alter load indicators, state ceilings, and toggles. In-memory changes persist live.
            </p>

            <div className="space-y-5">
              {agents.map((agent) => {
                return (
                  <div key={agent.id} className="border-b border-slate-800 pb-4 last:border-b-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={agent.avatar} alt={agent.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div>
                          <span className="text-xs font-semibold text-white block leading-none">{agent.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{agent.id.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Availability status click-toggle */}
                      <button
                        onClick={() => handleUpdateAgentStatus(agent.id, { isAvailable: !agent.isAvailable })}
                        disabled={isUpdatingAgentId === agent.id}
                        className="text-xs focus:outline-none transition-opacity"
                        title="Toggle accepting status"
                      >
                        {agent.isAvailable ? (
                          <span className="text-[9px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold leading-normal uppercase">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] text-rose-450 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold leading-normal uppercase">
                            PAUSED
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Numeric workload control details */}
                    <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 uppercase tracking-widest block mb-1">LOAD:</span>
                        <input
                          type="number"
                          value={agent.currentLoad}
                          min={0}
                          max={agent.maxCapacity}
                          onChange={(e) => handleUpdateAgentStatus(agent.id, { currentLoad: Number(e.target.value) })}
                          disabled={isUpdatingAgentId === agent.id}
                          className="w-full bg-slate-950 border border-slate-800 outline-none p-1 text-slate-200 rounded font-bold text-center focus:border-blue-550"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase tracking-widest block mb-1">CEILING:</span>
                        <input
                          type="number"
                          value={agent.maxCapacity}
                          min={1}
                          onChange={(e) => handleUpdateAgentStatus(agent.id, { maxCapacity: Number(e.target.value) })}
                          disabled={isUpdatingAgentId === agent.id}
                          className="w-full bg-slate-950 border border-slate-800 outline-none p-1 text-slate-200 rounded font-bold text-center focus:border-blue-550"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NLP match outputs & override records logs */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5">
            <h3 className="font-display font-medium text-white text-sm mb-1.5">AI Matching Logs & Override Center</h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-5">
              Inspect exactly how our modern NLP model interpreted customer statements, and reassign assistants if capacity shifts demand override.
            </p>

            {logs.length === 0 ? (
              <div className="text-center py-10 font-mono text-xs text-slate-500">
                AI matchmaking pipeline has zero transaction logs. Try matching some needs first.
              </div>
            ) : (
              <div className="space-y-4">
                {[...logs].reverse().map((log) => {
                  const currentAgent = agents.find(a => a.id === log.matchedAgentId);
                  const currentService = services.find(s => s.id === log.matchedServiceId);

                  return (
                    <div
                      key={log.id}
                      className="border border-slate-800 rounded-xl p-4 bg-slate-950/70 hover:bg-slate-900/40 transition"
                    >
                      {/* Log details bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-802 pb-2.5 mb-2.5 font-mono text-[10px]">
                        <span className="font-bold text-slate-400">ID: {log.id}</span>
                        <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          log.confidenceScore >= 0.8
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-550 mr-1 font-medium"
                        }`}>
                          NLP CONFIDENCE: {Math.round(log.confidenceScore * 100)}%
                        </span>
                      </div>

                      {/* Client raw query text */}
                      <div className="mb-3">
                        <span className="text-[9px] text-slate-550 font-mono uppercase block mb-0.5">Vocal/Text Client Query:</span>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{log.queryText}"
                        </p>
                      </div>

                      {/* Matches stats details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-[11px]">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Service Match:</span>
                          <span className="font-semibold text-white block">{currentService ? currentService.name : log.matchedServiceId}</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Skills Extracted:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {log.skillsExtracted.map((tag) => (
                              <span key={tag} className="bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-400 py-0.5 px-1.5 font-mono leading-none">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Manual Assignment Override Gating */}
                      <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <div className="flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                          <span className="text-xs text-slate-350">Assigned Partner: <strong className="text-white">{currentAgent ? currentAgent.name : log.matchedAgentId}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono font-bold leading-none shrink-0">OVERRIDE ASSIGNMENT:</span>
                          <select
                            value={log.matchedAgentId}
                            onChange={(e) => handleManualOverride(log.id, e.target.value)}
                            disabled={overridingLogId === log.id}
                            className="bg-slate-900 border border-slate-800 text-slate-300 rounded p-1 text-[11px] font-mono outline-none focus:border-blue-500 cursor-pointer text-xs"
                          >
                            {agents.map(a => (
                              <option key={a.id} value={a.id} className="bg-slate-950 text-slate-300">{a.name} ({a.currentLoad}/{a.maxCapacity})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
