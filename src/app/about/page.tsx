export const metadata = {
  title: "About Us | Serenade Singers",
  description:
    "Learn about Serenade Singers, a community choir and music education initiative dedicated to music, education, and community.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="about-flow-hero">
        <div className="container about-flow-wrap">
          <p className="eyebrow">About Serenade Singers</p>

          <h1>
            A Community Built Through
            <span> Music, Education, and Service.</span>
          </h1>

          <p>
            Serenade Singers is a community choir and music education initiative
            dedicated to connecting people through music, supporting choral
            culture, and making music learning more accessible.
          </p>
        </div>
      </section>

      <section className="container about-flow-section">
        <div className="about-flow-row">
          <div className="about-flow-number">01</div>
          <div>
            <h2>Who We Are</h2>
            <p>
              Serenade Singers was founded with the belief that music should be
              accessible, meaningful, and shared. We welcome people from
              different backgrounds who love music, wish to learn, and want to
              become part of a supportive musical community.
            </p>
            <p>
              Our work focuses on choir singing, music education, performance
              opportunities, volunteer participation, and community-based
              cultural development.
            </p>
          </div>
        </div>

        <div className="about-flow-row">
          <div className="about-flow-number">02</div>
          <div>
            <h2>Our Mission</h2>
            <p>
              Our mission is to make music education more accessible, support
              the growth of choral culture in Myanmar, and build a welcoming
              community where people can sing, learn, grow, and contribute.
            </p>
            <p>
              We aim to create opportunities for people who may face financial
              barriers or limited access to quality music learning resources.
            </p>
          </div>
        </div>

        <div className="about-flow-row">
          <div className="about-flow-number">03</div>
          <div>
            <h2>Our Vision</h2>
            <p>
              We envision Serenade Singers as a meaningful music education and
              choral community that inspires people to appreciate both Western
              Music and traditional Myanmar music.
            </p>
            <p>
              Through education, performance, and community engagement, we aim
              to contribute to cultural understanding and artistic growth.
            </p>
          </div>
        </div>

        <div className="about-flow-row">
          <div className="about-flow-number">04</div>
          <div>
            <h2>What We Do</h2>
            <p>
              We provide opportunities for members to learn music theory,
              develop choir and vocal skills, participate in performances, join
              volunteer programs, and engage in educational and cultural
              projects.
            </p>
            <p>
              Serenade Singers is more than a choir. It is a place to learn,
              belong, participate, and grow through music.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
