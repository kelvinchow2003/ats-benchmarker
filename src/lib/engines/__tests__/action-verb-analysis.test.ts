import { describe, it, expect } from "vitest";
import { runActionVerbAnalysisEngine } from "../action-verb-analysis";

describe("runActionVerbAnalysisEngine", () => {
  it("identifies strong action verbs", () => {
    const resume = `
• Built a microservices architecture
• Led team of 5 engineers
• Designed real-time data pipeline
• Deployed applications to production
`;
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.strongVerbCount).toBe(4);
    expect(result.verbInstances.some((v) => v.verb === "built")).toBe(true);
    expect(result.verbInstances.some((v) => v.verb === "led")).toBe(true);
    expect(result.verbInstances.some((v) => v.verb === "designed")).toBe(true);
    expect(result.verbInstances.some((v) => v.verb === "deployed")).toBe(true);
  });

  it("categorizes verbs correctly", () => {
    const resume = `
• Led the engineering team through a major migration
• Built a new authentication service
• Analyzed performance bottlenecks
• Presented findings to stakeholders
`;
    const result = runActionVerbAnalysisEngine(resume);

    const ledVerb = result.verbInstances.find((v) => v.verb === "led");
    const builtVerb = result.verbInstances.find((v) => v.verb === "built");
    const analyzedVerb = result.verbInstances.find((v) => v.verb === "analyzed");
    const presentedVerb = result.verbInstances.find((v) => v.verb === "presented");

    expect(ledVerb?.category).toBe("leadership");
    expect(builtVerb?.category).toBe("creation");
    expect(analyzedVerb?.category).toBe("analysis");
    expect(presentedVerb?.category).toBe("communication");
  });

  it("detects weak phrases", () => {
    const resume = `
• Responsible for managing the development team
• Helped to implement the new feature
• Worked on the backend system
`;
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.weakPhraseCount).toBe(3);
    expect(result.weakPhrases.some((w) => w.weakPhrase === "Responsible for")).toBe(true);
    expect(result.weakPhrases.some((w) => w.weakPhrase === "Helped")).toBe(true);
    expect(result.weakPhrases.some((w) => w.weakPhrase === "Worked on")).toBe(true);
  });

  it("provides alternatives for weak phrases", () => {
    const resume = "• Responsible for managing the development team";
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.weakPhrases[0].alternatives.length).toBeGreaterThan(0);
    expect(result.weakPhrases[0].alternatives).toContain("Led");
  });

  it("calculates verb diversity correctly", () => {
    const resume = `
• Built the application
• Designed the architecture
• Deployed to production
• Automated the testing pipeline
`;
    const result = runActionVerbAnalysisEngine(resume);

    // 4 unique verbs out of 4 total = diversity 1.0
    expect(result.uniqueVerbCount).toBe(4);
    expect(result.verbDiversity).toBe(1);
  });

  it("detects overused verbs (3+ uses)", () => {
    const resume = `
• Built the frontend application
• Built the backend API
• Built the deployment pipeline
• Built the monitoring dashboard
`;
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.overusedVerbs.length).toBeGreaterThan(0);
    expect(result.overusedVerbs[0].verb).toBe("built");
    expect(result.overusedVerbs[0].count).toBe(4);
  });

  it("returns score between 0 and 100", () => {
    const resume = `
• Built microservices architecture
• Led team of engineers
• Designed data pipeline
`;
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns zero counts for empty resume", () => {
    const result = runActionVerbAnalysisEngine("");

    expect(result.totalBullets).toBe(0);
    expect(result.strongVerbCount).toBe(0);
    expect(result.weakPhraseCount).toBe(0);
    expect(result.uniqueVerbCount).toBe(0);
  });

  it("includes category breakdown sorted by count", () => {
    const resume = `
• Built the application
• Created the design system
• Launched the product
• Led the team
• Managed the project
`;
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.categoryBreakdown.length).toBeGreaterThan(0);
    // Should be sorted descending by count
    for (let i = 1; i < result.categoryBreakdown.length; i++) {
      expect(result.categoryBreakdown[i].count).toBeLessThanOrEqual(
        result.categoryBreakdown[i - 1].count
      );
    }
  });

  it("returns top verbs sorted by frequency", () => {
    const resume = `
• Built the frontend
• Built the backend
• Designed the API
`;
    const result = runActionVerbAnalysisEngine(resume);

    expect(result.topVerbs.length).toBeGreaterThan(0);
    expect(result.topVerbs[0].verb).toBe("built");
    expect(result.topVerbs[0].count).toBe(2);
  });
});
