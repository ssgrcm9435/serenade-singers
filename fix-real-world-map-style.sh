#!/usr/bin/env bash
set -euo pipefail

echo "Adding real SVG world map style without react-simple-maps..."

npm install d3-geo topojson-client
npm install -D @types/d3-geo @types/topojson-client

cat > src/app/classical-music-map/page.tsx <<'TSX'
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

type CountryInfo = {
  score: number;
  level: string;
  detail: string;
};

type MapCountry = {
  id?: string | number;
  properties: {
    name?: string;
  };
  geometry: unknown;
};

const scores: Record<string, CountryInfo> = {
  Italy: {
    score: 100,
    level: "Very High",
    detail:
      "Opera, sacred music, violin making, and major composers such as Vivaldi, Verdi, Puccini, and Monteverdi.",
  },
  Germany: {
    score: 98,
    level: "Very High",
    detail:
      "Major center of Bach, Beethoven, Brahms, Wagner, Schumann, Mendelssohn, and orchestral tradition.",
  },
  Austria: {
    score: 96,
    level: "Very High",
    detail:
      "Vienna classical tradition, Mozart, Haydn, Schubert, Mahler, and world-famous concert culture.",
  },
  France: {
    score: 92,
    level: "Very High",
    detail:
      "Opera, ballet, impressionism, conservatories, Debussy, Ravel, and major European concert tradition.",
  },
  Russia: {
    score: 90,
    level: "Very High",
    detail:
      "Strong orchestral, ballet, piano, and conservatory tradition with Tchaikovsky, Rachmaninoff, Stravinsky, and Prokofiev.",
  },
  "United Kingdom": {
    score: 88,
    level: "High",
    detail:
      "Strong choral, cathedral, orchestral, and festival traditions with Purcell, Elgar, Britten, and Vaughan Williams.",
  },
  Czechia: {
    score: 84,
    level: "High",
    detail:
      "Rich Central European tradition with Dvořák, Smetana, Janáček, opera, chamber music, and conservatories.",
  },
  Poland: {
    score: 80,
    level: "High",
    detail:
      "Known for Chopin, major piano tradition, competitions, and strong national classical music identity.",
  },
  Hungary: {
    score: 78,
    level: "High",
    detail:
      "Important contribution through Liszt, Bartók, Kodály, folk influence, and music education methods.",
  },
  Spain: {
    score: 74,
    level: "Medium High",
    detail:
      "Distinct national color in classical guitar, opera, zarzuela, and composers such as Albéniz, Granados, and Falla.",
  },
  Netherlands: {
    score: 72,
    level: "Medium High",
    detail:
      "Strong early music, orchestral, choir, and conservatory culture.",
  },
  Belgium: {
    score: 70,
    level: "Medium High",
    detail:
      "Important violin, opera, conservatory, and European classical performance tradition.",
  },
  "United States of America": {
    score: 68,
    level: "Medium High",
    detail:
      "Major orchestras, universities, opera companies, film music, and contemporary classical scene.",
  },
  Finland: {
    score: 66,
    level: "Medium",
    detail:
      "Strong Nordic orchestral, education, festival, and contemporary music tradition.",
  },
  Norway: {
    score: 64,
    level: "Medium",
    detail:
      "Known for Grieg, Nordic orchestral culture, music education, and festivals.",
  },
  Sweden: {
    score: 64,
    level: "Medium",
    detail:
      "Strong choir, orchestral, music education, and Nordic classical tradition.",
  },
  Denmark: {
    score: 62,
    level: "Medium",
    detail:
      "Important Nordic classical music tradition with orchestras, choirs, and conservatories.",
  },
  Switzerland: {
    score: 62,
    level: "Medium",
    detail:
      "Strong concert culture, festivals, conservatories, and European classical performance scene.",
  },
  Japan: {
    score: 58,
    level: "Medium",
    detail:
      "Strong classical music education, piano culture, orchestras, competitions, and audience base.",
  },
  China: {
    score: 50,
    level: "Developing Influence",
    detail:
      "Rapidly growing conservatories, piano education, orchestras, competitions, and classical music audiences.",
  },
  "South Korea": {
    score: 48,
    level: "Developing Influence",
    detail:
      "Strong classical training culture, international competitions, opera, piano, strings, and vocal performance.",
  },
  Canada: {
    score: 46,
    level: "Developing Influence",
    detail:
      "Strong orchestras, universities, festivals, and classical performance culture.",
  },
  Australia: {
    score: 44,
    level: "Developing Influence",
    detail:
      "Growing classical music ecosystem with orchestras, conservatories, festivals, and choirs.",
  },
  Brazil: {
    score: 36,
    level: "Emerging",
    detail:
      "Developing classical music scene with orchestras, conservatories, and national composers.",
  },
  Argentina: {
    score: 34,
    level: "Emerging",
    detail:
      "Important Latin American classical tradition with opera, orchestras, and music education.",
  },
  Myanmar: {
    score: 18,
    level: "Early Developing",
    detail:
      "Western classical music is still developing through private education, choirs, music schools, and cultural initiatives.",
  },
};

