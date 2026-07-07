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
