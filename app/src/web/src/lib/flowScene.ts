/**
 * Script and geometry for the animated "how the four IQs connect" sequence.
 *
 * Kept as data, separate from the renderer, so the narrative can be re-cut
 * without touching animation code. Coordinates are in the SVG user space of
 * VIEWBOX; every node is positioned by its centre.
 */

export const VIEWBOX = { w: 1040, h: 600 };

export type Tone = "work" | "fabric" | "foundry" | "web" | "app" | "agent";

export interface FlowNode {
  id: string;
  /** Centre of the node. */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  tone: Tone;
  /** Rendered as a circle rather than a rounded rect. */
  avatar?: boolean;
  /** Shown under the node while it is the active step. */
  working?: string;
  /** Shown under the node once its step has played. */
  done?: string;
}

export const NODES: FlowNode[] = [
  {
    id: "user", x: 62, y: 300, w: 52, h: 52, avatar: true, tone: "app",
    label: "Advisor", sub: "Signed in",
  },
  {
    id: "web", x: 214, y: 300, w: 152, h: 66, tone: "app",
    label: "Web app", sub: "ca-mrc-web · nginx + SPA",
  },
  {
    id: "bff", x: 404, y: 300, w: 152, h: 66, tone: "app",
    label: "BFF", sub: "ca-mrc-bff · FastAPI",
    working: "on-behalf-of exchange", done: "user token · scoped",
  },
  {
    id: "agent", x: 612, y: 300, w: 176, h: 80, tone: "agent",
    label: "Foundry agent", sub: "mortgage-renewal-concierge",
    working: "choosing tools", done: "grounded answer",
  },
  {
    id: "work", x: 892, y: 82, w: 196, h: 74, tone: "work",
    label: "Work IQ", sub: "Microsoft 365 · Graph",
    working: "reading mail, Teams, files", done: "18 emails · 43 messages",
  },
  {
    id: "fabric", x: 892, y: 227, w: 196, h: 74, tone: "fabric",
    label: "Fabric IQ", sub: "OneLake · semantic model",
    working: "querying the renewal book", done: "7 tables · 15 measures",
  },
  {
    id: "foundry", x: 892, y: 372, w: 196, h: 74, tone: "foundry",
    label: "Foundry IQ", sub: "AI Search · policy corpus",
    working: "retrieving policy", done: "RP-003 · OSFI B-20",
  },
  {
    id: "webiq", x: 892, y: 517, w: 196, h: 74, tone: "web",
    label: "Web IQ", sub: "Grounding with Bing",
    working: "checking the market", done: "competitor rates",
  },
];

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  d: string;
}

export const EDGES: FlowEdge[] = [
  { id: "user-web", from: "user", to: "web", d: "M 92 300 L 134 300" },
  { id: "web-bff", from: "web", to: "bff", d: "M 292 300 L 326 300" },
  { id: "bff-agent", from: "bff", to: "agent", d: "M 482 300 L 522 300" },
  {
    id: "agent-work", from: "agent", to: "work",
    d: "M 700 288 C 752 288, 748 82, 792 82",
  },
  {
    id: "agent-fabric", from: "agent", to: "fabric",
    d: "M 700 296 C 752 296, 748 227, 792 227",
  },
  {
    id: "agent-foundry", from: "agent", to: "foundry",
    d: "M 700 304 C 752 304, 748 372, 792 372",
  },
  {
    id: "agent-webiq", from: "agent", to: "webiq",
    d: "M 700 312 C 752 312, 748 517, 792 517",
  },
];

/** One packet travelling an edge during a slice of its scene. */
export interface Flow {
  edge: string;
  /** Travel from the edge's `to` end back to its `from` end. */
  reverse?: boolean;
  /** Window within the scene, as fractions of scene duration. */
  from?: number;
  to?: number;
  tone?: Tone;
}

export interface Scene {
  id: string;
  /** Short label for the timeline chip. */
  label: string;
  /** Narration shown under the stage while the scene plays. */
  caption: string;
  ms: number;
  /** Nodes lit while the scene plays. */
  nodes: string[];
  flows: Flow[];
}

