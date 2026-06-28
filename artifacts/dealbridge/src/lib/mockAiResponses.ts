const mockResponses: Record<string, string> = {
  // Industry / vertical
  healthcare:
    "Healthcare is one of our strongest verticals — we have specialists in clinical voice workflows and HIPAA-compliant deployments. What type of facility are you working with?",
  clinic:
    "Clinic deployments are very common for us. Are you looking to integrate with an existing EHR system like Epic or Cerner, or starting greenfield?",
  hospital:
    "Hospital-scale deployments need robust uptime and deep EHR integration. How many departments or units would this solution touch?",
  finance:
    "Financial services is a strong fit — we handle compliance-heavy environments well. Are you working within retail banking, wealth management, or something else?",
  legal:
    "Legal workflows often hinge on accuracy and confidentiality. Are you thinking of document automation, client intake, or internal knowledge search?",
  retail:
    "Retail AI solutions can range from customer service automation to inventory ops. Which side of the business is this for?",
  saas:
    "SaaS companies often use us for onboarding automation or in-app support flows. What's the use case you're trying to solve?",

  // Team / company
  people:
    "Good to know the team size — that helps us scope licensing and onboarding. Are most of those users technical, or primarily business-side?",
  team:
    "Got it on the team. Would this be deployed to internal staff, external customers, or both?",
  startup:
    "Startups often benefit from our lean onboarding path — faster to pilot, lower initial commitment. What stage are you at?",
  enterprise:
    "Enterprise deployments have more moving parts — SSO, audit logging, dedicated support. Do you have a procurement or security review process we'd need to pass?",

  // Timeline
  urgent:
    "Tight timelines are doable — our fastest pilots run in 3–4 weeks with scoped requirements. What's the hard deadline driven by?",
  pilot:
    "Pilots are a great starting point. What does success look like for you at the end of a pilot — specific metrics or outcomes?",
  deadline:
    "Understood on the deadline. To hit that, we'd want to lock scope in the first week. What's the one feature that absolutely has to work on day one?",
  asap:
    "We can move fast when needed. The key constraint is usually integration complexity — are there existing systems this needs to plug into?",

  // Technical / integration
  epic:
    "Epic integration is solid but requires FHIR API access and your IT team's involvement. Do you have an internal developer who can own the integration setup?",
  cerner:
    "Cerner has good API coverage. We've done this before — typically a 2–3 week integration sprint. Does your IT team have API access configured?",
  api:
    "API-first is exactly how we work — everything is exposed via REST with webhook support. Do you have a developer who'll be owning the integration?",
  integration:
    "Integration complexity is one of the biggest scope drivers. Can you walk me through what systems this would need to talk to?",
  crm:
    "CRM integration is common — we support Salesforce, HubSpot, and custom connectors. Which CRM are you on, and what data needs to flow between them?",
  slack:
    "Slack integration is straightforward and often used for alert routing or internal handoffs. Should this send notifications, or do you need two-way interaction?",
  voice:
    "Voice workflows are a core capability — we handle transcription, real-time summarization, and routing. Is this inbound calls, outbound, or both?",

  // Budget / commercial
  budget:
    "That budget range is solid for a phased rollout. We typically structure it as a pilot fee then an annual subscription once validated. Does that model work for your procurement process?",
  cost:
    "Cost is always a factor — our pricing scales with usage and seats. Can you give me a rough sense of what range you're working within?",
  pricing:
    "Pricing depends on deployment size and integrations. For a ballpark: pilots typically start at $15–25K, annual contracts from $50K upward. Does that align with your expectations?",
  contract:
    "For contracts, we offer annual or multi-year terms. Security and legal review is part of the process — do you have an estimated procurement timeline?",

  // Compliance / security
  hipaa:
    "HIPAA compliance is baked into our platform — BAA included, data residency options available. Do you need on-premise deployment or is cloud acceptable?",
  compliance:
    "Compliance requirements shape the deployment architecture significantly. Beyond your industry standards, are there internal security policies we'd need to align with?",
  gdpr:
    "GDPR is fully supported — EU data residency, right-to-erasure workflows, and DPA documentation available. Are your end-users primarily based in the EU?",
  security:
    "Security review is standard at this stage. We support SSO, SOC 2 Type II, and can provide penetration test reports. What does your security approval process look like?",

  // Positive signals
  interested:
    "Great — the next step is usually a scoped discovery call with one of our specialists. Would you like me to route that based on your use case?",
  ready:
    "Perfect. You've given me everything I need to make a strong routing recommendation. Shall I generate your account brief now?",
  yes:
    "Noted. That confirms a few things for our specialist. Is there anything else you'd want them to know before we make the introduction?",
  good:
    "Glad to hear it. Let me make sure we've captured everything correctly — anything you'd add or clarify before I route you through?",
};

export function getMockAiResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lower.includes(keyword)) {
      return response;
    }
  }

  return "That's helpful context. What else should I know about your needs before I route you to the right specialist?";
}
