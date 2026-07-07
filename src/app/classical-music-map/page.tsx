"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Italy: { score: 100, level: "Very High", detail: "Opera, sacred music, violin making, Vivaldi, Verdi, Puccini, and Monteverdi." },
  Germany: { score: 98, level: "Very High", detail: "Bach, Beethoven, Brahms, Wagner, Schumann, Mendelssohn, and orchestral tradition." },
  Austria: { score: 96, level: "Very High", detail: "Vienna classical tradition, Mozart, Haydn, Schubert, Mahler, and concert culture." },
  France: { score: 92, level: "Very High", detail: "Opera, ballet, impressionism, conservatories, Debussy, Ravel, and European concert tradition." },
  Russia: { score: 90, level: "Very High", detail: "Orchestral, ballet, piano, conservatory tradition, Tchaikovsky, Rachmaninoff, Stravinsky, and Prokofiev." },
  "United Kingdom": { score: 88, level: "High", detail: "Choral, cathedral, orchestral, and festival traditions with Purcell, Elgar, Britten, and Vaughan Williams." },
  Czechia: { score: 84, level: "High", detail: "Dvořák, Smetana, Janáček, opera, chamber music, and conservatories." },
  Poland: { score: 80, level: "High", detail: "Chopin, piano tradition, competitions, and national classical music identity." },
  Hungary: { score: 78, level: "High", detail: "Liszt, Bartók, Kodály, folk influence, and music education methods." },
  Spain: { score: 74, level: "Medium High", detail: "Classical guitar, opera, zarzuela, Albéniz, Granados, and Falla." },
  Netherlands: { score: 72, level: "Medium High", detail: "Early music, orchestral, choir, and conservatory culture." },
  Belgium: { score: 70, level: "Medium High", detail: "Violin, opera, conservatory, and European classical performance tradition." },
  "United States of America": { score: 68, level: "Medium High", detail: "Major orchestras, universities, opera companies, film music, and contemporary classical scene." },
  Finland: { score: 66, level: "Medium", detail: "Nordic orchestral, education, festival, and contemporary music tradition." },
  Norway: { score: 64, level: "Medium", detail: "Grieg, Nordic orchestral culture, music education, and festivals." },
  Sweden: { score: 64, level: "Medium", detail: "Choir, orchestral, music education, and Nordic classical tradition." },
  Denmark: { score: 62, level: "Medium", detail: "Nordic classical music tradition with orchestras, choirs, and conservatories." },
  Switzerland: { score: 62, level: "Medium", detail: "Concert culture, festivals, conservatories, and European performance scene." },
  Japan: { score: 58, level: "Medium", detail: "Classical music education, piano culture, orchestras, competitions, and audience base." },
  China: { score: 50, level: "Developing Influence", detail: "Growing conservatories, piano education, orchestras, competitions, and audiences." },
  "South Korea": { score: 48, level: "Developing Influence", detail: "Classical training culture, competitions, opera, piano, strings, and vocal performance." },
  Canada: { score: 46, level: "Developing Influence", detail: "Orchestras, universities, festivals, and classical performance culture." },
  Australia: { score: 44, level: "Developing Influence", detail: "Orchestras, conservatories, festivals, and choirs." },
  Brazil: { score: 36, level: "Emerging", detail: "Developing classical music scene with orchestras, conservatories, and national composers." },
  Argentina: { score: 34, level: "Emerging", detail: "Latin American classical tradition with opera, orchestras, and music education." },
  Myanmar: { score: 18, level: "Early Developing", detail: "Developing through private education, choirs, music schools, and cultural initiatives." },
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
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [countries, setCountries] = useState<MapCountry[]>([]);
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<{
    name: string;
    info?: CountryInfo;
    x: number;
    y: number;
  } | null>(null);

  const width = 1000;
  const height = 560;

  const projection = useMemo(
    () => geoMercator().scale(155).translate([width / 2, height / 1.48]),
    []
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    async function loadMap() {
      const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      const topology = await res.json();
      const geo = feature(topology, topology.objects.countries) as unknown as {
        features: MapCountry[];
      };
      setCountries(geo.features);
    }

    loadMap();
  }, []);

  
  function updateTooltip(
    event: React.MouseEvent<SVGPathElement, MouseEvent>,
    name: string,
    info?: CountryInfo
  ) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;

    setHovered({
      name,
      info,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  return (
    <main className="classical-map-page">
      <div className="classical-map-shell">
        <Link href="/" className="classical-map-back">
          ← Back to Home
        </Link>

        <section className="classical-map-card">
          <p className="classical-map-eyebrow">Serenade Singers Knowledge</p>

          <h1>Western Classical Music Around the World</h1>

          <p className="classical-map-intro">
            Explore the historical development and global influence of Western
            classical music through an interactive world map. Hover over a
            country to view details. Use your mouse wheel to zoom.
          </p>

          
          <div className="classical-map-toolbar">
            <button
              type="button"
              onClick={() =>
                setZoom((value) =>
                  Math.max(0.75, Number((value - 0.25).toFixed(2)))
                )
              }
              aria-label="Zoom out"
            >
              −
            </button>

            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="Reset zoom"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() =>
                setZoom((value) =>
                  Math.min(3, Number((value + 0.25).toFixed(2)))
                )
              }
              aria-label="Zoom in"
            >
              +
            </button>

            <span>Zoom {Math.round(zoom * 100)}%</span>
          </div>

<div
            ref={frameRef}
            className="classical-map-frame"
            onMouseLeave={() => setHovered(null)}
          >
            <div className="classical-map-hint">
              Hover countries for details
            </div>

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="classical-map-svg"
              role="img"
              aria-label="Western classical music influence world map"
            >
              <rect width={width} height={height} fill="#fbfaf6" />

              <g
                transform={`translate(${width / 2} ${height / 2}) scale(${zoom}) translate(${-width / 2} ${-height / 2})`}
              >
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
                      strokeWidth={0.7 / zoom}
                      className="classical-map-country"
                      onMouseEnter={(event) => updateTooltip(event, name, info)}
                      onMouseMove={(event) => updateTooltip(event, name, info)}
                    />
                  );
                })}
              </g>
            </svg>

            {hovered && (
              <div
                className="classical-map-tooltip"
                style={{
                  left: `min(${hovered.x + 16}px, calc(100% - 340px))`,
                  top: `${Math.max(hovered.y + 16, 16)}px`,
                }}
              >
                <strong>{hovered.name}</strong>

                {hovered.info ? (
                  <>
                    <span>
                      {hovered.info.level} • Score {hovered.info.score}
                    </span>
                    <p>{hovered.info.detail}</p>
                  </>
                ) : (
                  <p>No detailed classical music data added yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="classical-map-legend">
            <span className="very-high">Very High</span>
            <span className="high">High</span>
            <span className="medium-high">Medium High</span>
            <span className="developing">Developing</span>
            <span className="early">Early Developing</span>
          </div>

          <p className="classical-map-note">
            Note: This is an educational cultural-analysis map, not an official
            global ranking.
          </p>
        </section>
      </div>
    </main>
  );
}
