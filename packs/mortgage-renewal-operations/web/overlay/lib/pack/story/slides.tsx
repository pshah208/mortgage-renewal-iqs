'use client';

import type { Config, Data } from '@puckeditor/core';
import {
  architectureSlideComponent,
  AskAction,
  closeSlideConfig,
  EditableStoryIcon,
  inlineText,
  inlineTextarea,
  intentSlideComponent,
  intentSlideData,
  iqSlideComponent,
  iqSlideData,
  personaSlideComponent,
  personaSlideData,
  PromptCallout,
  storyIconField,
  type ArchitecturePuckData,
  type CloseComponents,
  type LandingSlideProps,
  type StoryIconName,
} from '@/lib/story/slide-kit';

export const MORTGAGE_PROMPT_LABEL = 'Request to Mortgage Renewal IQ';
export const MORTGAGE_ASK_LABEL = 'Ask Mortgage Renewal IQ';
export const MORTGAGE_PROMPT_CHAPTER_IDS = [
  'work-context',
  'governed-evidence',
  'policy-guidance',
  'external-context',
  'recommendation',
] as const;

const MORTGAGE_COMPONENT_TYPES = new Set([
  'PersonaSlide',
  'IntentSlide',
  'ArchitectureSlide',
  'IqSlide',
  'ApprovalSlide',
  'CloseSlide',
]);

export function isMortgageChapterDocument(value: unknown): value is Data {
  if (
    !value ||
    typeof value !== 'object' ||
    !Array.isArray((value as { content?: unknown }).content)
  ) {
    return false;
  }
  const data = value as Data;
  return (
    Boolean(data.root) &&
    data.content.length === 1 &&
    MORTGAGE_COMPONENT_TYPES.has(data.content[0]?.type ?? '')
  );
}

export function isMortgageChapterDocumentFor(
  chapterId: string,
  value: unknown,
): value is Data {
  if (!isMortgageChapterDocument(value)) return false;
  const packaged = mortgageDefaultChapterData(chapterId);
  return packaged?.content[0]?.type === value.content[0]?.type;
}

export const MORTGAGE_LANDING_DEFAULT: LandingSlideProps = {
  eyebrow: '{{ organization_name }} · Mortgage Renewal Operations',
  title: 'Prioritize renewals\nwithout automating approval.',
  description:
    'Follow how Microsoft IQ connects work context, governed renewal measures, '
    + 'policy guidance, and current market signals into human-reviewed retention recommendations.',
  startLabel: 'Start live story',
  replayLabel: 'Replay recorded run',
};

type ApprovalSlideProps = {
  promptLabel: string;
  prompt: string;
  askLabel: string;
  section1: string;
  section2: string;
  section3: string;
  section4: string;
  focusLabel: string;
  focusTitle: string;
  focusText: string;
  focusIcon: StoryIconName;
};

function ApprovalSlide({
  id,
  editMode,
  promptLabel,
  prompt,
  askLabel,
  section1,
  section2,
  section3,
  section4,
  focusLabel,
  focusTitle,
  focusText,
  focusIcon,
}: ApprovalSlideProps & { id: string; editMode?: boolean }) {
  return (
    <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[section1, section2, section3, section4].map((section, index) => (
            <div
              key={index}
              className="border border-[var(--story-ink)]/20 bg-[var(--story-card)] p-4 text-[12px] font-black uppercase tracking-[0.08em]"
            >
              {section}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PromptCallout label={promptLabel} prompt={prompt} />
        </div>
        <AskAction
          label={askLabel}
          className="mt-4"
          completeLabel="Approval brief ready"
          failedLabel="Try the approval brief again"
        />
      </div>
      <div className="relative flex min-h-72 items-center justify-center bg-[var(--story-ink)] p-8 text-white">
        <div className="absolute left-0 top-0 h-4 w-full bg-[var(--story-accent)]" />
        <div className="text-center">
          <EditableStoryIcon
            name={focusIcon ?? 'shield'}
            componentId={id}
            propName="focusIcon"
            editMode={editMode}
            className="mx-auto h-10 w-10 text-[var(--story-highlight)]"
          />
          <div className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--story-highlight)]">
            {focusLabel}
          </div>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.05em]">
            {focusTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/70">
            {focusText}
          </p>
        </div>
      </div>
    </div>
  );
}

