import { Router } from "express";

const router = Router();

export interface LeadRecord {
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
  auditEvents: Array<{
    time: string;
    actor: string;
    action: string;
    tag: string;
    tagColor: string;
  }>;
}

// ── Seeded mock leads ─────────────────────────────────────────────────────────
const LEADS_STORE: LeadRecord[] = [
  {
    id: "DB-A8F2C1",
    company: "Aethel Health Clinic",
    industry: "Healthcare",
    useCase: "AI voice-and-chat for patient intake",
    teamSize: "12–20 people",
    urgency: "High — pilot in 6 weeks",
    budget: "$50K–100K / year",
    integrations: "EHR (Epic) · HIPAA compliance · Single sign-on",
    stage: "Confirmed",
    specialist: "Solutions Engineer + Compliance Specialist",
    createdAt: "2 hours ago",
    score: 92,
    auditEvents: [
      { time: "2h 34m ago", actor: "AI COO", action: "Lead qualification started", tag: "Qualify", tagColor: "#00d4ff" },
      { time: "2h 31m ago", actor: "AI COO", action: "Use case extracted: Healthcare Voice/Chat", tag: "Extract", tagColor: "#00d4ff" },
      { time: "2h 28m ago", actor: "AI COO", action: "Company type identified: Clinic", tag: "Extract", tagColor: "#00d4ff" },
      { time: "2h 10m ago", actor: "AI COO", action: "Urgency flagged: High — 6 week pilot deadline", tag: "Flag", tagColor: "#f59e0b" },
      { time: "2h 04m ago", actor: "AI COO", action: "Integration need recorded: EHR (Epic)", tag: "Extract", tagColor: "#00d4ff" },
      { time: "1h 58m ago", actor: "AI COO", action: "Budget range captured: $50K–100K / year", tag: "Extract", tagColor: "#a78bfa" },
      { time: "1h 55m ago", actor: "Routing Engine", action: "Context brief compiled and scoped", tag: "Brief", tagColor: "#10b981" },
      { time: "1h 52m ago", actor: "Routing Engine", action: "Specialist match: Solutions Engineer (92% fit)", tag: "Route", tagColor: "#10b981" },
      { time: "1h 44m ago", actor: "You", action: "Routing accepted — handoff confirmed", tag: "Confirm", tagColor: "#10b981" },
    ],
  },
  {
    id: "DB-B3D9E7",
    company: "NovaPay Fintech",
    industry: "Finance",
    useCase: "Automated KYC and onboarding assistant",
    teamSize: "50–100 people",
    urgency: "Medium — Q3 rollout",
    budget: "$200K–500K / year",
    integrations: "Plaid API · Salesforce CRM · Auth0",
    stage: "Routing",
    specialist: "Enterprise Sales Director",
    createdAt: "5 hours ago",
    score: 78,
    auditEvents: [
      { time: "5h 10m ago", actor: "AI COO", action: "Lead qualification started", tag: "Qualify", tagColor: "#00d4ff" },
      { time: "5h 08m ago", actor: "AI COO", action: "Use case extracted: KYC Automation", tag: "Extract", tagColor: "#00d4ff" },
      { time: "4h 55m ago", actor: "AI COO", action: "Integration need: Plaid API + Salesforce", tag: "Extract", tagColor: "#00d4ff" },
      { time: "4h 48m ago", actor: "Routing Engine", action: "Context brief compiled", tag: "Brief", tagColor: "#10b981" },
      { time: "4h 45m ago", actor: "Routing Engine", action: "Specialist match: Enterprise Sales (78% fit)", tag: "Route", tagColor: "#10b981" },
    ],
  },
  {
    id: "DB-C7K1M4",
    company: "EduReach Academy",
    industry: "EdTech",
    useCase: "AI tutor chatbot for K-12 students",
    teamSize: "5–10 people",
    urgency: "Low — exploring options",
    budget: "$10K–30K / year",
    integrations: "Google Classroom · Canvas LMS",
    stage: "Qualified",
    specialist: "Pending",
    createdAt: "1 day ago",
    score: 61,
    auditEvents: [
      { time: "1d 2h ago", actor: "AI COO", action: "Lead qualification started", tag: "Qualify", tagColor: "#00d4ff" },
      { time: "1d 1h ago", actor: "AI COO", action: "Use case extracted: K-12 AI Tutor", tag: "Extract", tagColor: "#00d4ff" },
      { time: "1d 40m ago", actor: "AI COO", action: "Budget captured: $10K–30K / year", tag: "Extract", tagColor: "#a78bfa" },
    ],
  },
  {
    id: "DB-D2P8Q5",
    company: "LogiTrack Corp",
    industry: "Logistics",
    useCase: "Voice AI for warehouse operations",
    teamSize: "200–500 people",
    urgency: "High — live in 4 weeks",
    budget: "$150K–300K / year",
    integrations: "SAP ERP · Twilio · Slack",
    stage: "Handoff",
    specialist: "Solutions Engineer",
    createdAt: "3 hours ago",
    score: 88,
    auditEvents: [
      { time: "3h 20m ago", actor: "AI COO", action: "Lead qualification started", tag: "Qualify", tagColor: "#00d4ff" },
      { time: "3h 10m ago", actor: "AI COO", action: "Urgency flagged: High — 4 week deadline", tag: "Flag", tagColor: "#f59e0b" },
      { time: "2h 55m ago", actor: "Routing Engine", action: "Context brief compiled", tag: "Brief", tagColor: "#10b981" },
      { time: "2h 48m ago", actor: "Solutions Engineer", action: "Handoff brief sent to specialist", tag: "Handoff", tagColor: "#10b981" },
    ],
  },
  {
    id: "DB-E5R3T9",
    company: "MedSync Labs",
    industry: "Healthcare",
    useCase: "Clinical documentation AI assistant",
    teamSize: "30–50 people",
    urgency: "Medium — next quarter",
    budget: "$80K–150K / year",
    integrations: "HL7 FHIR · Azure AD · Epic",
    stage: "New",
    specialist: "Pending",
    createdAt: "Just now",
    score: 55,
    auditEvents: [
      { time: "Just now", actor: "AI COO", action: "Lead qualification started", tag: "Qualify", tagColor: "#00d4ff" },
    ],
  },
  {
    id: "DB-F9W6X2",
    company: "RetailAI Co.",
    industry: "Retail",
    useCase: "AI-powered customer support & returns",
    teamSize: "100–200 people",
    urgency: "High — holiday season prep",
    budget: "$100K–200K / year",
    integrations: "Shopify · Zendesk · Segment",
    stage: "Confirmed",
    specialist: "Customer Success Engineer",
    createdAt: "6 hours ago",
    score: 85,
    auditEvents: [
      { time: "6h 30m ago", actor: "AI COO", action: "Lead qualification started", tag: "Qualify", tagColor: "#00d4ff" },
      { time: "6h 20m ago", actor: "AI COO", action: "Urgency flagged: High — holiday deadline", tag: "Flag", tagColor: "#f59e0b" },
      { time: "5h 55m ago", actor: "Routing Engine", action: "Specialist match: Customer Success (85% fit)", tag: "Route", tagColor: "#10b981" },
      { time: "5h 44m ago", actor: "You", action: "Routing accepted — handoff confirmed", tag: "Confirm", tagColor: "#10b981" },
    ],
  },
];

