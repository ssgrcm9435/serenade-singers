export const metadata = {
  title: "Terms of Use | Serenade Singers",
  description: "Website terms of use for Serenade Singers.",
};

const terms = [
  {
    title: "1. Website Use",
    text: "By accessing and using the Serenade Singers website, you agree to use this website respectfully, lawfully, and only for appropriate educational, informational, and community-related purposes.",
  },
  {
    title: "2. About Serenade Singers",
    text: "Serenade Singers is a community choir and music education initiative dedicated to promoting music education, choral culture, artistic development, and community engagement in Myanmar.",
  },
  {
    title: "3. Educational Content",
    text: "Articles, blog posts, learning materials, and educational resources on this website are provided for general learning and informational purposes. They should not be considered formal academic, legal, financial, or professional advice.",
  },
  {
    title: "4. Accuracy of Information",
    text: "Serenade Singers strives to provide accurate and updated information. However, we do not guarantee that all website content is complete, current, or free from errors.",
  },
  {
    title: "5. Programs and Activities",
    text: "Information about classes, rehearsals, performances, events, volunteer programs, and community projects may be updated or changed when necessary.",
  },
  {
    title: "6. User Conduct",
    text: "Users must not misuse the website, attempt unauthorized access, submit harmful content, or engage in harassment, discrimination, abusive behavior, or unlawful activity.",
  },
  {
    title: "7. External Links",
    text: "This website may include links to external websites or third-party platforms. Serenade Singers is not responsible for the content, privacy practices, or policies of external websites.",
  },
  {
    title: "8. Intellectual Property",
    text: "All website content, logos, designs, articles, educational materials, graphics, photographs, and media belong to Serenade Singers or their respective owners unless otherwise stated.",
  },
  {
    title: "9. Limitation of Liability",
    text: "Serenade Singers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of this website or reliance on information provided on the website.",
  },
  {
    title: "10. Changes to These Terms",
    text: "Serenade Singers reserves the right to update or modify these Terms of Use at any time. Continued use of the website means you accept the latest version of these terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="container">
      <p className="eyebrow">Website Policy</p>
      <h1 className="section-title">Terms of Use</h1>
      <p className="section-text">
        These Terms of Use explain the basic rules and conditions for accessing
        and using the Serenade Singers website.
      </p>

      <div className="terms-list">
        {terms.map((item) => (
          <div className="terms-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="terms-note">
        <h3>Contact</h3>
        <p>
          For questions about these terms, please contact
          info.serenadesingers@gmail.com.
        </p>
      </div>
    </main>
  );
}
