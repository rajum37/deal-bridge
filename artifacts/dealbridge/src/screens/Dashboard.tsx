import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Users, TrendingUp, CheckCircle, AlertCircle, Circle, X, Search } from "lucide-react";

// ── Mock lead data ────────────────────────────────────────────────────────────
export interface Lead {
  id: string;
  company: string;
  industry: string;
  useCase: string;
  teamSize: string;
  urgency: string;
  budget: string;
  integrations: string;
  stage: "New" | "Qualified" | "Routing" | "Handoff" | "Confirmed";
  specialist: string;
  createdAt: string;
  score: number;
  auditEvents: AuditEvent[];
}

interface AuditEvent {
  time: string;
  actor: string;
  action: string;
  tag: string;
  tagColor: string;
}


// ── Helpers ───────────────────────────────────────────────────────────────────
function stageColor(stage: Lead["stage"]) {
  switch (stage) {
    case "New":       return { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)" };
    case "Qualified": return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)" };
    case "Routing":   return { color: "#00d4ff", bg: "rgba(0,212,255,0.12)",   border: "rgba(0,212,255,0.25)" };
    case "Handoff":   return { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" };
    case "Confirmed": return { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" };
  }
}

function stageIcon(stage: Lead["stage"]) {
  switch (stage) {
    case "New":       return <Circle size={11} />;
    case "Qualified": return <AlertCircle size={11} />;
    case "Routing":   return <TrendingUp size={11} />;
    case "Handoff":   return <Users size={11} />;
    case "Confirmed": return <CheckCircle size={11} />;
  }
}

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "18px 20px",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--db-text-secondary)", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? "var(--db-accent)", lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--db-text-secondary)" }}>{sub}</div>}
    </div>
  );
}

