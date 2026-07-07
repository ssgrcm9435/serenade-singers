#!/usr/bin/env bash
set -euo pipefail

echo "Adding safe Classical Music World Map page without extra dependencies..."

mkdir -p src/app/classical-music-map

cat > src/app/classical-music-map/page.tsx <<'TSX'
import Link from "next/link";

const countries = [
  {
    country: "Italy",
    level: "Very High",
    score: 100,
    detail:
      "Opera, sacred music, violin making, and major composers such as Vivaldi, Verdi, Puccini, and Monteverdi.",
  },
  {
    country: "Germany",
    level: "Very High",
    score: 98,
    detail:
      "Major center of Bach, Beethoven, Brahms, Wagner, Schumann, Mendelssohn, and orchestral tradition.",
  },
  {
    country: "Austria",
    level: "Very High",
    score: 96,
    detail:
      "Vienna classical tradition, Mozart, Haydn, Schubert, Mahler, and world-famous concert culture.",
  },
  {
    country: "France",
    level: "Very High",
    score: 92,
    detail:
      "Opera, ballet, impressionism, conservatories, Debussy, Ravel, and a major European concert tradition.",
  },
  {
    country: "Russia",
    level: "Very High",
    score: 90,
    detail:
      "Strong orchestral, ballet, piano, and conservatory tradition with Tchaikovsky, Rachmaninoff, Stravinsky, and Prokofiev.",
  },
  {
    country: "United Kingdom",
    level: "High",
    score: 88,
    detail:
      "Strong choral, cathedral, orchestral, and festival traditions with Purcell, Elgar, Britten, and Vaughan Williams.",
  },
  {
    country: "Czechia",
    level: "High",
    score: 84,
    detail:
      "Rich Central European tradition with Dvořák, Smetana, Janáček, opera, chamber music, and conservatories.",
  },
  {
    country: "Poland",
    level: "High",
    score: 80,
    detail:
      "Known for Chopin, major piano tradition, competitions, and strong national classical music identity.",
  },
  {
    country: "Hungary",
    level: "High",
    score: 78,
    detail:
      "Important contribution through Liszt, Bartók, Kodály, folk influence, and music education methods.",
  },
  {
    country: "Japan",
    level: "Medium",
    score: 58,
    detail:
      "Strong classical music education, piano culture, orchestras, competitions, and audience base.",
  },
  {
    country: "China",
    level: "Developing Influence",
    score: 50,
    detail:
      "Rapidly growing conservatories, piano education, orchestras, competitions, and classical music audiences.",
  },
  {
    country: "South Korea",
    level: "Developing Influence",
    score: 48,
    detail:
      "Strong classical training culture, international competitions, opera, piano, strings, and vocal performance.",
  },
  {
    country: "Myanmar",
    level: "Early Developing",
    score: 18,
    detail:
      "Western classical music is still developing through private education, choirs, music schools, and cultural initiatives.",
  },
];

function barWidth(score: number) {
  return `${Math.max(12, Math.min(score, 100))}%`;
}

export default function ClassicalMusicMapPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ee] px-5 py-10 text-[#061a2f]">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-sm font-black text-[#c9a24a]">
          ← Back to Home
        </Link>

        <section className="mt-8 rounded-[34px] border border-[#e8dfcc] bg-white/90 p-6 shadow-xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#c9a24a]">
            Serenade Singers Knowledge
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Western Classical Music Around the World
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[#405064]">
            Explore an educational overview of countries with strong historical
            influence in Western classical music, including composers,
            conservatories, orchestras, opera houses, and music education
            traditions.
          </p>

          <div className="mt-8 rounded-[30px] border border-[#e8dfcc] bg-[#fbfaf6] p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {countries.map((item) => (
                <article
                  key={item.country}
                  className="group rounded-[24px] border border-[#e8dfcc] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c9a24a] hover:shadow-xl"
                  title={item.detail}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">{item.country}</h2>
                      <p className="mt-1 text-sm font-bold text-[#c9a24a]">
                        {item.level}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#061a2f] px-3 py-1 text-xs font-black text-white">
                      {item.score}
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#efe8d9]">
                    <div
                      className="h-full rounded-full bg-[#c9a24a]"
                      style={{ width: barWidth(item.score) }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#405064]">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-6 rounded-3xl bg-[#061a2f] p-5 text-sm leading-7 text-white/80">
            Note: This is an educational cultural-analysis page, not an official
            global ranking. It is designed for Serenade Singers knowledge and
            music education.
          </p>
        </section>
      </div>
    </main>
  );
}
TSX

python3 - <<'PY'
from pathlib import Path

p = Path("src/app/page.tsx")
if p.exists():
    text = p.read_text()

    if "classical-music-map" not in text:
        card = '''
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
'''

        if "<FaqSection />" in text:
            text = text.replace("<FaqSection />", "<FaqSection />\n" + card)
        elif "<TestimonialsSection />" in text:
            text = text.replace("<TestimonialsSection />", "<TestimonialsSection />\n" + card)
        else:
            text = text.replace("</main>", card + "\n</main>")

        p.write_text(text)
        print("Homepage card added.")
    else:
        print("Homepage already links to map.")
PY

npm run build

git add .
git commit -m "Add safe classical music knowledge page"
git push origin main

echo "Done. Open /classical-music-map"
