'use client';

import type { StoryChapter, StoryEditorData } from '@/lib/story/config';
import type {
  PackStoryExperience,
  StorySlideContext,
} from '@/lib/story/pack-experience';
import { packTheme } from '@/lib/pack/theme';
import {
  MortgageStoryPage,
  mortgageChapterPuckDefinition,
  mortgageLandingContent,
  mortgageLandingPuckDefinition,
} from '@/lib/pack/story/document';
import { MORTGAGE_PROMPT_CHAPTER_IDS } from '@/lib/pack/story/slides';

export const packExperience: PackStoryExperience = {
  packId: 'mortgage-renewal-operations',
  theme: packTheme,
  requiredReplayChapters: [...MORTGAGE_PROMPT_CHAPTER_IDS],
  landing(value: StoryEditorData | undefined) {
    return mortgageLandingContent(value);
  },
  renderSlide(context: StorySlideContext) {
    return <MortgageStoryPage {...context} />;
  },
  landingPuckDefinition(value) {
    return mortgageLandingPuckDefinition(value);
  },
  chapterPuckDefinition(chapter: StoryChapter) {
    return mortgageChapterPuckDefinition(chapter);
  },
};