// ── GET /api/leads ─────────────────────────────────────────────────────────────
router.get("/leads", (req, res) => {
  const search = (req.query.search as string | undefined)?.toLowerCase();
  const stage = req.query.stage as string | undefined;

  let leads = [...LEADS_STORE];

  if (search) {
    leads = leads.filter(
      (l) =>
        l.company.toLowerCase().includes(search) ||
        l.industry.toLowerCase().includes(search) ||
        l.useCase.toLowerCase().includes(search),
    );
  }

  if (stage && stage !== "All") {
    leads = leads.filter((l) => l.stage === stage);
  }

  res.json(leads);
});

// ── POST /api/leads ────────────────────────────────────────────────────────────
router.post("/leads", (req, res) => {
  const body = req.body as Partial<LeadRecord>;

  const now = new Date();
  const lead: LeadRecord = {
    id: `DB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    company: body.company ?? "Unknown",
    industry: body.industry ?? "General",
    useCase: body.useCase ?? "",
    teamSize: body.teamSize ?? "Unknown",
    urgency: body.urgency ?? "Unknown",
    budget: body.budget ?? "Unknown",
    integrations: body.integrations ?? "None specified",
    stage: "Qualified",
    specialist: "Pending",
    createdAt: "Just now",
    score: Math.min(98, Math.max(40, Math.floor(Math.random() * 35) + 55)),
    auditEvents: body.auditEvents ?? [
      {
        time: now.toLocaleTimeString(),
        actor: "AI COO",
        action: "Lead qualification completed via Prospect Chat",
        tag: "Qualify",
        tagColor: "#00d4ff",
      },
    ],
  };

  LEADS_STORE.unshift(lead);
  res.status(201).json(lead);
});

// ── GET /api/leads/:id ─────────────────────────────────────────────────────────
router.get("/leads/:id", (req, res) => {
  const lead = LEADS_STORE.find((l) => l.id === req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json(lead);
});

export default router;
