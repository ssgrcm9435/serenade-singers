export const metadata = {
  title: "Support Us | Serenade Singers",
  description: "Support Serenade Singers music education, choral culture, and community projects.",
};

const supportHelps = [
  "Develop music education resources and learning materials",
  "Publish educational articles, blog posts, and music awareness content",
  "Organize choir activities, performances, and community events",
  "Support young people who have limited access to quality music education",
  "Promote appreciation for both Western Music and traditional Myanmar music",
  "Strengthen music education and choral culture in Myanmar",
];

const waysToSupport = [
  "Financial contributions",
  "Sponsorship opportunities",
  "Educational partnerships",
  "Volunteer service",
  "In-kind contributions such as books, sheet music, equipment, or learning resources",
  "Community collaboration and project support",
];

export default function SupportPage() {
  return (
    <main className="container">
      <p className="eyebrow">Support Our Mission</p>
      <h1 className="section-title">Support Serenade Singers</h1>

      <p className="section-text">
        Serenade Singers is a volunteer-driven community choir and music
        education initiative dedicated to making music learning more accessible
        and supporting the growth of music education and choral culture in
        Myanmar.
      </p>

      <div className="terms-note support-hero-note">
        <h3>Music • Education • Community</h3>
        <p>
          Your support helps us continue educational, cultural, and community
          projects that make music more accessible to people from different
          backgrounds.
        </p>
      </div>

      <div className="terms-list">
        <div className="terms-card">
          <h3>Your Support Helps Us</h3>
          <ul className="policy-list">
            {supportHelps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="terms-card">
          <h3>Ways to Support</h3>
          <ul className="policy-list">
            {waysToSupport.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="terms-card">
          <h3>Support Inquiries</h3>
          <p>
            For donations, sponsorship opportunities, partnerships, volunteer
            support, or other support inquiries, please contact:
          </p>
          <p>
            <strong>info.serenadesingers@gmail.com</strong>
          </p>
        </div>
      </div>
    </main>
  );
}
