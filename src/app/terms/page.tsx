const terms = [
  {
    title: "1. Membership Agreement",
    text: "By joining Serenade Singers, members agree to participate respectfully, attend rehearsals responsibly, and follow the guidance of the conductor, teachers, and organizers."
  },
  {
    title: "2. Attendance Policy",
    text: "Members should attend rehearsals, classes, events, and performances on time. If a member cannot attend, they should inform the organizer in advance whenever possible."
  },
  {
    title: "3. Rehearsal and Class Discipline",
    text: "During choir rehearsal and music classes, members are expected to stay focused, avoid unnecessary disruption, respect the learning environment, and prepare assigned music or materials."
  },
  {
    title: "4. Event Participation",
    text: "Participation in concerts, webinars, workshops, community events, or performances may require prior registration or confirmation. Serenade Singers may limit participation based on rehearsal attendance, preparation, or event requirements."
  },
  {
    title: "5. Media Permission",
    text: "Photos, videos, and audio recordings may be taken during rehearsals, classes, events, and performances. These materials may be used for Serenade Singers' website, social media, promotional materials, and documentation."
  },
  {
    title: "6. Profile Photo and Signup Information",
    text: "Information submitted through the signup form, including name, contact details, music experience, and profile photo, may be used for membership records, communication, class arrangement, and internal organization."
  },
  {
    title: "7. Privacy and Data Use",
    text: "Serenade Singers will use submitted information only for choir, music class, event, communication, and organizational purposes. Personal information will not be sold or shared for unrelated commercial purposes."
  },
  {
    title: "8. Payment and Class Policy",
    text: "For paid music classes, workshops, or events, fees, schedules, refund rules, and payment deadlines may be announced separately. Registration may not be confirmed until payment or required confirmation is completed."
  },
  {
    title: "9. Respectful Conduct",
    text: "Members, students, parents, teachers, and organizers must communicate respectfully. Harassment, discrimination, bullying, offensive behavior, or intentional disruption will not be accepted."
  },
  {
    title: "10. Health and Safety",
    text: "Members should follow safety instructions during rehearsals, classes, travel, stage preparation, and event participation. If a member feels unwell, they should inform the organizer and avoid putting others at risk."
  },
  {
    title: "11. Changes to Schedule",
    text: "Rehearsal times, class schedules, event dates, venues, and program details may change due to organizational needs, venue availability, weather, health concerns, or other unexpected situations."
  },
  {
    title: "12. Intellectual Property",
    text: "Serenade Singers' name, logo, branding materials, website content, event designs, and promotional materials belong to Serenade Singers and should not be copied or reused without permission."
  },
  {
    title: "13. Agreement Confirmation",
    text: "By submitting the signup form or participating in Serenade Singers activities, the participant confirms that they have read, understood, and agreed to these terms and conditions."
  }
];

export default function TermsPage() {
  return (
    <main className="container">
      <p className="eyebrow">Terms & Conditions</p>

      <h1 className="section-title">
        Serenade Singers Terms and Conditions
      </h1>

      <p className="section-text">
        These terms explain the basic rules, responsibilities, privacy expectations,
        and participation policies for Serenade Singers members, students, parents,
        event participants, and visitors.
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
        <h3>Important Note</h3>
        <p>
          These terms may be updated when necessary. Continued participation in
          Serenade Singers activities means the participant accepts the latest
          version of these terms.
        </p>
      </div>
    </main>
  );
}
