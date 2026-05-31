export const metadata = {
  title: "Copyright Notice | Serenade Singers",
  description: "Copyright notice for Serenade Singers website content and materials.",
};

const copyright = [
  {
    title: "1. Ownership of Content",
    text: "All website content, including articles, blog posts, educational materials, graphics, logos, photographs, videos, designs, publications, and media, is protected by copyright and intellectual property laws.",
  },
  {
    title: "2. Serenade Singers Materials",
    text: "The Serenade Singers name, logo, branding, website design, written content, educational content, and promotional materials belong to Serenade Singers unless otherwise stated.",
  },
  {
    title: "3. Permitted Use",
    text: "Content may be viewed and shared for personal, educational, and non-commercial purposes, provided that proper attribution is given to Serenade Singers.",
  },
  {
    title: "4. Restricted Use",
    text: "Unauthorized reproduction, modification, distribution, commercial use, or republication of Serenade Singers content without prior permission is prohibited.",
  },
  {
    title: "5. Third-Party Materials",
    text: "Third-party content, trademarks, images, music references, and materials remain the property of their respective owners.",
  },
  {
    title: "6. Permission Requests",
    text: "For permission to use Serenade Singers materials, please contact us before copying, republishing, modifying, or distributing our content.",
  },
];

export default function CopyrightPage() {
  return (
    <main className="container">
      <p className="eyebrow">Website Policy</p>
      <h1 className="section-title">Copyright Notice</h1>
      <p className="section-text">
        © 2026 Serenade Singers. All Rights Reserved.
      </p>

      <div className="terms-list">
        {copyright.map((item) => (
          <div className="terms-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="terms-note">
        <h3>Copyright Contact</h3>
        <p>
          For copyright inquiries or permission requests, please contact
          info.serenadesingers@gmail.com.
        </p>
      </div>
    </main>
  );
}