const approvalSlideComponent = {
  label: 'Approval brief',
  fields: {
    promptLabel: inlineText,
    prompt: inlineTextarea,
    askLabel: inlineText,
    section1: inlineText,
    section2: inlineText,
    section3: inlineText,
    section4: inlineText,
    focusLabel: inlineText,
    focusTitle: inlineText,
    focusText: inlineTextarea,
    focusIcon: storyIconField,
  },
  render: ({
    id,
    puck,
    ...props
  }: ApprovalSlideProps & { id: string; puck: { isEditing: boolean } }) => (
    <ApprovalSlide {...props} id={id} editMode={puck.isEditing} />
  ),
};

function approvalSlideData(
  props: ApprovalSlideProps & { id?: string },
): Data {
  const { id = 'approval-slide', ...values } = props;
  return {
    root: { props: { title: values.focusTitle } },
    content: [{ type: 'ApprovalSlide', props: { id, ...values } }],
  } as Data;
}

export const mortgageStoryConfig: Config<any> = {
  components: {
    PersonaSlide: personaSlideComponent,
    IntentSlide: intentSlideComponent,
    ArchitectureSlide: architectureSlideComponent,
    IqSlide: iqSlideComponent,
    ApprovalSlide: approvalSlideComponent,
    ...closeSlideConfig.components,
  },
} as unknown as Config<any>;

const persona = personaSlideData({
  id: 'renewal-lead-assignment',
  role: 'Mortgage Renewal Strategy Lead',
  name: 'Renewal operations leader',
  team: 'Retail banking renewal centre · {{ organization_name }}',
  assignment:
    'Prepare a governed renewal-prioritization brief for the weekly pricing, branch, and risk review.',
  goalLabel: 'The decision',
  goalTitle: 'Separate prioritization from price and approval authority.',
  goal1:
    'Identify maturity windows with elevated payment-shock, competitor-gap, and shopping signals.',
  goal2:
    'Use aggregate branch and segment views unless a governed workflow requires row-level review.',
  goal3:
    'Apply offer catalogue, escalation, pricing, privacy, and suitability boundaries.',
  goal4:
    'Prepare a recommendation that names evidence, confidence, and the human approval owner.',
});

const architecture: ArchitecturePuckData = {
  root: { props: { title: 'Microsoft IQ architecture' } },
  content: [
    {
      type: 'ArchitectureSlide',
      props: {
        id: 'mortgage-renewal-architecture',
        layoutVersion: 2,
        eyebrow: 'Microsoft IQ architecture',
        title: 'Connect every kind of intelligence to one renewal choice',
        peopleTitle: 'Intelligence of people',
        peopleDetail: 'Advisor notes, review questions, commitments, meetings, and branch follow-ups',
        peopleIcon: 'users',
        workLabel: 'Work IQ',
        businessTitle: 'Intelligence of renewal operations',
        businessDetail:
          'Maturity workload, balances, branch capacity, payment shock, derived attrition scores, and offer coverage',
        businessIcon: 'database',
        fabricLabel: 'Fabric IQ',
        knowledgeTitle: 'Intelligence of governed guidance',
        knowledgeDetail:
          'Pricing guardrails, privacy rules, offer catalogue, approval roles, and escalation procedures',
        knowledgeIcon: 'shield',
        foundryLabel: 'Foundry IQ',
        worldTitle: 'Intelligence of the real-time world',
        worldDetail:
          'Public rate movement, housing-market signals, regulatory context, and borrower sentiment',
        worldIcon: 'globe',
        webLabel: 'Web IQ',
        platformEyebrow: 'Intelligence platform',
        platformTitle: 'Microsoft IQ',
        platformDetail:
          'One governed platform connecting evidence, reasoning, and reviewable recommendations.',
        platformIcon: 'brain',
        outcome1: 'Aggregated by default',
        outcome2: 'Score-aware',
        outcome3: 'Policy grounded',
        outcome4: 'Approval routed',
        outcome5: 'Human decided',
        destinationTitle: 'Renewal teams + agents',
        destinationDetail:
          'Agents, branch leaders, pricing reviewers, and applications read the same governed evidence.',
        destinationIcon: 'users',
      },
    },
  ],
};

