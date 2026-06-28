import { Router } from "express";
import {
  ListDealsQueryParams,
  CreateDealBody,
  UpdateDealBody,
  ScoreDealBody,
  ListActivityQueryParams,
} from "@workspace/api-zod";

const router = Router();

const AICOO_BASE = "https://www.aicoo.io/api/v1";

async function aicooProxy(path: string, options: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${AICOO_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    throw new Error(`Aicoo API error: ${res.status}`);
  }
  return res.json();
}

// Mock data for demo (no backend persistence yet)
const MOCK_DEALS = [
  {
    id: "deal-001",
    title: "Enterprise SaaS Deal - TechCorp",
    company: "TechCorp Inc.",
    contactName: "Sarah Chen",
    contactEmail: "sarah@techcorp.com",
    value: 120000,
    stage: "negotiation",
    score: 87,
    industry: "Technology",
    notes: "Strong fit with our enterprise tier. Procurement involved.",
    aiSummary: "High-value enterprise deal with strong buy signals. Decision-maker engaged.",
    tags: ["enterprise", "saas", "priority"],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "deal-002",
    title: "Series B Funding Bridge",
    company: "GreenLeaf Ventures",
    contactName: "Marcus Rivera",
    contactEmail: "m.rivera@greenleaf.vc",
    value: 500000,
    stage: "proposal",
    score: 72,
    industry: "Finance",
    notes: "Interested in AI-powered due diligence. Meeting next week.",
    aiSummary: "Promising VC relationship. Strong interest in AI features. Needs custom demo.",
    tags: ["vc", "funding", "ai-focus"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "deal-003",
    title: "Healthcare Analytics Platform",
    company: "MedInsight Group",
    contactName: "Dr. Lisa Park",
    contactEmail: "l.park@medinsight.com",
    value: 85000,
    stage: "qualified",
    score: 65,
    industry: "Healthcare",
    notes: "HIPAA compliance is a key requirement.",
    aiSummary: "Mid-stage opportunity with compliance complexity. Timeline 60-90 days.",
    tags: ["healthcare", "compliance", "analytics"],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: null,
  },
  {
    id: "deal-004",
    title: "Retail Chain Integration",
    company: "NexMart Retail",
    contactName: "James O'Brien",
    contactEmail: "j.obrien@nexmart.com",
    value: 210000,
    stage: "closed_won",
    score: 95,
    industry: "Retail",
    notes: "Closed Q4. Integration starts next month.",
    aiSummary: "Successfully closed. Strong champion relationship drove this deal.",
    tags: ["retail", "won", "integration"],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "deal-005",
    title: "Fintech Startup Pilot",
    company: "PayFlow AI",
    contactName: "Anika Sharma",
    contactEmail: "anika@payflow.ai",
    value: 25000,
    stage: "lead",
    score: 48,
    industry: "Fintech",
    notes: "Inbound lead from conference. Early stage evaluation.",
    aiSummary: "Early-stage lead with high growth potential. Needs nurturing.",
    tags: ["fintech", "startup", "inbound"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: null,
  },
  {
    id: "deal-006",
    title: "Legal Tech Automation",
    company: "LexaDigital Corp",
    contactName: "Tom Harrison",
    contactEmail: "t.harrison@lexadigital.com",
    value: 60000,
    stage: "closed_lost",
    score: 31,
    industry: "Legal",
    notes: "Lost to competitor. Price sensitivity.",
    aiSummary: "Competitor pricing undercut us. Revisit in 6 months.",
    tags: ["legal", "lost", "revisit"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_INSIGHTS = [
  {
    id: "ins-001",
    title: "Enterprise segment showing 23% higher close rates",
    body: "Deals in the enterprise segment (>$100K) are closing at 23% higher rates this quarter compared to SMB. Consider reallocating resources toward enterprise prospecting.",
    type: "opportunity",
    relevantDealIds: ["deal-001", "deal-004"],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ins-002",
    title: "Healthcare deals averaging 45-day longer sales cycles",
    body: "HIPAA compliance requirements are extending healthcare deal cycles by an average of 45 days. Pre-qualifying compliance readiness early could accelerate these deals.",
    type: "risk",
    relevantDealIds: ["deal-003"],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ins-003",
    title: "AI scoring accuracy improved to 91%",
    body: "The DealBridge AI model has reached 91% accuracy on deal outcome predictions based on the last 30 closed deals. Deals scoring above 80 have a 78% win rate.",
    type: "market",
    relevantDealIds: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_ACTIVITY = [
  { id: "act-001", type: "deal_stage_changed", description: "TechCorp deal moved to Negotiation", dealId: "deal-001", dealTitle: "Enterprise SaaS Deal - TechCorp", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "act-002", type: "ai_scored", description: "AI scored GreenLeaf Ventures deal: 72/100", dealId: "deal-002", dealTitle: "Series B Funding Bridge", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: "act-003", type: "deal_won", description: "NexMart Retail deal marked as Closed Won — $210K", dealId: "deal-004", dealTitle: "Retail Chain Integration", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "act-004", type: "deal_created", description: "New lead: PayFlow AI added to pipeline", dealId: "deal-005", dealTitle: "Fintech Startup Pilot", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "act-005", type: "note_added", description: "Note added to MedInsight Group deal", dealId: "deal-003", dealTitle: "Healthcare Analytics Platform", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "act-006", type: "deal_lost", description: "LexaDigital deal marked as Closed Lost", dealId: "deal-006", dealTitle: "Legal Tech Automation", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

// GET /api/deals
router.get("/deals", (req, res) => {
  const parsed = ListDealsQueryParams.safeParse(req.query);
  let deals = [...MOCK_DEALS];
  if (parsed.success) {
    if (parsed.data.stage) {
      deals = deals.filter((d) => d.stage === parsed.data.stage);
    }
    if (parsed.data.search) {
      const s = parsed.data.search.toLowerCase();
      deals = deals.filter(
        (d) =>
          d.title.toLowerCase().includes(s) ||
          d.company.toLowerCase().includes(s)
      );
    }
  }
  res.json(deals);
});

// POST /api/deals
router.post("/deals", (req, res) => {
  const parsed = CreateDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid deal data" });
    return;
  }
  const deal = {
    id: `deal-${Date.now()}`,
    ...parsed.data,
    score: Math.floor(Math.random() * 40) + 40,
    aiSummary: null as string | null,
    createdAt: new Date().toISOString(),
    updatedAt: null as string | null,
    tags: parsed.data.tags ?? [],
    contactName: parsed.data.contactName ?? null,
    contactEmail: parsed.data.contactEmail ?? null,
    industry: parsed.data.industry ?? null,
    notes: parsed.data.notes ?? null,
  };
  MOCK_DEALS.unshift(deal as (typeof MOCK_DEALS)[0]);
  res.status(201).json(deal);
});

// GET /api/deals/:id
router.get("/deals/:id", (req, res) => {
  const deal = MOCK_DEALS.find((d) => d.id === req.params.id);
  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  res.json(deal);
});

// PATCH /api/deals/:id
router.patch("/deals/:id", (req, res) => {
  const idx = MOCK_DEALS.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  const parsed = UpdateDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid update data" });
    return;
  }
  MOCK_DEALS[idx] = {
    ...MOCK_DEALS[idx],
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };
  res.json(MOCK_DEALS[idx]);
});

// DELETE /api/deals/:id
router.delete("/deals/:id", (req, res) => {
  const idx = MOCK_DEALS.findIndex((d) => d.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  MOCK_DEALS.splice(idx, 1);
  res.status(204).send();
});

// POST /api/deals/:id/analyze
router.post("/deals/:id/analyze", (req, res) => {
  const deal = MOCK_DEALS.find((d) => d.id === req.params.id);
  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  res.json({
    dealId: deal.id,
    score: deal.score,
    summary: deal.aiSummary ?? `AI analysis for ${deal.title}: Strong market fit detected based on company profile and engagement signals.`,
    strengths: [
      "Active stakeholder engagement",
      "Strong industry alignment",
      "Budget authority confirmed",
    ],
    risks: [
      "Competitive pressure from 2 other vendors",
      "Extended procurement timeline likely",
    ],
    recommendations: [
      "Schedule executive sponsor meeting within 7 days",
      "Prepare custom ROI analysis",
      "Offer a pilot program to reduce perceived risk",
    ],
    winProbability: deal.score / 100,
    estimatedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

// POST /api/ai/score
router.post("/ai/score", (req, res) => {
  const parsed = ScoreDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid score input" });
    return;
  }
  const score = Math.floor(Math.random() * 40) + 50;
  res.json({
    score,
    confidence: 0.87,
    factors: [
      "Company size matches ideal customer profile",
      "Multiple stakeholders engaged",
      "Budget confirmed in discovery",
      "Timeline aligned with quarter close",
    ],
  });
});

// GET /api/ai/insights
router.get("/ai/insights", (_req, res) => {
  res.json(MOCK_INSIGHTS);
});

// GET /api/activity
router.get("/activity", (req, res) => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? parsed.data.limit : 20;
  res.json(MOCK_ACTIVITY.slice(0, limit));
});

// GET /api/stats/dashboard
router.get("/stats/dashboard", (_req, res) => {
  const won = MOCK_DEALS.filter((d) => d.stage === "closed_won");
  const lost = MOCK_DEALS.filter((d) => d.stage === "closed_lost");
  const active = MOCK_DEALS.filter(
    (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
  );
  const totalValue = MOCK_DEALS.reduce((s, d) => s + d.value, 0);
  const avgScore =
    MOCK_DEALS.reduce((s, d) => s + d.score, 0) / MOCK_DEALS.length;
  res.json({
    totalDeals: MOCK_DEALS.length,
    totalValue,
    avgScore: Math.round(avgScore),
    closedWon: won.length,
    closedLost: lost.length,
    winRate: won.length / (won.length + lost.length),
    avgDealSize: totalValue / MOCK_DEALS.length,
    dealsThisMonth: active.length,
    valueThisMonth: active.reduce((s, d) => s + d.value, 0),
  });
});

// GET /api/stats/pipeline
router.get("/stats/pipeline", (_req, res) => {
  const stages = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
  const result = stages.map((stage) => {
    const stageDeals = MOCK_DEALS.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + d.value, 0),
      avgScore:
        stageDeals.length > 0
          ? Math.round(stageDeals.reduce((s, d) => s + d.score, 0) / stageDeals.length)
          : 0,
    };
  });
  res.json(result);
});

export default router;
