export function normalizeWord(input: string): string {
  return input.trim().replace(/\s+/g, " ").toUpperCase();
}

export function buildInitialRevealed(word: string): boolean[] {
  return Array.from(word).map((ch) => ch === " ");
}

export function maskWord(word: string, revealed: boolean[]): string {
  return Array.from(word)
    .map((ch, i) => {
      if (ch === " ") return " ";
      return revealed[i] ? ch : "_";
    })
    .join(" ");
}

export function countOccurrences(word: string, letter: string): number {
  const upper = letter.toUpperCase();
  return Array.from(word).filter((ch) => ch.toUpperCase() === upper).length;
}

export function applyReveal(
  word: string,
  revealed: boolean[],
  letter: string,
): boolean[] {
  const upper = letter.toUpperCase();
  return Array.from(word).map((ch, i) =>
    ch.toUpperCase() === upper ? true : revealed[i],
  );
}

export function isFullyRevealed(word: string, revealed: boolean[]): boolean {
  return Array.from(word).every((ch, i) => ch === " " || revealed[i]);
}
