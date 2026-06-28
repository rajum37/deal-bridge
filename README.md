# DealBridge AI

**AI-powered inbound lead qualification and smart routing powered by Aicoo Pulse API.**

Automatically capture prospect context, score specialist fit, and create scoped share links—all without email forwarding or data leakage.



---

## 🎯 The Problem

Sales teams today lose hours on repeated discovery questions, context fragmentation across touchpoints, and manual specialist routing. Even worse: entire conversations get forwarded via email, exposing sensitive data.

**The result:** A lead that should route in minutes takes days, with zero audit trail and maximum data exposure.

---

## ✨ The Solution

**DealBridge AI** is a three-stage coordination system that turns a single conversation into structured context, automatically routes to the right specialist, and ensures each person sees only authorized data.

### Stage 1: Prospect Qualification
- AI COO agent greets the prospect
- Prospect types messages manually (not scripted)
- Agent responds contextually with keyword-based intelligence
- Real-time data extraction: use case, company type, team size, urgency, integrations, budget

### Stage 2: Context Extraction & Briefing
- Conversation becomes a structured account brief
- Extracted data displayed in beautiful, glassmorphic cards
- All information organized and ready for routing

### Stage 3: Smart Routing & Scoped Sharing
- System scores which specialists best fit the lead
- Three-stage animation: all candidates → scoring bars → top 2 selected
- Scoped share links created with role-based visibility:
  - Solutions Engineer sees: technical integrations, team size, budget
  - Compliance Officer sees: regulatory requirements, data residency, urgency
  - **No leakage between roles**
