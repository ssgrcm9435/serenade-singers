export const metadata = {
  title: "Privacy Policy | Serenade Singers",
  description: "Privacy policy for Serenade Singers website users, members, and visitors.",
};

const privacy = [
  {
    title: "1. Information We Collect",
    text: "Serenade Singers may collect information submitted through contact forms, registration forms, volunteer applications, email inquiries, newsletters, and other website features.",
  },
  {
    title: "2. How We Use Information",
    text: "Information may be used for communication, membership administration, class arrangement, event coordination, volunteer management, educational activities, and organizational purposes.",
  },
  {
    title: "3. Personal Information",
    text: "Personal information may include names, contact details, music experience, membership information, volunteer interests, and messages submitted through the website.",
  },
  {
    title: "4. Data Protection",
    text: "Serenade Singers takes reasonable measures to protect personal information from unauthorized access, misuse, disclosure, or loss.",
  },
  {
    title: "5. No Sale of Personal Data",
    text: "Serenade Singers does not sell, rent, or trade personal information to third parties.",
  },
  {
    title: "6. Third-Party Services",
    text: "The website may use third-party services such as analytics tools, embedded forms, email services, or social media links. These services may have their own privacy policies.",
  },
  {
    title: "7. Media and Event Documentation",
    text: "Photos, videos, and audio recordings from public activities, rehearsals, performances, or events may be used for documentation, education, promotion, and communication purposes.",
  },
  {
    title: "8. Updates to This Policy",
    text: "This Privacy Policy may be updated when necessary. Continued use of the website means you accept the latest version of the policy.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="container">
      <p className="eyebrow">Website Policy</p>
      <h1 className="section-title">Privacy Policy</h1>
      <p className="section-text">
        Serenade Singers respects your privacy and is committed to protecting
        the personal information of website users, members, volunteers, students,
        parents, and visitors.
      </p>

      <div className="terms-list">
        {privacy.map((item) => (
          <div className="terms-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="terms-note">
        <h3>Privacy Contact</h3>
        <p>
          For privacy-related inquiries, please contact
          info.serenadesingers@gmail.com.
        </p>
      </div>
    </main>
  );
}
