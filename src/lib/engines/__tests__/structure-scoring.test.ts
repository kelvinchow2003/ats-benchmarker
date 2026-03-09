import { describe, it, expect } from "vitest";
import { runStructureScoringEngine } from "../structure-scoring";

const WELL_STRUCTURED_RESUME = `
John Doe
john@example.com | (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe

Summary
Experienced full-stack software engineer with over five years of professional experience building scalable web applications and distributed systems. Passionate about clean architecture, performance optimization, and mentoring engineering teams to deliver high-quality products.

Experience
Software Engineer, Acme Corp — Jan 2020 – Present
• Built microservices architecture serving 1M+ users across multiple regions
• Led migration from monolith to event-driven system using Kafka and RabbitMQ
• Reduced API latency by 40% through implementing Redis caching strategy
• Implemented CI/CD pipelines using GitHub Actions for automated deployments
• Mentored 3 junior developers on best practices and code review standards
• Designed and implemented real-time notification system using WebSockets
• Collaborated with product team to define technical requirements and roadmap
• Architected database schema supporting multi-tenant SaaS application

Frontend Developer, StartupXYZ — Jun 2017 – Dec 2019
• Developed React component library used across 5 different product lines
• Improved page load time by 60% through code splitting and lazy loading
• Built responsive dashboards with real-time data updates using D3.js
• Implemented comprehensive unit and integration test suite with Jest
• Created design system documentation and component storybook for the team
• Optimized bundle size by 45% through tree shaking and dependency analysis
• Participated in on-call rotation and resolved production incidents promptly

Skills
JavaScript, TypeScript, React, Next.js, Node.js, Python, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Redis, GraphQL, REST APIs, CI/CD, Git, Agile, Scrum

Education
B.S. Computer Science, State University — 2017
Relevant coursework: Data Structures, Algorithms, Operating Systems, Database Systems, Software Engineering

Projects
Open-source CLI tool for automated testing — github.com/johndoe/cli-tool
Personal blog platform built with Next.js and MDX — github.com/johndoe/blog

Certifications
AWS Certified Solutions Architect — Associate
Google Cloud Professional Cloud Developer
`;

describe("runStructureScoringEngine", () => {
  it("detects all critical sections in a well-structured resume", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    const contactInfo = result.sections.find((s) => s.name === "Contact Information");
    const experience = result.sections.find((s) => s.name === "Experience");
    const education = result.sections.find((s) => s.name === "Education");
    const skills = result.sections.find((s) => s.name === "Skills");

    expect(contactInfo?.found).toBe(true);
    expect(experience?.found).toBe(true);
    expect(education?.found).toBe(true);
    expect(skills?.found).toBe(true);
  });

  it("detects optional sections", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    const projects = result.sections.find((s) => s.name === "Projects");
    const certifications = result.sections.find((s) => s.name === "Certifications");

    expect(projects?.found).toBe(true);
    expect(certifications?.found).toBe(true);
  });

  it("marks too_short for very short resumes", () => {
    const shortResume = "John Doe\njohn@example.com\nSoftware engineer.";
    const result = runStructureScoringEngine(shortResume);

    expect(result.lengthAssessment).toBe("too_short");
    expect(result.totalWords).toBeLessThan(200);
  });

  it("marks ideal for a normal-length resume", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    expect(result.lengthAssessment).toBe("ideal");
  });

  it("marks too_long for very long resumes", () => {
    // Generate a resume with > 1800 words
    const longContent = "• Developed and maintained software applications\n".repeat(400);
    const longResume = `Experience\n${longContent}`;
    const result = runStructureScoringEngine(longResume);

    expect(result.lengthAssessment).toBe("too_long");
  });

  it("detects inconsistent bullet styles", () => {
    const resume = `Experience
• Built React applications
- Deployed to AWS
* Managed team of 5
`;
    const result = runStructureScoringEngine(resume);

    const bulletIssue = result.formattingIssues.find((i) => i.type === "inconsistent_bullets");
    expect(bulletIssue).toBeDefined();
    expect(bulletIssue?.severity).toBe("warning");
  });

  it("detects excessive personal pronouns", () => {
    const resume = `Experience
I built the application. I managed the team. I deployed the system.
I also wrote tests. I mentored juniors. My work was excellent.
`;
    const result = runStructureScoringEngine(resume);

    const pronounIssue = result.formattingIssues.find((i) => i.type === "personal_pronouns");
    expect(pronounIssue).toBeDefined();
  });

  it("returns a score between 0 and 100", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("gives a high score for a well-structured resume", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it("handles empty resume", () => {
    const result = runStructureScoringEngine("");

    expect(result.totalWords).toBe(0);
    expect(result.totalLines).toBe(0);
    expect(result.bulletCount).toBe(0);
  });

  it("counts bullets correctly", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    expect(result.bulletCount).toBeGreaterThan(0);
  });

  it("tracks critical vs important vs optional section counts", () => {
    const result = runStructureScoringEngine(WELL_STRUCTURED_RESUME);

    expect(result.criticalSectionsTotal).toBe(4); // Contact, Experience, Education, Skills
    expect(result.criticalSectionsFound).toBeLessThanOrEqual(result.criticalSectionsTotal);
    expect(result.importantSectionsTotal).toBe(1); // Summary/Objective
  });
});
