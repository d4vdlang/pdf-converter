import { Helmet } from "react-helmet";
import React from "react";
import { Link } from "react-router-dom";
import posts from "../posts.json";

export default function BlogList() {
  return (
    <>
      <Helmet>
        <title>Blog — PDFConvert4me</title>
        <meta
          name="description"
          content="Guides, tutorials, and tips about PDF conversion, file management, and productivity."
        />
      </Helmet>

      <div className="blog-container">
        <h1 className="blog-title">Blog</h1>

        <div className="blog-grid">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="blog-card"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="blog-card-image"
                />
              )}

              <h2 className="blog-card-title">{post.title}</h2>

              <p className="blog-card-excerpt">{post.description}</p>

              <p className="blog-card-date">{post.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
