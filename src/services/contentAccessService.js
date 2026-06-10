/**
 * contentAccessService.js — High-level content access queries.
 *
 * Builds on top of accessControl.js to provide semantic, screen-facing
 * functions. Screens should call these instead of reaching into accessControl
 * directly when they need richer context (locked messages, preview flags, etc.).
 *
 * Rules:
 *   free + available   → full access for everyone
 *   premium + available → locked for free users; full experience requires Premium
 *   coming_soon        → no access, no preview
 */

import { ACCESS_TYPE, isPremiumUser } from './accessControl';

/** True if the story has no available content yet. */
export function isStoryComingSoon(story) {
  return story?.status === 'coming_soon';
}

/** True if the story is on the free tier. */
export function isStoryFree(story) {
  return story?.accessType === ACCESS_TYPE.FREE;
}

/** True if the story requires Premium. */
export function isStoryPremium(story) {
  return story?.accessType === ACCESS_TYPE.PREMIUM;
}

/**
 * True if the user may read the narration scenes of this story.
 * Free stories → always. Premium → requires Premium plan.
 * coming_soon → never.
 */
export function canOpenStoryFullExperience(story) {
  if (!story || isStoryComingSoon(story)) return false;
  if (isStoryFree(story)) return true;
  return isPremiumUser();
}

/**
 * True if the user may see the story card (title, description, first scene
 * teaser) even without full access.
 * coming_soon → no preview.
 */
export function canPreviewStory(story) {
  if (!story || isStoryComingSoon(story)) return false;
  return true;
}

/**
 * Returns one of: 'full' | 'preview' | 'locked' | 'coming_soon'
 * Used by StoryCard / StoryDetailScreen to decide which UI state to render.
 */
export function getStoryAccessStatus(story) {
  if (!story) return 'locked';
  if (isStoryComingSoon(story)) return 'coming_soon';
  if (canOpenStoryFullExperience(story)) return 'full';
  if (canPreviewStory(story)) return 'preview';
  return 'locked';
}

/**
 * Returns the primary action type for the story detail CTA button.
 * 'openFull'      → navigate to Narration
 * 'openParentArea' → navigate to ParentArea (locked premium)
 * 'disabled'      → no action (coming soon)
 */
export function getStoryPrimaryAction(story) {
  if (!story || isStoryComingSoon(story)) return 'disabled';
  if (canOpenStoryFullExperience(story)) return 'openFull';
  return 'openParentArea';
}

/**
 * Returns the badge type string for a story given current progress.
 * 'completed' | 'inProgress' | 'locked' | 'free' | 'premium' | 'comingSoon'
 */
export function getStoryBadgeType(story, progressCount = 0, isCompleted = false) {
  if (isStoryComingSoon(story)) return 'comingSoon';
  if (isCompleted) return 'completed';
  if (progressCount > 0) return 'inProgress';
  if (!canOpenStoryFullExperience(story)) return 'locked';
  if (isStoryFree(story)) return 'free';
  return 'premium';
}

/**
 * Returns a comprehensive UI state object for StoryDetailScreen / StoryBookHero.
 *
 * Shape:
 *   accessStatus        — 'full' | 'preview' | 'locked' | 'coming_soon'
 *   primaryLabel        — string for CTA button
 *   primaryButtonStyle  — 'primary' | 'locked' | 'disabled'
 *   primaryActionType   — 'openFull' | 'openParentArea' | 'disabled'
 *   showPremiumBanner   — bool, show locked-premium reminder strip
 *   helperText          — string | null, small text below button
 *   showComingSoon      — bool
 *   showPreview         — bool, show teaser content without full unlock
 *   showFullExperience  — bool
 *   badgeType           — from getStoryBadgeType
 *   primaryButtonDisabled — bool
 */
export function getStoryUIState(story, progressCount = 0, totalScenes = 0) {
  const isCompleted = progressCount >= totalScenes && totalScenes > 0;
  const accessStatus = getStoryAccessStatus(story);
  const actionType = getStoryPrimaryAction(story);
  const badgeType = getStoryBadgeType(story, progressCount, isCompleted);

  let primaryLabel;
  let primaryButtonStyle;
  let helperText = null;
  let primaryButtonDisabled = false;

  if (accessStatus === 'coming_soon') {
    primaryLabel = '⏳ Em breve';
    primaryButtonStyle = 'disabled';
    primaryButtonDisabled = true;
    helperText = 'Essa história chegará em breve!';
  } else if (accessStatus === 'preview') {
    primaryLabel = 'Pedir ao responsável';
    primaryButtonStyle = 'locked';
    helperText = 'Peça a um responsável para desbloquear.';
  } else if (isCompleted) {
    primaryLabel = null;
    primaryButtonStyle = 'primary';
  } else if (progressCount > 0) {
    primaryLabel = '▶ Continuar a História';
    primaryButtonStyle = 'primary';
  } else {
    primaryLabel = '▶ Começar a História';
    primaryButtonStyle = 'primary';
  }

  return {
    accessStatus,
    primaryLabel,
    primaryButtonStyle,
    primaryActionType: actionType,
    showPremiumBanner: accessStatus === 'preview',
    helperText,
    showComingSoon: accessStatus === 'coming_soon',
    showPreview: accessStatus === 'preview',
    showFullExperience: accessStatus === 'full',
    badgeType,
    primaryButtonDisabled,
    isCompleted,
  };
}

/**
 * Child-facing message shown when a story is locked.
 * Keep short — displayed inside StoryCard.
 */
export function getLockedStoryMessage() {
  return 'Plano Família ✨';
}

/**
 * Parent-facing message shown in the upgrade prompt.
 * story param reserved for future per-story messaging.
 */
export function getParentPremiumMessage(story) {
  const title = story?.titulo ?? 'essa história';
  return `"${title}" é Plano Família. Fale com um responsável para desbloquear todas as aventuras.`;
}
