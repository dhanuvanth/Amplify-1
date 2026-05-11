import { REGISTRY_ASSETS } from "./registryAssets";

export const FAMILIES: Record<string, any> = {
  atlas: {
    name: "Atlas",
    tagline: "Data & Context Platform",
    color: "#0EA5E9",
    bg: "#F0F9FF",
    longDesc: "Atlas is the data foundation that gives every other platform family credibility. It provides AI readiness assessments, semantic context layers, master data management, and migration capabilities. Without clean, contextualized data, Relay agents hallucinate and Sentinel governance has nothing to govern.",
    solutions: ["Foundation Sprint — 4-week data readiness assessment and remediation", "AI Ready Data Estate — Semantic layer, embeddings, and retrieval infrastructure", "Master Data & Domain Context — Identity resolution and shared vocabulary", "Migration Factory — Automated data pipeline modernization"],
    useCases: ["Enterprise needs to make existing data warehouses AI-ready", "Customer wants RAG but data is scattered across 15 systems", "Data quality issues are blocking AI pilot expansion"],
    dependsOn: ["Sentinel for data governance and compliance guardrails"],
    enables: ["Relay agents with grounded, accurate enterprise context", "Forge pipelines with trusted test data"]
  },
  forge: {
    name: "Forge",
    tagline: "AI-Native Engineering Platform",
    color: "#F59E0B",
    bg: "#FFFBEB",
    longDesc: "Forge is how InfoVision builds — and how it helps customers build faster. It covers the AI-assisted SDLC with measurable productivity benchmarks, modernization factories, quality engineering intelligence, and release acceleration. Every Forge asset has a before/after metric attached.",
    solutions: ["Engineering Productivity Office — Prompt libs, vibe templates, measurable dev velocity", "QE Intelligence — AI testing frameworks, eval harnesses, regression detection", "Modernization Factory — Code migration agents, legacy analysis, transformation", "Release Acceleration — CI/CD integration, automated review, deployment pipelines"],
    useCases: ["CIO wants to measure AI impact on engineering productivity", "Legacy Java monolith needs modernization to microservices", "QA team needs to test LLM-powered features systematically"],
    dependsOn: ["Sentinel guardrails for secure code generation", "Nexus patterns for multi-agent CI/CD pipelines"],
    enables: ["Faster delivery of Relay agents and Atlas pipelines", "Measurable productivity story for sales conversations"]
  },
  relay: {
    name: "Relay",
    tagline: "Workflow & Agent Platform",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    longDesc: "Relay delivers business-facing agentic AI with short time to value. Every Relay solution targets one sponsor, one KPI, and a contained scope that can show ROI in weeks, not quarters. It's the platform family most likely to be the first purchase — customer care, document intelligence, IT ops, knowledge operations.",
    solutions: ["Customer Care Studio — Contact center agent assist, disposition AI, sentiment tracking", "Document Intelligence — OCR + LLM extraction for invoices, contracts, medical records", "Service & Order Operations AI — IT ops automation, runbook execution, incident triage", "Enterprise Knowledge Assistant — Semantic search across Confluence, SharePoint, Slack"],
    useCases: ["Telecom company wants to reduce average handle time by 20%", "Insurance firm needs to extract clauses from 50K contracts", "IT team spends 40% of time on repetitive runbook execution"],
    dependsOn: ["Atlas for grounded retrieval context", "Sentinel for production guardrails and audit logging", "Nexus for multi-agent orchestration patterns"],
    enables: ["Recurring managed ops engagements via Sentinel", "Data improvement feedback loops back to Atlas"]
  },
  sentinel: {
    name: "Sentinel",
    tagline: "Governed Runtime & Managed AI Ops",
    color: "#EF4444",
    bg: "#FEF2F2",
    longDesc: "Sentinel is what turns a pilot into a longer relationship. It provides governance, security guardrails, observability, cost tracking, evaluation harnesses, and managed AI operations. It's the least glamorous family but the most important for recurring revenue — every production deployment needs Sentinel.",
    solutions: ["Governance Office — Security guardrails, PII detection, compliance middleware", "Cost & Reliability Control — Observability, token tracking, quality drift detection", "AI Run Office — Runtime console, approval workflows, incident playbooks", "Model & Agent Operations — Evaluation scheduling, A/B testing, model lifecycle"],
    useCases: ["CISO needs prompt injection defense before approving production deployment", "CFO wants visibility into LLM costs across 12 agents", "CIO needs a managed operations team for production AI systems"],
    dependsOn: ["None — Sentinel is the foundation other families depend on"],
    enables: ["Production readiness for every Relay and Forge deployment", "Recurring managed services revenue stream"]
  },
  nexus: {
    name: "Nexus",
    tagline: "Shared Platform Infrastructure",
    color: "#6B7280",
    bg: "#F9FAFB",
    longDesc: "Nexus holds the cross-cutting architecture patterns that all four platform families depend on. Multi-agent orchestration, shared state management, handoff protocols, and common infrastructure templates. These are the building blocks that don't belong to one family but are used by all.",
    solutions: ["Multi-Agent Orchestration — Supervisor, swarm, plan-and-execute patterns", "Shared State Management — Redis-based state, context windowing, memory patterns", "Common Infrastructure — Terraform modules, Docker templates, CI/CD patterns"],
    useCases: ["Multiple Relay agents need to coordinate on a complex workflow", "Forge CI pipeline needs to orchestrate code analysis + testing + migration agents", "Sentinel evaluation harness needs to run multi-agent test scenarios"],
    dependsOn: ["Sentinel for security across all orchestrated agents"],
    enables: ["Complex multi-agent solutions across all families"]
  }
};

