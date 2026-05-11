/**
 * Canonical accelerator catalog — synced from AIMPLIFY asset registry (CSV).
 * Fields map to catalog cards, family pages, and asset detail views.
 */

const C = ["blue", "purple", "orange", "green"];

function archFromFlow(flow: string, colors?: string) {
  const steps = flow
    .split(/\s*(?:-->|\u2192|\?)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!steps.length) return { architecture: ["Not applicable"] as string[], archColors: ["blue"] as string[] };
  const archColors = steps.map((_, i) => {
    const part = colors?.split(/,\s*/)[i]?.trim().toLowerCase();
    if (part && ["blue", "purple", "orange", "green"].includes(part)) return part;
    return C[i % 4];
  });
  return { architecture: steps, archColors };
}

function preqs(csv: string) {
  const parts = csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return [{ name: "See asset documentation", done: true }];
  return parts.map((name) => ({ name, done: true }));
}

function tags(csv: string) {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const REGISTRY_ASSETS = [
  {
    id: "ATL-001",
    name: "DataSmith - Tableau to Looker Migration",
    family: "atlas",
    category: "BI Migration",
    clouds: ["azure"],
    maturity: "experimental",
    effort: "low",
    demoReady: true,
    solution: "Migraton Factory",
    owner: "Manik",
    ownerInit: "MK",
    desc: "Discovery, Migration and Validation of Tableau dashboards to Looker",
    longDesc:
      "Discovery — Lineage analysis, schema analysis, cluster analysis.\n\nDataSmith accelerates Tableau-to-Looker migration with agentic discovery and validation workflows.",
    ...archFromFlow(""),
    quickStart: "# GUI-based hosted service — contact owner for tenant access.\n# Prerequisites: Tableau workbooks as .twbx",
    prerequisites: preqs("Hosted service, Need Tableau as .twbx files"),
    dependencies: ["Not applicable"],
    stats: { deployments: 0, demos: 0, projects: 0, satisfaction: 0 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("Tableau, Looker, DataSmith, Migration, Agentic AI"),
    demoUrl: "https://datasmith.infovision.io",
  },
  {
    id: "ATL-002",
    name: "DataSmith - Synthetic Data Generator",
    family: "atlas",
    category: "Data Generation",
    clouds: ["aws", "gcp", "azure"],
    maturity: "validated",
    effort: "low",
    demoReady: true,
    solution: "Master Data & Domain Context",
    owner: "Manik",
    ownerInit: "MK",
    desc: "Synthetic Data Generator",
    longDesc:
      "Generates tens to millions of rows of synthetic data statistically modeled on a given input dataset.\n\nHosted DataSmith capability for safe sharing and testing without exposing production rows.",
    ...archFromFlow(""),
    quickStart: "# GUI-based hosted service — contact owner for workspace provisioning.",
    prerequisites: preqs("Hosted service, None"),
    dependencies: ["Not applicable"],
    stats: { deployments: 0, demos: 0, projects: 0, satisfaction: 0 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("Data Generator, Data Generation, DataSmith"),
  },
  {
    id: "FRG-001",
    name: "Sprinter",
    family: "forge",
    category: "SDLC Automation, Agile Acceleration",
    clouds: ["azure"],
    maturity: "validated",
    effort: "medium",
    demoReady: false,
    solution: "Engineering Productivity Office",
    owner: "Noumika",
    ownerInit: "NB",
    desc: "AI-powered SDLC bot that expands user stories, generates tasks, test cases, code snippets, and release notes via a Kanban board.",
    longDesc:
      "Sprinter is a web application integrated with GPT-3.5-turbo that streamlines the entire software development lifecycle. It automates repetitive SDLC tasks including user story expansion with personas, goals and acceptance criteria, task and subtask generation, code snippet generation across multiple languages, test case creation, test code generation, release notes compilation, and weekly/monthly status reports.\n\nThe interface mirrors a JIRA-style Kanban board with four columns: To-Do, In Progress, QA, and Done — each unlocking relevant AI-powered actions at that stage. Project Managers, Developers, and QA Engineers each benefit from role-specific automation that reduces manual effort, improves consistency, and accelerates delivery timelines.\n\nKey challenges solved: manual test case and story creation is error-prone and slow; no tooling existed to leverage historical data for risk prediction and story point estimation. Sprinter addresses both by combining LLM intelligence with structured project context.",
    ...archFromFlow(
      "User Story Input --> LLM Prompt Construction --> GPT-3.5-turbo --> Task / Code / Test Case Generation --> Kanban Board Display --> Release Notes / Reports",
    ),
    quickStart: "# See SDLC Sprinter detailed capability document (project folder).\n# Stack: Python 3.x, Node.js, React",
    prerequisites: preqs("Python 3.x, Node.js, React"),
    dependencies: ["Not applicable"],
    stats: { deployments: 1, demos: 0, projects: 0, satisfaction: 70 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("SDLC, Agile, User Stories, Test Cases, Code Generation, Kanban, Release Notes, GPT, JIRA"),
  },
  {
    id: "FRG-002",
    name: "Code Migration Frameworks",
    family: "forge",
    category: "Code Modernization, Legacy Migration",
    clouds: ["azure", "gcp"],
    maturity: "validated",
    effort: "high",
    demoReady: false,
    solution: "Modernization Factory",
    owner: "Hebin",
    ownerInit: "HB",
    desc: "AI-assisted COBOL-to-Java and .NET-to-Node.js code migration with real-time developer Q&A and context-aware conversion.",
    longDesc:
      "Code Migration Frameworks is a multi-language modernization accelerator that uses GitHub Copilot and Gemini code assist plugins to convert legacy codebases to modern tech stacks. Currently proven for COBOL + C (with Python Flask API) to Java Spring Boot, and .NET C# to Node.js migrations.\n\nThe solution analyzes the source project's full file structure and codebase context, then assists developers through automated code conversion while answering real-time contextual queries. Additional capabilities include logging, test case generation, and SQL injection anomaly detection baked into the converted output.\n\nKey challenges solved: manual code migration from legacy systems takes months, creates bottlenecks, and requires senior developer expertise for navigation. This accelerator reduces conversion time dramatically while keeping developers in the loop through a conversational AI interface.",
    ...archFromFlow(
      "Source Code Ingestion --> Context Discovery (File Structure Analysis) --> AI-Assisted Conversion (Copilot / Gemini) --> Output Generation (Java / Node.js) --> Test Case Generation --> QA Validation",
    ),
    quickStart: "# Use VS Code with GitHub Copilot / Gemini plugins per internal runbook.\n# Prerequisites: legacy source tree and target stack credentials.",
    prerequisites: preqs("Python 3.x, Java 17+, Node.js 18+, COBOL runtime"),
    dependencies: ["Not applicable"],
    stats: { deployments: 2, demos: 0, projects: 0, satisfaction: 30 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("COBOL, Java, Springboot, Code Migration, Legacy Modernization, .NET, Node.js, GitHub Copilot, Gemini"),
  },
  {
    id: "FRG-003",
    name: "ADLC Unified Framework",
    family: "forge",
    category: "Automated Code Review, CI/CD Integration",
    clouds: ["azure"],
    maturity: "validated",
    effort: "medium",
    demoReady: false,
    solution: "Release Acceleration",
    owner: "Praty",
    ownerInit: "PR",
    desc: "Webhook-triggered AI code reviewer that delivers line-by-line analysis, best practice feedback, and Slack notifications on every PR.",
    longDesc:
      "The ADLC Unified Framework (Senior Dev GPT) is a webhook-driven SDLC optimization bot that automates code review on every pull or merge request. When a developer submits a PR in GitLab, the bot is triggered automatically via webhook, receives the committed code, and acts as a senior developer performing detailed line-by-line analysis.\n\nFeedback is delivered through a Slack app called Senior Dev in a conversational format, providing best practice recommendations, security vulnerability detection, and performance optimization suggestions in real time. The entire loop — from PR submission to feedback delivery — completes in minutes rather than hours.\n\nKey challenges solved: lead developer bandwidth is the primary bottleneck in high-velocity agile teams. Code reviews get rushed or skipped entirely, introducing bugs and technical debt. This accelerator removes the human bottleneck by providing always-on, consistent, high-quality automated review.\n\nIntegrates with: GitLab, GitHub, Bitbucket (via webhooks), Slack (notifications), GitLab CI/CD pipeline.",
    ...archFromFlow(
      "PR / MR Submitted --> Webhook Trigger (GitLab) --> Code Ingestion --> GPT-4 Line-by-Line Analysis --> Best Practice Scoring --> Slack Notification (Senior Dev) --> Developer Iterates",
    ),
    quickStart: "# Configure GitLab (or GitHub/Bitbucket) webhook to Senior Dev endpoint.\n# pip install dependencies per internal deployment guide.",
    prerequisites: preqs("Python 3.x, GitLab CI/CD, Slack SDK"),
    dependencies: ["Not applicable"],
    stats: { deployments: 3, demos: 0, projects: 0, satisfaction: 0 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("Code Review, Webhook, GitLab, Slack, CI/CD, GPT-4, SDLC, Automated Review, Pull Request"),
  },
  {
    id: "RLY-001",
    name: "Multiagent Call Center Automation",
    family: "relay",
    category: "Multi-Agent Orchestration, Call Center Automation",
    clouds: ["gcp"],
    maturity: "validated",
    effort: "high",
    demoReady: false,
    solution: "Customer Care Studio",
    owner: "Gokulram",
    ownerInit: "GR",
    desc: "LangGraph multi-agent system with 6 specialized agents automating sentiment analysis, ticketing, recommendations, and resolution.",
    longDesc:
      "The Multiagent Call Center Automation System is an AI-driven solution built on a LangGraph-based multi-agent framework that optimizes call center operations through specialized autonomous agents. Six agents work in concert: Sentiment Analysis (real-time tone detection), Customer Profile Update (CRM sync), Call Avoidance (proactive deflection), Support Ticket Management (JIRA integration), Recommendation (personalized suggestions), and Resolution (case closure).\n\nAgents integrate seamlessly with PostgreSQL for data management, JIRA for ticket lifecycle, and email platforms for outbound communication. The LangGraph framework enables agents to operate both autonomously and collaboratively via a shared state memory object — allowing contextual handoffs between agents without data loss.\n\nKey challenges solved: traditional call center workflows are siloed, requiring manual handoffs between systems. This system distributes responsibility across specialized agents, eliminating handoff delays, reducing average handle time, and improving first-call resolution rates.",
    ...archFromFlow(
      "Incoming Call / Trigger --> Sentiment Analysis Agent --> Customer Profile Agent --> Call Avoidance Agent --> Ticket Management Agent (JIRA) --> Recommendation Agent --> Resolution Agent --> Post-Call Summary",
    ),
    quickStart:
      "git clone https://github.com/by-Gokulram/multiagent_callcenter_automation.git\ncd multiagent_callcenter_automation\n# Follow README for Python env and API keys",
    prerequisites: preqs("Python 3.x, LangGraph, PostgreSQL"),
    dependencies: ["Not applicable"],
    stats: { deployments: 1, demos: 0, projects: 0, satisfaction: 0 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("Multi-Agent, LangGraph, Call Center, Sentiment Analysis, JIRA, Automation, Agentic AI, Orchestration, Gemini"),
    repoUrl: "https://github.com/by-Gokulram/multiagent_callcenter_automation.git",
  },
  {
    id: "RLY-002",
    name: "Healthcare Bot",
    family: "relay",
    category: "Domain Agent, Knowledge Retrieval",
    clouds: ["azure", "gcp"],
    maturity: "validated",
    effort: "medium",
    demoReady: false,
    solution: "Enterprise Knowledge Assistant",
    owner: "Abhiram",
    ownerInit: "AB",
    desc: "Dual-persona RAG chatbot for hospital environments serving both patients and staff with role-tailored, policy-aware responses.",
    longDesc:
      "The Healthcare Bot is a dual-persona RAG-powered conversational agent designed for hospital environments. It serves two distinct user groups — Patients and Staff — each with a dedicated portal pathway and persona-customized responses drawn from role-specific data sources.\n\nFor patients, the bot handles medical history queries, appointment details, medication reminders, and general health inquiries. For staff, it provides instant access to HR policies, leave balances, compliance documentation, and operational guidelines. Semantic search powered by Chroma vector store and Redis caching (40% response time reduction) ensures fast, accurate retrieval even from large document corpora.\n\nKey challenges solved: employees and patients both face friction accessing the right information from the right source. Manual HR intervention for routine queries is costly and inconsistent. The Healthcare Bot eliminates this by embedding organizational knowledge directly into a conversational interface, with 85% query accuracy documented on complex semantic queries.",
    ...archFromFlow(
      "User Query (Patient / Staff Portal) --> Persona Selection --> Document Retrieval (Chroma Vector Store) --> Redis Cache Check --> Gemini 1.5 Flash LLM --> Role-Tailored Response --> Feedback Logging",
    ),
    quickStart: "# Deploy FastAPI service per internal healthcare deployment guide.\n# Configure Chroma + Redis and Gemini credentials.",
    prerequisites: preqs("Python 3.x, FastAPI, Redis, Chroma"),
    dependencies: ["Not applicable"],
    stats: { deployments: 2, demos: 0, projects: 0, satisfaction: 100 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("RAG, Healthcare, Dual Persona, Chroma, Redis, Embeddings, Knowledge Retrieval, Gemini, FastAPI"),
  },
  {
    id: "RLY-003",
    name: "Contextual Intelligence — Speech Diarization",
    family: "relay",
    category: "Conversational AI, Real-Time Intelligence",
    clouds: ["gcp", "azure"],
    maturity: "battle-tested",
    effort: "high",
    demoReady: false,
    solution: "Customer Care Studio",
    owner: "Veera",
    ownerInit: "VR",
    desc: "Real-time speech diarization that structures live customer conversations and serves contextual product data and trade-in options instantly.",
    longDesc:
      "The Contextual Intelligence Speech Diarization System is a real-time conversational intelligence accelerator built for high-engagement customer interactions (retail, telecom). It listens to live audio between a CSR and customer, converts speech to text, attributes each utterance to the correct speaker (90% accuracy with clean audio), and extracts structured insights categorized by products, plans, and information requests — all with timestamps.\n\nSimultaneously, the system performs dynamic web scraping via Selenium and LangChain to fetch real-time product availability, pricing, color options, and trade-in values from external sources. Results are cached in Redis (40% latency improvement) and surfaced on an interactive iPad interface showing insight bubbles and a cart integration for seamless purchase completion.\n\nKey challenges solved: sales reps lose conversational flow while manually looking up product details, directly impacting conversion rates. This accelerator keeps reps present in the conversation while the AI handles real-time lookup, structuring, and recommendations in the background.",
    ...archFromFlow(
      "Live Audio Input --> Speech-to-Text (Gemini Flash) --> Speaker Attribution (Diarization) --> Insight Extraction & Categorization --> Dynamic Product Retrieval (Selenium / Web Scraping) --> Redis Cache --> Interactive UI Display (iPad) --> Cart Integration",
    ),
    quickStart: "# Start FastAPI + React services per deployment guide.\n# Configure Gemini Flash, Redis, and Selenium drivers.",
    prerequisites: preqs("Python 3.x, React.js, FastAPI, Redis, LangChain"),
    dependencies: ["Not applicable"],
    stats: { deployments: 3, demos: 0, projects: 0, satisfaction: 100 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags(
      "Speech Diarization, Real-Time, Conversational AI, Web Scraping, Redis, LangChain, Gemini, Speaker Attribution, Cart Integration",
    ),
  },
  {
    id: "SNT-001",
    name: "Data Policy Anomaly Bot",
    family: "sentinel",
    category: "Compliance Validation, Policy Governance",
    clouds: ["azure", "gcp"],
    maturity: "validated",
    effort: "medium",
    demoReady: false,
    solution: "Ops & Governance",
    owner: "Veera",
    ownerInit: "VR",
    desc: "Natural language compliance bot that validates organizational policies against live BigQuery datasets and flags anomalies by risk severity.",
    longDesc:
      "The Data Policy Anomaly Bot is an AI-powered compliance accelerator that enables non-technical users to query organizational policies in plain English and validate them against live datasets in real time. Built on Azure GPT-4 + LangChain + BigQuery, the bot retrieves relevant policy documents via vector embeddings, generates structured validation queries, and runs them against live data to detect schema-level and data-level violations.\n\nAnomaly detection results are classified by risk severity and surfaced as clear, actionable bullet-point summaries — no SQL expertise required. The system is designed for compliance teams operating under GDPR, CCPA, or internal data governance frameworks who need to dramatically reduce manual review cycles.\n\nKey challenges solved: manual compliance checks against large datasets are error-prone and IT-dependent. This bot eliminates the bottleneck by automating policy retrieval, validation, and risk classification end-to-end.",
    ...archFromFlow(
      "Natural Language Query --> Policy Document Retrieval (Vector Embeddings / FAISS) --> Query Structuring (GPT-4) --> BigQuery Validation (Schema + Data Level) --> Anomaly Detection --> Risk Severity Classification --> Actionable Summary Output",
    ),
    quickStart: "pip install -r requirements.txt\nstreamlit run app.py\n# Configure Azure OpenAI + BigQuery credentials per runbook.",
    prerequisites: preqs("Python 3.x, Streamlit, Google BigQuery, Azure OpenAI"),
    dependencies: ["Not applicable"],
    stats: { deployments: 1, demos: 0, projects: 0, satisfaction: 40 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags(
      "Compliance, Policy Governance, Anomaly Detection, BigQuery, GDPR, CCPA, LangChain, GPT-4, Vector Embeddings, Risk Classification",
    ),
  },
  {
    id: "SNT-002",
    name: "Sentiment Analysis on Call Recordings",
    family: "relay",
    category: "Call Quality Monitoring, Compliance Analytics",
    clouds: ["gcp"],
    maturity: "validated",
    effort: "medium",
    demoReady: false,
    solution: "Customer Care Studio",
    owner: "Gokulram",
    ownerInit: "GR",
    desc: "Gemini 1.5 Pro multimodal call analyzer that detects sentiment, tone, sarcasm, and compliance violations directly from audio — no transcription needed.",
    longDesc:
      "The Sentiment Analysis on Call Recordings system uses Google Gemini 1.5 Pro's native multimodal audio processing to analyze customer service calls end-to-end without requiring a separate transcription step. Gemini directly evaluates both audio content and vocal tone to assess sentiment intensity, tone, sarcasm, and linguistic compliance markers — matching the latency and accuracy of text-based analysis.\n\nThe system flags calls for compliance violations based on predefined regulatory keywords and thresholds, and generates customizable reports highlighting sentiment trends, risk areas, and agent performance metrics. This positions it as both a real-time QA layer and a post-call analytics engine for call center operations.\n\nKey challenges solved: traditional sentiment analysis pipelines require transcription as a prerequisite, adding cost, latency, and accuracy loss (especially for accented speech or noisy environments). Gemini's direct audio processing eliminates this stage entirely.",
    ...archFromFlow(
      "Audio Input (Call Recording) --> Gemini 1.5 Pro Direct Audio Analysis --> Sentiment Scoring (Tone Intensity / Sarcasm / Emotion) --> Compliance Keyword Detection --> Risk Flagging --> Customizable Report Generation",
    ),
    quickStart:
      "git clone https://github.com/by-Gokulram/tone_sentiment_analysis.git\ncd tone_sentiment_analysis\npip install -r requirements.txt\nstreamlit run app.py",
    prerequisites: preqs("Python 3.x, LangChain, Streamlit, Gemini 1.5 Pro"),
    dependencies: ["Not applicable"],
    stats: { deployments: 2, demos: 0, projects: 0, satisfaction: 70 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags(
      "Sentiment Analysis, Call Recordings, Compliance, Tone Detection, Gemini, Multimodal, Audio Processing, Call Center, QA Monitoring",
    ),
    repoUrl: "https://github.com/by-Gokulram/tone_sentiment_analysis.git",
  },
  {
    id: "NXS-001",
    name: "SLM vs LLM Decision Playbook",
    family: "sentinel",
    category: "Model Selection, Cost Benchmarking",
    clouds: ["azure", "gcp"],
    maturity: "validated",
    effort: "low",
    demoReady: false,
    solution: "Model & Agent Operations",
    owner: "Dhanuvanth",
    ownerInit: "DH",
    desc: "A systematic framework for choosing between Small Language Models (SLM) and Large Language Models (LLM) based on deployment constraints, operational readiness, and business requirements.",
    longDesc:
      "The SLM vs LLM Decision Playbook is a cost-analysis and benchmarking tool that helps engineering teams make informed model selection decisions before committing to a tech stack. Built with LangChain, LlamaIndex, and Tiktoken, the tool lets users select from multiple LLMs and embedding models, run queries against a shared dataset, and compare cost per 1K tokens, input/output/embedding token counts, and total query cost side by side.\n\nOutputs include bar chart visualizations of cost breakdowns per model combination and a word cloud of the most semantically relevant terms in the retrieved data. The tool embeds the data source once at initialization and reuses those vectors across all queries, eliminating redundant embedding costs.\n\nKey value: every platform family faces the same model selection question at project kickoff. This playbook gives teams a structured, data-driven answer rather than a gut-feel choice — directly reducing LLM spend on production deployments.",
    ...archFromFlow(
      "User assessment form --> Decision engine (gatekeepers + weighted score) --> Recommendation result --> Gemini narrative --> Persist submissions (optional Supabase)",
    ),
    quickStart: "# Hosted app:\n# Open https://arch-eval-wx7y.vercel.app/\n# Optional: clone and run locally with Node + Vite per repo README.",
    prerequisites: preqs("Node.js, Google API, Supabase"),
    dependencies: [
      "React and React DOM",
      "TypeScript and type definitions",
      "Vite and plugins",
      "Tailwind CSS and PostCSS",
      "Google Generative AI SDK",
      "Supabase client",
      "Lucide icons",
    ],
    stats: { deployments: 1, demos: 0, projects: 0, satisfaction: 0 },
    changelog: [{ ver: "registry", date: "Feb 6, 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags("LLM Benchmarking, Cost Analysis, Token Cost, Model Selection, SLM, Embeddings, LangChain, LlamaIndex, GPT"),
    demoUrl: "https://arch-eval-wx7y.vercel.app/",
  },
  {
    id: "NXS-002",
    name: "PromptEval",
    family: "nexus",
    category: "Prompt Engineering, Quality Evaluation",
    clouds: ["azure", "gcp"],
    maturity: "experimental",
    effort: "low",
    demoReady: false,
    solution: "Common Infrastructure",
    owner: "InfoVision",
    ownerInit: "IV",
    desc: "Shared prompt evaluation framework for testing, scoring, and iterating on prompts across all platform families and LLM providers.",
    longDesc:
      "PromptEval is a cross-platform prompt quality evaluation framework that provides a structured methodology for testing, scoring, and iterating on prompts before they are deployed in production accelerators. As a Nexus shared utility, it serves all platform families — Forge engineers validating code review prompts, Relay teams testing conversational agent personas, Sentinel teams assessing compliance query accuracy, and Atlas teams evaluating data insight prompts.\n\nCore capabilities include: multi-prompt variant testing against the same input dataset, response scoring across dimensions (accuracy, relevance, completeness, tone adherence), side-by-side comparison of prompt outputs, regression detection when prompts are modified, and exportable evaluation reports.\n\nKey value for Nexus: prompt quality is the single most variable factor in LLM output quality across all accelerators. Without a shared evaluation layer, every team re-invents ad hoc testing. PromptEval standardizes this into a reusable workflow that can be plugged into any accelerator's development cycle.",
    ...archFromFlow(
      "Prompt Variants Input --> Dataset Selection --> Multi-Model Execution --> Response Scoring (Accuracy / Relevance / Tone) --> Side-by-Side Comparison --> Regression Detection --> Evaluation Report Export",
    ),
    quickStart: "# Draft asset — internal PromptEval / LIE integration runbook.\n# Python 3.x + LangChain + Azure OpenAI",
    prerequisites: preqs("Python 3.x, LangChain, Azure OpenAI"),
    dependencies: ["Not applicable"],
    stats: { deployments: 2, demos: 0, projects: 0, satisfaction: 0 },
    changelog: [{ ver: "draft", date: "May 2026", desc: "Registry status: draft — derived from LIE prompt benchmarking patterns." }],
    tags: tags("Prompt Engineering, Evaluation, Benchmarking, Quality, LLM Testing, Regression, Prompt Management"),
  },
  {
    id: "NXS-003",
    name: "LIE — LLM Insight Engine",
    family: "sentinel",
    category: "Multi-LLM Benchmarking, Model Observability",
    clouds: ["azure", "gcp"],
    maturity: "battle-tested",
    effort: "high",
    demoReady: false,
    solution: "Model & Agent Operations",
    owner: "Noumika",
    ownerInit: "NB",
    desc: "Unified multi-LLM benchmarking platform that runs concurrent queries across GPT, Mistral, Llama, Gemini and compares responses side by side.",
    longDesc:
      "The LLM Insight Engine (LIE) is a single unified platform that enables development teams to benchmark any combination of LLMs and embedding models against the same training document and query set — delivering fair, reproducible, apples-to-apples comparisons.\n\nUsers upload a source document, select from an extensive list of LLMs and embedding models, and the engine computes all viable LLM-embedding combinations. Queries are executed concurrently across all combinations with response times tracked. Results are displayed side by side on screen and exportable as Excel or via email.\n\nKey technical achievement: moving model execution from CPU to GPU layers (CUDA) reduced concurrent execution times significantly. Parameters are held constant across all runs ensuring benchmarking integrity.",
    ...archFromFlow(
      "Document Upload --> Model & Embedding Selection --> Viable Combination Computation --> Concurrent Query Execution (GPU/CUDA) --> Response + Latency Capture --> Side-by-Side Display --> Excel Export / Email",
    ),
    quickStart: "# Internal deployment — GPU-enabled environment required.\n# See project folder for sample benchmark queries and Excel output template.",
    prerequisites: preqs("Python 3.x, React, LangChain, LlamaIndex, PyTorch, CUDA, FAISS"),
    dependencies: ["Not applicable"],
    stats: { deployments: 3, demos: 0, projects: 0, satisfaction: 100 },
    changelog: [{ ver: "registry", date: "May 2026", desc: "Imported from AIMPLIFY asset registry." }],
    tags: tags(
      "LLM Benchmarking, Multi-LLM, GPT, Mistral, Llama, Gemini, Embeddings, Model Comparison, FAISS, LangChain, LlamaIndex",
    ),
  },
];

export type RegistryAsset = (typeof REGISTRY_ASSETS)[number];
