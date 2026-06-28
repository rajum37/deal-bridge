import { useEffect, useState } from "react";
import { useScreen } from "@/contexts/ScreenContext";
import { ArrowRight, CheckCircle } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────
interface BriefField {
  label: string;
  value: string;
  critical?: boolean;   // accent color for value
  wide?: boolean;       // spans both columns
  tag?: string;         // optional colored tag
  tagColor?: string;
}

const BRIEF_FIELDS: BriefField[] = [
  {
    label: "Company Name",
    value: "Aethel Health Clinic",
  },
  {
    label: "Industry",
    value: "Healthcare",
    tag: "Regulated",
    tagColor: "#f59e0b",
  },
  {
    label: "Use Case",
    value: "AI voice-and-chat for patient intake",
    wide: true,
  },
  {
    label: "Team Size",
    value: "12–20 people",
  },
  {
    label: "Urgency",
    value: "High — pilot in 6 weeks",
    critical: true,
    tag: "HIGH",
    tagColor: "#ef4444",
  },
  {
    label: "Integration Requirements",
    value: "EHR (Epic) · HIPAA compliance · Single sign-on",
    wide: true,
  },
  {
    label: "Budget",
    value: "$50K–100K / year",
    critical: true,
  },
  {
    label: "Best Next Owner",
    value: "Solutions Engineer + Compliance Specialist",
    tag: "Matched",
    tagColor: "#10b981",
  },
];

const STAGGER_MS = 100; // delay between each card
const DURATION_MS = 300;

// ── Animated ellipsis ─────────────────────────────────────────────────────────
function AnimatedEllipsis() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 520);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ letterSpacing: "0.08em" }}>
      {"·".repeat(dots)}
      <span style={{ opacity: 0 }}>{"·".repeat(3 - dots)}</span>
    </span>
  );
}

// ── Card component ────────────────────────────────────────────────────────────
function BriefCard({
  field,
  index,
  visible,
  allDone,
}: {
  field: BriefField;
  index: number;
  visible: boolean;
  allDone: boolean;
}) {
  const delay = index * STAGGER_MS;

  return (
    <div
      style={{
        gridColumn: field.wide ? "1 / -1" : undefined,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity ${DURATION_MS}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms,
                     transform ${DURATION_MS}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms,
                     box-shadow 600ms ease ${delay}ms`,
        // Glow pulse immediately after sliding in, then settle
        boxShadow:
          visible && !allDone
            ? "0 0 22px rgba(0,212,255,0.28)"
            : "0 0 0px rgba(0,212,255,0)",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.035)",
        border: field.critical
          ? "1px solid rgba(0,212,255,0.25)"
          : "1px solid rgba(255,255,255,0.08)",
        padding: "16px 18px",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#a5b4fc", // lavender-400
          }}
        >
          {field.label}
        </span>
        {field.tag && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: "20px",
              color: field.tagColor ?? "#00d4ff",
              background: `${field.tagColor ?? "#00d4ff"}18`,
              border: `1px solid ${field.tagColor ?? "#00d4ff"}35`,
              flexShrink: 0,
            }}
          >
            {field.tag}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "14px",
          fontWeight: field.critical ? 600 : 400,
          lineHeight: 1.5,
          color: field.critical ? "var(--db-accent)" : "var(--db-text-primary)",
          textShadow: field.critical
            ? "0 0 16px rgba(0,212,255,0.35)"
            : "none",
        }}
      >
        {field.value}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountBrief() {
  const { setScreen } = useScreen();
  const [visibleCount, setVisibleCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [hueAngle, setHueAngle] = useState(0);

  // Stagger cards in on mount
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BRIEF_FIELDS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount((c) => Math.max(c, i + 1));
        }, 120 + i * STAGGER_MS),
      );
    });

    // Mark all done after last card finishes animating
    const doneDelay =
      120 + BRIEF_FIELDS.length * STAGGER_MS + DURATION_MS + 200;
    timers.push(setTimeout(() => setAllDone(true), doneDelay));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Slow hue-rotate on background gradient after cards load
  useEffect(() => {
    if (!allDone) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      // Full cycle in 20 000ms
      setHueAngle((elapsed / 20_000) * 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [allDone]);

  return (
    <>
      <style>{`
        @keyframes briefCardGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(0,212,255,0); }
          50%       { box-shadow: 0 0 24px rgba(0,212,255,0.28); }
        }
        .route-btn {
          transition: transform 300ms ease, box-shadow 300ms ease, background 300ms ease;
        }
        .route-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 0 50px rgba(0,212,255,0.65) !important;
        }
        .route-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <div
        className="flex flex-col items-center justify-start w-full px-4 py-8"
        style={{
          minHeight: "calc(100dvh - 60px - 44px)",
          /* Slow hue-shifting ambient gradient */
          background: allDone
            ? `radial-gradient(ellipse 80% 60% at 50% 10%,
                hsl(${195 + hueAngle % 40}, 80%, 12%) 0%,
                #0a0e27 65%)`
            : "transparent",
          transition: "background 2s ease",
        }}
      >
        {/* ── Main card ── */}
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            backdropFilter: "blur(24px)",
            padding: "clamp(24px, 4vw, 44px)",
            boxShadow: "0 0 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* ── Header ── */}
          <div style={{ marginBottom: "28px" }}>
            {/* Top badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "20px",
                marginBottom: "14px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--db-accent)",
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.18)",
              }}
            >
              <CheckCircle size={11} />
              Context Brief · Auto-generated
            </div>

            <h1
              style={{
                fontFamily: "var(--app-font-serif)",
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 600,
                color: "var(--db-accent)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                textShadow: "0 0 30px rgba(0,212,255,0.2)",
                marginBottom: "6px",
              }}
            >
              Account Context Brief
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--db-text-secondary)",
              }}
            >
              Structured from qualification conversation · Ready for specialist handoff
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)",
              marginBottom: "28px",
            }}
          />

          {/* ── Data grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
              marginBottom: "36px",
            }}
          >
            {BRIEF_FIELDS.map((field, i) => (
              <BriefCard
                key={field.label}
                field={field}
                index={i}
                visible={visibleCount > i}
                allDone={allDone}
              />
            ))}
          </div>

          {/* ── Bottom section ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              opacity: allDone ? 1 : 0,
              transform: allDone ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 400ms ease, transform 400ms ease",
            }}
          >
            <button
              data-testid="button-route-to-specialist"
              className="route-btn"
              onClick={() => setScreen("routing")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 40px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "var(--app-font-sans)",
                color: "#0a0e27",
                background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 30px rgba(0,212,255,0.4)",
                letterSpacing: "0.01em",
              }}
            >
              Route to Specialist
              <ArrowRight size={17} />
            </button>

            <p
              style={{
                fontSize: "12px",
                color: "var(--db-text-secondary)",
                letterSpacing: "0.03em",
              }}
            >
              Analyzing best fit<AnimatedEllipsis />
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