/** Accelerator catalog — populated from AIMPLIFY asset registry (see `registryAssets.ts`). */
export const ASSETS = [...REGISTRY_ASSETS];

export const SUBS0 = [
  { id: "SUB-041", name: "Slack Workflow Automator", submitter: "Arjun Mehta", submitterInit: "AM", date: "Apr 12", family: "relay", desc: "AI agent automating Slack workflows.", status: "ai-review", aiScore: 72, aiFindings: [{ category: "Security", status: "fail", detail: "No input sanitization" }, { category: "Docs", status: "pass", detail: "README present" }, { category: "Testing", status: "warn", detail: "No eval harness" }, { category: "Cloud", status: "pass", detail: "Cloud Run + Terraform" }, { category: "Compliance", status: "fail", detail: "Missing audit logging" }], govReviewer: null, govNotes: "" },
  { id: "SUB-038", name: "PDF Contract Analyzer", submitter: "Lisa Chen", submitterInit: "LC", date: "Apr 8", family: "relay", desc: "Extracts clauses and risk flags from legal contracts.", status: "governance", aiScore: 91, aiFindings: [{ category: "Security", status: "pass", detail: "Guardrails applied" }, { category: "Docs", status: "pass", detail: "Comprehensive" }, { category: "Testing", status: "pass", detail: "200+ contracts" }, { category: "Cloud", status: "pass", detail: "Lambda + Bedrock" }, { category: "Dependencies", status: "warn", detail: "Unmaintained PDF lib" }], govReviewer: "Rina Chatterjee", govNotes: "Recommend pypdfium2 migration. Otherwise excellent." },
  { id: "SUB-035", name: "Terraform Cost Estimator", submitter: "Priya Sharma", submitterInit: "PS", date: "Mar 28", family: "sentinel", desc: "Estimates cloud costs from Terraform plans.", status: "approved", aiScore: 95, aiFindings: [{ category: "Security", status: "pass", detail: "Clean" }, { category: "Docs", status: "pass", detail: "Excellent" }, { category: "Testing", status: "pass", detail: "50+ plans" }, { category: "Cloud", status: "pass", detail: "Multi-cloud" }, { category: "Compliance", status: "pass", detail: "Proper key mgmt" }], govReviewer: "Carlos Mendez", govNotes: "Approved as SEN-004." }
];

export const SC0: Record<string, any> = {
  "ai-review": { label: "AI Review", color: "#0EA5E9", bg: "#F0F9FF" },
  "remediation": { label: "Needs Changes", color: "#F59E0B", bg: "#FFFBEB" },
  "governance": { label: "Governance", color: "#8B5CF6", bg: "#F5F3FF" },
  "approved": { label: "Approved", color: "#22C55E", bg: "#DCFCE7" }
};

export const CL: Record<string, string> = { aws: "AWS", gcp: "GCP", azure: "Azure" };
export const CC: Record<string, string> = { aws: "#F59E0B", gcp: "#0EA5E9", azure: "#06B6D4" };
export const ML: Record<string, string> = { "experimental": "Experimental", "validated": "Validated", "battle-tested": "Battle-Tested" };
export const MC: Record<string, string> = { "experimental": "text-amber-500", "validated": "text-emerald-500", "battle-tested": "text-sky-500" };
export const EC: Record<string, string> = { low: "text-emerald-500", medium: "text-amber-500", high: "text-rose-500" };
export const ACM: Record<string, string> = { blue: "#0EA5E9", purple: "#8B5CF6", orange: "#F59E0B", green: "#22C55E" };

export const ACTIVITY = [
  { who: "Registry sync", action: "updated catalog from", what: "AIMPLIFY asset sheet", time: "Just now", color: "#0EA5E9" },
  { who: "Lisa Chen", action: "submitted", what: "PDF Contract Analyzer", time: "4h ago", color: "#8B5CF6" },
  { who: "Priya S.", action: "published", what: "Terraform Cost Estimator", time: "1d ago", color: "#22C55E" },
  { who: "Gokulram", action: "linked repo for", what: "Multiagent Call Center Automation", time: "2d ago", color: "#8B5CF6" },
  { who: "Dhanuvanth", action: "published deploy URL for", what: "SLM vs LLM Decision Playbook", time: "3d ago", color: "#22C55E" },
];
