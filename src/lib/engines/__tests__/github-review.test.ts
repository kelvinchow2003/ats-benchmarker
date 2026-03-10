import { describe, it, expect } from "vitest";
import { parseGitHubUsername, formatProfileForPrompt } from "../github-review";
import type { GitHubProfileData } from "@/types/evaluation";

describe("parseGitHubUsername", () => {
  it("extracts username from plain string", () => {
    expect(parseGitHubUsername("octocat")).toBe("octocat");
  });

  it("extracts username from full HTTPS URL", () => {
    expect(parseGitHubUsername("https://github.com/octocat")).toBe("octocat");
  });

  it("extracts username from URL without protocol", () => {
    expect(parseGitHubUsername("github.com/octocat")).toBe("octocat");
  });

  it("extracts username from URL with www", () => {
    expect(parseGitHubUsername("https://www.github.com/octocat")).toBe(
      "octocat"
    );
  });

  it("handles trailing slashes", () => {
    expect(parseGitHubUsername("https://github.com/octocat/")).toBe("octocat");
    expect(parseGitHubUsername("octocat/")).toBe("octocat");
  });

  it("handles whitespace", () => {
    expect(parseGitHubUsername("  octocat  ")).toBe("octocat");
    expect(parseGitHubUsername("  https://github.com/octocat  ")).toBe(
      "octocat"
    );
  });

  it("accepts usernames with hyphens", () => {
    expect(parseGitHubUsername("my-cool-user")).toBe("my-cool-user");
  });

  it("accepts single character username", () => {
    expect(parseGitHubUsername("a")).toBe("a");
  });

  it("throws for empty string", () => {
    expect(() => parseGitHubUsername("")).toThrow("Invalid GitHub username");
  });

  it("throws for string with only spaces", () => {
    expect(() => parseGitHubUsername("   ")).toThrow("Invalid GitHub username");
  });

  it("throws for invalid characters (underscores are not allowed in GitHub usernames)", () => {
    expect(() => parseGitHubUsername("invalid_user")).toThrow(
      "Invalid GitHub username"
    );
  });

  it("throws for username starting with hyphen", () => {
    expect(() => parseGitHubUsername("-invalid")).toThrow(
      "Invalid GitHub username"
    );
  });

  it("throws for username ending with hyphen", () => {
    expect(() => parseGitHubUsername("invalid-")).toThrow(
      "Invalid GitHub username"
    );
  });

  it("handles HTTP URL (not just HTTPS)", () => {
    expect(parseGitHubUsername("http://github.com/octocat")).toBe("octocat");
  });

  it("rejects URL with subpath beyond username", () => {
    // e.g., https://github.com/octocat/repo should not match as just "octocat"
    expect(() =>
      parseGitHubUsername("https://github.com/octocat/repo")
    ).toThrow("Invalid GitHub username");
  });
});

describe("formatProfileForPrompt", () => {
  const baseProfile: GitHubProfileData = {
    username: "testuser",
    name: "Test User",
    bio: "Full-stack developer from SF",
    publicRepos: 42,
    followers: 150,
    profileUrl: "https://github.com/testuser",
    repos: [],
  };

  it("includes username in output", () => {
    const output = formatProfileForPrompt(baseProfile);
    expect(output).toContain("GitHub Username: testuser");
  });

  it("includes name when present", () => {
    const output = formatProfileForPrompt(baseProfile);
    expect(output).toContain("Name: Test User");
  });

  it("omits name when null", () => {
    const profile = { ...baseProfile, name: null };
    const output = formatProfileForPrompt(profile);
    expect(output).not.toContain("Name:");
  });

  it("includes bio when present", () => {
    const output = formatProfileForPrompt(baseProfile);
    expect(output).toContain("Bio: Full-stack developer from SF");
  });

  it("omits bio when null", () => {
    const profile = { ...baseProfile, bio: null };
    const output = formatProfileForPrompt(profile);
    expect(output).not.toContain("Bio:");
  });

  it("includes public repos count", () => {
    const output = formatProfileForPrompt(baseProfile);
    expect(output).toContain("Public Repos: 42");
  });

  it("includes followers count", () => {
    const output = formatProfileForPrompt(baseProfile);
    expect(output).toContain("Followers: 150");
  });

  it("shows 'No public repositories found.' when repos list is empty", () => {
    const output = formatProfileForPrompt(baseProfile);
    expect(output).toContain("No public repositories found.");
  });

  it("formats repos with name, language, stars, and description", () => {
    const profile: GitHubProfileData = {
      ...baseProfile,
      repos: [
        {
          name: "awesome-project",
          description: "An amazing project",
          language: "TypeScript",
          stars: 42,
          url: "https://github.com/testuser/awesome-project",
        },
      ],
    };
    const output = formatProfileForPrompt(profile);

    expect(output).toContain("=== TOP REPOSITORIES ===");
    expect(output).toContain("• awesome-project");
    expect(output).toContain("[TypeScript]");
    expect(output).toContain("★ 42");
    expect(output).toContain("An amazing project");
  });

  it("omits language bracket when language is null", () => {
    const profile: GitHubProfileData = {
      ...baseProfile,
      repos: [
        {
          name: "no-lang-repo",
          description: null,
          language: null,
          stars: 0,
          url: "https://github.com/testuser/no-lang-repo",
        },
      ],
    };
    const output = formatProfileForPrompt(profile);

    expect(output).toContain("• no-lang-repo");
    expect(output).not.toContain("[");
    expect(output).not.toContain("★");
  });

  it("omits star count when stars is 0", () => {
    const profile: GitHubProfileData = {
      ...baseProfile,
      repos: [
        {
          name: "zero-stars",
          description: "No stars yet",
          language: "Python",
          stars: 0,
          url: "https://github.com/testuser/zero-stars",
        },
      ],
    };
    const output = formatProfileForPrompt(profile);

    expect(output).toContain("• zero-stars");
    expect(output).toContain("[Python]");
    expect(output).not.toContain("★");
  });

  it("omits repo description line when description is null", () => {
    const profile: GitHubProfileData = {
      ...baseProfile,
      repos: [
        {
          name: "no-desc",
          description: null,
          language: "Go",
          stars: 5,
          url: "https://github.com/testuser/no-desc",
        },
      ],
    };
    const output = formatProfileForPrompt(profile);
    const lines = output.split("\n");
    const repoLine = lines.find((l) => l.includes("• no-desc"));
    expect(repoLine).toBeTruthy();

    // The next line after the repo should NOT be an indented description
    const repoIndex = lines.indexOf(repoLine!);
    if (repoIndex < lines.length - 1) {
      expect(lines[repoIndex + 1]).not.toMatch(/^\s{2}/);
    }
  });

  it("formats multiple repos", () => {
    const profile: GitHubProfileData = {
      ...baseProfile,
      repos: [
        {
          name: "repo-a",
          description: "First repo",
          language: "JavaScript",
          stars: 10,
          url: "https://github.com/testuser/repo-a",
        },
        {
          name: "repo-b",
          description: "Second repo",
          language: "Rust",
          stars: 100,
          url: "https://github.com/testuser/repo-b",
        },
      ],
    };
    const output = formatProfileForPrompt(profile);

    expect(output).toContain("• repo-a");
    expect(output).toContain("• repo-b");
    expect(output).toContain("[JavaScript]");
    expect(output).toContain("[Rust]");
    expect(output).toContain("★ 10");
    expect(output).toContain("★ 100");
    expect(output).not.toContain("No public repositories found.");
  });
});
