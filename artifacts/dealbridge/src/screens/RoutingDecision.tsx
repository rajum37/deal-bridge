import { useEffect, useRef, useState } from "react";
import { useScreen } from "@/contexts/ScreenContext";
import { ArrowRight, BarChart2, DollarSign, Settings, Shield } from "lucide-react";

// ── Specialist data ────────────────────────────────────────────────────────
const SPECIALISTS = [
  {
    id: "solutions-engineer",
    name: "Solutions Engineer",
    subtitle: "Technical integration",
    Icon: Settings,
    score: 92,
    selected: true,
  },
  {
    id: "healthcare-compliance",
    name: "Healthcare Compliance",
    subtitle: "Regulatory",
    Icon: Shield,
    score: 88,
    selected: true,
  },
  {
    id: "sales-director",
    name: "Sales Director",
    subtitle: "Commercial",
    Icon: BarChart2,
    score: 65,
    selected: false,
  },
  {
    id: "finance-lead",
    name: "Finance Lead",
    subtitle: "Budget planning",
    Icon: DollarSign,
    score: 45,
    selected: false,
  },
];

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

// Stages:
//  0 = mount (all dimmed, waiting)
//  1 = cards visible (0–1s)
//  2 = scoring bars + count-up (1–3s)
//  3 = selection highlight + SVG (3–4s)
//  4 = final + button

