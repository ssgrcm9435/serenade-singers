import { blogs } from "@/data/blogs";

export default function BlogPage() {
  return (
    <main className="blog-page">
      <section className="blog-list-hero">
        <div className="blog-list-wrap">
          <p className="blog-label blog-gold">Serenade Singers</p>

          <h1 className="blog-list-title">Music Blog</h1>

          <p className="blog-list-subtitle">
            Music education, choir culture, creativity, harmony, and community
            awareness through music.
          </p>
        </div>
      </section>

      <section className="blog-grid-section">
        <div className="blog-list-wrap">
          <div className="blog-grid">
            {blogs.map((blog) => (
              <a key={blog.slug} href={`/blog/${blog.slug}`} className="blog-card">
                <div className="blog-card-image">
                  <img src={blog.image} alt={blog.alt} />
                </div>

                <div className="blog-card-body">
                  <p className="blog-label">{blog.category}</p>

                  <h2 className="blog-card-title">{blog.title}</h2>

                  <p className="blog-text">{blog.description}</p>

                  <strong className="blog-link">Read Article →</strong>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
