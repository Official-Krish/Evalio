import { prisma } from "../lib/prisma";
import type { LeetCodeDifficulty } from "@evalio/db";

const CSV_BASE = Bun.env.CSV_BASE;

if (!CSV_BASE) {
  throw new Error("Missing CSV_BASE environment variable");
}

interface CsvRow {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  acceptance: number;
}

function isRowValid(row: Record<string, string>): boolean {
  const slug = row["slug"] || row["title_slug"] || "";
  const acceptance = parseFloat(
    row["acceptance"] || row["acceptance_rate"] || "",
  );
  return !!slug && Number.isFinite(acceptance);
}

function parseRow(header: string[], vals: string[]): Record<string, string> {
  const row: Record<string, string> = {};
  header.forEach((h, idx) => {
    row[h] = vals[idx] ?? "";
  });
  return row;
}

function mapRow(row: Record<string, string>): CsvRow {
  return {
    id: parseInt(
      row["id"] || row["problem_id"] || row["question_id"] || "0",
      10,
    ),
    title: row["title"] || row["problem_title"] || "",
    slug: row["slug"] || row["title_slug"] || "",
    difficulty: (row["difficulty"] || row["level"] || "").toUpperCase(),
    acceptance: parseFloat(row["acceptance"] || row["acceptance_rate"] || "0"),
  };
}

export async function fetchCompanyQuestions(
  companySlug: string,
  count: number = 3,
): Promise<
  {
    id: number;
    title: string;
    slug: string;
    difficulty: LeetCodeDifficulty;
    acceptanceRate: number;
  }[]