export const SCENES: Scene[] = [
  {
    id: "ask",
    label: "Ask",
    caption:
      "An advisor asks a question in the browser. The SPA has no keys and no data — it forwards the question to the BFF.",
    ms: 2600,
    nodes: ["user", "web"],
    flows: [
      { edge: "user-web", from: 0, to: 0.5 },
      { edge: "web-bff", from: 0.45, to: 1 },
    ],
  },
  {
    id: "obo",
    label: "On-behalf-of",
    caption:
      "The BFF exchanges the user's token on their behalf. Every downstream call runs as the person who asked — never as the app.",
    ms: 2400,
    nodes: ["bff"],
    flows: [],
  },
  {
    id: "plan",
    label: "Plan",
    caption:
      "The Foundry agent reads the question and decides which tools it needs. Nothing here is scripted — the routing is the model's.",
    ms: 2400,
    nodes: ["bff", "agent"],
    flows: [{ edge: "bff-agent", from: 0, to: 0.55 }],
  },
  {
    id: "work",
    label: "Work IQ",
    caption:
      "Work IQ reaches Microsoft 365 through Graph — the campaign's email, Teams and document history, filtered to what this user may see.",
    ms: 2600,
    nodes: ["agent", "work"],
    flows: [{ edge: "agent-work", from: 0, to: 0.55, tone: "work" }],
  },
  {
    id: "fabric",
    label: "Fabric IQ",
    caption:
      "Fabric IQ queries the governed renewal book in OneLake — the same semantic model and measures behind the monthly risk pack.",
    ms: 2600,
    nodes: ["agent", "fabric"],
    flows: [{ edge: "agent-fabric", from: 0, to: 0.55, tone: "fabric" }],
  },
  {
    id: "foundry",
    label: "Foundry IQ",
    caption:
      "Foundry IQ retrieves policy and pricing rules from AI Search — what the bank is allowed to offer, and who has to approve it.",
    ms: 2600,
    nodes: ["agent", "foundry"],
    flows: [{ edge: "agent-foundry", from: 0, to: 0.55, tone: "foundry" }],
  },
  {
    id: "webiq",
    label: "Web IQ",
    caption:
      "Web IQ is the only layer that leaves the tenant — grounding with Bing to test the claim against live competitor rates.",
    ms: 2600,
    nodes: ["agent", "webiq"],
    flows: [{ edge: "agent-webiq", from: 0, to: 0.55, tone: "web" }],
  },
  {
    id: "synthesis",
    label: "Synthesis",
    caption:
      "All four return at once. No single layer holds the answer — the agent reconciles them and carries the citations forward.",
    ms: 3000,
    nodes: ["agent", "work", "fabric", "foundry", "webiq"],
    flows: [
      { edge: "agent-work", reverse: true, from: 0, to: 0.6, tone: "work" },
      { edge: "agent-fabric", reverse: true, from: 0.08, to: 0.68, tone: "fabric" },
      { edge: "agent-foundry", reverse: true, from: 0.16, to: 0.76, tone: "foundry" },
      { edge: "agent-webiq", reverse: true, from: 0.24, to: 0.84, tone: "web" },
    ],
  },
  {
    id: "answer",
    label: "Decision",
    caption:
      "The answer streams back with its sources attached — and a human still makes the call.",
    ms: 3000,
    nodes: ["agent", "bff", "web", "user"],
    flows: [
      { edge: "bff-agent", reverse: true, from: 0, to: 0.34 },
      { edge: "web-bff", reverse: true, from: 0.3, to: 0.64 },
      { edge: "user-web", reverse: true, from: 0.6, to: 0.94 },
    ],
  },
];

export const TOTAL_MS = SCENES.reduce((sum, s) => sum + s.ms, 0);

/** Absolute start time of each scene, parallel to SCENES. */
export const SCENE_STARTS: number[] = SCENES.reduce<number[]>((acc, _s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].ms);
  return acc;
}, []);

export function sceneAt(t: number): number {
  for (let i = SCENES.length - 1; i >= 0; i -= 1) {
    if (t >= SCENE_STARTS[i]) return i;
  }
  return 0;
}
