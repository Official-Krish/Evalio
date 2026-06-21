import { prisma } from "../lib/prisma";
import type { LeetCodeDifficulty } from "@evalio/db";

const CSV_BASE = Bun.env.CSV_BASE;

function resolveCsvBase(): string | null {
  if (!CSV_BASE) return null;
  // Convert GitHub repo URLs to raw content URLs
  const repoMatch = CSV_BASE.match(
    /^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/,
  );
  if (repoMatch) {
    return `https://raw.githubusercontent.com/${repoMatch[1]}/main`;
  }
  return CSV_BASE;
}

interface CsvRow {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  acceptance: number;
}

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function lookup(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k] ?? row[normalizeKey(k)];
    if (v) return v;
  }
  // Try normalized matching
  const norm = normalizeKey(keys[0] ?? "");
  for (const [rk, rv] of Object.entries(row)) {
    if (normalizeKey(rk) === norm && rv) return rv;
  }
  return "";
}

function slugFromUrl(url: string): string {
  const m = url.match(/\/problems\/([^/?#]+)/);
  return m ? m[1]! : "";
}

function parseAcceptance(val: string): number {
  return parseFloat(val.replace(/%/g, "").trim());
}

function isRowValid(row: Record<string, string>): boolean {
  const slug =
    lookup(row, "slug", "title_slug", "titleSlug") ||
    slugFromUrl(lookup(row, "url"));
  const acceptance = parseAcceptance(
    lookup(
      row,
      "acceptance",
      "acceptance_rate",
      "acceptancerate",
      "acRate",
      "acceptance %",
      "acceptance%",
    ),
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
  const url = lookup(row, "url");
  return {
    id: parseInt(
      lookup(
        row,
        "id",
        "problem_id",
        "question_id",
        "problemid",
        "leetcodeId",
        "leetcode_id",
      ),
      10,
    ),
    title: lookup(
      row,
      "title",
      "problem_title",
      "problemTitle",
      "question_title",
      "questionTitle",
    ),
    slug: lookup(row, "slug", "title_slug", "titleSlug") || slugFromUrl(url),
    difficulty: lookup(
      row,
      "difficulty",
      "level",
      "difficulty_level",
      "difficultyLevel",
    ).toUpperCase(),
    acceptance: parseAcceptance(
      lookup(
        row,
        "acceptance",
        "acceptance_rate",
        "acceptancerate",
        "acRate",
        "acceptance %",
        "acceptance%",
      ),
    ),
  };
}

const FALLBACK_QUESTIONS: Array<{
  id: number;
  title: string;
  slug: string;
  difficulty: LeetCodeDifficulty;
  acceptanceRate: number;
}> = [
  {
    id: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.49,
  },
  {
    id: 2,
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.42,
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.34,
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "HARD" as LeetCodeDifficulty,
    acceptanceRate: 0.38,
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    slug: "longest-palindromic-substring",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.33,
  },
  {
    id: 6,
    title: "Reverse Integer",
    slug: "reverse-integer",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.29,
  },
  {
    id: 7,
    title: "String to Integer (atoi)",
    slug: "string-to-integer-atoi",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.17,
  },
  {
    id: 8,
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.54,
  },
  {
    id: 9,
    title: "Container With Most Water",
    slug: "container-with-most-water",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.55,
  },
  {
    id: 10,
    title: "3Sum",
    slug: "3sum",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.34,
  },
  {
    id: 11,
    title: "Letter Combinations of a Phone Number",
    slug: "letter-combinations-of-a-phone-number",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.57,
  },
  {
    id: 12,
    title: "Remove Nth Node From End of List",
    slug: "remove-nth-node-from-end-of-list",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.43,
  },
  {
    id: 13,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.4,
  },
  {
    id: 14,
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.62,
  },
  {
    id: 15,
    title: "Generate Parentheses",
    slug: "generate-parentheses",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.73,
  },
  {
    id: 16,
    title: "Merge k Sorted Lists",
    slug: "merge-k-sorted-lists",
    difficulty: "HARD" as LeetCodeDifficulty,
    acceptanceRate: 0.51,
  },
  {
    id: 17,
    title: "Next Permutation",
    slug: "next-permutation",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.38,
  },
  {
    id: 18,
    title: "Search in Rotated Sorted Array",
    slug: "search-in-rotated-sorted-array",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.39,
  },
  {
    id: 19,
    title: "Find First and Last Position of Element in Sorted Array",
    slug: "find-first-and-last-position-of-element-in-sorted-array",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.43,
  },
  {
    id: 20,
    title: "Combination Sum",
    slug: "combination-sum",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.68,
  },
  {
    id: 21,
    title: "Rotate Image",
    slug: "rotate-image",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.69,
  },
  {
    id: 22,
    title: "Group Anagrams",
    slug: "group-anagrams",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.66,
  },
  {
    id: 23,
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.5,
  },
  {
    id: 24,
    title: "Spiral Matrix",
    slug: "spiral-matrix",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.49,
  },
  {
    id: 25,
    title: "Jump Game",
    slug: "jump-game",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.38,
  },
  {
    id: 26,
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.48,
  },
  {
    id: 27,
    title: "Unique Paths",
    slug: "unique-paths",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.64,
  },
  {
    id: 28,
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.54,
  },
  {
    id: 29,
    title: "Edit Distance",
    slug: "edit-distance",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.56,
  },
  {
    id: 30,
    title: "Sort Colors",
    slug: "sort-colors",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.64,
  },
  {
    id: 31,
    title: "Minimum Window Substring",
    slug: "minimum-window-substring",
    difficulty: "HARD" as LeetCodeDifficulty,
    acceptanceRate: 0.41,
  },
  {
    id: 32,
    title: "Word Search",
    slug: "word-search",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.41,
  },
  {
    id: 33,
    title: "Decode Ways",
    slug: "decode-ways",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.46,
  },
  {
    id: 34,
    title: "Binary Tree Inorder Traversal",
    slug: "binary-tree-inorder-traversal",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.76,
  },
  {
    id: 35,
    title: "Validate Binary Search Tree",
    slug: "validate-binary-search-tree",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.32,
  },
  {
    id: 36,
    title: "Same Tree",
    slug: "same-tree",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.58,
  },
  {
    id: 37,
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.65,
  },
  {
    id: 38,
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.74,
  },
  {
    id: 39,
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.63,
  },
  {
    id: 40,
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.54,
  },
  {
    id: 41,
    title: "Binary Tree Maximum Path Sum",
    slug: "binary-tree-maximum-path-sum",
    difficulty: "HARD" as LeetCodeDifficulty,
    acceptanceRate: 0.39,
  },
  {
    id: 42,
    title: "Longest Consecutive Sequence",
    slug: "longest-consecutive-sequence",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.5,
  },
  {
    id: 43,
    title: "Single Number",
    slug: "single-number",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.72,
  },
  {
    id: 44,
    title: "Copy List with Random Pointer",
    slug: "copy-list-with-random-pointer",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.51,
  },
  {
    id: 45,
    title: "Word Break",
    slug: "word-break",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.45,
  },
  {
    id: 46,
    title: "Linked List Cycle",
    slug: "linked-list-cycle",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.49,
  },
  {
    id: 47,
    title: "LRU Cache",
    slug: "lru-cache",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.41,
  },
  {
    id: 48,
    title: "Sort List",
    slug: "sort-list",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.6,
  },
  {
    id: 49,
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    difficulty: "MEDIUM" as LeetCodeDifficulty,
    acceptanceRate: 0.66,
  },
  {
    id: 50,
    title: "Move Zeroes",
    slug: "move-zeroes",
    difficulty: "EASY" as LeetCodeDifficulty,
    acceptanceRate: 0.62,
  },
];

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
  // Try CSV source first
  const csvBase = resolveCsvBase();
  if (csvBase) {
    try {
      const url = `${csvBase}/${companySlug}/all.csv`;
      const res = await fetch(url);
      if (res.ok) {
        const reservoir: CsvRow[] = [];
        let seen = 0;

        const reader = res.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let buf = "";
          let header: string[] | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
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
              if (reservoir.length < count) {
                reservoir.push(parsed);
              } else {
                const j = Math.floor(Math.random() * seen);
                if (j < count) reservoir[j] = parsed;
              }
            }
          }

          if (reservoir.length > 0) {
            return reservoir.map((r) => ({
              id: r.id,
              title: r.title,
              slug: r.slug,
              difficulty: mapDifficulty(r.difficulty),
              acceptanceRate: r.acceptance,
            }));
          }
          console.warn(
            `[questionPool] CSV had 0 valid rows for ${companySlug} — falling back`,
          );
        }
      }
    } catch (err) {
      console.warn(`[questionPool] CSV fetch error for ${companySlug}:`, err);
    }
  }

  // Fallback to default question pool
  console.warn(`[questionPool] Using fallback questions for ${companySlug}`);
  const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
    difficulty: (q.difficulty ?? "Medium").toUpperCase(),
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
