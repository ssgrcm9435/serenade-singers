const testimonials = [
  {
    role: "Choir Member",
    text: "The choir rehearsals are welcoming and inspiring. I've learned so much while making wonderful friends.",
  },
  {
    role: "Volunteer",
    text: "Serenade Singers provides a supportive environment where everyone has the opportunity to grow.",
  },
  {
    role: "Workshop Participant",
    text: "The workshops are well organized and easy to follow. I always leave feeling motivated.",
  },
  {
    role: "Member",
    text: "I appreciate the organization's commitment to transparency, education, and community service.",
  },
  {
    role: "Member",
    text: "Lumi made registration and communication simple and convenient. The online member system is very easy to use.",
  },
  {
    role: "Choir Member",
    text: "The performances are professionally organized, and every member is encouraged to do their best.",
  },
  {
    role: "Volunteer",
    text: "I enjoy being part of a community that values music, collaboration, and lifelong learning.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-inner">
        <div className="testimonials-header">
          <p className="testimonials-eyebrow">Member Experiences</p>
          <h2>What People Say About Serenade Singers</h2>
          <p>
            Real experiences from members, volunteers, and participants who have
            been part of Serenade Singers' musical journey.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <article className="testimonial-card" key={`${item.role}-${index}`}>
              <div className="testimonial-stars" aria-label="Five star review">
                ★★★★★
              </div>
              <p className="testimonial-text">“{item.text}”</p>
              <div className="testimonial-role">— {item.role}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
