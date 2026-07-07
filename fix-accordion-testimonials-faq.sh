#!/usr/bin/env bash
set -euo pipefail

echo "Upgrading Testimonials and FAQ to single-open accordion..."

mkdir -p src/components/home

cat > src/components/home/TestimonialsSection.tsx <<'TSX'
"use client";

import { useState } from "react";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

        <div className="testimonials-accordion">
          {testimonials.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                className={`testimonial-accordion-card ${isOpen ? "is-open" : ""}`}
                key={`${item.role}-${index}`}
              >
                <button
                  className="testimonial-accordion-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`testimonial-panel-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>
                    <span className="testimonial-stars" aria-label="Five star review">
                      ★★★★★
                    </span>
                    <strong>{item.role}</strong>
                  </span>
                  <span className="testimonial-toggle" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <div
                  id={`testimonial-panel-${index}`}
                  className="testimonial-accordion-panel"
                  hidden={!isOpen}
                >
                  <p className="testimonial-text">“{item.text}”</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
TSX

cat > src/components/home/FaqSection.tsx <<'TSX'
"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Serenade Singers?",
    answer:
      "Serenade Singers is a non-profit music organization based in Yangon, Myanmar, dedicated to music education, choral excellence, community engagement, and volunteer service.",
  },
  {
    question: "Who can join Serenade Singers?",
    answer:
      "Anyone who is interested in music, singing, learning, volunteering, or community service is welcome to apply. Both beginners and experienced musicians can participate.",
  },
  {
    question: "Do I need previous choir or singing experience?",
    answer:
      "No. Previous choir or singing experience is not required. Serenade Singers welcomes beginners and supports members as they learn and grow.",
  },
  {
    question: "Is there a membership fee?",
    answer:
      "No. Serenade Singers does not charge a membership fee. Some activities, workshops, events, or official merchandise may have separate costs when applicable.",
  },
  {
    question: "How do I become a member?",
    answer:
      "You can apply through the official online registration system. After your information is reviewed and verified, you may receive access to the Member Hub.",
  },
  {
    question: "Can I join as a volunteer?",
    answer:
      "Yes. Volunteers are welcome to support events, workshops, educational programs, outreach activities, administration, and community service projects.",
  },
  {
    question: "What activities does Serenade Singers organize?",
    answer:
      "Serenade Singers organizes choir rehearsals, music education programs, workshops, public performances, volunteer activities, meetings, and community engagement projects.",
  },
  {
    question: "What is Lumi?",
    answer:
      "Lumi is Serenade Singers' digital assistant. Lumi helps with registration, official T-shirt orders, payment submission, suggestions, and basic guidance.",
  },
  {
    question: "How do I order an official Serenade Singers T-shirt?",
    answer:
      "Members and volunteers can order official T-shirts through Lumi or the online system. The order process may require registered Gmail verification and OTP confirmation.",
  },
  {
    question: "How do I submit payment?",
    answer:
      "Payment details can be submitted through Lumi or the designated online payment system. Payment records may be reviewed by the admin team before approval.",
  },
  {
    question: "Can I send suggestions or feedback?",
    answer:
      "Yes. You can send suggestions, feedback, or concerns through Lumi or the official contact channels. Submitted suggestions may be reviewed by the organization team.",
  },
  {
    question: "Is my personal information protected?",
    answer:
      "Yes. Serenade Singers aims to handle member and volunteer information responsibly and uses verification steps to protect access to member services.",
  },
  {
    question: "How can I stay updated?",
    answer:
      "You can stay updated through the official website, Member Hub, events page, meetings, and official communication channels.",
  },
  {
    question: "How can I contact Serenade Singers?",
    answer:
      "You can contact Serenade Singers through the website contact page or official communication channels listed by the organization.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq-section" id="faq">
      <div className="faq-inner">
        <div className="faq-header">
          <p className="faq-eyebrow">Frequently Asked Questions</p>
          <h2>Everything You Need to Know</h2>
          <p>
            Clear answers about membership, volunteering, activities, Lumi,
            payments, official T-shirts, and community participation.
          </p>
        </div>

        <div className="faq-accordion">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article className={`faq-card ${isOpen ? "is-open" : ""}`} key={item.question}>
                <button
                  className="faq-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <div id={`faq-panel-${index}`} className="faq-panel" hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
TSX

cat >> src/app/globals.css <<'CSS'

/* Single-open accordion refinements for Testimonials + FAQ */
.testimonials-accordion,
.faq-accordion {
  display: grid;
  gap: 16px;
}

.testimonial-accordion-card,
.faq-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e8dfcc;
  border-radius: 24px;
  box-shadow: 0 16px 42px rgba(6, 26, 47, 0.07);
  overflow: hidden;
}

.testimonial-accordion-card.is-open,
.faq-card.is-open {
  border-color: rgba(201, 162, 74, 0.65);
  box-shadow: 0 22px 56px rgba(6, 26, 47, 0.11);
}

.testimonial-accordion-trigger,
.faq-trigger {
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 22px 26px;
  color: #061a2f;
  font: inherit;
  font-weight: 900;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.testimonial-accordion-trigger > span:first-child {
  display: grid;
  gap: 8px;
}

.testimonial-toggle,
.faq-toggle {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(201, 162, 74, 0.14);
  color: #c9a24a;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.testimonial-accordion-panel,
.faq-panel {
  padding: 0 26px 24px;
}

.testimonial-accordion-panel p,
.faq-panel p {
  margin: 0;
  color: #405064;
  font-size: 16px;
  line-height: 1.8;
}

@media (max-width: 760px) {
  .testimonial-accordion-trigger,
  .faq-trigger {
    padding: 20px;
  }

  .testimonial-accordion-panel,
  .faq-panel {
    padding: 0 20px 22px;
  }
}
CSS

npm run build

git add .
git commit -m "Improve testimonials and FAQ accordion behavior"
git push origin main

echo "Done. Testimonials and FAQ now auto-close previous open item."
