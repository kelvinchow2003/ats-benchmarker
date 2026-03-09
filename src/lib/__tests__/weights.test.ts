import { describe, it, expect } from "vitest";
import { computeComposite, isDefaultWeights, DEFAULT_WEIGHTS } from "../weights";

describe("DEFAULT_WEIGHTS", () => {
  it("has legacy, semantic, and ai weights", () => {
    expect(DEFAULT_WEIGHTS.legacy).toBeDefined();
    expect(DEFAULT_WEIGHTS.semantic).toBeDefined();
    expect(DEFAULT_WEIGHTS.ai).toBeDefined();
  });

  it("sums to 100", () => {
    expect(DEFAULT_WEIGHTS.legacy + DEFAULT_WEIGHTS.semantic + DEFAULT_WEIGHTS.ai).toBe(100);
  });

  it("has expected default values (30/30/40)", () => {
    expect(DEFAULT_WEIGHTS.legacy).toBe(30);
    expect(DEFAULT_WEIGHTS.semantic).toBe(30);
    expect(DEFAULT_WEIGHTS.ai).toBe(40);
  });
});

describe("computeComposite", () => {
  it("calculates weighted composite with default weights", () => {
    // legacy=80*0.3 + semantic=70*0.3 + ai=90*0.4
    // = 24 + 21 + 36 = 81
    const result = computeComposite(80, 70, 90, DEFAULT_WEIGHTS);
    expect(result).toBe(81);
  });

  it("returns 0 when all scores are 0", () => {
    const result = computeComposite(0, 0, 0, DEFAULT_WEIGHTS);
    expect(result).toBe(0);
  });

  it("returns 100 when all scores are 100", () => {
    const result = computeComposite(100, 100, 100, DEFAULT_WEIGHTS);
    expect(result).toBe(100);
  });

  it("calculates with custom weights", () => {
    const weights = { legacy: 50, semantic: 25, ai: 25 };
    // 80*0.5 + 60*0.25 + 40*0.25 = 40 + 15 + 10 = 65
    const result = computeComposite(80, 60, 40, weights);
    expect(result).toBe(65);
  });

  it("rounds the result to nearest integer", () => {
    // 33*0.3 + 33*0.3 + 33*0.4 = 9.9 + 9.9 + 13.2 = 33
    const result = computeComposite(33, 33, 33, DEFAULT_WEIGHTS);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("handles single engine dominating", () => {
    const weights = { legacy: 100, semantic: 0, ai: 0 };
    const result = computeComposite(85, 0, 0, weights);
    expect(result).toBe(85);
  });
});

describe("isDefaultWeights", () => {
  it("returns true for default weights", () => {
    expect(isDefaultWeights(DEFAULT_WEIGHTS)).toBe(true);
    expect(isDefaultWeights({ legacy: 30, semantic: 30, ai: 40 })).toBe(true);
  });

  it("returns false for custom weights", () => {
    expect(isDefaultWeights({ legacy: 50, semantic: 25, ai: 25 })).toBe(false);
    expect(isDefaultWeights({ legacy: 30, semantic: 40, ai: 30 })).toBe(false);
  });
});
