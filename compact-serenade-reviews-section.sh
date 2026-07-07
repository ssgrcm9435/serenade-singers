#!/usr/bin/env bash
set -euo pipefail

echo "Making Serenade Singers reviews section compact..."

cat > src/components/home/TestimonialsSection.tsx <<'TSX'
"use client";

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
  {
    role: "Choir Member",
    text: "Serenade Singers ကို ဝင်ရောက်ပြီးနောက် ဂီတပညာသာမက အသင်းအဖွဲ့နဲ့ အတူတကွ ပူးပေါင်းလုပ်ဆောင်တတ်တဲ့ အတွေ့အကြုံတွေလည်း ရရှိခဲ့ပါတယ်။",
  },
  {
    role: "Volunteer",
    text: "စေတနာ့ဝန်ထမ်းအဖြစ် ပါဝင်ခွင့်ရတာ ဂုဏ်ယူစရာပါ။ လူမှုအသိုင်းအဝိုင်းအတွက် ဂီတနဲ့ အကျိုးပြုနိုင်တာကို အလွန်တန်ဖိုးထားပါတယ်။",
  },
  {
    role: "Member",
    text: "Lumi က Registration၊ Official T-Shirt မှာယူခြင်းနဲ့ အခြားဝန်ဆောင်မှုတွေကို လွယ်ကူမြန်ဆန်စွာ အသုံးပြုနိုင်အောင် ကူညီပေးတာ အရမ်းအဆင်ပြေပါတယ်။",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section compact-reviews-section">
      <div className="testimonials-inner">
        <div className="testimonials-header compact-reviews-header">
          <p className="testimonials-eyebrow">Member Experiences</p>
          <h2>What People Say</h2>
          <p>
            Real experiences from members, volunteers, and participants who have
            been part of Serenade Singers.
          </p>
        </div>

        <div className="compact-reviews-scroll" aria-label="Serenade Singers reviews">
          {testimonials.map((item, index) => (
            <article className="compact-review-card" key={`${item.role}-${index}`}>
              <div className="testimonial-stars" aria-label="Five star review">
                ★★★★★
              </div>
              <p>“{item.text}”</p>
              <strong>— {item.role}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
TSX

cat >> src/app/globals.css <<'CSS'

/* Compact horizontal reviews section */
.compact-reviews-section {
  padding: 70px 28px;
}

.compact-reviews-header {
  margin-bottom: 26px;
}

.compact-reviews-header h2 {
  font-size: clamp(32px, 4vw, 48px);
}

.compact-reviews-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(290px, 360px);
  gap: 18px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 6px 4px 22px;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.compact-review-card {
  scroll-snap-align: start;
  min-height: 250px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e8dfcc;
  border-radius: 26px;
  padding: 26px;
  box-shadow: 0 16px 42px rgba(6, 26, 47, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.compact-review-card p {
  margin: 18px 0 22px;
  color: #26384d;
  font-size: 15.5px;
  line-height: 1.75;
}

.compact-review-card strong {
  color: #061a2f;
  font-size: 14px;
}

@media (max-width: 760px) {
  .compact-reviews-section {
    padding: 60px 20px;
  }

  .compact-reviews-scroll {
    grid-auto-columns: minmax(260px, 85vw);
  }

  .compact-review-card {
    min-height: 270px;
  }
}
CSS

npm run build

git add .
git commit -m "Make Serenade reviews section compact"
git push origin main

echo "Done. Reviews section is now compact with horizontal scroll."
