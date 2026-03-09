import { describe, it, expect } from "vitest";
import { runLegacyEngine } from "../legacy";

describe("runLegacyEngine", () => {
  it("matches exact keywords found in both resume and JD", () => {
    const resume = "Experienced with React, TypeScript, and Node.js";
    const jd = "Looking for someone with React and TypeScript skills";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords).toContain("react");
    expect(result.matchedKeywords).toContain("typescript");
    expect(result.score).toBeGreaterThan(0);
  });

  it("detects missing keywords not in resume", () => {
    const resume = "I know Python and Django";
    const jd = "Must know React, Python, and Kubernetes";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords).toContain("python");
    expect(result.missingKeywords).toContain("react");
    expect(result.missingKeywords).toContain("kubernetes");
  });

  it("preserves compound phrases as single tokens", () => {
    const resume = "Proficient in machine learning and data science";
    const jd = "Requires experience with machine learning";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords).toContain("machine learning");
  });

  it("matches synonyms (k8s -> kubernetes)", () => {
    const resume = "Deployed services on k8s clusters";
    const jd = "Experience with Kubernetes required";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords).toContain("kubernetes");
    expect(result.synonymMatches).toBeDefined();
    expect(result.synonymMatches!["kubernetes"]).toBe("k8s");
  });

  it("returns score 100 when all keywords match", () => {
    const resume = "Expert in React and TypeScript development";
    const jd = "React TypeScript";
    const result = runLegacyEngine(resume, jd);

    expect(result.score).toBe(100);
    expect(result.matchRate).toBe(1);
    expect(result.missingKeywords).toHaveLength(0);
  });

  it("returns score 0 when no keywords match", () => {
    const resume = "I am a chef with culinary expertise";
    const jd = "React TypeScript Kubernetes Docker";
    const result = runLegacyEngine(resume, jd);

    expect(result.score).toBe(0);
    expect(result.matchRate).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
  });

  it("handles empty resume", () => {
    const result = runLegacyEngine("", "React TypeScript");

    expect(result.score).toBe(0);
    expect(result.matchedKeywords).toHaveLength(0);
  });

  it("handles empty JD", () => {
    const result = runLegacyEngine("I know React", "");

    expect(result.totalJDKeywords).toBe(0);
    expect(result.score).toBe(0);
  });

  it("filters out stop words from JD keywords", () => {
    const resume = "React developer";
    const jd = "We are looking for a React developer";
    const result = runLegacyEngine(resume, jd);

    // "we", "are", "looking", "for", "a" are all stop words
    expect(result.matchedKeywords).toContain("react");
    expect(result.matchedKeywords).not.toContain("we");
    expect(result.matchedKeywords).not.toContain("are");
    expect(result.matchedKeywords).not.toContain("looking");
  });

  it("handles special character terms like C#", () => {
    const resume = "Developed applications using C# and .NET framework";
    const jd = "C# .NET developer needed";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords.some((k) => k === "c#" || k === "csharp")).toBe(true);
  });

  it("handles special character terms like C++", () => {
    const resume = "Wrote high-performance code in C++";
    const jd = "C++ programming experience";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords.some((k) => k === "c++")).toBe(true);
  });

  it("matches Node.js variations", () => {
    const resume = "Built APIs with NodeJS and Express";
    const jd = "Node.js backend developer";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords).toContain("node.js");
  });

  it("calculates matchRate correctly", () => {
    const resume = "React developer with Python";
    const jd = "React Python Java Go";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchRate).toBeCloseTo(result.matchedKeywords.length / result.totalJDKeywords);
    expect(result.score).toBe(Math.round(result.matchRate * 100));
  });

  it("matches via synonym reverse lookup (js -> javascript)", () => {
    const resume = "Strong background in JavaScript and ES6";
    const jd = "Proficiency in JS required";
    const result = runLegacyEngine(resume, jd);

    expect(result.matchedKeywords).toContain("js");
  });
});