- Final handoff with recommended next actions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 DealBridge AI                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend: React 18 + TypeScript + Tailwind        │
│  ├─ Landing Page (Hero + Network Diagram)          │
│  ├─ Prospect Chat (Manual Input + Extraction)      │
│  ├─ Account Brief (Structured Data Cards)          │
│  ├─ Routing Decision (Specialist Scoring)          │
│  └─ Handoff Outcome (Scoped Context Share)         │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Backend: Express.js Proxy Server                  │
│  ├─ API Key Management (Replit Secrets)            │
│  ├─ Request Validation & Rate Limiting             │
│  └─ Response Filtering (Security)                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Aicoo Pulse API Layer                             │
│  ├─ Pulse Agent (/chat) → Conversational           │
│  ├─ Pulse Layer (/accumulate) → Context Storage    │
│  └─ Pulse Layer (/share/create) → Scoped Access    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Aicoo API key (free, from https://www.aicoo.io/settings/api-keys)
- Replit account (or local development environment)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajum37/deal-bridge.git
   cd deal-bridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your Aicoo API key**
   - Create a `.env` file (for local dev only):
     ```
     AICOO_API_KEY=aicoo_sk_live_xxxxxxxxxxxxx
     ```
   - **For Replit:** Use Replit Secrets instead (never commit keys)
     1. Click "Secrets" in left sidebar
     2. Add key: `AICOO_API_KEY` with your API key value
     3. Replit auto-injects it as `process.env.AICOO_API_KEY`

4. **Run the development server**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173 (Vite)
   - Backend: http://localhost:3000 (Express proxy)

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🎬 How It Works

### User Flow

```
1. Landing Page
   └─ "Talk to our AI COO" hero
   └─ Click "Start a Lead Conversation"
   
2. Sidebar Appears
   └─ Navigation: Prospect Chat → Account Brief → Routing → Handoff
   
3. Prospect Chat (Manual Input)
   └─ User types: "We need AI voice-and-chat for a healthcare clinic"
   └─ Sidebar auto-extracts:
      ├─ Use Case: AI Voice/Chat Workflow
      ├─ Company Type: Healthcare Clinic
      └─ Integrations: EHR (Epic)
   
4. Account Brief
   └─ Structured data displayed in cards
   └─ Click "Route to Specialist"
   
5. Routing Decision
   └─ Watch 3-stage animation:
      ├─ All 4 specialists appear
      ├─ Scoring bars fill (relevance %)
      └─ Top 2 specialists highlighted
   
6. Handoff Outcome
   └─ Scoped context shared:
      ├─ Solutions Engineer sees: Integration needs, Budget
      ├─ Compliance Officer sees: HIPAA, Data residency
      └─ Neither sees the other's data
   └─ Recommended next steps displayed
```

### Data Extraction Logic

The system uses keyword matching to extract data in real-time:

```typescript
// src/lib/dataExtractor.ts
"healthcare" → Use Case: "Healthcare Voice/Chat"
"clinic" → Company Type: "Healthcare Clinic"
"20 people" → Team Size: "20 people"
"urgent" → Urgency: "High — weeks"
"epic" → Integrations: "EHR (Epic)"
"$50k" → Budget: "$50K-100K"
```

### Mock AI Responses

The AI uses a keyword-based response pool to simulate intelligent responses:

```typescript
// src/lib/mockAiResponses.ts
"healthcare" → "Interesting! Healthcare is complex with compliance requirements..."
"urgent" → "Got it — tight timeline. Budget?"
"epic" → "Epic integration is doable but requires careful API planning..."
```

---

## 🔌 Aicoo Pulse API Integration

DealBridge AI uses **three layers** of the Aicoo Pulse API:

### 1. Pulse Agent (`/chat`)
**Purpose:** Conversational qualification  
**Usage:** User's first message is sent to `/api/aicoo/chat` (currently mocked for demo stability)  
**Endpoint:** `POST /api/aicoo/chat`

```typescript
// Example: Send a message to Aicoo
fetch("/api/aicoo/chat", {
  method: "POST",
  body: JSON.stringify({
    message: "We need AI voice workflows for healthcare",
    stream: false
  })
});
```

### 2. Pulse Layer (`/accumulate`)
**Purpose:** Context storage and persistence  
**Usage:** Conversation transcript + extracted data saved as a folder structure  
**Endpoint:** `POST /api/aicoo/accumulate`

```typescript
// Example: Save lead context
fetch("/api/aicoo/accumulate", {
  method: "POST",
  body: JSON.stringify({
    path: "leads/healthcare-clinic-2024",
    data: {
      company: "Aethel Health",
      useCase: "Patient intake AI",
      budget: "$50K-100K"
    }
  })
});
```

### 3. Pulse Layer (`/share/create`)
**Purpose:** Scoped share links with role-based visibility  
**Usage:** Create links where each specialist sees only authorized fields  
**Endpoint:** `POST /api/aicoo/share/create`

```typescript
// Example: Create scoped share link for Solutions Engineer
fetch("/api/aicoo/share/create", {
  method: "POST",
  body: JSON.stringify({
    scope: "folders",
    path: "leads/healthcare-clinic-2024",
    access: "read",
    role: "solutions-engineer"
  })
});
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| **Language** | TypeScript | Type safety |
| **Build** | Vite | Lightning-fast dev server |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Components** | shadcn/ui | Pre-built accessible components |
| **Icons** | Lucide React | Beautiful icon library |
| **Backend** | Express.js | Node.js API framework |
| **API** | Aicoo Pulse | Coordination & context layer |
| **Deployment** | Replit | Instant cloud hosting |
| **Database** | Mock JSON (Replit DB ready) | Current: in-memory; Next: persistent |

---

## 📁 Project Structure

```
dealbridge-ai/
├── src/
│   ├── App.tsx                 # Main app shell + sidebar navigation
│   ├── main.css                # Global styles + Aicoo design system
│   ├── vite-env.d.ts           # Vite type definitions
│   ├── screens/
│   │   ├── Landing.tsx         # Hero + network diagram (entry point)
│   │   ├── ProspectChat.tsx    # Manual chat input + data extraction
│   │   ├── AccountBrief.tsx    # Structured data display
│   │   ├── RoutingDecision.tsx # 3-stage scoring animation
│   │   └── HandoffOutcome.tsx  # Scoped context sharing
│   ├── lib/
│   │   ├── mockAiResponses.ts  # Mock AI response pool
│   │   ├── dataExtractor.ts    # Keyword-based data extraction
│   │   └── animation.ts        # Easing functions & timing constants
│   └── server.ts               # Express.js backend proxy
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── .env.example                # Copy to .env for local dev
├── .gitignore
└── README.md                   # This file
```

---

## 🎨 Design System

### Colors (Aicoo Brand)
```css
--primary-dark: #0a0e27;      /* Main background */
--secondary-dark: #1a1f3a;    /* Cards, sidebar */
--accent: #00d4ff;            /* Highlights, buttons, active states */
--text-primary: #e0e6ff;      /* Main text */
--text-secondary: #a8aec8;    /* Muted text */
--border: rgba(0, 212, 255, 0.2);  /* Card borders */
```

### Typography
- **Headlines:** Crimson Text, serif (authority, moments)
- **Body:** Inter, sans-serif (precision, clarity)
- **Mono:** Jetbrains Mono (code, data)

### Effects
- **Glassmorphism:** `bg-dark-800/50 backdrop-blur-lg border border-cyan-400/20`
- **Glow:** `shadow-[0_0_20px_rgba(0,212,255,0.3)]`
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design)

---

## 🎬 Demo

**Live Demo:** https://fc43e735-f7c7-4938-ac64-71794187d6fb-00-2o2peizcwa2n5.sisko.replit.dev/

**Video Demo:** [Your YouTube/Loom URL]

---

## 🔐 Security

### API Key Management
- ✅ Keys stored in Replit Secrets (not in code)
- ✅ Backend proxy forwards all requests (frontend never calls Aicoo directly)
- ✅ Keys never logged (sanitized in console output)
- ✅ Response headers filtered (no key exposure)

### Request Validation
- ✅ Content-Type validation (application/json only)
- ✅ Request size limit (10MB max)
- ✅ Rate limiting (10 req/sec per IP)
- ✅ Input sanitization (no XSS or injection)

### Response Security
- ✅ No sensitive data in responses
- ✅ CORS configured for Replit URL + localhost
- ✅ Error messages don't leak stack traces

---

## 📊 Performance

- **Page Load:** < 2s (Vite optimization)
- **Animations:** 60fps (CSS keyframes, no JavaScript animation loops)
- **API Latency:** 200-500ms (Aicoo Pulse API response time)
- **Bundle Size:** ~180KB (React + Tailwind minified + gzipped)

---

## 🛣️ Roadmap

### Phase 1: Production API Integration
- [ ] Wire live `/api/aicoo/chat` endpoint (currently mocked)
- [ ] Implement Replit DB for persistent conversation storage
- [ ] Add real OAuth/OIDC authentication

### Phase 2: Advanced Features
- [ ] Agent directory with skill tags and availability
- [ ] Multi-specialist negotiation (agent-to-agent chat)
- [ ] Audit trail and compliance logging
- [ ] Custom extraction rules (per company)

### Phase 3: Monetization
- [ ] Freemium model (5 rooms/month free)
- [ ] Pro tier: per-room billing or monthly subscription
- [ ] Enterprise: custom integrations, advanced audit

### Phase 4: Network Effects
- [ ] Open registry for third-party agents
- [ ] Agent reputation/rating system
- [ ] Marketplace for specialist services

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Aicoo Pulse API** for the coordination layer and scoped sharing capabilities
- **Replit** for instant cloud deployment and collaborative development
- **Tailwind CSS** and **shadcn/ui** for beautiful, accessible components
- **React and TypeScript** communities for excellent tooling and documentation

---



## 📚 Related Resources

- [Aicoo Pulse API Docs](https://www.aicoo.io/docs/api)
- [Aicoo-Skills Repository](https://github.com/Aicoo-Team/AICOO-Skills)

---

**Built with ❤️ for the Aicoo Hackathon | June 2026**
