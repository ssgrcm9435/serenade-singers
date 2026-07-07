#!/usr/bin/env bash
set -euo pipefail

echo "Updating Serenade Singers testimonials..."

mkdir -p src/components/home

cat > src/components/home/TestimonialsSection.tsx <<'TSX'
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
TSX

python3 - <<'PY'
from pathlib import Path

p = Path("src/app/page.tsx")
text = p.read_text()

if 'TestimonialsSection' not in text:
    text = text.replace(
        'import RecentEventGallery from "@/components/RecentEventGallery";',
        'import RecentEventGallery from "@/components/RecentEventGallery";\nimport TestimonialsSection from "@/components/home/TestimonialsSection";'
    )

if '<TestimonialsSection />' not in text:
    text = text.replace(
        '<RecentEventGallery />',
        '<RecentEventGallery />\n          <TestimonialsSection />'
    )

p.write_text(text)
print("Homepage connected to testimonials.")
PY

cat >> src/app/globals.css <<'CSS'

/* Serenade Singers Testimonials */
.testimonials-section {
  padding: 90px 28px;
}

.testimonials-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.testimonials-header {
  max-width: 780px;
  margin-bottom: 36px;
}

.testimonials-eyebrow {
  margin: 0 0 14px;
  color: #c9a24a;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 5px;
  text-transform: uppercase;
}

.testimonials-header h2 {
  margin: 0;
  color: #061a2f;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -1.5px;
}

.testimonials-header p {
  margin: 18px 0 0;
  color: #405064;
  font-size: 17px;
  line-height: 1.8;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8dfcc;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 18px 50px rgba(6, 26, 47, 0.08);
}

.testimonial-stars {
  color: #c9a24a;
  font-size: 16px;
  letter-spacing: 2px;
  margin-bottom: 18px;
}

.testimonial-text {
  color: #26384d;
  font-size: 16px;
  line-height: 1.8;
  margin: 0 0 24px;
}

.testimonial-role {
  color: #061a2f;
  font-weight: 900;
  font-size: 14px;
}

@media (max-width: 900px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .testimonials-section {
    padding: 70px 20px;
  }
}
CSS

npm run build

git add .
git commit -m "Update Serenade Singers testimonials"
git push origin main

echo "Done. Testimonials updated."