> {
  const url = `${CSV_BASE}/${companySlug}/all.csv`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV for ${companySlug}: ${res.status}`);
  }

  const reservoir: CsvRow[] = [];
  let seen = 0;

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Response body not readable");
  }

  const decoder = new TextDecoder();
  let buf = "";
  let header: string[] | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");

    // Keep the last incomplete line in the buffer
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;

      if (!header) {
        header = line.split(",").map((h) => h.trim().toLowerCase());
        continue;
      }

      const vals = line.split(",").map((v) => v.trim());
      const row = parseRow(header, vals);
      if (!isRowValid(row)) continue;

      const parsed = mapRow(row);
      if (!parsed.id) continue;

      seen++;

      // Reservoir sampling: keep first `count` items, then randomly replace
      if (reservoir.length < count) {
        reservoir.push(parsed);
      } else {
        const j = Math.floor(Math.random() * seen);
        if (j < count) {
          reservoir[j] = parsed;
        }
      }
    }
  }

  return reservoir.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    difficulty: mapDifficulty(r.difficulty),
    acceptanceRate: r.acceptance,
  }));
}

function mapDifficulty(d: string): LeetCodeDifficulty {
  switch (d) {
    case "EASY":
      return "EASY" as LeetCodeDifficulty;
    case "MEDIUM":
      return "MEDIUM" as LeetCodeDifficulty;
    case "HARD":
      return "HARD" as LeetCodeDifficulty;
    default:
      return "MEDIUM" as LeetCodeDifficulty;
  }
}

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

const QUESTION_QUERY = `
query questionData($slug: String!) {
  question(titleSlug: $slug) {
    questionId
    title
    titleSlug
    content
    difficulty
    acRate
    exampleTestcases
    sampleTestCase
    metaData
    topicTags { name }
  }
}
`;

interface LeetCodeQuestionData {
  content?: string;
  difficulty?: string;
  acRate?: number;
  exampleTestcases?: string;
  sampleTestCase?: string;
  metaData?: string;
  topicTags?: { name: string }[];
}

interface ParsedTestCase {
  input: string;
  output: string;
  explanation?: string;
}

function parseTestCases(
  content: string,
  exampleTestcases?: string,
): ParsedTestCase[] {
  const cases: ParsedTestCase[] = [];

  if (content) {
    const exampleRegex =
      /<strong>Example\s*\d+:?<\/strong>[\s\S]*?<pre>([\s\S]*?)<\/pre>/gi;
    let match: RegExpExecArray | null;
    while ((match = exampleRegex.exec(content)) !== null) {
      const block = match[1]!;
      const inputMatch = block.match(
        /<strong>Input:?<\/strong>\s*(.*?)(?:<strong>|$)/i,
      );
      const outputMatch = block.match(
        /<strong>Output:?<\/strong>\s*(.*?)(?:<strong>|$)/i,
      );
      const explanationMatch = block.match(
        /<strong>Explanation:?<\/strong>\s*(.*?)(?:<strong>|$)/i,
      );
      if (inputMatch || outputMatch) {
        cases.push({
          input: inputMatch ? inputMatch[1]!.trim() : "",
          output: outputMatch ? outputMatch[1]!.trim() : "",
          explanation: explanationMatch
            ? explanationMatch[1]!.trim()
            : undefined,
        });
      }
    }
  }

  if (cases.length === 0 && exampleTestcases && !content) {
    const lines = exampleTestcases.trim().split("\n");
    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        cases.push({
          input: lines[i] ?? "",
          output: lines[i + 1] ?? "",
        });
      }
    }
  }

  return cases.slice(0, 3);
}

export async function fetchLeetCodeDescription(slug: string): Promise<{
  description: string;
  difficulty: string;
  acRate: number;
  topics: string[];
  testCases: ParsedTestCase[];
}> {
  const res = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: QUESTION_QUERY,
      variables: { slug },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: { question?: LeetCodeQuestionData };
  };
  const q = json.data?.question;
  if (!q) {
    throw new Error(`Question ${slug} not found on LeetCode`);
  }

  const content = q.content ?? "";
  const exampleTestcases = q.exampleTestcases;
  const testCases = parseTestCases(content, exampleTestcases);

  return {
    description: content,
    difficulty: q.difficulty ?? "Medium",
    acRate: q.acRate ?? 0,
    topics: (q.topicTags ?? []).map((t: { name: string }) => t.name),
    testCases,
  };
}

export async function getOrCreateQuestion(
  slug: string,
  leetcodeId: number,
  difficulty: LeetCodeDifficulty,
  acceptanceRate: number,
) {
  const existing = await prisma.leetCodeQuestion.findUnique({
    where: { leetcodeId },
  });

  if (existing && existing.description) {
    return {
      ...existing,
      testCases: [] as {
        input: string;
        output: string;
        explanation?: string;
      }[],
    };
  }

  if (existing && !existing.description) {
    try {
      const details = await fetchLeetCodeDescription(slug);
      const updated = await prisma.leetCodeQuestion.update({
        where: { leetcodeId },
        data: {
          description: details.description,
          expectedTopics: details.topics,
          acceptanceRate: details.acRate,
          difficulty: details.difficulty as LeetCodeDifficulty,
        },
      });
      return {
        ...updated,
        testCases: details.testCases,
      };
    } catch {
      return {
        ...existing,
        testCases: [] as {
          input: string;
          output: string;
          explanation?: string;
        }[],
      };
    }
  }

  let details: Awaited<ReturnType<typeof fetchLeetCodeDescription>>;
  try {
    details = await fetchLeetCodeDescription(slug);
  } catch {
    details = {
      description: "",
      difficulty,
      acRate: acceptanceRate,
      topics: [],
      testCases: [],
    };
  }

  const created = await prisma.leetCodeQuestion.create({
    data: {
      leetcodeId,
      title: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      slug,
      difficulty: details.difficulty as LeetCodeDifficulty,
      acceptanceRate: details.acRate,
      frequency: 0,
      companies: [],
      description: details.description || null,
      expectedTopics: details.topics,
    },
  });

  return {
    ...created,
    testCases: details.testCases,
  };
}
