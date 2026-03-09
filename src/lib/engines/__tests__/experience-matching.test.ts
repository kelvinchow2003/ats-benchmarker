import { describe, it, expect } from "vitest";
import { runExperienceMatchingEngine } from "../experience-matching";

describe("runExperienceMatchingEngine", () => {
  it("parses years of experience requirements from JD", () => {
    const jd = "Requires 5+ years of experience in software engineering";
    const resume = "Software Engineer, Acme Corp — Jan 2018 – Jan 2024";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.jdRequirements.length).toBeGreaterThan(0);
    expect(result.jdRequirements[0].minYears).toBe(5);
  });

  it("parses Month YYYY - Month YYYY date ranges from resume", () => {
    const resume = "Software Engineer — January 2019 – December 2023";
    const jd = "3 years experience required";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.resumeEntries.length).toBeGreaterThan(0);
    expect(result.resumeEntries[0].durationYears).toBeGreaterThanOrEqual(4);
  });

  it("parses Present/Current end dates", () => {
    const resume = "Software Engineer — Jan 2020 – Present";
    const jd = "2 years experience";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.resumeEntries.length).toBeGreaterThan(0);
    expect(result.resumeEntries[0].isCurrent).toBe(true);
  });

  it("parses YYYY - YYYY date ranges", () => {
    const resume = "Developer at Company X, 2018 - 2022";
    const jd = "3 years of experience";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.resumeEntries.length).toBeGreaterThan(0);
  });

  it("calculates total years of experience", () => {
    const resume = `
Software Engineer — Jan 2020 – Jan 2023
Junior Developer — Jun 2017 – Dec 2019
`;
    const jd = "5 years experience in software development";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.totalYears).toBeGreaterThanOrEqual(5);
  });

  it("detects senior seniority level from JD", () => {
    const resume = "Developer — 2015 – 2024";
    const jd = "Senior Software Engineer with 7+ years experience";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.jdSeniority).toBe("senior");
  });

  it("detects entry seniority level from JD", () => {
    const resume = "Intern — 2023 – 2024";
    const jd = "Junior developer, entry-level position";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.jdSeniority).toBe("entry");
  });

  it("detects intern seniority level from JD", () => {
    const resume = "Student — 2023 – 2024";
    const jd = "Software Engineering Internship";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.jdSeniority).toBe("intern");
  });

  it("returns good_match when experience meets requirements", () => {
    const resume = "Software Engineer — Jan 2019 – Jan 2024";
    const jd = "Requires 5 years of experience";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.overallFit).toBe("good_match");
  });

  it("returns under_qualified when experience is below requirements", () => {
    const resume = "Junior Developer — Jan 2023 – Jan 2024";
    const jd = "Requires 5 years of experience in software development";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.overallFit).toBe("under_qualified");
  });

  it("returns no_data when JD has no experience requirements", () => {
    const resume = "Developer — 2020 – 2024";
    const jd = "Looking for a great developer who loves coding";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.overallFit).toBe("no_data");
  });

  it("returns no_data fit for empty inputs", () => {
    const result = runExperienceMatchingEngine("", "");

    expect(result.overallFit).toBe("no_data");
    expect(result.totalYears).toBe(0);
    expect(result.resumeEntries).toHaveLength(0);
  });

  it("returns a score between 0 and 100", () => {
    const resume = "Software Engineer — Jan 2019 – Jan 2024";
    const jd = "5 years of experience in React development";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("sets candidateSeniority based on total years", () => {
    const resume = `
Lead Engineer — Jan 2014 – Jan 2024
Software Engineer — Jun 2010 – Dec 2013
`;
    const jd = "10 years experience required";
    const result = runExperienceMatchingEngine(resume, jd);

    expect(result.candidateSeniority).toBe("senior");
  });
});
