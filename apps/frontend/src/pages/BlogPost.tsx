import { useParams, Link } from "react-router-dom"
import { StaticPageLayout } from "@/components/layout/StaticPageLayout"
import { RevealSection } from "@/components/motion/RevealSection"
import { getBlogPost, BLOG_POSTS } from "@/lib/blogData"

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = getBlogPost(slug ?? "")

  if (!post) {
    return (
      <StaticPageLayout>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Post not found.</p>
          <Link
            to="/blog"
            style={{ fontSize: "13px", color: "#A78BFA", textDecoration: "none" }}
          >
            ← Back to blog
          </Link>
        </div>
      </StaticPageLayout>
    )
  }

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <StaticPageLayout>
      {/* Hero */}
      <RevealSection>
        <header className="landing-container pt-28 pb-10">
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Link
                to="/blog"
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              >
                Blog
              </Link>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>/</span>
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
            </div>

            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "var(--landing-fg)",
                margin: "0 0 16px",
              }}
            >
              {post.title}
            </h1>

            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 24px",
              }}
            >
              {post.subtitle}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                IL
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                  Interview Lab Team
                </p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                  {post.date} · {post.readMins} min read
                </p>
              </div>
            </div>
          </div>
        </header>
      </RevealSection>

      {/* Divider */}
      <div
        className="landing-container"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", marginBottom: "0" }}
      />

      {/* Article body */}
      <div className="landing-container py-14">
        <div style={{ maxWidth: "660px" }}>
          {post.sections.map((section, i) => (
            <RevealSection key={i}>
              <div style={{ marginBottom: "32px" }}>
                {section.heading && (
                  <h2
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "var(--landing-fg)",
                      margin: "0 0 10px",
                    }}
                  >
                    {section.heading}
                  </h2>
                )}
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                  }}
                >
                  {section.body}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>

      {/* More posts */}
      {otherPosts.length > 0 && (
        <div
          className="landing-container pb-24"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", paddingTop: "48px" }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "24px",
            }}
          >
            More from the blog
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
            {otherPosts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.02)",
                    transition: "border-color 0.15s, background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"
                    e.currentTarget.style.background = "rgba(124,58,237,0.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#A78BFA",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {p.tag}
                  </span>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--landing-fg)",
                      lineHeight: 1.4,
                      margin: "0 0 6px",
                    }}
                  >
                    {p.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    {p.date} · {p.readMins} min
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </StaticPageLayout>
  )
}
