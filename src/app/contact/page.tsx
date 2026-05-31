export const metadata = {
  title: "Contact Us | Serenade Singers",
  description:
    "Get in touch with Serenade Singers regarding membership, volunteering, partnerships, support, and general inquiries.",
};

const contacts = [
  {
    title: "General Inquiries",
    description:
      "Questions about Serenade Singers, programs, activities, and website information.",
  },
  {
    title: "Membership Questions",
    description:
      "Questions regarding membership, registration, choir participation, and joining Serenade Singers.",
  },
  {
    title: "Volunteer Opportunities",
    description:
      "Volunteer programs, community projects, educational initiatives, and outreach activities.",
  },
  {
    title: "Partnerships & Sponsorships",
    description:
      "Partnership opportunities, collaborations, sponsorships, and organizational support.",
  },
  {
    title: "Support & Donations",
    description:
      "Support inquiries, donations, educational support, and community development initiatives.",
  },
];

export default function ContactPage() {
  return (
    <main>
      <section className="contact-hero">
        <div className="container">
          <p className="eyebrow">Contact Serenade Singers</p>

          <h1>We Would Love to Hear From You</h1>

          <p className="contact-lead">
            Whether you have questions about membership, volunteering,
            performances, partnerships, music education, or community projects,
            please feel free to contact us.
          </p>
        </div>
      </section>

      <section className="container contact-section">
        <div className="contact-main-card">
          <h2>Official Contact Email</h2>

          <a
            className="contact-email"
            href="mailto:info.serenadesingers@gmail.com"
          >
            info.serenadesingers@gmail.com
          </a>

          <p>
            We aim to respond to inquiries as promptly as possible.
          </p>
        </div>

        <div className="contact-grid">
          {contacts.map((item) => (
            <div className="contact-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <a href="mailto:info.serenadesingers@gmail.com">
                info.serenadesingers@gmail.com
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
