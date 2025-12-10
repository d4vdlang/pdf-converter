const fs = require("fs");
const path = require("path");

// Load posts.json (which contains slug + info)
const posts = require("./src/posts.json");

function generateBlogUrls() {
  return posts
    .map(
      (post) => `
  <url>
    <loc>https://www.pdfconvert4me.xyz/blog/${post.slug}</loc>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");
}

function updateSitemap() {
  const sitemapPath = path.join(__dirname, "public", "sitemap.xml");

  let sitemap = fs.readFileSync(sitemapPath, "utf8");

  const blogUrls = generateBlogUrls();

  sitemap = sitemap.replace(
    /<!-- AUTO-BLOG-POSTS -->/g,
    `<!-- AUTO-BLOG-POSTS -->\n${blogUrls}\n  <!-- AUTO-BLOG-POSTS END -->`
  );

  fs.writeFileSync(sitemapPath, sitemap, "utf8");

  console.log("✅ Sitemap updated with blog posts!");
}

updateSitemap();
