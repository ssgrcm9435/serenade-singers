export const metadata = {
  title: "Join Serenade Singers | Community Choir & Music Education",
  description:
    "Join Serenade Singers, a community choir and music education initiative open to everyone who loves music.",
};

const benefits = [
  {
    title: "Music Education",
    items: [
      "Access to Music Theory lessons and educational resources",
      "Training in choir singing and vocal techniques",
      "Development of harmony, sight-singing, and ensemble skills",
      "Opportunities to learn about Classical Music, Choral Music, and Music Appreciation",
      "Participation in music workshops, seminars, and educational activities",
      "Exposure to both Western Music and traditional Myanmar music, including their artistic and cultural values",
    ],
  },
  {
    title: "Performance Opportunities",
    items: [
      "Participation in live performances and concerts",
      "Opportunities to perform in choir projects and special events",
      "Experience in ensemble singing and stage performance",
    ],
  },
  {
    title: "Community & Networking",
    items: [
      "Connect with fellow music lovers and musicians",
      "Become part of a supportive and inspiring musical community",
      "Participate in cultural and artistic activities",
    ],
  },
  {
    title: "Volunteer Opportunities",
    items: [
      "Participate in Serenade Singers volunteer programs and community projects",
      "Contribute to music education, community outreach, and social impact initiatives",
      "Gain experience in event management and organizational activities",
    ],
  },
  {
    title: "Leadership & Personal Development",
    items: [
      "Develop leadership, teamwork, and communication skills",
      "Build self-confidence and creative expression",
      "Strengthen responsibility, discipline, and professionalism",
    ],
  },
  {
    title: "Professional & Cultural Growth",
    items: [
      "Access networking opportunities within the music community",
      "Participate in cultural exchange and community engagement activities",
      "Enhance your portfolio and extracurricular experience",
      "Gain valuable personal and professional development opportunities",
    ],
  },
  {
    title: "Recognition",
    items: [
      "Receive official membership recognition",
      "Participate in Serenade Singers activities, projects, and future opportunities",
    ],
  },
];

const mission = [
  "Supporting the growth of music education and choral culture in Myanmar",
  "Expanding access to music education opportunities for young people who may face financial barriers or have limited access to quality music learning resources",
  "Promoting appreciation for both Western Music and traditional Myanmar music while encouraging cultural understanding and exchange",
  "Supporting educational, cultural, and social impact projects that make music more accessible to everyone",
];

export default function MembersPage() {
  return (
    <main>
      <section className="join-hero">
        <div className="container join-hero-inner">
          <p className="eyebrow">Join Serenade Singers</p>

          <h1>
            Everyone Can Sing.
            <br />
            Everyone Can Learn.
            <br />
            <span>Everyone Can Grow.</span>
          </h1>

          <p>
            Serenade Singers is a community choir and music education initiative
            open to everyone who loves music.
          </p>

          <p>
            There are no restrictions based on age, educational background,
            profession, or previous musical experience.
          </p>

          <p>
            Whether you are a student, professional, music enthusiast, beginner
            singer, or someone who simply enjoys music, you are welcome to
            become a member of Serenade Singers.
          </p>

          <div className="join-actions">
            <a className="btn-primary" href="/signup">
              Register Now
            </a>
            <a className="btn-secondary" href="/contact">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section className="container join-section">
        <p className="eyebrow">Membership Benefits</p>
        <h2 className="section-title">What Members Can Experience</h2>

        <div className="join-grid">
          {benefits.map((group) => (
            <div className="join-card" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container join-section">
        <div className="join-mission">
          <p className="eyebrow">Our Mission</p>

          <h2>
            Music Education, Choral Culture, and Community Growth
          </h2>

          <p>
            Serenade Singers aims to connect people through music, promote music
            education, and contribute to the development of arts and culture
            within our community.
          </p>

          <ul>
            {mission.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container join-section">
        <div className="join-why">
          <p className="eyebrow">Why Join Serenade Singers?</p>

          <h2>More Than a Choir</h2>

          <p>
            Serenade Singers is a place to learn, grow, connect, and share a
            passion for music with others.
          </p>

          <p>
            As a member, you will have opportunities not only to sing, but also
            to develop musical knowledge, performance skills, leadership
            abilities, and meaningful community connections.
          </p>

          <div className="join-values">
            <span>Sing</span>
            <span>Learn</span>
            <span>Participate</span>
            <span>Grow</span>
            <span>Contribute</span>
          </div>

          <a className="btn-primary" href="/signup">
            Become a Member
          </a>
        </div>
      </section>
    </main>
  );
}
