// Local storage for dismissed matches

const STORAGE_KEY = 'dismissedMatches';

export function getDismissedMatches(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function dismissMatch(matchId: string): void {
  const dismissed = getDismissedMatches();
  dismissed.add(matchId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
}

export function isMatchDismissed(matchId: string): boolean {
  return getDismissedMatches().has(matchId);
}

export function clearDismissedMatches(): void {
  localStorage.removeItem(STORAGE_KEY);
}
