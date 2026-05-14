import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from "./constants";

function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function makeLcg(seed: number): () => number {
  let s = seed === 0 ? 1 : seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function shuffle<T>(arr: T[], seed?: string): T[] {
  const copy = [...arr];
  const rand =
    seed !== undefined ? makeLcg(hashSeed(seed)) : () => Math.random();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function makeInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[
      Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)
    ];
  }
  return code;
}
