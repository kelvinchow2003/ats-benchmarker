import { getGeminiModel, extractJSON } from "./gemini-client";
import type {
  GitHubProfileData,
  GitHubRepo,
  GitHubReviewResult,
} from "@/types/evaluation";

/* ── GitHub API Fetching ── */

/**
 * Extract a GitHub username from a username string or full URL.
 * Handles: "octocat", "https://github.com/octocat", "github.com/octocat"
 */
export function parseGitHubUsername(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, "");

  // Full URL: https://github.com/username or github.com/username
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/?$/i
  );
  if (urlMatch) return urlMatch[1];

  // Plain username (alphanumeric + hyphens, GitHub rules)
  if (/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(trimmed)) {
    return trimmed;
  }

  throw new Error(
    `Invalid GitHub username or URL: "${input}". Provide a username like "octocat" or a URL like "https://github.com/octocat".`
  );
}

/**
 * Fetch public GitHub profile data using the REST API.
 * No authentication required for public profiles.
 */
export async function fetchGitHubProfile(
  username: string
): Promise<GitHubProfileData> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ATS-Resume-Benchmarker",
  };

  // Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
  });

  if (userRes.status === 404) {
    throw new Error(`GitHub user "${username}" not found.`);
  }
  if (userRes.status === 403) {
    throw new Error(
      "GitHub API rate limit exceeded. Please try again in a few minutes."
    );
  }
  if (!userRes.ok) {
    throw new Error(`GitHub API error: ${userRes.status} ${userRes.statusText}`);
  }

  const userData = await userRes.json();

  // Fetch top repos (sorted by most recently updated)
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&type=owner`,
    { headers }
  );

  let repos: GitHubRepo[] = [];
  if (reposRes.ok) {
    const reposData = await reposRes.json();
    repos = reposData
      .filter((r: { fork: boolean }) => !r.fork) // exclude forks
      .slice(0, 10)
      .map(
        (r: {
          name: string;
          description: string | null;
          language: string | null;
          stargazers_count: number;
          html_url: string;
        }) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          url: r.html_url,
        })
      );
  }

  return {
    username,
    name: userData.name ?? null,
    bio: userData.bio ?? null,
    publicRepos: userData.public_repos ?? 0,
    followers: userData.followers ?? 0,
    profileUrl: userData.html_url ?? `https://github.com/${username}`,
    repos,
  };
}

/* ── Gemini-Powered Review ── */

const SYSTEM_PROMPT = `You are an experienced technical recruiter evaluating a candidate's GitHub profile to assess their fit for a specific role. You are looking at their public GitHub presence the way a real hiring manager would.

EVALUATION CRITERIA:
1. **Technical Stack Alignment**: Do the candidate's repos and languages align with the job requirements?
2. **Project Quality**: Are there well-structured, documented repos with clear READMEs and descriptions?
3. **Activity & Consistency**: Does the candidate show regular contributions and ongoing projects?
4. **Open Source & Collaboration**: Any contributions to open source, or evidence of collaboration?
5. **Portfolio Strength**: Do the repos demonstrate real skills, or are they mostly tutorials/forks?
6. **Profile Completeness**: Is the GitHub profile well-maintained with a bio, README, and organized repos?

SCORING RUBRIC:
- 85–100 → "Strong Match": Excellent GitHub presence. Repos strongly align with the role, well-documented, active contributions.
- 65–84 → "Moderate Match": Decent presence. Some relevant repos, moderate activity, minor gaps.
- 40–64 → "Weak Match": Limited relevant repos, sparse activity, or poor documentation.
- 0–39 → "Not a Fit": No relevant repos, inactive profile, or empty GitHub.

IMPORTANT: Your Verdict MUST align with your Score per the rubric above.

You MUST respond with ONLY valid raw JSON. No markdown fences, no explanation text, no backticks.
The JSON must exactly match this schema:
{
  "Score": <number 0-100>,
  "Verdict": "<one of: Strong Match | Moderate Match | Weak Match | Not a Fit>",
  "Feedback": "<2-3 sentence overall assessment of the GitHub profile for this role>",
  "Strengths": ["<strength 1>", "<strength 2>", ...],
  "Improvements": ["<suggestion 1>", "<suggestion 2>", ...],
  "RepoHighlights": [{"name": "<repo name>", "relevance": "<why this repo matters for the role>"}, ...]
}`;

