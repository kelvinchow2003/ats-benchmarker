export interface EngineWeights {
  legacy: number; // 0–100
  semantic: number; // 0–100
  ai: number; // 0–100
}

export const DEFAULT_WEIGHTS: EngineWeights = {
  legacy: 30,
  semantic: 30,
  ai: 40,
};

const STORAGE_KEY = "ats-engine-weights";

export function loadWeights(): EngineWeights {
  if (typeof window === "undefined") return DEFAULT_WEIGHTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WEIGHTS;
    const parsed = JSON.parse(raw) as EngineWeights;
    if (
      typeof parsed.legacy === "number" &&
      typeof parsed.semantic === "number" &&
      typeof parsed.ai === "number" &&
      Math.round(parsed.legacy + parsed.semantic + parsed.ai) === 100
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_WEIGHTS;
}

export function saveWeights(w: EngineWeights): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

export function computeComposite(
  legacyScore: number,
  semanticScore: number,
  aiScore: number,
  weights: EngineWeights
): number {
  return Math.round(
    legacyScore * (weights.legacy / 100) +
      semanticScore * (weights.semantic / 100) +
      aiScore * (weights.ai / 100)
  );
}

export function isDefaultWeights(w: EngineWeights): boolean {
  return (
    w.legacy === DEFAULT_WEIGHTS.legacy &&
    w.semantic === DEFAULT_WEIGHTS.semantic &&
    w.ai === DEFAULT_WEIGHTS.ai
  );
}
