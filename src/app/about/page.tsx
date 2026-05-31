export const metadata = {
  title: "About Us | Serenade Singers",
  description:
    "Learn about Serenade Singers, a community choir and music education initiative dedicated to music, education, and community.",
};

const values = [
  "Music Education",
  "Choral Culture",
  "Community Service",
  "Western & Myanmar Music Appreciation",
  "Accessible Learning",
  "Artistic Growth",
];

export default function AboutPage() {
  return (
    <main>
      <section className="about-hero">
        <div className="container">
          <p className="eyebrow">About Serenade Singers</p>

          <h1>
            Music. Education.
            <br />
            Community.
          </h1>

          <p>
            Serenade Singers is a community choir and music education initiative
            dedicated to connecting people through music, promoting choral
            culture, and making music learning more accessible.
          </p>
        </div>
      </section>

      <section className="container about-section">
        <div className="about-card about-intro">
          <h2>Who We Are</h2>
          <p>
            Serenade Singers was founded with the belief that music should be
            accessible, meaningful, and shared. We welcome people from different
            backgrounds who love music, wish to learn, and want to become part
            of a positive musical community.
          </p>

          <p>
            Our work focuses on choir singing, music education, performance
            opportunities, volunteer participation, and community-based cultural
            development.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>
              To make music education more accessible, support the growth of
              choral culture in Myanmar, and build a welcoming community where
              people can sing, learn, grow, and contribute.
            </p>
          </div>

          <div className="about-card">
            <h3>Our Vision</h3>
            <p>
              To become a meaningful music education and choral community that
              inspires people to appreciate both Western Music and traditional
              Myanmar music while contributing to cultural and artistic growth.
            </p>
          </div>
        </div>

        <div className="about-card">
          <h2>What We Do</h2>
          <p>
            Serenade Singers provides opportunities for members to learn music
            theory, develop choir and vocal skills, participate in performances,
            join volunteer programs, and engage in educational and cultural
            projects.
          </p>

          <p>
            We also aim to support young people who may face financial barriers
            or limited access to quality music learning resources.
          </p>
        </div>

        <div className="about-values">
          {values.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
