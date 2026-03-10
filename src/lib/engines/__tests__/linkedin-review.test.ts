import { describe, it, expect } from "vitest";
import {
  extractLinkedInFields,
  formatLinkedInForPrompt,
  parseLinkedInUrl,
} from "../linkedin-review";
import type { LinkedInProfileData } from "@/types/evaluation";

const SAMPLE_LINKEDIN_TEXT = `John Doe
Senior Software Engineer at Google
San Francisco, California

Summary
Passionate software engineer with 8+ years of experience building scalable web applications.
Focused on React, TypeScript, and cloud-native architectures.

Experience
Senior Software Engineer
Google
Jan 2020 - Present
- Led migration of legacy services to microservices architecture
- Reduced API latency by 40% through query optimization

Software Engineer
Meta
Jun 2016 - Dec 2019
- Built real-time data pipeline processing 1M+ events per second
- Mentored 5 junior engineers

Education
BS Computer Science
Stanford University
2012 - 2016

Skills
TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes`;

describe("extractLinkedInFields", () => {
  it("extracts name from first non-empty line", () => {
    const result = extractLinkedInFields(SAMPLE_LINKEDIN_TEXT);
    expect(result.name).toBe("John Doe");
  });

  it("extracts headline from second non-empty line", () => {
    const result = extractLinkedInFields(SAMPLE_LINKEDIN_TEXT);
    expect(result.headline).toBe("Senior Software Engineer at Google");
  });

  it("extracts summary from Summary section", () => {
    const result = extractLinkedInFields(SAMPLE_LINKEDIN_TEXT);
    expect(result.summary).toContain("Passionate software engineer");
    expect(result.summary).toContain("cloud-native architectures");
  });

  it("extracts summary from About section header", () => {
    const text = `Jane Smith
Product Manager

About
Experienced PM driving product strategy for B2B SaaS platforms.

Experience
Product Manager at Stripe`;
    const result = extractLinkedInFields(text);
    expect(result.summary).toContain("Experienced PM");
  });

  it("returns null name when text is empty", () => {
    const result = extractLinkedInFields("");
    expect(result.name).toBeNull();
  });

  it("returns null headline when only one line", () => {
    const result = extractLinkedInFields("John Doe");
    expect(result.name).toBe("John Doe");
    expect(result.headline).toBeNull();
  });

  it("returns null summary when no summary section exists", () => {
    const text = `John Doe
Software Engineer

Experience
Engineer at Startup
2020 - Present`;
    const result = extractLinkedInFields(text);
    expect(result.summary).toBeNull();
  });

  it("always stores full text in profileText", () => {
    const result = extractLinkedInFields(SAMPLE_LINKEDIN_TEXT);
    expect(result.profileText).toBe(SAMPLE_LINKEDIN_TEXT);
  });

  it("handles leading blank lines", () => {
    const text = `


John Doe
Engineer at Acme`;
    const result = extractLinkedInFields(text);
    expect(result.name).toBe("John Doe");
    expect(result.headline).toBe("Engineer at Acme");
  });

  it("skips contact info lines (email) when finding headline", () => {
    const text = `John Doe
john@example.com
Senior Software Engineer at Google`;
    const result = extractLinkedInFields(text);
    expect(result.name).toBe("John Doe");
    expect(result.headline).toBe("Senior Software Engineer at Google");
  });

  it("skips contact info lines (linkedin URL) when finding headline", () => {
    const text = `John Doe
linkedin.com/in/johndoe
Senior Software Engineer`;
    const result = extractLinkedInFields(text);
    expect(result.headline).toBe("Senior Software Engineer");
  });

  it("skips phone number lines when finding headline", () => {
    const text = `John Doe
+1 (555) 123-4567
Product Manager at Stripe`;
    const result = extractLinkedInFields(text);
    expect(result.headline).toBe("Product Manager at Stripe");
  });

  it("summary extraction stops at Experience section", () => {
    const result = extractLinkedInFields(SAMPLE_LINKEDIN_TEXT);
    expect(result.summary).not.toContain("Senior Software Engineer");
    expect(result.summary).not.toContain("Google");
    // Summary should only contain the actual summary text
    expect(result.summary).not.toContain("Led migration");
  });
});

