import Image from "next/image";
import { site } from "@/data/site";
import RecentEventGallery from "@/components/RecentEventGallery";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";

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
          <TestimonialsSection />
          <FaqSection />

          <section className="home-music-map-section">
            <div className="home-music-map-card">
              <p className="home-music-map-eyebrow">Music Knowledge</p>
              <h2>Western Classical Music Around the World</h2>
              <p>
                Discover countries with strong Western classical music traditions
                and learn how classical music continues to grow globally.
              </p>
              <a href="/classical-music-map" className="home-music-map-button">
                Explore Music Map →
              </a>
            </div>
          </section>


</main>
  );
}