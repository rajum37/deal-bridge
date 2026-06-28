import { useEffect, useRef, useState, useCallback } from "react";
import { useScreen } from "@/contexts/ScreenContext";
import { ArrowRight, Bot, Play, Send, User } from "lucide-react";
import { getMockAiResponse } from "@/lib/mockAiResponses";
import { extractDataFromMessage } from "@/lib/dataExtractor";

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "ai" | "user";
  displayText: string;
  done: boolean;
}

interface ExtractedField {
  key: string;
  label: string;
  value: string;
  color: string;
  fresh: boolean;
}

// ── Demo script ───────────────────────────────────────────────────────────────
const DEMO_STEPS: {
  role: "user";
  text: string;
  extract: Partial<Record<string, string>>;
}[] = [
  { role: "user", text: "We need an AI voice-and-chat workflow for a healthcare clinic", extract: { useCase: "Healthcare Voice/Chat", companyType: "Clinic" } },
  { role: "user", text: "About 15–20 people on the team", extract: { teamSize: "15–20 people" } },
  { role: "user", text: "Urgent — we want a pilot running in 6 weeks", extract: { urgency: "High — 6 week pilot" } },
  { role: "user", text: "Yes, we're running on Epic EHR", extract: { integration: "EHR — Epic" } },
  { role: "user", text: "$50K–100K per year budget", extract: { budget: "$50K–100K / year" } },
];

// ── Field config ──────────────────────────────────────────────────────────────
const FIELD_CONFIG: { key: string; label: string; color: string; emptyLabel: string }[] = [
  { key: "useCase",     label: "Use Case",         color: "#00d4ff", emptyLabel: "Listening…" },
  { key: "companyType", label: "Company Type",      color: "#00d4ff", emptyLabel: "Listening…" },
  { key: "teamSize",    label: "Team Size",         color: "#00d4ff", emptyLabel: "Listening…" },
  { key: "urgency",     label: "Urgency",           color: "#f59e0b", emptyLabel: "Listening…" },
  { key: "integration", label: "Integration Needs", color: "#00d4ff", emptyLabel: "Listening…" },
  { key: "budget",      label: "Budget",            color: "#a78bfa", emptyLabel: "Listening…" },
];

const OPENING = "Hi! I'm your AI COO. Tell me about your use case and I'll qualify your needs and route you to the right specialist.";