const criteria = intentSlideData({
  id: 'renewal-decision-criteria',
  item1: 'Maturity timing',
  item2: 'Payment shock',
  item3: 'Competitor gap',
  item4: 'Relationship depth',
  item5: 'Branch capacity',
  item6: 'Approval authority',
  traditionalLabel: 'Traditional view',
  traditionalText: 'Separate renewal lists, score exports, offer rules, and market checks.',
  focusLabel: 'The decision',
  focusTitle: 'Who needs attention, and what can be recommended for review?',
  focusText:
    'Mortgage Renewal IQ connects governed evidence with pricing and approval guardrails so recommendations remain reviewable and human-owned.',
  focusIcon: 'shield',
});

const workContext = iqSlideData('work', {
  id: 'mortgage-work-context',
  promptLabel: MORTGAGE_PROMPT_LABEL,
  askLabel: MORTGAGE_ASK_LABEL,
  prompt:
    'Catch me up before the renewal review. What commitments, executive questions, branch constraints, and approval follow-ups are open for this week?',
  name: 'Work IQ',
  promise: 'How renewal teams are already coordinating the week’s pressure',
  sourceLabel: 'Microsoft 365 work context',
  sources: ['Outlook', 'Teams', 'SharePoint', 'OneDrive', 'People', 'Calendar'],
  coreName: 'Microsoft Graph',
  coreDescription: 'Permission-trimmed work context',
  coreDetail1: 'Permission-aware retrieval across renewal, pricing, branch, and risk teams',
  coreDetail2: 'Persistent memory of accountable follow-ups',
  capabilities: [
    ['Leadership context found', 'Questions and constraints from renewal and pricing leaders'],
    ['Commitments assembled', 'Open owners, dates, and approval gates before review starts'],
  ],
  outcomeTitle: 'Team context',
  outcomeDetail: 'The renewal review starts from what the team already knows',
  foundation:
    'Signed-in identity · permission trimming · semantic index · relationships · recency',
});

const governedEvidence = iqSlideData('fabric', {
  id: 'mortgage-governed-evidence',
  promptLabel: MORTGAGE_PROMPT_LABEL,
  askLabel: MORTGAGE_ASK_LABEL,
  prompt:
    'Using the governed renewal model, where are maturity workload, payment shock, value at risk, and offer coverage creating the most pressure?',
  name: 'Fabric IQ',
  promise: 'Governed mortgage renewal facts with source ownership preserved',
  sourceLabel: 'Source systems',
  sourceDescription: 'Mirrored into OneLake without moving source authority',
  sources: [
    'Customer relationship reference',
    'Mortgage renewal workflow',
    'Derived risk signals',
    'Offer catalogue',
    'Branch performance',
  ],
  coreName: 'OneLake',
  coreDescription: 'One governed copy of renewal operations evidence',
  coreDetail1:
    'Maturity, balance, payment-shock, branch, offer, and derived-score measures retain lineage',
  capabilities: [
    ['Ontology', 'Relationship, renewal, risk signal, offer, branch, and approval role'],
    ['Semantic model', 'Direct Lake tables and governed measures over aggregate renewal evidence'],
  ],
  outcomeTitle: 'Governed evidence',
  outcomeDetail: 'Agents, people, and applications read the same facts',
  foundation:
    'Mirroring · conformance · lineage · Microsoft Entra identity · privacy boundary carried from source',
});

const policyGuidance = iqSlideData('foundry', {
  id: 'mortgage-policy-guidance',
  promptLabel: MORTGAGE_PROMPT_LABEL,
  askLabel: MORTGAGE_ASK_LABEL,
  prompt:
    'Before I recommend any retention path, what do our mortgage renewal rules allow, what requires escalation, and who must approve it?',
  name: 'Foundry IQ',
  promise: 'Governed policy guidance for reviewable recommendations',
  sourceLabel: 'Enterprise operating knowledge',
  sourceDescription: 'Published policies, procedures, playbooks, and measure definitions',
  sources: ['SharePoint', 'Policies', 'Procedures', 'Playbooks', 'Reference guides'],
  coreName: 'Knowledge base',
  coreDescription: 'Chunked · embedded · indexed',
  capabilities: [
    ['Reusable knowledge base', 'One governed mortgage-renewal operating domain'],
    ['Policy-gated options', 'Each recommendation names required evidence and approval path'],
    ['Citations', 'Guidance links to the source material used'],
    ['Enterprise security', 'Identity and source permissions remain enforced'],
  ],
  outcomeTitle: 'Approval-safe options',
  outcomeDetail: 'The team knows what can be recommended and who decides',
  integrationTitle: 'Ground every renewal recommendation',
  integrationText:
    'Mortgage Renewal IQ · renewal leaders · branch leaders · pricing · risk · compliance',
  foundation: 'Ingestion · embeddings · hybrid retrieval · reranking · citations',
});

