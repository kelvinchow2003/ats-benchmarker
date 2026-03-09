import { describe, it, expect } from "vitest";
import { runResumeQualityEngine } from "../resume-quality";

describe("runResumeQualityEngine", () => {
  it("rates bullet as strong when it has action verb and metrics", () => {
    const resume = "• Improved API response time by 40% serving 1M+ users";
    const result = runResumeQualityEngine(resume);

    expect(result.bullets[0].rating).toBe("strong");
    expect(result.bullets[0].hasActionVerb).toBe(true);
    expect(result.bullets[0].hasMetrics).toBe(true);
  });

  it("rates bullet as moderate when it has only action verb", () => {
    const resume = "• Built a microservices architecture for the platform";
    const result = runResumeQualityEngine(resume);

    expect(result.bullets[0].rating).toBe("moderate");
    expect(result.bullets[0].hasActionVerb).toBe(true);
    expect(result.bullets[0].hasMetrics).toBe(false);
  });

  it("rates bullet as weak when it has neither", () => {
    const resume = "• Responsible for the development of new features";
    const result = runResumeQualityEngine(resume);

    // "Responsible for" is a weak phrase, so hasActionVerb is false
    expect(result.bullets[0].rating).toBe("weak");
  });

  it("extracts percentage metrics", () => {
    const resume = "• Reduced load time by 60%";
    const result = runResumeQualityEngine(resume);

    expect(result.bullets[0].hasMetrics).toBe(true);
    expect(result.bullets[0].metrics).toContain("60%");
  });

  it("extracts dollar amount metrics", () => {
    const resume = "• Saved $500,000 in annual infrastructure costs";
    const result = runResumeQualityEngine(resume);

    expect(result.bullets[0].hasMetrics).toBe(true);
    expect(result.bullets[0].metrics.some((m) => m.includes("$"))).toBe(true);
  });

  it("extracts user count metrics", () => {
    const resume = "• Built platform serving 50000 users daily";
    const result = runResumeQualityEngine(resume);

    expect(result.bullets[0].hasMetrics).toBe(true);
  });

  it("detects action verbs at bullet start", () => {
    const resume = `
• Designed new authentication system
• Deployed microservices to Kubernetes
• Automated CI/CD pipeline
`;
    const result = runResumeQualityEngine(resume);

    expect(result.bulletsWithActionVerbs).toBe(3);
    expect(result.bullets[0].actionVerb).toBe("designed");
    expect(result.bullets[1].actionVerb).toBe("deployed");
    expect(result.bullets[2].actionVerb).toBe("automated");
  });

  it("detects weak phrasing and excludes from action verb count", () => {
    const resume = `
• Responsible for managing the development team
• Helped to implement the new feature
`;
    const result = runResumeQualityEngine(resume);

    expect(result.bulletsWithActionVerbs).toBe(0);
  });

  it("calculates metricsRate correctly", () => {
    const resume = `
• Improved performance by 30%
• Built new React components
• Reduced costs by $100,000
`;
    const result = runResumeQualityEngine(resume);

    expect(result.metricsRate).toBeCloseTo(result.bulletsWithMetrics / result.totalBullets);
  });

  it("returns strong overallRating for high metrics and verb rates", () => {
    const resume = `
• Improved API latency by 50% through caching optimization
• Reduced infrastructure costs by $200,000 annually
• Scaled platform to serve 5M users with 99.9% uptime
• Increased deployment frequency by 300% via CI/CD automation
• Led migration of 100 microservices to Kubernetes
`;
    const result = runResumeQualityEngine(resume);

    expect(result.overallRating).toBe("strong");
  });

  it("returns weak overallRating for no metrics and no verbs", () => {
    const resume = `
• Responsible for the application development
• Participated in team meetings
• Assisted with bug fixes
`;
    const result = runResumeQualityEngine(resume);

    expect(result.overallRating).toBe("weak");
  });

  it("returns score between 0 and 100", () => {
    const resume = `
• Built microservices serving 1M+ users
• Improved performance by 40%
`;
    const result = runResumeQualityEngine(resume);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("handles empty resume", () => {
    const result = runResumeQualityEngine("");

    expect(result.totalBullets).toBe(0);
    expect(result.bulletsWithMetrics).toBe(0);
    expect(result.bulletsWithActionVerbs).toBe(0);
    expect(result.score).toBe(0);
  });

  it("handles numbered bullet points", () => {
    const resume = `
1. Built the frontend application with React
2. Deployed services to AWS
`;
    const result = runResumeQualityEngine(resume);

    expect(result.totalBullets).toBe(2);
  });
});
