import { useScreen } from "@/contexts/ScreenContext";

const SUBWORDS = [
  "Lead",
  "qualification.",
  "Structured",
  "context.",
  "Instant",
  "routing.",
];

// Stagger: each word's glow cycle is 4s, delayed 0.35s per word
// The pulse lasts ~600ms inside the 4s cycle, giving a clean sequential feel
function SubheadlineWord({ word, index }: { word: string; index: number }) {
  const delay = index * 0.35;
  return (
    <span
      style={{
        display: "inline-block",
        animation: `wordGlow 4s ease-in-out ${delay}s infinite`,
        color: "var(--db-text-secondary)",
        marginRight: word.endsWith(".") ? "18px" : "6px",
        fontSize: "20px",
        fontFamily: "var(--app-font-sans)",
        fontWeight: 400,
      }}
    >
      {word}
    </span>
  );
}

// ── Step Flow ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    title: "Prospect",
    subtitle: "Inbound lead",
    detail: "You describe your use case in a natural conversation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    accent: false,
  },
  {
    number: "02",
    title: "AI COO",
    subtitle: "Qualify · Brief · Route",
    detail: "Extracts context, builds your account brief, routes to the right specialist",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 4-3 6.5-7 9-4-2.5-7-5-7-9a7 7 0 0 1 7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    accent: true,
  },
  {
    number: "03",
    title: "Specialist",
    subtitle: "Warm handoff",
    detail: "Pre-briefed expert receives your context and picks up the conversation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l4 4 8-8" />
        <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
      </svg>
    ),
    accent: false,
  },
];

