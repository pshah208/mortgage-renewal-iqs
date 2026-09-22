import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const story = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'story', 'default.json'), 'utf8'),
);
const slides = readFileSync(
  resolve(__dirname, '..', 'overlay', 'lib', 'pack', 'story', 'slides.tsx'),
  'utf8',
);

const expectedIds = [
  'decision-criteria',
  'connect',
  'meet-reviewer',
  'work-context',
  'governed-evidence',
  'policy-guidance',
  'external-context',
  'recommendation',
  'close',
];

test('the mortgage renewal story has nine complete ordered chapters', () => {
  assert.equal(story.chapters.length, 9);
  assert.deepEqual(story.chapters.map((chapter) => chapter.id), expectedIds);
  assert.deepEqual(
    story.chapters.map((chapter) => chapter.number),
    ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
  );
  for (const chapter of story.chapters) {
    assert.ok(chapter.title.trim());
    assert.ok(chapter.kicker.trim());
    assert.ok(chapter.takeaway.trim());
    assert.ok(chapter.durationMs >= 3000);
    assert.equal(chapter.enabled, true);
  }
});

test('prompt-backed replay chapters match shared IQ actions', () => {
  const promptBackedActions = new Set(['work', 'fabric', 'foundry', 'web']);
  const promptIds = story.chapters
    .filter((chapter) => promptBackedActions.has(chapter.action))
    .map((chapter) => chapter.id);
  assert.match(slides, /MORTGAGE_PROMPT_CHAPTER_IDS = \[/);
  for (const id of promptIds) {
    assert.match(slides, new RegExp(`'${id}'`));
  }
  for (const chapter of story.chapters) {
    if (promptBackedActions.has(chapter.action)) {
      assert.ok(chapter.prompt && chapter.prompt.trim().length > 0);
    } else {
      assert.equal(chapter.prompt, undefined);
    }
  }
});

test('story guardrails keep risk signals and recommendations within human authority', () => {
  const serialized = JSON.stringify(story);
  assert.match(serialized, /derived attrition risk/i);
  assert.match(serialized, /risk signals/i);
  assert.match(serialized, /reviewable/i);
  assert.match(serialized, /authorized human approval/i);
  assert.match(serialized, /must not approve, deny, bind, price, or communicate/i);
  assert.match(serialized, /determine affordability, creditworthiness, eligibility, or suitability/i);
  assert.match(serialized, /treat risk scores as customer intent/i);
});

test('the story uses the shared Puck slide grammar and no legacy flyer path', () => {
  for (const component of [
    'PersonaSlide',
    'IntentSlide',
    'ArchitectureSlide',
    'IqSlide',
    'ApprovalSlide',
    'CloseSlide',
  ]) {
    assert.match(slides, new RegExp(component));
  }
  assert.match(slides, /\{\{ organization_name \}\}/);
  assert.doesNotMatch(slides, /Flyer|flyer|customer-facing offer/);
  assert.doesNotMatch(JSON.stringify(story), /Flyer|flyer/);
});

test('chat settings are branded for mortgage renewal operations', () => {
  assert.equal(story.settings.chat.title, 'Mortgage Renewal IQ');
  assert.equal(story.settings.chat.starterPrompts.length, 4);
  assert.match(story.settings.chat.emptyDescription, /privacy and approval boundary/i);
});
