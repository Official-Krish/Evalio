export function fileNameFromUrl(url: string | null): string | null {
  if (!url) return null
  const name = url.split("/").pop()
  if (!name) return null
  return name.replace(/\.[^/.]+$/, "")
}

export function detectSections(text: string | null | undefined): { projects: number; skills: number } {
  if (!text) return { projects: 0, skills: 0 }
  const lower = text.toLowerCase()
  const projects = (lower.match(/\b(project|product|built|developed|engineered)\b/g) ?? []).length
  const skills = (lower.match(/\b(skill|proficient|experienced|expertise|knowledge of)\b/g) ?? []).length
  return {
    projects: Math.min(Math.max(Math.round(projects / 5), 0), 20),
    skills: Math.min(Math.max(Math.round(skills / 3), 0), 30),
  }
}
