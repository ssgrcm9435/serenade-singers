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
