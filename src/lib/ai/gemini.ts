import { GoogleGenAI, Type } from "@google/genai";

/**
 * Single entry point for ALL AI text rewriting/summarization in
 * ProgressFolio.
 *
 * Model policy (locked - see project rules): Google Gemini Flash-Lite
 * only. Do not add OpenAI, Anthropic, or any other provider here or
 * anywhere else in the app unless explicitly instructed otherwise.
 */

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your environment (see .env.example)."
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/** Rolling alias to the latest Gemini Flash-Lite release, overridable via env. */
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";

export interface CommitForSummary {
  sha: string;
  message: string;
  filesChanged: string[];
  additions: number;
  deletions: number;
}

export interface DailyEntrySummary {
  title: string;
  whatShipped: string;
  skills: string[];
  likelyLessons: string;
}

/**
 * Turns a day's worth of commits for one repo into a readable timeline
 * entry draft. The user can edit every field before publishing.
 */
export async function summarizeDailyCommits(params: {
  repoName: string;
  entryDate: string;
  commits: CommitForSummary[];
}): Promise<DailyEntrySummary> {
  const { repoName, entryDate, commits } = params;

  const commitList = commits
    .map(
      (c) =>
        `- ${c.sha.slice(0, 7)}: "${c.message}" (+${c.additions}/-${c.deletions}) [${c.filesChanged
          .slice(0, 8)
          .join(", ")}]`
    )
    .join("\n");

  const prompt = `You are writing a short, honest changelog entry for a student developer's public portfolio timeline.

Repo: ${repoName}
Date: ${entryDate}
Raw commits from that day:
${commitList}

Write a summary of what was shipped in a confident but plain, non-marketing tone. Infer likely skills demonstrated and a likely lesson learned from the diff shape and commit messages - keep both grounded in the evidence, do not invent unrelated claims.`;

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short entry title, under 60 chars" },
          whatShipped: {
            type: Type.STRING,
            description: "2-4 sentences describing what was actually built/fixed/changed",
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-6 short skill/technology tags shown by this work",
          },
          likelyLessons: {
            type: Type.STRING,
            description: "1-2 sentences on what was likely learned or was hard, inferred from the diff",
          },
        },
        required: ["title", "whatShipped", "skills", "likelyLessons"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response for daily summary.");
  }
  return JSON.parse(text) as DailyEntrySummary;
}

export interface WeeklyPostInput {
  displayName: string;
  weekLabel: string;
  entries: { title: string; whatShipped: string }[];
  profileUrl: string;
}

/**
 * Generates a ready-to-post weekly recap for X/LinkedIn from a week's
 * published timeline entries.
 */
export async function generateWeeklyPost(input: WeeklyPostInput): Promise<string> {
  const { displayName, weekLabel, entries, profileUrl } = input;

  const entryList = entries
    .map((e, i) => `${i + 1}. ${e.title} - ${e.whatShipped}`)
    .join("\n");

  const prompt = `Write a short, first-person "building in public" recap post for X/LinkedIn.

Builder: ${displayName}
Week: ${weekLabel}
Shipped this week:
${entryList}

Requirements:
- 3-6 lines, first person, no hashtags spam (0-2 max), no emojis unless natural
- Sound like a real student builder sharing progress, not a press release
- End with a line pointing readers to: ${profileUrl}
Return only the post text, nothing else.`;

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response for weekly post.");
  }
  return text.trim();
}
