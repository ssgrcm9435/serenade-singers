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

          <section className="mx-auto max-w-6xl px-5 py-16">
            <div className="rounded-[32px] border border-[#e8dfcc] bg-white/90 p-8 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#c9a24a]">
                Music Knowledge
              </p>
              <h2 className="mt-4 text-3xl font-black text-[#061a2f] md:text-5xl">
                Western Classical Music Around the World
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#405064]">
                Discover countries with strong Western classical music traditions
                and learn how classical music continues to grow globally.
              </p>
              <a
                href="/classical-music-map"
                className="mt-6 inline-flex rounded-full bg-[#061a2f] px-6 py-3 text-sm font-black text-white"
              >
                Explore Music Map →
              </a>
            </div>
          </section>

</main>
  );
}