const STANDALONE_SYSTEM_PROMPT = `You are an experienced developer advocate evaluating a candidate's GitHub profile as a general portfolio review. You are assessing their public GitHub presence the way a tech community leader or hiring manager browsing profiles would.

EVALUATION CRITERIA:
1. **Technical Breadth & Depth**: Does the candidate demonstrate strong skills across their chosen stack?
2. **Project Quality**: Are there well-structured, documented repos with clear READMEs and descriptions?
3. **Activity & Consistency**: Does the candidate show regular contributions and ongoing projects?
4. **Open Source & Collaboration**: Any contributions to open source, or evidence of collaboration?
5. **Portfolio Strength**: Do the repos demonstrate real skills, or are they mostly tutorials/forks?
6. **Profile Completeness**: Is the GitHub profile well-maintained with a bio, README, and organized repos?

SCORING RUBRIC:
- 85–100 → "Excellent": Outstanding GitHub presence. Well-documented, active, diverse projects.
- 65–84 → "Good": Solid presence. Decent repos, moderate activity, minor gaps.
- 40–64 → "Needs Work": Limited repos, sparse activity, or poor documentation.
- 0–39 → "Getting Started": No meaningful repos, inactive profile, or empty GitHub.

IMPORTANT: Your Verdict MUST align with your Score per the rubric above.

You MUST respond with ONLY valid raw JSON. No markdown fences, no explanation text, no backticks.
The JSON must exactly match this schema:
{
  "Score": <number 0-100>,
  "Verdict": "<one of: Excellent | Good | Needs Work | Getting Started>",
  "Feedback": "<2-3 sentence overall assessment of the GitHub profile>",
  "Strengths": ["<strength 1>", "<strength 2>", ...],
  "Improvements": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...],
  "RepoHighlights": [{"name": "<repo name>", "relevance": "<why this repo is notable>"}, ...]
}`;

/**
 * Format GitHub profile data into a text summary for the LLM.
 */
export function formatProfileForPrompt(profile: GitHubProfileData): string {
  const lines: string[] = [];

  lines.push(`GitHub Username: ${profile.username}`);
  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.bio) lines.push(`Bio: ${profile.bio}`);
  lines.push(`Public Repos: ${profile.publicRepos}`);
  lines.push(`Followers: ${profile.followers}`);
  lines.push("");

  if (profile.repos.length > 0) {
    lines.push("=== TOP REPOSITORIES ===");
    for (const repo of profile.repos) {
      const parts = [`• ${repo.name}`];
      if (repo.language) parts.push(`[${repo.language}]`);
      if (repo.stars > 0) parts.push(`★ ${repo.stars}`);
      lines.push(parts.join(" "));
      if (repo.description) {
        lines.push(`  ${repo.description}`);
      }
    }
  } else {
    lines.push("No public repositories found.");
  }

  return lines.join("\n");
}

/**
 * Engine: GitHub Profile Review.
 * Evaluates a GitHub profile against a job description using Gemini.
 */
export async function runGitHubReviewEngine(
  profileData: GitHubProfileData,
  jobDescription?: string
): Promise<GitHubReviewResult> {
  const model = await getGeminiModel();

  const profileSummary = formatProfileForPrompt(profileData);
  const isStandalone = !jobDescription;

  let userPrompt: string;
  let systemPrompt: string;

  if (jobDescription) {
    const trimmedJD = jobDescription.slice(0, 12000);
    systemPrompt = SYSTEM_PROMPT;
    userPrompt = `Evaluate this candidate's GitHub profile for the following job. Consider how a recruiter would view their public GitHub presence — repos, languages, project quality, and activity level.

=== JOB DESCRIPTION ===
${trimmedJD}

=== GITHUB PROFILE ===
${profileSummary}

Respond with ONLY raw JSON matching the required schema. No markdown, no code fences.`;
  } else {
    systemPrompt = STANDALONE_SYSTEM_PROMPT;
    userPrompt = `Review this developer's GitHub profile as a general portfolio assessment. Evaluate their public presence, project quality, activity level, and provide actionable suggestions for improvement.

=== GITHUB PROFILE ===
${profileSummary}

Respond with ONLY raw JSON matching the required schema. No markdown, no code fences.`;
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
  });

  const text = result.response.text().trim();
  const cleaned = extractJSON(text);

  let parsed: {
    Score: number;
    Verdict: string;
    Feedback: string;
    Strengths: string[];
    Improvements: string[];
    RepoHighlights: { name: string; relevance: string }[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.Score ?? 0)));

  // Validate verdict — use the appropriate set based on mode
  const roleFitVerdicts = [
    "Strong Match",
    "Moderate Match",
    "Weak Match",
    "Not a Fit",
  ] as const;
  const standaloneVerdicts = [
    "Excellent",
    "Good",
    "Needs Work",
    "Getting Started",
  ] as const;
  const allValidVerdicts = [...roleFitVerdicts, ...standaloneVerdicts] as const;
  type Verdict = (typeof allValidVerdicts)[number];

  let verdict: Verdict;
  if (allValidVerdicts.includes(parsed.Verdict as Verdict)) {
    verdict = parsed.Verdict as Verdict;
  } else if (isStandalone) {
    verdict =
      score >= 85
        ? "Excellent"
        : score >= 65
          ? "Good"
          : score >= 40
            ? "Needs Work"
            : "Getting Started";
  } else {
    verdict =
      score >= 85
        ? "Strong Match"
        : score >= 65
          ? "Moderate Match"
          : score >= 40
            ? "Weak Match"
            : "Not a Fit";
  }

  return {
    score,
    verdict,
    feedback: parsed.Feedback ?? "No feedback provided.",
    strengths: Array.isArray(parsed.Strengths) ? parsed.Strengths : [],
    improvements: Array.isArray(parsed.Improvements) ? parsed.Improvements : [],
    repoHighlights: Array.isArray(parsed.RepoHighlights)
      ? parsed.RepoHighlights.map((r) => ({
          name: r.name ?? "",
          relevance: r.relevance ?? "",
        }))
      : [],
    profileData,
  };
}