function StepFlow() {
  return (
    <div
      className="flex items-stretch justify-center gap-0 w-full"
      style={{ maxWidth: 680 }}
      aria-label="How it works"
    >
      {STEPS.map((step, i) => (
        <div key={step.title} className="flex items-center" style={{ flex: i === 1 ? "0 0 auto" : "1 1 0" }}>
          {/* Card */}
          <div
            className="step-card flex flex-col items-center text-center px-5 py-6 rounded-2xl w-full"
            style={{
              background: step.accent
                ? "linear-gradient(135deg, rgba(0,212,255,0.10), rgba(123,97,255,0.08))"
                : "rgba(255,255,255,0.03)",
              border: step.accent
                ? "1px solid rgba(0,212,255,0.30)"
                : "1px solid rgba(255,255,255,0.07)",
              boxShadow: step.accent
                ? "0 0 32px rgba(0,212,255,0.12), inset 0 1px 0 rgba(0,212,255,0.12)"
                : "none",
              animation: step.accent ? "cardPulse 4s ease-in-out infinite" : "none",
              minWidth: step.accent ? 200 : 160,
            }}
          >
            {/* Step number */}
            <div
              className="text-xs font-bold mb-3 tracking-widest"
              style={{ color: step.accent ? "var(--db-accent)" : "rgba(136,146,176,0.5)" }}
            >
              {step.number}
            </div>

            {/* Icon */}
            <div
              className="flex items-center justify-center rounded-xl mb-3"
              style={{
                width: 44,
                height: 44,
                background: step.accent
                  ? "rgba(0,212,255,0.12)"
                  : "rgba(255,255,255,0.05)",
                border: step.accent
                  ? "1px solid rgba(0,212,255,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: step.accent ? "var(--db-accent)" : "var(--db-text-secondary)",
              }}
            >
              {step.icon}
            </div>

            {/* Title */}
            <div
              className="text-sm font-semibold mb-1"
              style={{
                color: step.accent ? "var(--db-accent)" : "var(--db-text-primary)",
                letterSpacing: "0.01em",
              }}
            >
              {step.title}
            </div>

            {/* Subtitle badge */}
            <div
              className="text-xs mb-3 px-2 py-0.5 rounded-full"
              style={{
                color: step.accent ? "var(--db-accent)" : "var(--db-text-secondary)",
                background: step.accent ? "rgba(0,212,255,0.08)" : "transparent",
                border: step.accent ? "1px solid rgba(0,212,255,0.15)" : "none",
              }}
            >
              {step.subtitle}
            </div>

            {/* Detail */}
            <div
              className="text-xs leading-relaxed"
              style={{ color: "rgba(136,146,176,0.55)", maxWidth: 150 }}
            >
              {step.detail}
            </div>
          </div>

          {/* Connector arrow (between cards) */}
          {i < STEPS.length - 1 && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: "linear-gradient(90deg, rgba(0,212,255,0.2), rgba(0,212,255,0.5), rgba(0,212,255,0.2))",
                }}
              />
              <svg width="8" height="8" viewBox="0 0 8 8" style={{ color: "rgba(0,212,255,0.5)", marginTop: -5, marginLeft: 26 }}>
                <path d="M0 4 L7 4 M4 1 L7 4 L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Landing() {
  const { setScreen, setShowNav, setHasLeftLanding } = useScreen();
  return (
    <>
      {/* ── Scoped keyframes ── */}
      <style>{`
        @keyframes wordGlow {
          0%, 100% {
            color: var(--db-text-secondary);
            text-shadow: none;
          }
          10%, 20% {
            color: #00d4ff;
            text-shadow: 0 0 20px rgba(0, 212, 255, 0.85),
                         0 0 40px rgba(0, 212, 255, 0.35);
          }
        }

        @keyframes cardPulse {
          0%, 100% { box-shadow: 0 0 32px rgba(0,212,255,0.12), inset 0 1px 0 rgba(0,212,255,0.12); }
          50%       { box-shadow: 0 0 48px rgba(0,212,255,0.22), inset 0 1px 0 rgba(0,212,255,0.2); }
        }

        @keyframes ctaShimmer {
          0%   { box-shadow: 0 0 40px rgba(0,212,255,0.35), inset 0 0 0 1px rgba(0,212,255,0.3); }
          50%  { box-shadow: 0 0 65px rgba(0,212,255,0.55), inset 0 0 0 1px rgba(0,212,255,0.5); }
          100% { box-shadow: 0 0 40px rgba(0,212,255,0.35), inset 0 0 0 1px rgba(0,212,255,0.3); }
        }

        .landing-cta {
          animation: ctaShimmer 3s ease-in-out infinite;
          transition: transform 300ms ease, box-shadow 300ms ease, background 300ms ease;
        }
        .landing-cta:hover {
          transform: scale(1.05);
          box-shadow: 0 0 80px rgba(0,212,255,0.75), inset 0 0 0 1px rgba(0,212,255,0.8) !important;
          background: rgba(0,212,255,0.18) !important;
          animation: none;
        }
      `}</style>

      <div
        className="flex flex-col items-center justify-center min-h-full px-6 text-center"
        style={{
          minHeight: "calc(100dvh - 60px - 44px)",
          background:
            "linear-gradient(135deg, #0a0e27 0%, #0c1133 60%, #0a0e27 100%)",
        }}
      >
        {/* Top ambient glow */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(0,212,255,0.07) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />

        <div
          className="relative flex flex-col items-center gap-10 w-full"
          style={{ zIndex: 1, maxWidth: 780 }}
        >
          {/* ── Headline ── */}
          <h1
            className="text-[60px]"
            style={{
              fontFamily: "var(--app-font-serif)",
              fontWeight: 600,
              color: "var(--db-accent)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              textShadow: "0 0 40px rgba(0,212,255,0.25)",
              marginTop: "48px",
            }}
          >
            Talk to our AI COO
          </h1>

          {/* ── Subheadline — animated words ── */}
          <p
            style={{
              fontSize: 0,
              lineHeight: 1.9,
              maxWidth: 480,
            }}
          >
            {SUBWORDS.map((word, i) => (
              <SubheadlineWord key={word} word={word} index={i} />
            ))}
          </p>

          {/* ── Step Flow ── */}
          <StepFlow />

          {/* ── CTA buttons ── */}
          <div className="flex flex-col items-center gap-3">
            <button
              data-testid="button-start-lead-conversation"
              onClick={() => { setHasLeftLanding(true); setShowNav(true); setScreen("prospect-chat"); }}
              className="landing-cta"
              style={{
                padding: "20px 48px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: 600,
                fontFamily: "var(--app-font-sans)",
                color: "#00d4ff",
                background: "rgba(0, 212, 255, 0.10)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Start a Lead Conversation
            </button>

            <button
              onClick={() => { setHasLeftLanding(true); setShowNav(true); setScreen("dashboard"); }}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(136,146,176,0.65)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "color 200ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--db-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(136,146,176,0.65)"; }}
            >
              View Lead Dashboard →
            </button>
          </div>

          {/* ── Subtle footer hint ── */}
          <p
            style={{
              fontSize: "11px",
              color: "rgba(136,146,176,0.5)",
              letterSpacing: "0.04em",
              marginTop: -8,
            }}
          >
            No signup required · Live on Aicoo Pulse
          </p>
        </div>
      </div>
    </>
  );
}
