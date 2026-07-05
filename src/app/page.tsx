import FloatingAIAnimal from "@/components/FloatingAIAnimal";
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


      <section style={{
        maxWidth: "1200px",
        margin: "60px auto",
        padding: "32px",
        borderRadius: "24px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 12px 32px rgba(0,0,0,.08)",
        textAlign: "center"
      }}>
        <h2 style={{fontSize:"2rem",fontWeight:800,color:"#0f172a"}}>
          🤖 AI Assistant
        </h2>

        <p style={{
          marginTop:"16px",
          color:"#475569",
          lineHeight:1.8,
          maxWidth:"820px",
          marginLeft:"auto",
          marginRight:"auto"
        }}>
          Have questions about Serenade Singers?
          Our AI Assistant can help you learn about membership,
          volunteers, choir activities, voice assessment,
          voice practice, meetings, events and frequently asked questions anytime.
        </p>

        <div style={{
          display:"flex",
          justifyContent:"center",
          gap:"16px",
          flexWrap:"wrap",
          marginTop:"28px"
        }}>
          <a
            href="/ai"
            style={{
              background:"#0f172a",
              color:"#fff",
              padding:"14px 28px",
              borderRadius:"12px",
              textDecoration:"none",
              fontWeight:700
            }}
          >
            Chat with AI Assistant
          </a>

          <a
            href="/contact"
            style={{
              border:"1px solid #cbd5e1",
              color:"#0f172a",
              padding:"14px 28px",
              borderRadius:"12px",
              textDecoration:"none",
              fontWeight:700
            }}
          >
            Contact Administration
          </a>
        </div>
      </section>


          <RecentEventGallery />
    
  <FloatingAIAnimal />
</main>
  );
}