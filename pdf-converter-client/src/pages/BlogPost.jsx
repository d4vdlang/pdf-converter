import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../pages/blog.css";

// Import ALL posts
import posts from "../posts.json";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [toc, setToc] = useState([]);
  const [contentHTML, setContentHTML] = useState("");
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const p = posts.find((x) => x.slug === slug);
    setPost(p || null);

    if (!p || !p.content) {
      setToc([]);
      setContentHTML("");
      return;
    }

    try {
      // Parse HTML safely
      const tmp = document.createElement("div");
      tmp.innerHTML = p.content;

      // Build TOC from H2
      const headings = [...tmp.querySelectorAll("h2")].map((h, i) => ({
        id: `heading-${i}`,
        text: h.textContent || `Section ${i + 1}`,
      }));

      setToc(headings);

      // Add IDs to h2 so links work
      tmp.querySelectorAll("h2").forEach((h, i) => {
        h.setAttribute("id", `heading-${i}`);
      });

      setContentHTML(tmp.innerHTML);
    } catch (err) {
      console.error("TOC parsing error:", err);
      setToc([]);
      setContentHTML(p.content);
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="blog-container" style={{ maxWidth: 900 }}>
        <h1>Not found</h1>
        <p>Post not found.</p>
        <p>
          <Link to="/blog">← Back to blog</Link>
        </p>
      </div>
    );
  }

  // Reading time estimate
  const readingTime = (() => {
    const text = post.content.replace(/<[^>]+>/g, "");
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  })();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "30px 16px",
      }}
    >
      {/* SEO */}
      <Helmet>
        <title>{post.title} | PDFConvert4Me</title>
        <meta
          name="description"
          content={post.description || "PDFConvert4Me blog post"}
        />
        {post.image && <meta property="og:image" content={post.image} />}
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.description || ""}
        />
  <script type="application/ld+json">
  {`
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.description || ""}",
    "image": "${post.image || ""}",
    "author": {
      "@type": "Organization",
      "name": "PDFConvert4Me"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PDFConvert4Me",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pdfconvert4me.xyz/images/logo.png"
      }
    },
    "datePublished": "${post.date}",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://pdfconvert4me.xyz/blog/${post.slug}"
    }
     }
     `}
     </script>
      </Helmet>

      <main style={{ width: "100%", maxWidth: 1000 }}>
        <article className="blog-container" style={{ padding: "28px" }}>
          <p className="blog-meta">
            {post.date} • {readingTime}
          </p>

          <h1>{post.title}</h1>

          {/* Featured image */}
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="blog-featured-image"
            />
          )}

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            {/* MAIN CONTENT */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: contentHTML }}
                style={{ fontSize: 17, lineHeight: 1.75 }}
              />
            </div>

{/* TOC SIDEBAR */}
{toc.length > 0 && (
  <aside
    className="toc-wrapper"
    style={{
      width: 260,
      flexShrink: 0,
    }}
  >
    {/* MOBILE TOGGLE BUTTON */}
    <button
      className="toc-toggle"
      onClick={() => setTocOpen(!tocOpen)}
      style={{
        display: "none",
        width: "100%",
        padding: "12px 14px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 16,
        cursor: "pointer",
        marginBottom: 12,
      }}
    >
      {tocOpen ? "Hide contents ▲" : "On this page ▼"}
    </button>

    {/* CONTENT BOX */}
    <div
    className={`toc-box ${tocOpen ? "open" : ""}`}
    style={{
    position: "sticky",
    top: 100,
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
      }}
    >
      {/* desktop title */}
      <h4 className="toc-desktop-title" style={{ margin: "0 0 8px 0" }}>
        On this page
      </h4>

      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {toc.map((t) => (
          <li key={t.id} style={{ marginBottom: 8 }}>
            <a
              href={`#${t.id}`}
              style={{
                color: "#16a34a",
                textDecoration: "none",
              }}
              onClick={() => setTocOpen(false)} // auto-collapse after tap
            >
              {t.text}
            </a>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
        <div>{readingTime}</div>

        <div style={{ marginTop: 6 }}>
          <Link
            to="/blog"
            style={{ color: "#128f3b", textDecoration: "none" }}
          >
            ← Back to blog
          </Link>
        </div>
      </div>
    </div>
  </aside>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