const externalContext = iqSlideData('web', {
  id: 'mortgage-external-context',
  promptLabel: MORTGAGE_PROMPT_LABEL,
  askLabel: MORTGAGE_ASK_LABEL,
  prompt:
    'Check current public Canadian mortgage, rate, housing, and regulatory context. What could change the renewal recommendation or confirm internal evidence is enough?',
  name: 'Web IQ',
  promise: 'Current public context for renewal operations decisions',
  sourceLabel: 'Grounding APIs',
  sources: ['Web', 'Search', 'News', 'Finance'],
  coreName: 'Web IQ',
  coreDescription: 'Retrieval with attribution',
  coreDetail1: 'Source-linked public context at decision time',
  capabilities: [
    ['Material change scan', 'External events that can change the operating recommendation'],
    ['Source links', 'Evidence reviewers can inspect, or an honest no-impact finding'],
  ],
  outcomeTitle: 'External context',
  outcomeDetail: 'The recommendation survives contact with the market',
  foundation: 'Query planning · retrieval · freshness · attribution · safety',
});

const recommendation = approvalSlideData({
  id: 'mortgage-recommendation',
  promptLabel: MORTGAGE_PROMPT_LABEL,
  askLabel: 'Ask Mortgage Renewal IQ for the approval brief',
  prompt:
    'Based on the evidence, prepare a renewal review brief: prioritized segments, derived risk signals, offer paths, approval owners, privacy boundaries, and decisions that must remain with authorized humans.',
  section1: 'Prioritized renewal segments',
  section2: 'Derived signals and confidence',
  section3: 'Offer paths and approval owners',
  section4: 'Decisions that stay with people',
  focusLabel: 'Mortgage Renewal IQ recommendation',
  focusTitle: 'Evidence, option, owner, confidence, boundary.',
  focusText:
    'The output is scoped for review: who to prioritize, why now, what can be proposed, who approves, and what must not be automated.',
  focusIcon: 'shield',
});

const close: Data<CloseComponents> = {
  root: { props: { title: 'Recommendations stay human-owned' } },
  content: [
    {
      type: 'CloseSlide',
      props: {
        id: 'mortgage-close',
        title: 'Mortgage Renewal IQ recommends. Authorized people decide.',
        step1: 'Team context',
        step2: 'Governed evidence',
        step3: 'Policy guidance',
        step4: 'External context',
        step5: 'Human approval',
        artifactLabel: 'No automated pricing or adverse action',
      },
    },
  ],
};

const DEFAULT_DATA: Record<string, Data> = {
  'decision-criteria': criteria,
  connect: architecture,
  'meet-reviewer': persona,
  'work-context': workContext,
  'governed-evidence': governedEvidence,
  'policy-guidance': policyGuidance,
  'external-context': externalContext,
  recommendation,
  close,
};

export function mortgageDefaultChapterData(chapterId: string): Data | null {
  const data = DEFAULT_DATA[chapterId];
  return data ? structuredClone(data) : null;
}

export function narrativeFallbackData(chapter: {
  id: string;
  kicker: string;
  title: string;
  takeaway: string;
}): Data {
  return personaSlideData({
    id: `${chapter.id}-fallback`,
    role: chapter.kicker,
    name: chapter.title,
    team: '',
    assignment: chapter.takeaway,
    goalLabel: 'Story chapter',
    goalTitle: chapter.title,
    goal1: chapter.takeaway,
    goal2: '',
    goal3: '',
    goal4: '',
  });
}
