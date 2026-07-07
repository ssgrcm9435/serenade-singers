#!/usr/bin/env bash
set -euo pipefail

echo "Adding professional Serenade Singers FAQ section..."

mkdir -p src/components/home

cat > src/components/home/FaqSection.tsx <<'TSX'
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

        <div className="faq-list">
          {faqs.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
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
if not p.exists():
    raise FileNotFoundError("src/app/page.tsx not found")

text = p.read_text()

if 'FaqSection' not in text:
    text = text.replace(
        'import RecentEventGallery from "@/components/RecentEventGallery";',
        'import RecentEventGallery from "@/components/RecentEventGallery";\nimport FaqSection from "@/components/home/FaqSection";'
    )

    text = text.replace(
        '<RecentEventGallery />',
        '<RecentEventGallery />\n          <FaqSection />'
    )

p.write_text(text)
print("Homepage wired with FAQ section.")
PY

cat >> src/app/globals.css <<'CSS'

/* Serenade Singers FAQ Section */
.faq-section {
  padding: 90px 28px;
  background:
    radial-gradient(circle at top left, rgba(201, 162, 74, 0.12), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8f5ee 100%);
}

.faq-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.faq-header {
  max-width: 780px;
  margin-bottom: 34px;
}

.faq-eyebrow {
  margin: 0 0 14px;
  color: #c9a24a;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 5px;
  text-transform: uppercase;
}

.faq-header h2 {
  margin: 0;
  color: #061a2f;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -1.5px;
}

.faq-header p {
  margin: 18px 0 0;
  color: #405064;
  font-size: 17px;
  line-height: 1.8;
}

.faq-list {
  display: grid;
  gap: 16px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8dfcc;
  border-radius: 22px;
  padding: 0;
  box-shadow: 0 16px 42px rgba(6, 26, 47, 0.07);
  overflow: hidden;
}

.faq-item summary {
  cursor: pointer;
  list-style: none;
  padding: 22px 26px;
  color: #061a2f;
  font-size: 17px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: "+";
  color: #c9a24a;
  font-size: 24px;
  line-height: 1;
  font-weight: 900;
}

.faq-item[open] summary::after {
  content: "–";
}

.faq-item p {
  margin: 0;
  padding: 0 26px 24px;
  color: #405064;
  font-size: 16px;
  line-height: 1.75;
}

@media (max-width: 760px) {
  .faq-section {
    padding: 70px 20px;
  }

  .faq-item summary {
    padding: 20px;
    font-size: 16px;
  }

  .faq-item p {
    padding: 0 20px 22px;
  }
}
CSS

npm run build

git add .
git commit -m "Add professional FAQ section"
git push origin main

echo "Done. Professional FAQ section added successfully."
