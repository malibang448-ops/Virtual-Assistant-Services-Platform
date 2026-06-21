import React, { useState, useRef } from "react";
import { ServiceOffering, Agent } from "../types";
import { Brain, Mic, Square, Sparkles, UserCheck, ShieldCheck, Copy, ArrowRight, Loader, FileText } from "lucide-react";

interface RequestPortalViewProps {
  onActivateMatch: (token: string, agentName: string, agentId: string) => void;
}

export default function RequestPortalView({ onActivateMatch }: RequestPortalViewProps) {
  const [inputText, setInputText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  
  // Voice Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Match Result state
  const [matchResult, setMatchResult] = useState<{
    success: boolean;
    service: ServiceOffering;
    agent: Agent;
    reasoning: string;
    directLink: string;
    token: string;
  } | null>(null);

  // Quick testing templates
  const presets = [
    { title: "Zendesk CX Setup", query: "Optimize our customer ticketing. I need someone competent in Zendesk trigger macros and email crisis management." },
    { title: "SaaS Zapier Integrations", query: "I need help connecting our HubSpot CRM to Slack alerts and syncing lead entries in databases." },
    { title: "Latin Marketing Copy", query: "Drafting engaging weekly newsletter campaigns and providing complete bilingual English-Spanish copy translations." }
  ];

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);

    } catch (e) {
      alert("Microphone capture disabled or unavailable: " + e);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Helper utility converting blob to base64
  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Run Matchmaking algorithm
  const handleMatchRequest = async (useVoice: boolean) => {
    if (!inputText.trim() && !recordedBlob && useVoice === false) {
      alert("Please provide text requirements or record voice capture first");
      return;
    }

    setIsMatching(true);
    setMatchResult(null);

    try {
      let body: any = {};

      if (useVoice && recordedBlob) {
        console.log("Encoding audio blob to base64 base stream");
        const b64 = await convertBlobToBase64(recordedBlob);
        body = {
          type: "voice",
          voiceDataMimeType: "audio/webm",
          voiceDataBase64: b64
        };
      } else {
        body = {
          type: "text",
          query: inputText
        };
      }

      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const result = await res.json();
        setMatchResult(result);
        setRecordedBlob(null); // Reset recording
      } else {
        alert("The intelligence gateway failed to parse match rules. Try simpler terms.");
      }
    } catch (err) {
      console.error("Match server error", err);
      alert("Error contacting the matchmaking service node.");
    } finally {
      setIsMatching(false);
    }
  };

  const copyUrlToClipboard = () => {
    if (matchResult) {
      const fullUrl = `${window.location.origin}${matchResult.directLink}`;
      navigator.clipboard.writeText(fullUrl);
      alert("Matched Gateway Link Copied Securely to Clipboard!");
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Intelligent AI Matching Assistant
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Submit your requirements in natural language. Our model transcribes vocal commands, maps technical service tags, and locks a secure direct gateway to your qualified trainer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Input parameters panel */}
        <div className="md:col-span-2">
          {!matchResult ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h3 className="font-display font-medium text-xs text-slate-400 uppercase tracking-widest mb-4">Input Specifications</h3>

              {/* Text Area Input */}
              <div className="mb-4">
                <textarea
                  placeholder="Describe your exact assistant needs (e.g., 'I need help designing my startup social graphics on Canva and organizing monthly retainer schedules')..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 text-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 tracking-wide leading-relaxed placeholder-slate-600"
                  disabled={isMatching || isRecording}
                />
              </div>

              {/* Voice Attachment Capture area */}
              <div className="mb-6 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-semibold text-slate-400 font-display">VOICE INPUT CAPTURE</span>
                  {recordDuration > 0 && (
                    <span className="text-xs font-mono font-medium text-rose-400 animate-pulse">
                      Recording: 0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isMatching}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-display text-xs font-semibold py-2 px-4 rounded-lg transition border border-slate-700"
                    >
                      <Mic className="w-3.5 h-3.5 text-blue-400" />
                      <span>Record Voice Request</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-rose-600 text-white font-display text-xs font-bold py-2 px-4 rounded-lg animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {recordedBlob && !isRecording && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-400 font-semibold font-display">✓ Voice recorded</span>
                      <button
                        onClick={() => handleMatchRequest(true)}
                        className="text-xs bg-blue-600 text-white py-2 px-3.5 rounded-lg font-bold font-display hover:bg-blue-500 transition"
                      >
                        Match from voice
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preset suggestion tabs */}
              <div className="mb-6">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5 font-bold">Quick Sandbox Examples:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {presets.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => setInputText(p.query)}
                      className="text-left text-[11px] p-2.5 border border-slate-800 rounded-lg hover:border-blue-500 bg-slate-950/40 hover:bg-slate-900/40 transition"
                    >
                      <div className="font-bold text-slate-200 mb-0.5">{p.title}</div>
                      <div className="text-slate-500 line-clamp-1 truncate">{p.query}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Matching Submission Call */}
              <button
                type="button"
                onClick={() => handleMatchRequest(false)}
                disabled={isMatching || isRecording || !inputText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 font-display text-xs font-bold text-white py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isMatching ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Analyzing intents and verifying capacity load stats...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Initialize AI Intent Matchmaking</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Successful AI Match output matching guidelines */
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-blue-500 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-mono uppercase font-bold py-1 px-4 rounded-bl-xl tracking-wider leading-none">
                Optimal Match Reserved
              </div>

              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold mb-4 font-mono uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Confidential Match Log Generated</span>
              </div>

              <div className="border-b border-slate-805 pb-4 mb-4">
                <span className="text-[10px] text-slate-550 font-mono block uppercase">ASSIGNED CATEGORY</span>
                <h3 className="font-display font-bold text-lg text-white">{matchResult.service.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{matchResult.service.description}</p>
              </div>

              {/* Matched Agent Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 mb-4.5">
                <span className="text-[10px] text-slate-500 font-mono block uppercase mb-2">MATCHED HUMAN SPECIALIST</span>
                <div className="flex items-center gap-3">
                  <img
                    src={matchResult.agent.avatar}
                    alt={matchResult.agent.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                  />
                  <div>
                    <h4 className="font-display font-semibold text-sm text-white">{matchResult.agent.name}</h4>
                    <p className="text-[11px] text-slate-400">{matchResult.agent.title}</p>
                  </div>
                </div>

                <div className="mt-3 bg-slate-950 p-3 border border-slate-850 rounded-xl leading-relaxed text-xs italic text-slate-300">
                  "{matchResult.reasoning}"
                </div>
              </div>

              {/* Unique Secure token gateway url block */}
              <div className="bg-blue-950/40 border border-blue-900/50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between text-[10px] font-mono mb-2 uppercase text-blue-300 font-bold">
                  <span>Secure Gated Access Link</span>
                  <span>SSL encrypted</span>
                </div>
                <div className="bg-slate-950 px-3 py-2 rounded-xl text-xs text-slate-300 flex items-center justify-between border border-slate-800 font-mono shrink-0">
                  <span className="truncate max-w-[200px] select-all text-blue-300">{window.location.origin}{matchResult.directLink}</span>
                  <button onClick={copyUrlToClipboard} className="text-blue-400 hover:text-white font-bold shrink-0 ml-2 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  * This link is unique and activates raw Direct Hire, real-time consultation messaging, and direct booking clearances on load.
                </p>
              </div>

              {/* Activate Workspaces */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onActivateMatch(matchResult.token, matchResult.agent.name, matchResult.agent.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-display text-xs font-bold py-3 px-4 rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow shadow-blue-500/10"
                >
                  <span>Connect Secure Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMatchResult(null)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold px-4 rounded-xl transition"
                >
                  Reset Match AI
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informative tips column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-display font-medium text-xs text-slate-400 uppercase tracking-wider mb-3">Matching Metrics</h3>
            <ul className="space-y-3 font-mono text-[11px] text-slate-300 animate-fade">
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span>Model Alias:</span>
                <span className="font-semibold text-blue-400">gemini-3.5-flash</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span>Success Rate:</span>
                <span className="font-semibold text-blue-400">95%+ verified</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span>Response SLA:</span>
                <span className="font-semibold text-blue-400">&lt; 1,200ms</span>
              </li>
              <li className="flex justify-between">
                <span>Data Protection:</span>
                <span className="font-semibold text-blue-400">SSL Secured</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-950/20 border border-blue-900/40 rounded-2xl p-5">
            <h4 className="font-display text-blue-300 font-bold text-xs uppercase tracking-wide mb-2">Voice Matching Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vesta AI lets you input requirements straight from your mic stream. Try speaking: <em>"I need a technical operations leader to integrate HubSpot APIs and verify landing page connections."</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
