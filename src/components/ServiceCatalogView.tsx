import React, { useState } from "react";
import { ServiceOffering, Agent } from "../types";
import { Check } from "lucide-react";

interface ServiceCatalogViewProps {
  services: ServiceOffering[];
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  onOpenMatcher: () => void;
}

export default function ServiceCatalogView({
  services,
  agents,
  onSelectAgent,
  onOpenMatcher
}: ServiceCatalogViewProps) {
  const [activeTierIdx, setActiveTierIdx] = useState<Record<string, number>>({});

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intro section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-blue-400 uppercase tracking-widest text-[10px] font-bold font-mono tracking-wider block mb-3">Our Offerings</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Uncompromised Competencies
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Explore our system of modular, elite virtual assistant services. Each category is lead by a dedicated human specialist trained to assume the exact workload your startup or executive team demands.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={onOpenMatcher}
            className="bg-blue-600 text-white font-display font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/15"
          >
            Match My Exact Needs Now
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const leadAgent = agents.find((a) => a.id === service.assignedAgentId);
          const currentTierIdx = activeTierIdx[service.id] || 0;
          const currentTier = service.pricingTiers[currentTierIdx];

          return (
            <div
              key={service.id}
              className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 transition-all duration-300 hover:border-slate-750 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/5 cursor-default"
            >
              <div>
                {/* Header Icon + Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-bold shrink-0">
                    <span className="font-mono text-[10px] tracking-wider uppercase">{service.skillsRequired[0]}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono py-1 px-2.5 rounded-full">
                    Lead: {leadAgent ? leadAgent.name.split(" ")[0] : "Agent"}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-5 min-h-[40px]">
                  {service.description}
                </p>

                {/* Required Skill badges */}
                <div className="mb-6">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider mb-2">Verified Skillsets</span>
                  <div className="flex flex-wrap gap-1">
                    {service.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-400 font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interactive Tiers Selector */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 mb-6">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                    <span className="text-[10px] font-bold text-slate-500 font-display uppercase tracking-wider">PRICING TIERS</span>
                    <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-md">
                      {service.pricingTiers.map((tier, idx) => (
                        <button
                          key={tier.name}
                          onClick={() => setActiveTierIdx(prev => ({ ...prev, [service.id]: idx }))}
                          className={`text-[9px] px-2 py-1 rounded transition-all font-semibold uppercase cursor-pointer ${
                            currentTierIdx === idx
                              ? "bg-slate-850 text-blue-400 shadow-sm font-bold"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {tier.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 flex items-baseline gap-1">
                    <span className="text-xl font-bold font-display text-white">{currentTier.price}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{currentTier.period}</span>
                  </div>

                  <ul className="space-y-1.5">
                    {currentTier.features.map((feat) => (
                      <li key={feat} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lead Agent and triggers */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                {leadAgent && (
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={leadAgent.avatar}
                        alt={leadAgent.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-800"
                      />
                      <div className="leading-none">
                        <span className="text-xs font-semibold text-white block">{leadAgent.name}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5 block">{leadAgent.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 mr-1 text-[11px]">
                      <span className="text-amber-400">★ {leadAgent.rating}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onOpenMatcher}
                    className="text-[11px] text-center border border-slate-800 hover:border-slate-700 bg-slate-905 bg-slate-900/40 hover:bg-slate-800 text-slate-300 p-2.5 rounded-xl transition font-medium font-display cursor-pointer"
                  >
                    Custom Match AI
                  </button>
                  {leadAgent && (
                    <button
                      onClick={() => onSelectAgent(leadAgent.id)}
                      className="text-[11px] text-center bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition font-medium font-display shadow shadow-blue-500/10 cursor-pointer"
                    >
                      Hire & Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
