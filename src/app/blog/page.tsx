"use client";

import { useMemo, useState } from "react";
import { blogs } from "@/data/blogs";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Collect unique categories
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(blogs.map((blog) => blog.category)))];
  }, []);

  // Filter blogs based on search keyword and category
  const filteredBlogs = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return blogs.filter((blog) => {
      const matchesCategory = category === "All" || blog.category === category;
      const matchesSearch =
        blog.title.toLowerCase().includes(keyword) ||
        blog.description.toLowerCase().includes(keyword) ||
        blog.category.toLowerCase().includes(keyword) ||
        blog.author.toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main className="blog-page">
      {/* Hero / Intro Section */}
      <section className="blog-list-hero">
        <div className="blog-list-wrap">
          <p className="blog-label blog-gold">Serenade Singers</p>
          <h1 className="blog-list-title">Music Blog</h1>
          <p className="blog-list-subtitle">
            Music education, choir culture, creativity, harmony, and community
            awareness through music.
          </p>

          {/* Search and category select */}
          <div className="blog-search-panel">
            <input
              type="search"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="blog-search-input"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="blog-category-select"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="blog-grid-section">
        <div className="blog-list-wrap">
          {filteredBlogs.length > 0 ? (
            <div className="blog-grid">
              {filteredBlogs.map((blog) => (
                <a
                  key={blog.slug}
                  href={`/blog/${blog.slug}`}
                  className="blog-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="blog-card-image">
                    {/* Local or Internet image handling */}
                    <img
                      src={blog.image.startsWith("http") ? blog.image : blog.image}
                      alt={blog.alt}
                    />
                  </div>

                  <div className="blog-card-body">
                    <p className="blog-label">{blog.category}</p>
                    <h2 className="blog-card-title">{blog.title}</h2>
                    <p className="blog-card-meta">
                      {blog.date} • {blog.readTime}
                    </p>
                    <p className="blog-text">{blog.description}</p>
                    <strong className="blog-link">Read Article →</strong>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="blog-empty-state">
              <h2>No articles found</h2>
              <p>
                Try searching with another keyword or selecting a different
                category.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}