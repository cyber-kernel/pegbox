/**
 * Hand-curated list of popular tools (no analytics dependency)
 */
export const POPULAR_TOOL_IDS: string[] = [
  'voice-cleaner',
  'silence-cutter',
];

export function isPopularTool(id: string): boolean {
  return POPULAR_TOOL_IDS.includes(id);
}

export function isNewTool(addedOn: string): boolean {
  if (!addedOn) return false;
  const added = new Date(addedOn).getTime();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return added >= thirtyDaysAgo;
}

