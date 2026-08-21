/**
 * Content and structure for the per-layer architecture diagrams shown on the
 * four single-IQ story slides.
 *
 * Kept as data, separate from the renderer, so a presenter can re-word a box
 * without touching layout or animation code — the same split already used by
 * `flowScene.ts` for the four-IQ sequence.
 *
 * Every diagram is the same left-to-right sentence:
 *
 *     sources  →  core  →  outcomes  →  agents
 *
 * `outcomes` and `agents` are optional because the four layers genuinely differ
 * in shape: Foundry IQ carries its detail as a card grid inside the core and has
 * no separate outcomes column, and Work IQ ends at its outcomes with no agent
 * column. Rendering those as absent columns rather than empty ones keeps the
 * remaining columns wide enough to read at presenter distance.
 */

import type { IQId } from "../types";

export interface DiagramOutcome {
  title: string;
  detail: string;
}

export interface DiagramCard {
  title: string;
  detail: string;
  /** Spans the full width of the core card grid. */
  wide?: boolean;
}

export interface DiagramSpec {
  id: IQId;
  /** Heading above the diagram, e.g. "Work IQ". */
  title: string;
  subtitle: string;
  sources: {
    label: string;
    /** Optional sentence under the column label. */
    lede?: string;
    tiles: string[];
    /** Tiles that should span the full column width, e.g. Web IQ's "Browse". */
    wideTiles?: string[];
    foot?: string;
  };
  core: {
    title: string;
    detail: string;
    /** Small emphasised strips under the core title. */
    notes?: string[];
    /** Card grid rendered inside the core, used by Foundry IQ. */
    cards?: DiagramCard[];
  };
  outcomes?: {
    items: DiagramOutcome[];
    foot?: string;
  };
  agents?: {
    title: string;
    detail: string;
    foot?: string;
    items?: string;
  };
  /** Footer bar, rendered after a shield glyph. */
  assurances: string[];
  /**
   * Narration for each stream stage, read out by the caption line as the
   * animation advances. One entry per connector, in left-to-right order.
   */
  stages: string[];
}

export const DIAGRAMS: Record<IQId, DiagramSpec> = {
  work: {
    id: "work",
    title: "Work IQ",
    subtitle: "How the team works, communicated in context",
    sources: {
      label: "Microsoft 365 work context",
      tiles: ["Outlook", "Teams", "SharePoint", "Files", "People & roles", "Calendar"],
    },
    core: {
      title: "Work IQ",
      detail: "People · documents · communication · workflows",
      notes: [
        "Persistent memory of how the team works",
        "Permission-aware with Microsoft Entra",
      ],
    },
    outcomes: {
      items: [
        {
          title: "Planning brief found",
          detail: "Objectives and the expected customer outcome",
        },
        {
          title: "Review criteria assembled",
          detail: "Execution expectations, guardrails, and open considerations",
        },
      ],
      foot: "Team context · ready for the next decision",
    },
    assurances: [
      "Microsoft Entra identity",
      "Permission-aware retrieval",
      "Organizational memory",
    ],
    stages: [
      "Reading Microsoft 365 through Graph — mail, Teams, files and calendar, filtered to what this user may see.",
      "Work IQ assembles the campaign's correspondence into a brief and a set of review criteria.",
    ],
  },

  fabric: {
    id: "fabric",
    title: "Fabric IQ",
    subtitle: "Context on business entities, systems of record, and actions",
    sources: {
      label: "Enterprise data sources",
      tiles: [
        "Snowflake",
        "Azure PostgreSQL",
        "Azure Databricks",
        "SharePoint & files",
        "SaaS applications",
        "Real-time streams",
      ],
      foot: "Structured, unstructured, batch, SaaS, and real-time data",
    },
    core: {
      title: "OneLake",
      detail: "Mirroring · connectors · shortcuts",
      notes: ["Unified and governed"],
    },
    outcomes: {
      items: [
        { title: "Ontology", detail: "Business entities and relationships" },
        { title: "Semantic model", detail: "Governed measures, KPIs, and hierarchies" },
      ],
    },
    agents: {
      title: "Fabric IQ",
      detail: "Agents reason in business concepts and act on live context",
    },
    assurances: [
      "OneLake",
      "Governance",
      "Microsoft Entra identity",
      "Security carried from source",
    ],
    stages: [
      "Data lands in OneLake by mirroring, connectors and shortcuts — no copy, no separate warehouse to reconcile.",
      "The ontology and semantic model turn tables into business concepts: renewals, exposure, attrition risk.",
      "The agent queries those concepts, not raw tables — the same measures behind the monthly risk pack.",
    ],
  },

  foundry: {
    id: "foundry",
    title: "Foundry IQ",
    subtitle: "Unlocking enterprise knowledge for agents",
    sources: {
      label: "Enterprise knowledge sources",
      lede: "Bring scattered knowledge into one reusable, governed expert domain.",
      tiles: ["SharePoint", "Websites", "Files", "Databases", "Fabric", "APIs"],
    },
    core: {
      title: "Foundry IQ",
      detail: "Permission-aware knowledge and grounded retrieval",
      cards: [
        {
          title: "Reusable knowledge bases",
          detail: "Build governed knowledge once and reuse it across agents.",
        },
        {
          title: "Indexed and remote sources",
          detail: "Combine prepared indexes with live retrieval from connected systems.",
        },
        {
          title: "Agentic retrieval",
          detail: "Plan searches, refine queries, and assemble the best context at runtime.",
        },
        {
          title: "Transformation and embedding",
          detail: "Prepare diverse content for high-quality semantic grounding.",
        },
        {
          title: "Enterprise security",
          detail: "Respect identity, permissions, citations, and source-level controls.",
          wide: true,
        },
      ],
    },
    agents: {
      title: "Agents & experiences",
      detail: "Grounded answers with evidence and citations",
      foot: "Ground every agent and application",
      items: "Mortgage IQ · Custom agents · Microsoft 365",
    },
    assurances: [
      "Microsoft Entra identity",
      "Permission-aware retrieval",
      "Grounded answers",
      "Citations",
    ],
    stages: [
      "Scattered policy content — SharePoint, files, databases, APIs — is prepared once into a governed expert domain.",
      "Agentic retrieval plans the search at run time and returns the rulebook with citations attached.",
    ],
  },

  web: {
    id: "web",
    title: "Web IQ",
    subtitle: "Current public web context for agents",
    sources: {
      label: "Grounding APIs",
      tiles: ["Web", "News", "Images", "Video"],
      wideTiles: ["Browse"],
    },
    core: {
      title: "Web IQ",
      detail: "Web grounding built for multi-step agents",
    },
    outcomes: {
      items: [
        { title: "Quality", detail: "Relevant, source-linked context agents can trust" },
        { title: "Speed", detail: "Responsive grounding for multi-step agent work" },
        { title: "Efficiency", detail: "Concentrated signal with less irrelevant content" },
      ],
    },
    agents: {
      title: "Grounded agents",
      detail: "Current public market context with linked evidence",
    },
    assurances: [
      "Current public sources",
      "Source links",
      "Domain controls",
      "Grounded responses",
    ],
    stages: [
      "The only layer that leaves the tenant — grounding APIs reach current public sources.",
      "Results are filtered for quality, speed and signal density before the agent sees them.",
      "The competitor claim comes back with links, so a human can check it rather than trust it.",
    ],
  },
};

/** Number of animated connectors a spec renders, left to right. */
export function stageCount(spec: DiagramSpec): number {
  return 1 + (spec.outcomes ? 1 : 0) + (spec.agents ? 1 : 0);
}
