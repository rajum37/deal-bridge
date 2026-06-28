import { useCallback, useEffect, useRef, useState } from "react";
import { useScreen } from "@/contexts/ScreenContext";
import { Check, Copy, ExternalLink, ArrowRight, X, Clock } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const HEADER_1 = "Solutions Engineer can see:";
const HEADER_2 = "Compliance Officer can see:";
const MOCK_SHARE_URL = "https://aicoo.io/shared/f4c8d3a1...ab91";

const BULLETS_1 = [
  "Use Case: AI voice-and-chat workflow",
  "Team Size: 15-20 people",
  "Integration Needs: EHR (Epic), SSO",
  "Budget: $50K-100K annual",
];

const BULLETS_2 = [
  "Use Case: Patient intake workflow",
  "Urgency: 6-week pilot",
  "Compliance: HIPAA, data residency",
  "Team Size: 15-20 people",
];

const RIGHT_BULLETS = [
  { label: "Timing",     value: "Next 48 hours" },
  { label: "Focus",      value: "Integration architecture, EHR compatibility" },
  { label: "Attendees",  value: "Your team + Solutions Engineer" },
];

const CHAR_MS   = 18;   // ms per character for typewriter
const BULLET_MS = 175;  // ms between bullet reveals

// ── Audit events ─────────────────────────────────────────────────────────────
const AUDIT_EVENTS: { time: string; actor: string; action: string; tag: string; tagColor: string }[] = [
  { time: "2m 34s ago", actor: "AI COO",               action: "Lead qualification started",                        tag: "Qualify",  tagColor: "#00d4ff" },
  { time: "2m 31s ago", actor: "AI COO",               action: "Use case extracted: Healthcare Voice/Chat",         tag: "Extract",  tagColor: "#00d4ff" },
  { time: "2m 28s ago", actor: "AI COO",               action: "Company type identified: Clinic",                   tag: "Extract",  tagColor: "#00d4ff" },
  { time: "2m 19s ago", actor: "AI COO",               action: "Team size confirmed: 15–20 people",                 tag: "Extract",  tagColor: "#00d4ff" },
  { time: "2m 10s ago", actor: "AI COO",               action: "Urgency flagged: High — 6 week pilot deadline",     tag: "Flag",     tagColor: "#f59e0b" },
  { time: "2m 04s ago", actor: "AI COO",               action: "Integration need recorded: EHR (Epic)",             tag: "Extract",  tagColor: "#00d4ff" },
  { time: "1m 58s ago", actor: "AI COO",               action: "Budget range captured: $50K–100K / year",           tag: "Extract",  tagColor: "#a78bfa" },
  { time: "1m 55s ago", actor: "Routing Engine",       action: "Context brief compiled and scoped",                 tag: "Brief",    tagColor: "#10b981" },
  { time: "1m 52s ago", actor: "Routing Engine",       action: "Specialist match: Solutions Engineer (87% fit)",    tag: "Route",    tagColor: "#10b981" },
  { time: "1m 51s ago", actor: "Routing Engine",       action: "Context shared with Compliance Officer (HIPAA)",    tag: "Share",    tagColor: "#10b981" },
  { time: "1m 48s ago", actor: "Solutions Engineer",   action: "Context brief received and acknowledged",           tag: "Received", tagColor: "#10b981" },
  { time: "Just now",   actor: "You",                  action: "Routing accepted — handoff confirmed",              tag: "Confirm",  tagColor: "#10b981" },
];

