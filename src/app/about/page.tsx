const stats = [
  ["SATB", "Choir Structure"],
  ["Beginner", "Friendly Training"],
  ["Live", "Performances"],
  ["Music", "Community"],
];

const values = [
  {
    title: "Vocal Development",
    text: "Members learn breathing, tone control, resonance, projection, diction, harmony, and musical expression through structured rehearsal.",
  },
  {
    title: "Team Harmony",
    text: "Choir singing develops listening, discipline, timing, blending, confidence, and teamwork through SATB ensemble practice.",
  },
  {
    title: "Performance Culture",
    text: "Members receive opportunities to participate in concerts, showcases, community events, webinars, and music projects.",
  },
];

const programs = [
  "Choir Rehearsals",
  "Vocal Training",
  "Music Theory",
  "Piano Lessons",
  "Live Performances",
  "Community Events",
  "Music Workshops",
  "Webinars",
];

export default function AboutPage() {
  return (
    <main>
      <section className="about-pro-hero">
        <div className="about-pro-wrap">
          <div className="about-pro-left">
            <p className="eyebrow">About Serenade Singers</p>

            <h1>
              One Thing.
              <span> One Voice.</span>
            </h1>

            <p>
              Serenade Singers is a modern choir and music community for people
              who love singing, harmony, teamwork, and creative growth. We welcome
              both complete beginners and experienced singers.
            </p>

            <div className="about-pro-actions">
              <a className="btn-primary" href="/signup">Join Our Choir</a>
              <a className="btn-outline" href="/classes">View Programs</a>
            </div>
          </div>

          <div className="about-pro-panel">
            <p>Our Focus</p>
            <h2>Music. Harmony. Growth.</h2>
            <span>
              Vocal training, choir discipline, musical confidence, friendship,
              and performance experience in one organized community.
            </span>
          </div>
        </div>

        <div className="about-stats">
          {stats.map(([big, small]) => (
            <div className="about-stat" key={big}>
              <strong>{big}</strong>
              <span>{small}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-pro-section">
        <div className="about-section-head">
          <p className="eyebrow">Why Join Us</p>
          <h2>Built for musical growth and real community.</h2>
        </div>

        <div className="about-value-grid">
          {values.map((item) => (
            <div className="about-value-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-pro-section about-split">
        <div>
          <p className="eyebrow">What We Do</p>
          <h2>Activities & Programs</h2>
          <p>
            Serenade Singers organizes musical activities, choir rehearsals,
            training programs, performances, and educational experiences for
            members and students.
          </p>
        </div>

        <div className="program-cloud">
          {programs.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="about-cta-pro">
        <div>
          <p className="eyebrow">Join Serenade Singers</p>
          <h2>Come sing with us — we’d love to have you in our team.</h2>
          <p>
            No experience is required. If you are willing to learn, attend
            rehearsals, and grow with a creative team, Serenade Singers welcomes you.
          </p>
        </div>

        <a className="btn-primary" href="/signup">Register Now</a>
      </section>
    </main>
  );
}
