# Autonomous Social Media Autopilot Command Center

An enterprise-grade, autonomous executive thought leadership and social media distribution platform powered by Gemini 2.5 and Imagen 3.

---

## 🎯 Executive Summary & Concept

The **Autopilot Command Center** enables founders, agencies, and executive leaders to automate their organic social media thought leadership on autopilot with **zero hallucination, strict brand voice compliance, and 1-click Buffer dispatch**.

Instead of generic template regurgitation, the engine continuously monitors live technical signals, scores breakout trends against your agency's service capabilities, formulates contrarian strategic perspectives, and crafts bespoke multi-channel post groups (LinkedIn, Instagram Carousels, Facebook) accompanied by AI-generated visual architecture blueprints.

---

## 👥 Role Architecture: 1 Author & Multiple Invited Users

The platform is designed around a clear separation between the **Platform Author (Owner)** and **Invited Team Members / Clients (Users)**:

```
┌─────────────────────────────────────────────────────────────┐
│                   PLATFORM AUTHOR / OWNER                   │
│   • Buffer API Credentials & Channel Bindings               │
│   • Global Brand Brain & Voice Guardrails                   │
│   • Autopilot Scheduler & Autonomous Cron Execution         │
│   • Multi-Workspace Creation & Client Account Invitations   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Generates Scoped Magic Token Invites
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     CONTENT REVIEWER (USER)   │   │     CLIENT VIEWER (USER)      │
│ • Inspects omnichannel drafts │   │ • Read-only access to queue   │
│ • Tests alternative hooks     │   │ • Performance analytics       │
│ • Edits slide body text       │   │ • Calendar posting visibility │
│ • 1-Click "Approve & Queue"   │   │ • Zero exposure to API keys   │
└───────────────────────────────┘   └───────────────────────────────┘
```

### 1. Platform Author (Owner)
- **Privileges**: Full administrative authority over all workspaces.
- **Responsibilities**: Sets the global Brand Brain (services, tone of voice, forbidden words), connects the production Buffer Access Token (`BUFFER_ACCESS_TOKEN`), initiates manual autopilot runs, and manages workspace team memberships.

### 2. Invited Users (Reviewers & Clients)
- **Privileges**: Scoped workspace access.
- **Workflow**: Receive an email invite or direct magic link (`/join?token=...`), open the interactive dashboard, review prepared post groups, inspect quality control audit scores (must be 90+/100), make live copy edits, and approve posts for Buffer dispatch.
- **Security**: Sensitive Buffer tokens and Gemini API keys are never exposed in user client sessions.

---

## 🗺️ User Connection & Onboarding Roadmap

Here is the end-to-end connection flow for bringing a new client or team onto the platform:

```
Step 1: Owner Setup (Author)
  └─► Configure Brand Brain positioning, tone guidelines, and content mix ratios.
  
Step 2: Buffer Connectivity (Author)
  └─► Input Buffer API Access Token to auto-bind LinkedIn, Instagram, and Facebook profile IDs.
  
Step 3: Invite Team & Clients (Author -> Users)
  └─► Open User Profile Modal -> "Invite & Team Roles" tab.
  └─► Enter client work email, select role (Reviewer vs. Viewer), and assign workspace.
  └─► System generates secure invitation link with scoped authentication token.
  
Step 4: Autonomous Generation & Quality Gate (Engine)
  └─► Gemini 2.5 scans real-time tech signals and synthesizes 3-platform post groups.
  └─► Imagen 3 renders visual architectural blueprints.
  └─► 8-point automated compliance auditor validates readability, tone, and claim safety (90+ threshold).
  
Step 5: Collaborative Queue Review (Users)
  └─► Invited reviewers inspect drafts, toggle hook variations, and approve posts with 1-click.
  
Step 6: Buffer Dispatch & Live Analytics (Live Sync)
  └─► Approved posts are automatically scheduled into Buffer channels at optimal distribution slots.
```

---

## ⚡ The 7-Stage Autopilot Pipeline

1. **Live Signal Radar**: Scans tech feeds and Google search signals for breakout industry developments.
2. **Relevance Scoring**: Evaluates candidate topics against a 6-metric matrix (enterprise relevance, novelty, contrarian potential, service alignment).
3. **Strategic Synthesis**: Formulates deep, authoritative angles adhering to your selected content mix (*60% Service Expertise, 30% Industry Trends, 10% Culture/Brand*).
4. **Omnichannel Adaptation**: Tailors the core concept for:
   - **LinkedIn**: Short, punchy hook lines, structured takeaways, and actionable frameworks.
   - **Instagram**: 5-slide visual carousel breakdowns with high-contrast text slides.
   - **Facebook**: Conversational commentary driving community discussion.
5. **Imagen AI Visuals**: Automatically generates clean blueprint diagrams and architectural graphics.
6. **Quality Control Gate**: Evaluates every draft against an 8-point audit checklist (flags unsupported claims, aggressive marketing tone, or formatting errors).
7. **Buffer Dispatch**: Schedules approved post packages directly to connected social accounts.

---

## ⌨️ Omnisearch & Keyboard Navigation

- Press `⌘K` or `Ctrl+K` from anywhere in the application to open the **Command Palette**.
- Search queued posts, radar trend signals, and client workspaces, or execute instant system actions (e.g. *Run Autopilot Cycle*, *Launch Studio*, *Invite Member*).

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js 18+
- Gemini API Key (`GEMINI_API_KEY`)

### Quickstart
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Add your GEMINI_API_KEY in .env.local

# 3. Start development server (Express + Vite on Port 3000)
npm run dev
```