export default function RoutingDecision() {
  const { setScreen } = useScreen();
  const [stage, setStage] = useState(0);
  const [displayScores, setDisplayScores] = useState([0, 0, 0, 0]);
  const [buttonVisible, setButtonVisible] = useState(false);
  const rafRef = useRef<number>(0);

  // ── Stage progression ──────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 80);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 3100);
    const t4 = setTimeout(() => setStage(4), 4100);
    const t5 = setTimeout(() => setButtonVisible(true), 4600);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  // ── Score count-up (stage 2) ───────────────────────────────────────────
  useEffect(() => {
    if (stage !== 2) return;
    const targets = SPECIALISTS.map((s) => s.score);
    const PER_DELAY = 200; // ms stagger between specialists
    const DURATION = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      setDisplayScores(
        targets.map((target, i) => {
          const delay = i * PER_DELAY;
          const adj = Math.max(0, elapsed - delay);
          const p = Math.min(adj / DURATION, 1);
          return Math.round((1 - Math.pow(1 - p, 2)) * target);
        }),
      );
      if (elapsed < DURATION + (targets.length - 1) * PER_DELAY) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage]);

  return (
    <>
      <style>{`
        @keyframes arrowDraw {
          from { stroke-dashoffset: 240; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes routeGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(0,212,255,0.3); }
          50%       { box-shadow: 0 0 55px rgba(0,212,255,0.7); }
        }
        .arrow-path { stroke-dasharray: 240; stroke-dashoffset: 240; }
        .arrow-draw           { animation: arrowDraw 0.65s cubic-bezier(0.4,0,0.2,1) forwards; }
        .arrow-draw-delay     { animation: arrowDraw 0.65s cubic-bezier(0.4,0,0.2,1) 0.22s forwards; }
        .selected-glow        { animation: routeGlow 2.6s ease-in-out infinite; }
      `}</style>

      <div
        className="flex flex-col items-center w-full px-4 py-8"
        style={{ minHeight: "calc(100dvh - 60px - 44px)", maxWidth: 1100, margin: "0 auto" }}
      >
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <h1
            style={{
              fontFamily: "var(--app-font-serif)",
              fontSize: "clamp(24px, 3.5vw, 34px)",
              fontWeight: 600,
              color: "var(--db-accent)",
              letterSpacing: "-0.01em",
              textShadow: "0 0 28px rgba(0,212,255,0.25)",
              marginBottom: "8px",
            }}
          >
            Smart Routing Analysis
          </h1>
          <p style={{ fontSize: "14px", color: "var(--db-text-secondary)" }}>
            {stage < 2
              ? "Finding the best specialist for this lead…"
              : stage < 3
                ? "Scoring specialist relevance…"
                : stage < 4
                  ? "Confirming best fit…"
                  : "Routing decision confirmed"}
          </p>
        </div>

        {/* ── Specialist grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "960px",
            marginBottom: "36px",
          }}
        >
          {SPECIALISTS.map((spec, i) => {
            const s3 = stage >= 3;
            const barColor = scoreColor(spec.score);

            return (
              <div
                key={spec.id}
                className={s3 && spec.selected ? "selected-glow" : ""}
                style={{
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.03)",
                  border: s3 && spec.selected
                    ? "1px solid rgba(0,212,255,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  backdropFilter: "blur(20px)",
                  opacity: stage === 0
                    ? 0
                    : s3
                      ? spec.selected ? 1 : 0.28
                      : 1,
                  filter: stage === 0
                    ? "brightness(0.6)"
                    : s3
                      ? spec.selected ? "brightness(1)" : "brightness(0.55)"
                      : "brightness(0.85)",
                  transform: s3 && spec.selected
                    ? "scale(1.07)"
                    : stage >= 1 ? "scale(1)" : "scale(0.95)",
                  transition: [
                    `opacity 400ms ease ${stage === 1 ? i * 100 : 0}ms`,
                    `filter 500ms ease`,
                    `transform 450ms cubic-bezier(0.4,0,0.2,1)`,
                    `border-color 400ms ease`,
                  ].join(", "),
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 48, height: 48,
                    borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 12,
                    background: s3 && spec.selected ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.06)",
                    border: s3 && spec.selected ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    transition: "background 400ms ease, border-color 400ms ease",
                  }}
                >
                  <spec.Icon
                    size={22}
                    style={{
                      color: s3 && spec.selected ? "var(--db-accent)" : "var(--db-text-secondary)",
                      transition: "color 400ms ease",
                    }}
                  />
                </div>

                {/* Name & subtitle */}
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--db-text-primary)", marginBottom: 4, lineHeight: 1.3 }}>
                  {spec.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--db-text-secondary)", marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {spec.subtitle}
                </div>

                {/* Score bar */}
                <div
                  style={{
                    width: "100%",
                    opacity: stage >= 2 ? 1 : 0,
                    transform: stage >= 2 ? "none" : "translateY(6px)",
                    transition: `opacity 300ms ease ${i * 200}ms, transform 300ms ease ${i * 200}ms`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em" }}>
                    <span style={{ color: "var(--db-text-secondary)", textTransform: "uppercase" }}>Relevance</span>
                    <span style={{ color: barColor }}>{displayScores[i]}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${displayScores[i]}%`,
                        borderRadius: 99,
                        background: barColor,
                        boxShadow: `0 0 8px ${barColor}88`,
                        transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${i * 200}ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SVG flow chart (stage 3+) ── */}
        <div
          style={{
            width: "100%",
            maxWidth: 680,
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 500ms ease, transform 500ms ease",
            marginBottom: 32,
          }}
        >
          <svg
            viewBox="0 0 680 148"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "auto", overflow: "visible" }}
          >
            {/* Center pill */}
            <rect x="270" y="12" width="140" height="40" rx="20"
              fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.38)" strokeWidth="1.5" />
            <text x="340" y="37" textAnchor="middle" fill="#00d4ff"
              fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="0.06em">
              LEAD DATA
            </text>

            {/* Left arrow */}
            <path d="M 308 52 C 276 82 196 92 155 106"
              fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round"
              className={`arrow-path ${stage >= 3 ? "arrow-draw" : ""}`} />
            {stage >= 3 && (
              <polygon points="143,104 157,100 159,114" fill="#00d4ff"
                style={{ opacity: 1, transition: "opacity 300ms 0.72s ease" }} />
            )}

            {/* Right arrow */}
            <path d="M 372 52 C 404 82 484 92 525 106"
              fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round"
              className={`arrow-path ${stage >= 3 ? "arrow-draw-delay" : ""}`} />
            {stage >= 3 && (
              <polygon points="537,104 523,100 521,114" fill="#00d4ff"
                style={{ opacity: 1, transition: "opacity 300ms 0.94s ease" }} />
            )}

            {/* Left label */}
            <text x="118" y="130" textAnchor="middle" fill="#e0e6ff"
              fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="500">
              Solutions Engineer
            </text>

            {/* Right label */}
            <text x="560" y="130" textAnchor="middle" fill="#e0e6ff"
              fontSize="10.5" fontFamily="Inter, sans-serif" fontWeight="500">
              Compliance Specialist
            </text>
          </svg>

          <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--db-text-secondary)", marginTop: 6, letterSpacing: "0.02em" }}>
            Healthcare + Compliance Requirements →{" "}
            <span style={{ color: "var(--db-accent)", fontWeight: 600 }}>
              Solutions Engineer + Compliance Specialist
            </span>
          </p>
        </div>

        {/* ── Final section (stage 4) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: stage >= 4 ? 1 : 0,
            transform: stage >= 4 ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 400ms ease, transform 400ms ease",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--db-text-secondary)", textAlign: "center", maxWidth: 460 }}>
            These specialists will review your scoped context brief and coordinate the engagement
          </p>

          <button
            data-testid="button-create-handoff-brief"
            onClick={() => setScreen("handoff")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 38px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "var(--app-font-sans)",
              color: "#0a0e27",
              background: "linear-gradient(135deg, #00d4ff, #0099cc)",
              border: "none",
              cursor: "pointer",
              opacity: buttonVisible ? 1 : 0,
              transform: buttonVisible ? "scale(1)" : "scale(0.95)",
              transition: "opacity 300ms ease, transform 300ms ease, box-shadow 300ms ease",
              boxShadow: buttonVisible ? "0 0 34px rgba(0,212,255,0.45)" : "none",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              Object.assign((e.currentTarget as HTMLButtonElement).style, {
                transform: "scale(1.04)",
                boxShadow: "0 0 54px rgba(0,212,255,0.65)",
              });
            }}
            onMouseLeave={(e) => {
              Object.assign((e.currentTarget as HTMLButtonElement).style, {
                transform: "scale(1)",
                boxShadow: "0 0 34px rgba(0,212,255,0.45)",
              });
            }}
          >
            Create Handoff Brief
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