// ── Toast component ──────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Mount → visible
    const t1 = setTimeout(() => setVisible(true), 30);
    // Start fade-out
    const t2 = setTimeout(() => setVisible(false), 2000);
    // Remove after fade
    const t3 = setTimeout(onDone, 2500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        right: 24,
        zIndex: 9999,
        padding: "10px 18px",
        borderRadius: 10,
        background: "rgba(0,20,30,0.92)",
        border: "1px solid rgba(0,212,255,0.35)",
        color: "#00d4ff",
        fontSize: 13,
        fontWeight: 600,
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 24px rgba(0,212,255,0.25)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 300ms ease, transform 300ms ease",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}

// ── Bullet row ────────────────────────────────────────────────────────────────
function Bullet({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-12px)",
        transition: "opacity 280ms ease, transform 280ms ease",
        marginBottom: 8,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          marginTop: 3,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "var(--db-accent)",
          boxShadow: "0 0 6px rgba(0,212,255,0.5)",
        }}
      />
      <span style={{ fontSize: 13, color: "var(--db-text-primary)", lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HandoffOutcome() {
  const { setScreen } = useScreen();

  // Left card typewriter state
  const [h1Text,        setH1Text]        = useState("");
  const [bullets1Count, setBullets1Count] = useState(0);
  const [h2Text,        setH2Text]        = useState("");
  const [bullets2Count, setBullets2Count] = useState(0);
  const [shareVisible,  setShareVisible]  = useState(false);

  // Right card
  const [rightVisible,  setRightVisible]  = useState(false);
  const [rightBullets,  setRightBullets]  = useState(0);

  // Background pulse
  const [pulse, setPulse] = useState(1);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Routed confirmation state
  const [routed, setRouted] = useState(false);
  const [routedVisible, setRoutedVisible] = useState(false);

  // Audit trail modal
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);

  const cancelledRef = useRef(false);

  // ── Typewriter helpers ─────────────────────────────────────────────────────
  const typeString = useCallback(
    (text: string, setter: (s: string) => void): Promise<void> =>
      new Promise((resolve) => {
        let i = 0;
        const tick = () => {
          if (cancelledRef.current) return;
          i++;
          setter(text.slice(0, i));
          if (i < text.length) setTimeout(tick, CHAR_MS);
          else setTimeout(resolve, 80);
        };
        setTimeout(tick, CHAR_MS);
      }),
    [],
  );

  const revealBullets = useCallback(
    (count: number, setter: (n: number) => void): Promise<void> =>
      new Promise((resolve) => {
        let i = 0;
        const tick = () => {
          if (cancelledRef.current) return;
          i++;
          setter(i);
          if (i < count) setTimeout(tick, BULLET_MS);
          else setTimeout(resolve, 120);
        };
        setTimeout(tick, BULLET_MS);
      }),
    [],
  );

  // ── Mount orchestration ────────────────────────────────────────────────────
  useEffect(() => {
    cancelledRef.current = false;

    const run = async () => {
      await typeString(HEADER_1, setH1Text);
      await revealBullets(BULLETS_1.length, setBullets1Count);
      await typeString(HEADER_2, setH2Text);
      await revealBullets(BULLETS_2.length, setBullets2Count);
      if (!cancelledRef.current) setShareVisible(true);
    };

    void run();

    // Right card slides in after 2s
    const tRight = setTimeout(() => {
      if (cancelledRef.current) return;
      setRightVisible(true);
    }, 1800);

    // Right bullets stagger 400ms after card appears
    const tBullets = RIGHT_BULLETS.map((_, i) =>
      setTimeout(() => {
        if (cancelledRef.current) return;
        setRightBullets(i + 1);
      }, 2300 + i * 260),
    );

    // Background pulse every 2s
    const tPulse = setInterval(() => {
      setPulse((p) => (p === 1 ? 0.91 : 1));
    }, 2000);

    return () => {
      cancelledRef.current = true;
      clearTimeout(tRight);
      tBullets.forEach(clearTimeout);
      clearInterval(tPulse);
    };
  }, [typeString, revealBullets]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(MOCK_SHARE_URL); } catch { /* ok */ }
    setCopied(true);
    setToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2200);
  };

  const showToast = (msg: string) => setToast(msg);

  const handleAcceptRoute = () => {
    setRouted(true);
    setTimeout(() => setRoutedVisible(true), 40);
  };

  // ── Blinking cursor ────────────────────────────────────────────────────────
  const Cursor = () => (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: "1em",
        background: "var(--db-accent)",
        marginLeft: 2,
        verticalAlign: "middle",
        animation: "cursorBlink 0.7s ease-in-out infinite",
      }}
    />
  );

  return (
    <>
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes bulletSlide {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {toast && (
        <Toast key={toast + Date.now()} message={toast} onDone={() => setToast(null)} />
      )}

      {/* ── Audit Trail Modal ── */}
      {auditOpen && (
        <div
          onClick={() => { setAuditVisible(false); setTimeout(() => setAuditOpen(false), 300); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(5,8,24,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
            opacity: auditVisible ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 580,
              maxHeight: "80vh",
              borderRadius: 18,
              background: "rgba(10,14,39,0.97)",
              border: "1px solid rgba(0,212,255,0.18)",
              backdropFilter: "blur(32px)",
              boxShadow: "0 0 60px rgba(0,212,255,0.12)",
              display: "flex", flexDirection: "column",
              opacity: auditVisible ? 1 : 0,
              transform: auditVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
              transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "18px 22px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <Clock size={16} style={{ color: "var(--db-accent)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--db-text-primary)" }}>Full Audit Trail</div>
                <div style={{ fontSize: 11, color: "var(--db-text-secondary)", marginTop: 1 }}>
                  {AUDIT_EVENTS.length} events · 3 actors · 2m 34s total
                </div>
              </div>
              <button
                onClick={() => { setAuditVisible(false); setTimeout(() => setAuditOpen(false), 300); }}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer",
                }}
              >
                <X size={14} style={{ color: "var(--db-text-secondary)" }} />
              </button>
            </div>

            {/* Event list */}
            <div style={{ overflowY: "auto", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 2 }}>
              {AUDIT_EVENTS.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "10px 12px", borderRadius: 10,
                    background: i === AUDIT_EVENTS.length - 1 ? "rgba(16,185,129,0.05)" : "transparent",
                    border: i === AUDIT_EVENTS.length - 1 ? "1px solid rgba(16,185,129,0.15)" : "1px solid transparent",
                    transition: "background 200ms",
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, paddingTop: 3, flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: ev.tagColor,
                      boxShadow: `0 0 6px ${ev.tagColor}80`,
                      flexShrink: 0,
                    }} />
                    {i < AUDIT_EVENTS.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 20, background: "rgba(255,255,255,0.07)", marginTop: 4 }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--db-text-primary)" }}>{ev.actor}</span>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                          padding: "1px 7px", borderRadius: 20,
                          background: `${ev.tagColor}18`,
                          border: `1px solid ${ev.tagColor}40`,
                          color: ev.tagColor,
                        }}
                      >
                        {ev.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--db-text-secondary)", lineHeight: 1.45 }}>{ev.action}</div>
                  </div>

                  <div style={{ fontSize: 10.5, color: "rgba(136,146,176,0.45)", flexShrink: 0, paddingTop: 2, whiteSpace: "nowrap" }}>
                    {ev.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Routing confirmed success panel ── */}
      {routed && (
        <div
          style={{
            opacity: routedVisible ? 1 : 0,
            transform: routedVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 450ms ease, transform 450ms cubic-bezier(0.4,0,0.2,1)",
            width: "100%",
            maxWidth: 620,
            margin: "60px auto",
            padding: "48px 40px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(16,185,129,0.25)",
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            textAlign: "center",
          }}
        >
          {/* Check circle */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.12)",
              border: "2px solid rgba(16,185,129,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 32px rgba(16,185,129,0.25)",
            }}
          >
            <Check size={32} style={{ color: "#10b981" }} />
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--app-font-serif)",
                fontSize: 28,
                fontWeight: 600,
                color: "#10b981",
                letterSpacing: "-0.01em",
                marginBottom: 8,
              }}
            >
              Routing Confirmed
            </h2>
            <p style={{ fontSize: 14, color: "var(--db-text-secondary)", lineHeight: 1.6, maxWidth: 420 }}>
              Your lead has been routed to the Solutions Engineer. The specialist has been notified with the full context brief and will reach out within 48 hours.
            </p>
          </div>

          {/* Detail pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 380 }}>
            {[
              { label: "Specialist", value: "Solutions Engineer" },
              { label: "Notification sent", value: "Just now" },
              { label: "Expected response", value: "Within 48 hours" },
              { label: "Reference ID", value: "#DB-" + Math.random().toString(36).slice(2,8).toUpperCase() },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--db-text-secondary)" }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--db-text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* New lead button */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setScreen("dashboard")}
              style={{
                marginTop: 8,
                padding: "12px 32px",
                borderRadius: 11,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--app-font-sans)",
                color: "var(--db-accent)",
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.25)",
                cursor: "pointer",
                transition: "background 250ms ease, box-shadow 250ms ease",
              }}
              onMouseEnter={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, { background: "rgba(0,212,255,0.14)", boxShadow: "0 0 20px rgba(0,212,255,0.2)" });
              }}
              onMouseLeave={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, { background: "rgba(0,212,255,0.08)", boxShadow: "none" });
              }}
            >
              View Dashboard
            </button>
            <button
              onClick={() => setScreen("prospect-chat")}
              style={{
                marginTop: 8,
                padding: "12px 32px",
                borderRadius: 11,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--app-font-sans)",
                color: "var(--db-text-secondary)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                transition: "background 250ms ease, color 250ms ease",
              }}
              onMouseEnter={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, { background: "rgba(255,255,255,0.07)", color: "var(--db-text-primary)" });
              }}
              onMouseLeave={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, { background: "rgba(255,255,255,0.04)", color: "var(--db-text-secondary)" });
              }}
            >
              New Lead
            </button>
          </div>
        </div>
      )}

      {/* ── Main handoff content (hidden once routed) ── */}
      {!routed && <div
        style={{
          opacity: pulse,
          transition: "opacity 1.5s ease",
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(16px, 3vw, 32px) 16px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Page heading ── */}
        <div>
          <h1
            style={{
              fontFamily: "var(--app-font-serif)",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 600,
              color: "var(--db-accent)",
              letterSpacing: "-0.01em",
              textShadow: "0 0 24px rgba(0,212,255,0.2)",
              marginBottom: 4,
            }}
          >
            Handoff Outcome
          </h1>
          <p style={{ fontSize: 13, color: "var(--db-text-secondary)" }}>
            Context scoped and shared · Specialist routing confirmed
          </p>
        </div>

        {/* ── Action buttons ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "flex-start",
          }}
        >
          {/* Accept & Route — primary */}
          <button
            data-testid="button-accept-route"
            onClick={handleAcceptRoute}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "12px 32px",
              borderRadius: 11,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--app-font-sans)",
              color: "#0a0e27",
              background: "linear-gradient(135deg, #00d4ff, #0099cc)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 28px rgba(0,212,255,0.4)",
              transition: "transform 250ms ease, box-shadow 250ms ease",
            }}
            onMouseEnter={(e) => {
              Object.assign((e.currentTarget as HTMLButtonElement).style, {
                transform: "scale(1.04)", boxShadow: "0 0 50px rgba(0,212,255,0.65)",
              });
            }}
            onMouseLeave={(e) => {
              Object.assign((e.currentTarget as HTMLButtonElement).style, {
                transform: "scale(1)", boxShadow: "0 0 28px rgba(0,212,255,0.4)",
              });
            }}
          >
            Accept &amp; Route
            <ArrowRight size={15} />
          </button>

          {/* View Full Audit Trail — secondary */}
          <button
            data-testid="button-audit-trail"
            onClick={() => { setAuditOpen(true); setTimeout(() => setAuditVisible(true), 40); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 11,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--app-font-sans)",
              color: "var(--db-accent)",
              background: "rgba(0,212,255,0.07)",
              border: "1px solid rgba(0,212,255,0.22)",
              cursor: "pointer",
              transition: "background 250ms ease, box-shadow 250ms ease",
            }}
            onMouseEnter={(e) => {
              Object.assign((e.currentTarget as HTMLButtonElement).style, {
                background: "rgba(0,212,255,0.12)", boxShadow: "0 0 18px rgba(0,212,255,0.2)",
              });
            }}
            onMouseLeave={(e) => {
              Object.assign((e.currentTarget as HTMLButtonElement).style, {
                background: "rgba(0,212,255,0.07)", boxShadow: "none",
              });
            }}
          >
            <ExternalLink size={14} />
            View Full Audit Trail
          </button>

        </div>

        {/* ── Metrics ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: "0 28px",
            padding: "14px 0",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {[
            { label: "Lead qualified in", value: "2m 34s" },
            { label: "Routing decision", value: "12ms" },
            { label: "Context sync", value: "real-time" },
          ].map((m) => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "var(--db-text-secondary)" }}>{m.label}:</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--db-accent)", letterSpacing: "0.02em" }}>
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Two-column main area ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Scoped Context Share ── */}
          <div
            style={{
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(22px)",
              padding: "clamp(20px, 3vw, 28px)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--app-font-serif)",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--db-accent)",
                marginBottom: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Context Shared with Specialists
            </h2>

            {/* Section 1 */}
            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    color: "#10b981",
                    fontWeight: 700,
                    fontSize: 15,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--db-text-primary)",
                    minHeight: "1.3em",
                  }}
                >
                  {h1Text}
                  {h1Text.length < HEADER_1.length && <Cursor />}
                </span>
              </div>

              <div style={{ paddingLeft: 18 }}>
                {BULLETS_1.map((b, i) => (
                  <Bullet key={b} text={b} visible={bullets1Count > i} />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.05)",
                marginBottom: 20,
              }}
            />

            {/* Section 2 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    color: "#10b981",
                    fontWeight: 700,
                    fontSize: 15,
                    lineHeight: 1,
                    visibility: h2Text.length > 0 ? "visible" : "hidden",
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--db-text-primary)",
                    minHeight: "1.3em",
                  }}
                >
                  {h2Text}
                  {h2Text.length > 0 && h2Text.length < HEADER_2.length && <Cursor />}
                </span>
              </div>

              <div style={{ paddingLeft: 18 }}>
                {BULLETS_2.map((b, i) => (
                  <Bullet key={b} text={b} visible={bullets2Count > i} />
                ))}
              </div>
            </div>

            {/* Share link — appears after all content typed */}
            <div
              style={{
                opacity: shareVisible ? 1 : 0,
                transform: shareVisible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 400ms ease, transform 400ms ease",
                padding: 14,
                borderRadius: 10,
                background: "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "var(--db-text-secondary)",
                  marginBottom: 8,
                }}
              >
                Share Link
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontSize: 11.5,
                    color: "var(--db-accent)",
                    wordBreak: "break-all",
                    lineHeight: 1.4,
                  }}
                >
                  {MOCK_SHARE_URL}
                </code>
                <button
                  onClick={() => void handleCopy()}
                  title="Copy link"
                  style={{
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: copied
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(0,212,255,0.1)",
                    border: copied
                      ? "1px solid rgba(16,185,129,0.3)"
                      : "1px solid rgba(0,212,255,0.25)",
                    cursor: "pointer",
                    transition: "all 250ms ease",
                  }}
                >
                  {copied ? (
                    <Check size={13} style={{ color: "#10b981" }} />
                  ) : (
                    <Copy size={13} style={{ color: "var(--db-accent)" }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Next Step Recommendation ── */}
          <div
            style={{
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(22px)",
              padding: "clamp(20px, 3vw, 28px)",
              opacity: rightVisible ? 1 : 0,
              transform: rightVisible ? "translateY(0)" : "translateY(28px)",
              transition: "opacity 500ms ease, transform 500ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--app-font-serif)",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--db-accent)",
                marginBottom: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Recommended Action
            </h2>

            {/* Main recommendation text */}
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--db-text-primary)",
                lineHeight: 1.4,
                marginBottom: 24,
                letterSpacing: "-0.01em",
              }}
            >
              Schedule a technical deep-dive with the Solutions Engineer
            </p>

            {/* Staggered bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {RIGHT_BULLETS.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    opacity: rightBullets > i ? 1 : 0,
                    transform: rightBullets > i ? "translateX(0)" : "translateX(-14px)",
                    transition: "opacity 320ms ease, transform 320ms ease",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "var(--db-accent)",
                      marginBottom: 4,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--db-text-primary)",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Specialist match badge */}
            <div
              style={{
                marginTop: 24,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: rightBullets >= RIGHT_BULLETS.length ? 1 : 0,
                transition: "opacity 400ms ease 200ms",
              }}
            >
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: 15 }}>✓</span>
              <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>
                Context brief has been scoped &amp; shared with Solutions Engineer
              </span>
            </div>
          </div>
        </div>

      </div>}
    </>
  );
}