function getColor(score?: number) {
  if (!score) return "#ded8cc";
  if (score >= 90) return "#5b1a1a";
  if (score >= 75) return "#9a3412";
  if (score >= 60) return "#c9822b";
  if (score >= 45) return "#d6b35f";
  if (score >= 30) return "#a9b978";
  return "#8fa8bd";
}

export default function ClassicalMusicMapPage() {
  const [countries, setCountries] = useState<MapCountry[]>([]);
  const [hovered, setHovered] = useState<{
    name: string;
    info?: CountryInfo;
    x: number;
    y: number;
  } | null>(null);

  const width = 1000;
  const height = 560;

  const projection = useMemo(
    () =>
      geoMercator()
        .scale(155)
        .translate([width / 2, height / 1.48]),
    []
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    async function loadMap() {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
      );
      const topology = await res.json();
      const geo = feature(topology, topology.objects.countries) as unknown as {
        features: MapCountry[];
      };
      setCountries(geo.features);
    }

    loadMap();
  }, []);

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
            Explore the historical development and global influence of Western
            classical music through a real interactive world map.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-[30px] border border-[#e8dfcc] bg-[#fbfaf6] p-3">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-auto w-full"
              role="img"
              aria-label="Western classical music influence world map"
            >
              <rect width={width} height={height} fill="#fbfaf6" />

              {countries.map((country, index) => {
                const name = country.properties.name || "Unknown";
                const info = scores[name];
                const path = pathGenerator(country as never);

                if (!path) return null;

                return (
                  <path
                    key={`${name}-${index}`}
                    d={path}
                    fill={getColor(info?.score)}
                    stroke="#ffffff"
                    strokeWidth={0.7}
                    className="transition duration-200 hover:fill-[#061a2f]"
                    onMouseEnter={(event) =>
                      setHovered({
                        name,
                        info,
                        x: event.clientX,
                        y: event.clientY,
                      })
                    }
                    onMouseMove={(event) =>
                      setHovered({
                        name,
                        info,
                        x: event.clientX,
                        y: event.clientY,
                      })
                    }
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </svg>

            {hovered && (
              <div
                className="pointer-events-none fixed z-50 max-w-xs rounded-2xl border border-[#e8dfcc] bg-white px-4 py-3 text-sm shadow-2xl"
                style={{
                  left: hovered.x + 14,
                  top: hovered.y + 14,
                }}
              >
                <p className="font-black text-[#061a2f]">{hovered.name}</p>

                {hovered.info ? (
                  <>
                    <p className="mt-1 font-bold text-[#c9a24a]">
                      {hovered.info.level} • Score {hovered.info.score}
                    </p>
                    <p className="mt-2 leading-6 text-[#405064]">
                      {hovered.info.detail}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 leading-6 text-[#405064]">
                    No detailed classical music data added yet.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-[#405064]">
            <span className="rounded-full bg-[#5b1a1a] px-3 py-2 text-white">
              Very High
            </span>
            <span className="rounded-full bg-[#9a3412] px-3 py-2 text-white">
              High
            </span>
            <span className="rounded-full bg-[#c9822b] px-3 py-2 text-white">
              Medium High
            </span>
            <span className="rounded-full bg-[#d6b35f] px-3 py-2 text-[#061a2f]">
              Developing
            </span>
            <span className="rounded-full bg-[#8fa8bd] px-3 py-2 text-white">
              Early Developing
            </span>
          </div>

          <p className="mt-6 rounded-3xl bg-[#061a2f] p-5 text-sm leading-7 text-white/80">
            Note: This is an educational cultural-analysis map, not an official
            global ranking.
          </p>
        </section>
      </div>
    </main>
  );
}
TSX

npm run build

git add .
git commit -m "Add real interactive classical music world map"
git push origin main

echo "Done. Real world map page added at /classical-music-map"
