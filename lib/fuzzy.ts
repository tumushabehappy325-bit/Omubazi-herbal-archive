/** Lightweight Levenshtein distance — no external fuzzy deps. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  let prev = new Array<number>(cols);
  let curr = new Array<number>(cols);

  for (let j = 0; j < cols; j++) prev[j] = j;

  for (let i = 1; i < rows; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j < cols; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[b.length];
}

/** Similarity in [0, 1] from edit distance against the longer string. */
export function similarity(a: string, b: string): number {
  const longer = Math.max(a.length, b.length);
  if (longer === 0) return 1;
  return 1 - levenshtein(a, b) / longer;
}

const TOKEN_RE = /[a-z0-9]+/g;

/** Best similarity of `term` against a field and its word tokens. */
export function fieldSimilarity(term: string, field: string): number {
  let best = similarity(term, field);

  const tokens = field.match(TOKEN_RE) ?? [];
  for (const token of tokens) {
    if (token.length < 3) continue;
    best = Math.max(best, similarity(term, token));

    // Prefix/substring tolerance for longer botanical names
    if (token.length >= term.length + 2) {
      for (let i = 0; i <= token.length - term.length; i++) {
        const slice = token.slice(i, i + term.length);
        best = Math.max(best, similarity(term, slice));
      }
    }
  }

  return best;
}
