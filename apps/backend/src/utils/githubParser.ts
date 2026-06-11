export interface ParsedGithubProfile {
  username: string
  summary: string
  languages: string[]
  projects: {
    name: string
    description: string | null
    url: string
    stars: number
    language: string | null
  }[]
}

export function extractUsername(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== "github.com") return null
    const parts = u.pathname.replace(/^\/+/, "").split("/")
    return parts[0] ?? null
  } catch {
    return null
  }
}

export async function parseGithubProfile(
  username: string
): Promise<ParsedGithubProfile> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`),
  ])

  if (!userRes.ok) {
    throw new Error(`GitHub user fetch failed: ${userRes.status}`)
  }

  const userData = (await userRes.json()) as {
    bio: string | null
    login: string
  }

  const reposData = userRes.ok
    ? ((await reposRes.json()) as {
        name: string
        description: string | null
        html_url: string
        stargazers_count: number
        language: string | null
      }[])
    : []

  const langSet = new Set<string>()
  reposData.forEach((r) => {
    if (r.language) langSet.add(r.language)
  })

  const projects = reposData
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
    }))

  return {
    username: userData.login,
    summary: userData.bio ?? "",
    languages: Array.from(langSet).sort(),
    projects,
  }
}
