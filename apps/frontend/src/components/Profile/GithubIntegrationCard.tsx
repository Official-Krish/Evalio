import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  IconBrandGithub,
  IconStar,
  IconExternalLink,
  IconUnlink,
  IconLoader2,
} from "@tabler/icons-react";

// Color mapping for GitHub languages
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Shell: "#89e051",
  Swift: "#f05138",
  Kotlin: "#A97BFF",
};

interface GithubIntegrationCardProps {
  initialUsername?: string | null;
}

export function GithubIntegrationCard({
  initialUsername: _initialUsername,
}: GithubIntegrationCardProps) {
  const queryClient = useQueryClient();
  const [usernameInput, setUsernameInput] = useState("");
  const [linking, setLinking] = useState(false);

  // Fetch linked GitHub profile from local backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["githubProfile"],
    queryFn: api.getGithubProfile,
  });

  const linkMutation = useMutation({
    mutationFn: api.updateGithubProfile,
    onSuccess: () => {
      toast.success("GitHub profile linked successfully");
      queryClient.invalidateQueries({ queryKey: ["githubProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: api.deleteGithubProfile,
    onSuccess: () => {
      toast.success("GitHub account unlinked");
      queryClient.invalidateQueries({ queryKey: ["githubProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setUsernameInput("");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = usernameInput.trim();
    if (!username) {
      toast.error("Please enter a GitHub username");
      return;
    }

    setLinking(true);
    try {
      // Fetch public profile and repos directly from GitHub API client-side
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(
          `https://api.github.com/users/${username}/repos?per_page=50&sort=updated`,
        ),
      ]);

      if (!userRes.ok) {
        throw new Error(
          userRes.status === 404
            ? "GitHub user not found"
            : `GitHub API error: ${userRes.status}`,
        );
      }

      const userData = await userRes.json();
      const reposData = reposRes.ok ? await reposRes.json() : [];

      const langSet = new Set<string>();
      const rawRepos = Array.isArray(reposData) ? reposData : [];
      rawRepos.forEach((r: { language?: string }) => {
        if (r.language) langSet.add(r.language);
      });

      const projects = rawRepos
        .sort(
          (
            a: { stargazers_count?: number },
            b: { stargazers_count?: number },
          ) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0),
        )
        .slice(0, 10)
        .map(
          (r: {
            name: string;
            description?: string | null;
            stargazers_count?: number;
            language?: string | null;
          }) => ({
            name: r.name,
            description: r.description ?? null,
            stars: r.stargazers_count ?? 0,
            language: r.language ?? null,
          }),
        );

      await linkMutation.mutateAsync({
        username,
        summary: userData.bio ?? "",
        languages: Array.from(langSet).sort(),
        projects,
      });
    } catch (err: unknown) {
      toast.error(
        (err instanceof Error ? err.message : null) ||
          "Failed to fetch GitHub data. Check username.",
      );
    } finally {
      setLinking(false);
    }
  };

  const profile = data?.profile;

  if (isLoading) {
    return (
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <IconLoader2
            className="animate-spin"
            size={24}
            color="var(--app-accent)"
          />
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Loading portfolio...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconBrandGithub size={18} color="var(--color-text-muted)" />
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              fontWeight: 600,
            }}
          >
            GitHub Integration
          </span>
        </div>
        {profile && (
          <button
            onClick={() => unlinkMutation.mutate()}
            disabled={unlinkMutation.isPending}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-danger, #ef4444)",
              fontSize: "11px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: unlinkMutation.isPending ? 0.5 : 1,
            }}
          >
            <IconUnlink size={12} />
            Disconnect
          </button>
        )}
      </div>

      <div style={{ padding: "24px" }}>
        <AnimatePresence mode="wait">
          {!profile ? (
            <motion.form
              key="unlinked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleLink}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Link your GitHub account to synchronize public repositories and
                primary languages. This enables tailored technical interview
                sessions.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    github.com/
                  </span>
                  <input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="username"
                    disabled={linking}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 96px",
                      fontSize: "13px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={linking}
                  style={{
                    padding: "0 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--app-accent, #b8a88a)",
                    color: "var(--color-bg)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: linking ? 0.7 : 1,
                  }}
                >
                  {linking ? (
                    <>
                      <IconLoader2 className="animate-spin" size={14} />
                      Syncing
                    </>
                  ) : (
                    "Link Account"
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="linked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              {/* Linked header info */}
              <div>
                <a
                  href={`https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--app-accent, #b8a88a)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  @{profile.username}
                  <IconExternalLink size={13} />
                </a>
                {profile.summary && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                      margin: "8px 0 0",
                      paddingLeft: "10px",
                      borderLeft:
                        "2px solid var(--app-accent-border, rgba(184,168,138,0.25))",
                      fontStyle: "italic",
                    }}
                  >
                    "{profile.summary}"
                  </p>
                )}
              </div>

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-text-muted)",
                      margin: "0 0 8px",
                      fontWeight: 600,
                    }}
                  >
                    Core Languages
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                  >
                    {profile.languages.slice(0, 8).map((lang) => (
                      <div
                        key={lang}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: LANGUAGE_COLORS[lang] ?? "#8a8884",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary)",
                            fontWeight: 500,
                          }}
                        >
                          {lang}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Projects Pinned */}
              {profile.projects && profile.projects.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-text-muted)",
                      margin: "0 0 10px",
                      fontWeight: 600,
                    }}
                  >
                    Featured Repositories
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {profile.projects.slice(0, 3).map((proj) => (
                      <div
                        key={proj.name}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid var(--color-border-light)",
                          background: "rgba(255, 255, 255, 0.015)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}
                        >
                          <a
                            href={`https://github.com/${profile.username}/${proj.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--color-text)",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {proj.name}
                            <IconExternalLink size={11} />
                          </a>
                          {proj.description && (
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--color-text-muted)",
                                margin: "3px 0 0",
                                lineHeight: 1.4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {proj.description}
                            </p>
                          )}
                        </div>

                        {/* Project meta (stars, language) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          {proj.language && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background:
                                    LANGUAGE_COLORS[proj.language] ?? "#8a8884",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {proj.language}
                              </span>
                            </div>
                          )}
                          {proj.stars !== undefined && proj.stars > 0 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              <IconStar size={12} />
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {proj.stars}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
