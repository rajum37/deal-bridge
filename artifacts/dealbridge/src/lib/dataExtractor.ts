export interface LeadData {
  useCase: string | null;
  companyType: string | null;
  teamSize: string | null;
  urgency: string | null;
  integrations: string | null;
  budget: string | null;
}

export function extractDataFromMessage(message: string): Partial<LeadData> {
  const lower = message.toLowerCase();
  const result: Partial<LeadData> = {};

  // ── USE CASE ────────────────────────────────────────────────────────────────
  if (lower.includes("voice") && lower.includes("chat")) {
    result.useCase = "AI Voice/Chat Workflow";
  } else if (lower.includes("voice")) {
    result.useCase = "AI Voice Workflow";
  } else if (lower.includes("chat") || lower.includes("chatbot")) {
    result.useCase = "AI Chat Workflow";
  } else if (lower.includes("intake") || lower.includes("onboarding")) {
    result.useCase = "Patient Intake System";
  } else if (lower.includes("document") || lower.includes("doc")) {
    result.useCase = "Document Automation";
  } else if (lower.includes("support") || lower.includes("helpdesk")) {
    result.useCase = "Customer Support Automation";
  } else if (lower.includes("scheduling") || lower.includes("appointment")) {
    result.useCase = "Scheduling Automation";
  } else if (lower.includes("search") || lower.includes("knowledge")) {
    result.useCase = "Knowledge Search";
  }

  // ── COMPANY TYPE ────────────────────────────────────────────────────────────
  if (lower.includes("clinic")) {
    result.companyType = "Healthcare Clinic";
  } else if (lower.includes("hospital")) {
    result.companyType = "Hospital";
  } else if (lower.includes("health system") || lower.includes("idn")) {
    result.companyType = "Integrated Health System";
  } else if (lower.includes("pharmacy") || lower.includes("pharma")) {
    result.companyType = "Pharmaceutical / Pharmacy";
  } else if (lower.includes("saas")) {
    result.companyType = "SaaS Company";
  } else if (lower.includes("startup")) {
    result.companyType = "Startup";
  } else if (lower.includes("agency")) {
    result.companyType = "Agency";
  } else if (lower.includes("law firm") || lower.includes("legal")) {
    result.companyType = "Law Firm";
  } else if (lower.includes("bank") || lower.includes("financial")) {
    result.companyType = "Financial Services";
  } else if (lower.includes("retail") || lower.includes("ecommerce") || lower.includes("e-commerce")) {
    result.companyType = "Retail / E-Commerce";
  } else if (lower.includes("enterprise") || lower.includes("corporation")) {
    result.companyType = "Enterprise";
  }

  // ── TEAM SIZE ───────────────────────────────────────────────────────────────
  const rangeMatch = message.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(people|users?|staff|person|employees?|seats?)?/i);
  const singleMatch = message.match(/(\d+)\s*(people|users?|staff|person|employees?|seats?)/i);
  const approxMatch = message.match(/(?:about|around|~|roughly)\s*(\d+)/i);

  if (rangeMatch) {
    result.teamSize = `${rangeMatch[1]}–${rangeMatch[2]} people`;
  } else if (singleMatch) {
    result.teamSize = `${singleMatch[1]} people`;
  } else if (approxMatch) {
    result.teamSize = `~${approxMatch[1]} people`;
  } else if (lower.includes("small team") || lower.includes("just us") || lower.includes("just me")) {
    result.teamSize = "5–10 people";
  } else if (lower.includes("large team") || lower.includes("big team")) {
    result.teamSize = "50+ people";
  } else if (lower.includes("hundred") || lower.includes("hundreds")) {
    result.teamSize = "100+ people";
  }

  // ── URGENCY ─────────────────────────────────────────────────────────────────
  const weekMatch = message.match(/(\d+)\s*week/i);
  const monthMatch = message.match(/(\d+)\s*month/i);

  if (lower.includes("urgent") || lower.includes("asap") || lower.includes("rush") || lower.includes("immediately")) {
    result.urgency = "High — ASAP";
  } else if (weekMatch) {
    result.urgency = `High — ${weekMatch[1]} week${parseInt(weekMatch[1]) > 1 ? "s" : ""}`;
  } else if (lower.includes("soon") || lower.includes("quickly") || lower.includes("fast")) {
    result.urgency = "High — weeks";
  } else if (monthMatch) {
    const n = parseInt(monthMatch[1]);
    result.urgency = n <= 3 ? `Medium — ${monthMatch[1]} months` : `Low — ${monthMatch[1]} months`;
  } else if (lower.includes("next quarter") || lower.includes("q")) {
    result.urgency = "Medium — next quarter";
  } else if (lower.includes("no rush") || lower.includes("exploring") || lower.includes("researching")) {
    result.urgency = "Low — exploring";
  }

  // ── INTEGRATIONS ────────────────────────────────────────────────────────────
  const integrations: string[] = [];

  if (lower.includes("epic")) integrations.push("Epic EHR");
  if (lower.includes("cerner")) integrations.push("Cerner EHR");
  if (lower.includes("athena")) integrations.push("Athenahealth");
  if (lower.includes("salesforce") || lower.includes("sfdc")) integrations.push("Salesforce");
  if (lower.includes("hubspot")) integrations.push("HubSpot");
  if (lower.includes("slack")) integrations.push("Slack");
  if (lower.includes("teams") || lower.includes("microsoft teams")) integrations.push("MS Teams");
  if (lower.includes("sso") || lower.includes("single sign")) integrations.push("SSO/SAML");
  if (lower.includes("hipaa")) integrations.push("HIPAA Compliance");
  if (lower.includes("zapier")) integrations.push("Zapier");
  if (lower.includes("twilio")) integrations.push("Twilio");
  if (lower.includes("zendesk")) integrations.push("Zendesk");

  if (integrations.length > 0) {
    result.integrations = integrations.join(", ");
  } else if (lower.includes("ehr") || lower.includes("emr")) {
    result.integrations = "EHR/EMR (unspecified)";
  } else if (lower.includes("crm")) {
    result.integrations = "CRM (unspecified)";
  } else if (lower.includes("no integration") || lower.includes("standalone") || lower.includes("greenfield")) {
    result.integrations = "None — standalone";
  }

  // ── BUDGET ──────────────────────────────────────────────────────────────────
  const dollarRange = message.match(/\$\s*([\d,]+[kKmM]?)\s*[-–to]+\s*\$?\s*([\d,]+[kKmM]?)/i);
  const dollarSingle = message.match(/\$\s*([\d,]+[kKmM]?)/i);

  if (dollarRange) {
    result.budget = `$${dollarRange[1]}–$${dollarRange[2]}/year`;
  } else if (dollarSingle) {
    result.budget = `$${dollarSingle[1]}/year`;
  } else if (lower.includes("100k") || (lower.includes("100") && lower.includes("thousand"))) {
    result.budget = "$100K+/year";
  } else if (lower.includes("enterprise budget") || lower.includes("large budget")) {
    result.budget = "$100K+/year";
  } else if (lower.includes("small budget") || lower.includes("limited budget") || lower.includes("bootstrap")) {
    result.budget = "<$25K/year";
  } else if (lower.includes("startup") && !result.budget) {
    result.budget = "$10K–50K/year";
  }

  return result;
}