describe("formatLinkedInForPrompt", () => {
  const baseProfile: LinkedInProfileData = {
    name: "John Doe",
    headline: "Senior Software Engineer at Google",
    summary: "Passionate engineer with 8+ years experience.",
    profileText: "Full profile text here",
  };

  it("includes name when present", () => {
    const output = formatLinkedInForPrompt(baseProfile);
    expect(output).toContain("Name: John Doe");
  });

  it("omits name when null", () => {
    const profile = { ...baseProfile, name: null };
    const output = formatLinkedInForPrompt(profile);
    expect(output).not.toContain("Name:");
  });

  it("includes headline when present", () => {
    const output = formatLinkedInForPrompt(baseProfile);
    expect(output).toContain("Headline: Senior Software Engineer at Google");
  });

  it("omits headline when null", () => {
    const profile = { ...baseProfile, headline: null };
    const output = formatLinkedInForPrompt(profile);
    expect(output).not.toContain("Headline:");
  });

  it("includes summary section when present", () => {
    const output = formatLinkedInForPrompt(baseProfile);
    expect(output).toContain("=== SUMMARY ===");
    expect(output).toContain("Passionate engineer");
  });

  it("omits summary section when null", () => {
    const profile = { ...baseProfile, summary: null };
    const output = formatLinkedInForPrompt(profile);
    expect(output).not.toContain("=== SUMMARY ===");
  });

  it("includes full profile text section", () => {
    const output = formatLinkedInForPrompt(baseProfile);
    expect(output).toContain("=== FULL PROFILE TEXT ===");
    expect(output).toContain("Full profile text here");
  });

  it("truncates very long profile text", () => {
    const longText = "A".repeat(20000);
    const profile = { ...baseProfile, profileText: longText };
    const output = formatLinkedInForPrompt(profile);
    expect(output).toContain("[... profile truncated for length ...]");
    expect(output.length).toBeLessThan(20000);
  });

  it("does not truncate short profile text", () => {
    const output = formatLinkedInForPrompt(baseProfile);
    expect(output).not.toContain("truncated");
  });
});

describe("parseLinkedInUrl", () => {
  it("parses full HTTPS URL with www", () => {
    expect(parseLinkedInUrl("https://www.linkedin.com/in/johndoe")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("parses full HTTPS URL without www", () => {
    expect(parseLinkedInUrl("https://linkedin.com/in/johndoe")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("parses HTTP URL", () => {
    expect(parseLinkedInUrl("http://linkedin.com/in/johndoe")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("parses URL without protocol", () => {
    expect(parseLinkedInUrl("linkedin.com/in/johndoe")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("handles trailing slash", () => {
    expect(parseLinkedInUrl("https://linkedin.com/in/johndoe/")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("handles whitespace", () => {
    expect(parseLinkedInUrl("  https://linkedin.com/in/johndoe  ")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("constructs URL from plain username slug", () => {
    expect(parseLinkedInUrl("johndoe")).toBe(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("handles slugs with hyphens and numbers", () => {
    expect(parseLinkedInUrl("john-doe-a1b2c3")).toBe(
      "https://www.linkedin.com/in/john-doe-a1b2c3"
    );
  });

  it("handles single character slug", () => {
    expect(parseLinkedInUrl("j")).toBe("https://www.linkedin.com/in/j");
  });

  it("throws for empty string", () => {
    expect(() => parseLinkedInUrl("")).toThrow("Invalid LinkedIn");
  });

  it("throws for whitespace only", () => {
    expect(() => parseLinkedInUrl("   ")).toThrow("Invalid LinkedIn");
  });

  it("throws for URL to wrong LinkedIn path", () => {
    expect(() =>
      parseLinkedInUrl("https://linkedin.com/company/google")
    ).toThrow("Invalid LinkedIn");
  });

  it("throws for completely invalid input", () => {
    expect(() => parseLinkedInUrl("not a valid input!!!")).toThrow(
      "Invalid LinkedIn"
    );
  });
});
