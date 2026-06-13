import { Link } from "react-router-dom"
import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { StaticPageHero } from "@/components/static/StaticPageHero"
import { RevealSection } from "@/components/motion/RevealSection"
import { BLOG_POSTS } from "@/lib/blogData"

export function BlogPage() {
  return (
    <StaticPageLayout>
      <StaticPageHero
        badge="Blog"
        title="Thoughts on interviewing."
        subtitle="Interview science, product updates, and engineering notes — no filler."
      />

      <div className="landing-container pb-28">
        <div className="max-w-3xl space-y-0">
          {BLOG_POSTS.map((post, i) => (
            <RevealSection key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                style={{ textDecoration: "none" }}
              >
                <article
                  style={{
                    padding: "36px 0",
                    borderBottom: i < BLOG_POSTS.length - 1 ? "0.5px solid rgba(255,255,255,0.08)" : "none",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "24px",
                    alignItems: "start",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "2px 10px",
                          borderRadius: "999px",
                          background: "rgba(124,58,237,0.15)",
                          color: "#A78BFA",
                        }}
                      >
                        {post.tag}
                      </span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                        {post.date} · {post.readMins} min read
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "var(--landing-fg)",
                        lineHeight: 1.3,
                        margin: "0 0 10px",
                      }}
                    >
                      {post.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.45)",
                        margin: 0,
                        maxWidth: "520px",
                      }}
                    >
                      {post.subtitle}
                    </p>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      color: "rgba(255,255,255,0.2)",
                      paddingTop: "28px",
                      flexShrink: 0,
                    }}
                  >
                    →
                  </div>
                </article>
              </Link>
            </RevealSection>
          ))}
        </div>
      </div>
    </StaticPageLayout>
  )
}
