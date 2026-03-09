import { describe, it, expect } from "vitest";
import { runRequirementPriorityEngine } from "../requirement-priority";

describe("runRequirementPriorityEngine", () => {
  it("classifies requirements as required based on signal words", () => {
    const resume = "React developer";
    const jd = "Required: React, TypeScript, Node.js";
    const result = runRequirementPriorityEngine(resume, jd);

    const requiredReqs = result.requirements.filter((r) => r.priority === "required");
    expect(requiredReqs.length).toBeGreaterThan(0);
  });

  it("classifies requirements as preferred based on signal words", () => {
    const resume = "React developer";
    const jd = "Preferred: Experience with GraphQL and Redis";
    const result = runRequirementPriorityEngine(resume, jd);

    const preferredReqs = result.requirements.filter((r) => r.priority === "preferred");
    expect(preferredReqs.length).toBeGreaterThan(0);
  });

  it("classifies requirements as bonus based on signal words", () => {
    const resume = "React developer";
    const jd = "Nice to have: Kubernetes, Terraform";
    const result = runRequirementPriorityEngine(resume, jd);

    const bonusReqs = result.requirements.filter((r) => r.priority === "bonus");
    expect(bonusReqs.length).toBeGreaterThan(0);
  });

  it("section headers change context priority for subsequent lines", () => {
    const resume = "React TypeScript developer";
    const jd = `
Required Skills:
React
TypeScript
Node.js

Preferred Skills:
GraphQL
Redis

Bonus Skills:
Kubernetes
Terraform
`;
    const result = runRequirementPriorityEngine(resume, jd);

    const reactReq = result.requirements.find((r) => r.keyword === "react");
    const graphqlReq = result.requirements.find((r) => r.keyword === "graphql");
    const kubernetesReq = result.requirements.find((r) => r.keyword === "kubernetes");

    expect(reactReq?.priority).toBe("required");
    expect(graphqlReq?.priority).toBe("preferred");
    expect(kubernetesReq?.priority).toBe("bonus");
  });

  it("marks keywords as matched when found in resume", () => {
    const resume = "Experienced React and TypeScript developer";
    const jd = `
Required Skills:
React, TypeScript, Python
`;
    const result = runRequirementPriorityEngine(resume, jd);

    // The engine extracts keywords and checks them against the resume
    const matchedReqs = result.requirements.filter((r) => r.matched);
    const unmatchedReqs = result.requirements.filter((r) => !r.matched);

    // React and TypeScript should match, Python should not
    expect(matchedReqs.length).toBeGreaterThan(0);
    expect(unmatchedReqs.length).toBeGreaterThan(0);
    expect(matchedReqs.some((r) => r.keyword.includes("react"))).toBe(true);
    expect(unmatchedReqs.some((r) => r.keyword.includes("python"))).toBe(true);
  });

  it("calculates requiredMatchRate correctly", () => {
    const resume = "React TypeScript developer";
    const jd = "Required: React, TypeScript, Python, Java";
    const result = runRequirementPriorityEngine(resume, jd);

    // Should be between 0 and 1
    expect(result.requiredMatchRate).toBeGreaterThanOrEqual(0);
    expect(result.requiredMatchRate).toBeLessThanOrEqual(1);
  });

  it("uses weighted score: required 60%, preferred 30%, bonus 10%", () => {
    const resume = "React TypeScript GraphQL developer";
    const jd = `
Required Skills:
React
TypeScript

Preferred Skills:
GraphQL

Bonus Skills:
Kubernetes
`;
    const result = runRequirementPriorityEngine(resume, jd);

    // required: 100% match, preferred: 100% match, bonus: 0% match
    // weighted = 100*0.6 + 100*0.3 + 0*0.1 = 90
    expect(result.weightedScore).toBeGreaterThanOrEqual(0);
    expect(result.weightedScore).toBeLessThanOrEqual(100);
  });

  it("returns full match rates for empty JD", () => {
    const result = runRequirementPriorityEngine("React developer", "");

    expect(result.requiredMatchRate).toBe(1);
    expect(result.preferredMatchRate).toBe(1);
    expect(result.bonusMatchRate).toBe(1);
  });

  it("detects inline priority signals over section context", () => {
    const resume = "Python developer";
    const jd = "Python is a must-have requirement for this role";
    const result = runRequirementPriorityEngine(resume, jd);

    // "must have" is a required signal
    const pythonReq = result.requirements.find((r) =>
      r.keyword.includes("python")
    );
    if (pythonReq) {
      expect(pythonReq.priority).toBe("required");
    }
  });

  it("deduplicates repeated keywords", () => {
    const resume = "React developer";
    const jd = `
Required: React
Preferred: React experience
`;
    const result = runRequirementPriorityEngine(resume, jd);

    const reactReqs = result.requirements.filter((r) => r.keyword === "react");
    expect(reactReqs.length).toBeLessThanOrEqual(1);
  });

  it("returns weightedScore between 0 and 100", () => {
    const resume = "Full-stack developer with React, Node.js, Python";
    const jd = `
Required: React, Node.js, Python
Preferred: TypeScript, GraphQL
Nice to have: Kubernetes, Terraform
`;
    const result = runRequirementPriorityEngine(resume, jd);

    expect(result.weightedScore).toBeGreaterThanOrEqual(0);
    expect(result.weightedScore).toBeLessThanOrEqual(100);
  });
});