const SYSTEM_PROMPT = `You are DealBridge AI COO — a concise, warm, and professional AI sales assistant that qualifies inbound leads.
Your job is to gather key information through natural conversation: use case, company type, team size, urgency/timeline, integration needs, and budget.
Keep replies short (2-3 sentences max). Ask one follow-up question at a time. Be specific and helpful, not generic.
Once you have gathered enough context, encourage the prospect to generate their account brief.
Do not make up pricing, do not promise specific outcomes, and do not ask for contact info.`;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProspectChat() {
  const { setScreen } = useScreen();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "ai-0", role: "ai", displayText: OPENING, done: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Record<string, ExtractedField>>({});
  const [inputValue, setInputValue] = useState("");
  const [isBusy, setIsBusy] = useState(false); // blocks input while AI replies or demo runs
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgIdRef = useRef(1);
  const messagesRef = useRef<ChatMessage[]>([{ id: "ai-0", role: "ai", displayText: OPENING, done: true }]);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ── Typewriter ───────────────────────────────────────────────────────────────
  const typeMessage = useCallback((id: string, fullText: string, msPerChar = 22): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        i++;
        setMessages((prev) =>
          prev.map((m) => m.id === id ? { ...m, displayText: fullText.slice(0, i), done: i >= fullText.length } : m)
        );
        if (i < fullText.length) setTimeout(tick, msPerChar);
        else resolve();
      };
      setTimeout(tick, msPerChar);
    });
  }, []);

  // ── Apply extracted fields ───────────────────────────────────────────────────
  const applyExtract = useCallback((extract: Partial<Record<string, string>>) => {
    Object.entries(extract).forEach(([rawKey, value]) => {
      if (!value) return;
      const cfg = FIELD_CONFIG.find((f) => f.key === rawKey || f.key === (rawKey === "integrations" ? "integration" : rawKey));
      if (!cfg) return;
      setFields((prev) => ({ ...prev, [cfg.key]: { key: cfg.key, label: cfg.label, value, color: cfg.color, fresh: true } }));
      setTimeout(() => setFields((prev) => ({ ...prev, [cfg.key]: { ...prev[cfg.key], fresh: false } })), 1200);
    });
  }, []);

  // ── Send a user message + get AI reply ────────────────────────────────────────
  const sendUserMessage = useCallback(async (text: string, overrideExtract?: Partial<Record<string, string>>) => {
    const uid = `msg-${++msgIdRef.current}`;
    setMessages((prev) => [...prev, { id: uid, role: "user", displayText: text, done: true }]);

    // Extract from message text (or use override from demo)
    const rawExtracted = overrideExtract ?? extractDataFromMessage(text);
    const extracted: Partial<Record<string, string>> = Object.fromEntries(
      Object.entries(rawExtracted).filter(([, v]) => v != null) as [string, string][]
    );
    applyExtract(extracted);

    setLoading(true);

    // Try live Aicoo AI first, fall back to mock
    let aiText: string | null = null;
    try {
      const history = messagesRef.current.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.displayText,
      }));
      // Build a concise message that includes recent history context
      const recentHistory = history.slice(-6).map((m) => `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`).join("\n");
      const fullMessage = recentHistory
        ? `${SYSTEM_PROMPT}\n\nConversation so far:\n${recentHistory}\n\nUser: ${text}\n\nAI:`
        : `${SYSTEM_PROMPT}\n\nUser: ${text}\n\nAI:`;

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fullMessage }),
      });
      if (resp.ok) {
        const data = await resp.json() as Record<string, unknown>;
        const msg = data.message as string | undefined;
        if (typeof msg === "string" && msg) aiText = msg;
      }
    } catch {
      // fall through to mock
    }

    if (!aiText) {
      await sleep(800 + Math.random() * 400);
    }

    setLoading(false);

    const finalText = aiText ?? getMockAiResponse(text);
    const aiId = `msg-${++msgIdRef.current}`;
    setMessages((prev) => [...prev, { id: aiId, role: "ai", displayText: "", done: false }]);
    await typeMessage(aiId, finalText);
  }, [applyExtract, typeMessage]);

  // ── Live input send ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isBusy) return;
    setInputValue("");
    setIsBusy(true);
    await sendUserMessage(text);
    setIsBusy(false);
    inputRef.current?.focus();
  }, [inputValue, isBusy, sendUserMessage]);

  // ── Run demo ─────────────────────────────────────────────────────────────────
  const handleRunDemo = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    for (const step of DEMO_STEPS) {
      await sleep(400);
      await sendUserMessage(step.text, step.extract);
      await sleep(300);
    }
    setIsBusy(false);
  }, [isBusy, sendUserMessage]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const filledCount = Object.keys(fields).length;
  const canGenerateBrief = filledCount > 0;

  return (
    <>
      <style>{`
        @keyframes fieldSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fieldGlow {
          0%, 100% { box-shadow: none; }
          40%       { box-shadow: 0 0 18px rgba(0,212,255,0.4); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        .field-fresh { animation: fieldSlideIn 0.35s ease forwards, fieldGlow 1s ease 0.1s; }
        .typing-dot:nth-child(1) { animation: typingDot 1.2s 0.0s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation: typingDot 1.2s 0.2s infinite ease-in-out; }
        .typing-dot:nth-child(3) { animation: typingDot 1.2s 0.4s infinite ease-in-out; }
      `}</style>

      <div
        className="flex flex-col lg:flex-row gap-4 w-full px-4 py-4"
        style={{ minHeight: "calc(100dvh - 60px - 44px)", maxWidth: 1200, margin: "0 auto" }}
      >
        {/* ── Chat (60%) ─────────────────────────────────────── */}
        <div
          className="flex flex-col flex-1 rounded-xl overflow-hidden"
          style={{
            flex: "0 0 60%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              <Bot size={15} style={{ color: "var(--db-accent)" }} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--db-text-primary)" }}>AI COO</div>
              <div className="text-xs" style={{ color: "var(--db-text-secondary)" }}>Qualifying your use case in real time</div>
            </div>

            {/* Demo button */}
            <button
              onClick={() => void handleRunDemo()}
              disabled={isBusy}
              title="Run a scripted demo conversation"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: isBusy ? "rgba(255,255,255,0.03)" : "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: isBusy ? "rgba(136,146,176,0.4)" : "var(--db-accent)",
                cursor: isBusy ? "not-allowed" : "pointer",
              }}
            >
              <Play size={10} />
              Run Demo
            </button>

            <div
              className="flex items-center gap-1.5 text-xs ml-3"
              style={{ color: "var(--db-accent)" }}
            >
              <span className="status-dot active" />
              Live
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3 animate-fade-in" style={{ alignItems: "flex-start" }}>
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                  style={
                    msg.role === "ai"
                      ? { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)" }
                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {msg.role === "ai"
                    ? <Bot size={13} style={{ color: "#818cf8" }} />
                    : <User size={13} style={{ color: "var(--db-text-secondary)" }} />
                  }
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1 font-medium" style={{ color: "var(--db-text-secondary)" }}>
                    {msg.role === "ai" ? "AI COO" : "You"}
                  </div>
                  <div
                    className="text-sm leading-relaxed rounded-xl px-4 py-3"
                    style={
                      msg.role === "ai"
                        ? { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)", color: "var(--db-text-primary)" }
                        : { background: "transparent", border: "1px solid rgba(255,255,255,0.09)", color: "var(--db-text-primary)" }
                    }
                  >
                    {msg.displayText}
                    {!msg.done && (
                      <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--db-accent)", marginLeft: 2, verticalAlign: "middle", animation: "shimmer 0.7s ease-in-out infinite" }} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)" }}
                >
                  <Bot size={13} style={{ color: "#818cf8" }} />
                </div>
                <div
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#00d4ff" }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${isBusy ? "rgba(255,255,255,0.08)" : "rgba(0,212,255,0.2)"}`,
              }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSend(); }}
                placeholder={isBusy ? "AI is responding…" : "Describe your use case…"}
                disabled={isBusy}
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--db-text-primary)", caretColor: "var(--db-accent)" }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={!inputValue.trim() || isBusy}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: inputValue.trim() && !isBusy ? "rgba(0,212,255,0.9)" : "rgba(255,255,255,0.06)",
                }}
              >
                <Send size={13} style={{ color: inputValue.trim() && !isBusy ? "#0a0e27" : "rgba(136,146,176,0.4)" }} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Extracted context sidebar (40%) ──────────────────── */}
        <div
          className="flex flex-col rounded-xl overflow-hidden"
          style={{
            flex: "0 0 38%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Sidebar header */}
          <div className="px-5 py-3.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--db-accent)" }}>
              Extracted Context
            </div>
            <div className="text-xs" style={{ color: "var(--db-text-secondary)" }}>
              Auto-populated as conversation flows
            </div>
          </div>

          {/* Fields */}
          <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
            {FIELD_CONFIG.map((cfg) => {
              const field = fields[cfg.key];
              const populated = !!field;
              return (
                <div
                  key={cfg.key}
                  className={populated && field.fresh ? "field-fresh" : ""}
                  style={{ opacity: populated ? 1 : 0.35 }}
                >
                  <div className="text-xs font-medium mb-1" style={{ color: "var(--db-text-secondary)" }}>
                    {cfg.label}
                  </div>
                  <div
                    className="rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300"
                    style={
                      populated
                        ? { background: `${cfg.color}14`, border: `1px solid ${cfg.color}35`, color: cfg.color }
                        : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(136,146,176,0.4)" }
                    }
                  >
                    {populated ? field.value : cfg.emptyLabel}
                  </div>
                </div>
              );
            })}

            {/* Confidence bar */}
            {filledCount > 0 && (
              <div className="mt-4 pt-4 animate-fade-in" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between text-xs mb-2" style={{ color: "var(--db-text-secondary)" }}>
                  <span>Context confidence</span>
                  <span style={{ color: "var(--db-accent)" }}>
                    {Math.round((filledCount / FIELD_CONFIG.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(filledCount / FIELD_CONFIG.length) * 100}%`,
                      background: "linear-gradient(90deg, #00d4ff, #7b61ff)",
                      boxShadow: "0 0 8px rgba(0,212,255,0.5)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate brief CTA */}
          <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              data-testid="button-generate-account-brief"
              onClick={() => {
                // Fire-and-forget: save this lead to the API before navigating
                const f = fields as Record<string, ExtractedField>;
                const useCase = f.useCase?.value ?? "";
                const industryGuess = (() => {
                  const lc = useCase.toLowerCase();
                  if (lc.includes("health") || lc.includes("clinic") || lc.includes("hospital") || lc.includes("medical")) return "Healthcare";
                  if (lc.includes("finance") || lc.includes("fintech") || lc.includes("bank") || lc.includes("kyc")) return "Finance";
                  if (lc.includes("retail") || lc.includes("shop") || lc.includes("commerce")) return "Retail";
                  if (lc.includes("legal") || lc.includes("law")) return "Legal";
                  if (lc.includes("edtech") || lc.includes("school") || lc.includes("education")) return "EdTech";
                  if (lc.includes("logistic") || lc.includes("warehouse") || lc.includes("supply")) return "Logistics";
                  return "General";
                })();
                fetch("/api/leads", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    company: f.companyType?.value ?? "New Prospect",
                    industry: industryGuess,
                    useCase: f.useCase?.value ?? "",
                    teamSize: f.teamSize?.value ?? "",
                    urgency: f.urgency?.value ?? "",
                    budget: f.budget?.value ?? "",
                    integrations: f.integration?.value ?? "None specified",
                  }),
                }).catch(() => {});
                setScreen("account-brief");
              }}
              disabled={!canGenerateBrief}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
              style={
                canGenerateBrief
                  ? { background: "linear-gradient(135deg, #00d4ff, #0099cc)", color: "#0a0e27", boxShadow: "0 0 24px rgba(0,212,255,0.4)", cursor: "pointer" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(136,146,176,0.5)", cursor: "not-allowed" }
              }
              onMouseEnter={(e) => {
                if (!canGenerateBrief) return;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 44px rgba(0,212,255,0.65)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                if (!canGenerateBrief) return;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(0,212,255,0.4)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              {canGenerateBrief ? (
                <><span>Generate Account Brief</span><ArrowRight size={15} /></>
              ) : (
                "Gathering context…"
              )}
            </button>
            {!canGenerateBrief && (
              <p className="text-xs text-center mt-2" style={{ color: "rgba(136,146,176,0.4)" }}>
                Share your use case to get started
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
