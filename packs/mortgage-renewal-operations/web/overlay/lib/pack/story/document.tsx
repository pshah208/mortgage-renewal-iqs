'use client';

import { Render, type Data } from '@puckeditor/core';
import {
  defaultStoryChapters,
  type StoryChapter,
  type StoryEditorData,
} from '@/lib/story/config';
import type {
  StoryPuckDefinition,
  StorySlideContext,
} from '@/lib/story/pack-experience';
import {
  StorySlideRuntimeProvider,
  landingSlideConfig,
  landingSlideData,
  landingSlideProps,
  type LandingSlideProps,
} from '@/lib/story/slide-kit';
import {
  MORTGAGE_LANDING_DEFAULT,
  isMortgageChapterDocumentFor,
  mortgageDefaultChapterData,
  mortgageStoryConfig,
  narrativeFallbackData,
} from './slides';

export function mortgageChapterData(chapter: StoryChapter): Data {
  if (isMortgageChapterDocumentFor(chapter.id, chapter.editorData)) {
    return chapter.editorData;
  }
  const packaged = defaultStoryChapters().find(
    (candidate) => candidate.id === chapter.id,
  )?.editorData;
  if (isMortgageChapterDocumentFor(chapter.id, packaged)) return packaged;
  const mortgageDefault = mortgageDefaultChapterData(chapter.id);
  if (mortgageDefault) return mortgageDefault;
  return narrativeFallbackData(chapter);
}

export function mortgageChapterPuckDefinition(
  chapter: StoryChapter,
): StoryPuckDefinition {
  return {
    config: mortgageStoryConfig,
    data: mortgageChapterData(chapter),
  };
}

export function mortgageLandingPuckDefinition(
  value: StoryEditorData | undefined,
): StoryPuckDefinition {
  return {
    config: landingSlideConfig,
    data: landingSlideData(value, MORTGAGE_LANDING_DEFAULT),
  };
}

export function mortgageLandingContent(
  value: StoryEditorData | undefined,
): LandingSlideProps {
  return landingSlideProps(value, MORTGAGE_LANDING_DEFAULT);
}

export function MortgageStoryPage({
  chapter,
  prompt,
  promptSent,
  turn,
  artifact,
  status,
  onRunPrompt,
}: StorySlideContext) {
  return (
    <StorySlideRuntimeProvider
      runtime={{ prompt, promptSent, turn, artifact, status, onRunPrompt }}
    >
      <Render config={mortgageStoryConfig} data={mortgageChapterData(chapter)} />
    </StorySlideRuntimeProvider>
  );
}
