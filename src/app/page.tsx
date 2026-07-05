import FloatingAIMascot from "@/components/FloatingAIMascot";
import Image from "next/image";
import { site } from "@/data/site";
import RecentEventGallery from "@/components/RecentEventGallery";

export default function Home() {
  return (
    <main>
      <section className="hero-premium">

        <div className="hero-left">

          <div className="hero-logo-image">
            <Image
              src="/hero-logo.png"
              alt="Serenade Singers"
              width={900}
              height={500}
              priority
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

<p className="hero-description">
            Serenade Singers is a non-profit musical organization focused on
            choir music, harmony, and vocal artistry.
          </p>

          <div className="hero-buttons">

            <a
              className="btn-primary"
              href={site.signupForm}
              target="_blank"
            >
              Join Now
            </a>

            <a
              className="btn-outline"
              href="/events"
            >
              View Events
            </a>

          </div>

        </div>

        <div className="hero-right">

          <div className="hero-slider">

            <Image
              src="/hero-slide-1.jpg"
              alt="Choir Photo 1"
              width={900}
              height={900}
              priority
              className="hero-slide slide-one"
            />

            <Image
              src="/hero-slide-2.jpg"
              alt="Choir Photo 2"
              width={900}
              height={900}
              className="hero-slide slide-two"
            />

          </div>

        </div>

      </section>
          <RecentEventGallery />
<FloatingAIMascot />
</main>
  );
}