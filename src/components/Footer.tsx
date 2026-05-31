import Link from "next/link";
import { site } from "@/data/site";

export default function Footer() {
  const email = site.email || "info.serenadesingers@gmail.com";

  return (
    <footer className="footer">
      <div className="footer-inner">
        <h2>
          Serenade <span className="gold">Singers</span>
        </h2>

        <p>
          Music • Education • Community
        </p>

        <p>
          Founded by Piano For ALL International Music Education
        </p>

        <div className="footer-legal-links">
          <Link href="/terms">Terms of Use</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/copyright">Copyright Notice</Link>
          <Link href="/support">Support Us</Link>
        </div>

        <p className="footer-contact">
          Contact: <a href={`mailto:${email}`}>{email}</a>
        </p>

        <p className="footer-powered">
          © 2026 Serenade Singers. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