// ── Lead row ──────────────────────────────────────────────────────────────────
function LeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { color, bg, border } = stageColor(lead.stage);
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 200ms, border-color 200ms, transform 150ms",
      }}
      onMouseEnter={(e) => {
        Object.assign((e.currentTarget as HTMLButtonElement).style, {
          background: "rgba(0,212,255,0.04)",
          borderColor: "rgba(0,212,255,0.18)",
          transform: "translateX(2px)",
        });
      }}
      onMouseLeave={(e) => {
        Object.assign((e.currentTarget as HTMLButtonElement).style, {
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
          transform: "translateX(0)",
        });
      }}
    >
      {/* Score ring */}
      <div
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${scoreColor(lead.score)}18`,
          border: `2px solid ${scoreColor(lead.score)}55`,
          fontSize: 13,
          fontWeight: 700,
          color: scoreColor(lead.score),
        }}
      >
        {lead.score}
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--db-text-primary)" }}>{lead.company}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20, background: bg, border: `1px solid ${border}`, color, display: "flex", alignItems: "center", gap: 4 }}>
            {stageIcon(lead.stage)}
            {lead.stage}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--db-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lead.industry} · {lead.useCase}
        </div>
      </div>

      {/* Time */}
      <div style={{ flexShrink: 0, fontSize: 11, color: "rgba(136,146,176,0.5)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
        <Clock size={10} />
        {lead.createdAt}
      </div>

      <div style={{ flexShrink: 0, color: "rgba(136,146,176,0.3)", fontSize: 18 }}>›</div>
    </button>
  );
}

// ── Lead detail panel ─────────────────────────────────────────────────────────
function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { color, bg, border } = stageColor(lead.stage);
  const [auditOpen, setAuditOpen] = useState(false);

  const briefFields = [
    { label: "Company Name", value: lead.company },
    { label: "Industry", value: lead.industry },
    { label: "Use Case", value: lead.useCase, wide: true },
    { label: "Team Size", value: lead.teamSize },
    { label: "Urgency", value: lead.urgency, critical: true },
    { label: "Integrations", value: lead.integrations, wide: true },
    { label: "Budget", value: lead.budget, critical: true },
    { label: "Assigned Specialist", value: lead.specialist },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(5,8,24,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 16px 24px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 18,
          background: "rgba(10,14,39,0.98)",
          border: "1px solid rgba(0,212,255,0.15)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 0 80px rgba(0,212,255,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${scoreColor(lead.score)}18`,
              border: `2px solid ${scoreColor(lead.score)}55`,
              fontSize: 16,
              fontWeight: 700,
              color: scoreColor(lead.score),
              flexShrink: 0,
            }}
          >
            {lead.score}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--db-text-primary)", fontFamily: "var(--app-font-serif)", margin: 0 }}>
                {lead.company}
              </h2>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: bg, border: `1px solid ${border}`, color, display: "flex", alignItems: "center", gap: 4 }}>
                {stageIcon(lead.stage)}
                {lead.stage}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--db-text-secondary)" }}>
              Lead ID: {lead.id} · {lead.createdAt}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={16} style={{ color: "var(--db-text-secondary)" }} />
          </button>
        </div>

        {/* Brief fields grid */}
        <div style={{ padding: "20px 24px 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: 16,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--db-accent)",
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.18)",
            }}
          >
            <CheckCircle size={10} />
            Account Context Brief
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {briefFields.map((f) => (
              <div
                key={f.label}
                style={{
                  gridColumn: f.wide ? "1 / -1" : undefined,
                  background: "rgba(255,255,255,0.03)",
                  border: f.critical ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#a5b4fc", marginBottom: 6 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: f.critical ? 600 : 400, color: f.critical ? "var(--db-accent)" : "var(--db-text-primary)", lineHeight: 1.45 }}>
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit trail preview */}
        <div style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={14} style={{ color: "var(--db-accent)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--db-text-primary)" }}>Audit Trail</span>
                <span style={{ fontSize: 10, color: "var(--db-text-secondary)" }}>{lead.auditEvents.length} events</span>
              </div>
              <button
                onClick={() => setAuditOpen((v) => !v)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--db-accent)",
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                {auditOpen ? "Collapse" : "Expand All"}
              </button>
            </div>

            {/* Events */}
            <div style={{ padding: "8px 16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
              {(auditOpen ? lead.auditEvents : lead.auditEvents.slice(-4)).map((ev, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: i === arr.length - 1 ? "rgba(16,185,129,0.04)" : "transparent",
                    border: i === arr.length - 1 ? "1px solid rgba(16,185,129,0.12)" : "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, flexShrink: 0 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: ev.tagColor, boxShadow: `0 0 5px ${ev.tagColor}80` }} />
                    {i < arr.length - 1 && <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.07)", marginTop: 3 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--db-text-primary)" }}>{ev.actor}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", padding: "1px 6px", borderRadius: 20, background: `${ev.tagColor}18`, border: `1px solid ${ev.tagColor}40`, color: ev.tagColor }}>
                        {ev.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--db-text-secondary)", lineHeight: 1.4 }}>{ev.action}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(136,146,176,0.4)", flexShrink: 0, paddingTop: 2, whiteSpace: "nowrap" }}>
                    {ev.time}
                  </div>
                </div>
              ))}

              {!auditOpen && lead.auditEvents.length > 4 && (
                <button
                  onClick={() => setAuditOpen(true)}
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "var(--db-text-secondary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "4px 10px",
                  }}
                >
                  + {lead.auditEvents.length - 4} more events
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStage, setFilterStage] = useState<Lead["stage"] | "All">("All");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data: Lead[]) => { setLeads(data); setLoadingLeads(false); })
      .catch(() => setLoadingLeads(false));
  }, []);

  const stageCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] ?? 0) + 1;
    return acc;
  }, {});

  const filteredLeads = leads
    .filter((l) => filterStage === "All" || l.stage === filterStage)
    .filter((l) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.company.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.useCase.toLowerCase().includes(q)
      );
    });

  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0;
  const confirmedCount = stageCounts["Confirmed"] ?? 0;

  const STAGES: Array<Lead["stage"] | "All"> = ["All", "New", "Qualified", "Routing", "Handoff", "Confirmed"];

  return (
    <>
      {selectedLead && (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
          padding: "clamp(20px, 3vw, 36px) 16px",
          minHeight: "calc(100dvh - 60px - 44px)",
        }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: 12,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--db-accent)",
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.18)",
            }}
          >
            <TrendingUp size={10} />
            Live Pipeline
          </div>
          <h1
            style={{
              fontFamily: "var(--app-font-serif)",
              fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 600,
              color: "var(--db-accent)",
              letterSpacing: "-0.01em",
              textShadow: "0 0 28px rgba(0,212,255,0.2)",
              marginBottom: 4,
            }}
          >
            Lead Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--db-text-secondary)" }}>
            All inbound leads · AI-qualified · Click any row to view full brief and audit
          </p>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <StatCard label="Total Leads" value={leads.length} sub="all time" />
          <StatCard label="Confirmed" value={confirmedCount} sub="routed to specialist" color="#10b981" />
          <StatCard label="Avg. Score" value={`${avgScore}%`} sub="AI qualification score" color={scoreColor(avgScore)} />
          <StatCard label="In Pipeline" value={leads.length - confirmedCount} sub="active leads" color="#f59e0b" />
        </div>

        {/* ── Search + filter row ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {/* Search input */}
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(136,146,176,0.5)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by company, industry, use case…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 30,
                paddingRight: 12,
                paddingTop: 7,
                paddingBottom: 7,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--db-text-primary)",
                fontSize: 12,
                outline: "none",
                fontFamily: "var(--app-font-sans)",
                transition: "border-color 200ms",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>
        </div>

        {/* ── Stage filter pills ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {STAGES.map((s) => {
            const active = filterStage === s;
            const count = s === "All" ? leads.length : (stageCounts[s] ?? 0);
            const sc = s === "All" ? { color: "var(--db-accent)", bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.25)" } : stageColor(s as Lead["stage"]);
            return (
              <button
                key={s}
                onClick={() => setFilterStage(s)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 200ms",
                  background: active ? sc.bg : "rgba(255,255,255,0.03)",
                  border: active ? `1px solid ${sc.border}` : "1px solid rgba(255,255,255,0.08)",
                  color: active ? sc.color : "var(--db-text-secondary)",
                }}
              >
                {s}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 20,
                    background: active ? `${sc.color}22` : "rgba(255,255,255,0.06)",
                    color: active ? sc.color : "var(--db-text-secondary)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Lead list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loadingLeads ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--db-text-secondary)", fontSize: 14 }}>
              Loading leads…
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--db-text-secondary)", fontSize: 14 }}>
              {searchQuery ? `No leads matching "${searchQuery}"` : "No leads in this stage"}
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onClick={() => setSelectedLead(lead)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
