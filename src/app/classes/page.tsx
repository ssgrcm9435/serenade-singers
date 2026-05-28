const classes = [
  {
    title: "Piano Class",
    level: "Beginner • Intermediate • Advanced",
    description:
      "Professional piano lessons focused on technique, sight reading, musical interpretation, rhythm, scales, arpeggios, and performance confidence.",
    features: [
      "Classical Piano",
      "Finger Technique",
      "Sight Reading",
      "ABRSM Preparation",
      "Performance Training",
    ],
  },

  {
    title: "Vocal Training",
    level: "All Levels",
    description:
      "Modern vocal coaching for breathing, resonance, pitch control, diction, expression, projection, and healthy singing technique.",
    features: [
      "Breathing Technique",
      "Pitch Training",
      "Voice Projection",
      "Musical Expression",
      "Stage Confidence",
    ],
  },

  {
    title: "Choir Training",
    level: "Group Program",
    description:
      "Ensemble singing and harmony training focused on blend, listening, balance, choral discipline, and musical teamwork.",
    features: [
      "Harmony Singing",
      "Ensemble Listening",
      "Choral Discipline",
      "Concert Preparation",
      "Stage Performance",
    ],
  },

  {
    title: "Music Theory",
    level: "Foundation to Advanced",
    description:
      "Comprehensive music theory lessons including notation, rhythm, intervals, scales, harmony, ear training, and score reading.",
    features: [
      "Notation Reading",
      "Rhythm Training",
      "Harmony",
      "Ear Training",
      "ABRSM Theory",
    ],
  },

  {
    title: "Online Webinar",
    level: "Special Sessions",
    description:
      "Interactive music webinars, workshops, masterclasses, and educational sessions with musical discussions and practical learning.",
    features: [
      "Online Sessions",
      "Workshops",
      "Music Discussions",
      "Masterclasses",
      "Guest Speakers",
    ],
  },

  {
    title: "Performance Program",
    level: "Stage Experience",
    description:
      "Concert and event preparation for students and members to develop confidence, stage presence, professionalism, and teamwork.",
    features: [
      "Concert Experience",
      "Stage Presence",
      "Confidence Building",
      "Live Performance",
      "Team Collaboration",
    ],
  },
];

export default function ClassesPage() {
  return (
    <main className="container">

      <p className="eyebrow">
        Music Education
      </p>

      <h1 className="section-title">
        Music Classes & Programs
      </h1>

      <p className="section-text">
        Serenade Singers provides modern music education programs,
        choir activities, vocal training, piano lessons, music theory,
        and performance opportunities for students and members.
      </p>

      <div className="classes-grid">

        {classes.map((item) => (
          <div className="class-card" key={item.title}>

            <div className="class-top">

              <p className="class-level">
                {item.level}
              </p>

              <h2>
                {item.title}
              </h2>

            </div>

            <p className="class-description">
              {item.description}
            </p>

            <div className="feature-list">

              {item.features.map((feature) => (
                <div className="feature-item" key={feature}>
                  {feature}
                </div>
              ))}

            </div>

            <a
              className="btn-primary"
              href="/signup"
            >
              Join Program
            </a>

          </div>
        ))}

      </div>

    </main>
  );
}
