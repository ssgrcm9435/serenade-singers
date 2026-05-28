export default function BlogPage() {
  return (
    <main className="blog-page">
      <section className="blog-list-hero">
        <div className="blog-list-wrap">
          <p className="blog-label blog-gold">
            Serenade Singers
          </p>

          <h1 className="blog-list-title">
            Music Blog
          </h1>

          <p className="blog-list-subtitle">
            Music education, choir culture,
            creativity, harmony, and community
            awareness through music.
          </p>
        </div>
      </section>

      <section className="blog-grid-section">
        <div className="blog-list-wrap">
          <a
            href="/blog/music-awareness"
            className="blog-card"
          >
            <div className="blog-card-image">
              <img
                src="/og/music-awareness.jpg"
                alt="ဂီတပညာ၏ အရေးပါမှု"
              />
            </div>

            <div className="blog-card-body">
              <p className="blog-label">
                Music Awareness
              </p>

              <h2 className="blog-card-title">
                ဂီတပညာ၏ အရေးပါမှု
              </h2>

              <p className="blog-text">
                ဂီတပညာ၏ အရေးပါမှု၊
                music awareness နှင့်
                လူမှုအသိုင်းအဝိုင်းအပေါ်
                ဂီတ၏
                အကျိုးသက်ရောက်မှုများအကြောင်း
                ဆောင်းပါး။
              </p>

              <strong className="blog-link">
                Read Article →
              </strong>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
