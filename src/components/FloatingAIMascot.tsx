"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const messages = [
  "Need help joining Serenade Singers?",
  "Ask about events, classes, or rehearsals.",
  "I can guide members and volunteers.",
  "Voice assessment and practice info available.",
  "Tap here to chat with AI Assistant.",
];

export default function FloatingAIMascot() {
  const pathname = usePathname();
  const isAIPage = pathname === "/ai" || pathname?.startsWith("/ai/");

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (isAIPage) return;

    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isAIPage]);

  const MascotBody = (
    <div className="birdBody" aria-hidden="true">
      <div className="wing leftWing" />
      <div className="wing rightWing" />
      <div className="birdFace">
        <span className="eye" />
        <span className="eye" />
        <span className="beak" />
      </div>
      <span className="musicNote">♪</span>
    </div>
  );

  if (isAIPage) {
    return (
      <div className="aiPageMascot" aria-label="AI Assistant Mascot">
        {MascotBody}
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <Link href="/ai" className="aiMascot" aria-label="Open AI Assistant">
      <div className="speechBubble">{messages[messageIndex]}</div>
      {MascotBody}
      <style jsx>{styles}</style>
    </Link>
  );
}

const styles = `
  .aiMascot {
    position: fixed !important;
    right: 24px !important;
    bottom: 24px !important;
    left: auto !important;
    top: auto !important;
    z-index: 2147483647 !important;

    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 14px;

    width: auto;
    height: auto;
    max-width: calc(100vw - 32px);

    text-decoration: none;
    pointer-events: auto;
    transform: translateZ(0);
    animation: floatMascot 4s ease-in-out infinite;
  }

  .aiPageMascot {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    margin: 0 auto 18px;
    pointer-events: none;
    animation: floatMascot 4s ease-in-out infinite;
  }

  .speechBubble {
    width: min(250px, 58vw);
    padding: 14px 17px;
    border-radius: 24px 24px 6px 24px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(201, 162, 74, 0.38);
    color: #061a2f;
    font-size: 13px;
    font-weight: 850;
    line-height: 1.45;
    box-shadow: 0 18px 44px rgba(6, 26, 47, 0.16);
    backdrop-filter: blur(14px);
  }

  .birdBody {
    position: relative;
    flex: 0 0 auto;
    width: 66px;
    height: 66px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 34% 28%, #ffffff 0 8%, transparent 9%),
      linear-gradient(135deg, #061a2f, #12355b);
    border: 2px solid rgba(248, 215, 122, 0.82);
    box-shadow: 0 18px 44px rgba(6, 26, 47, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .aiPageMascot .birdBody {
    width: 78px;
    height: 78px;
  }

  .birdFace {
    position: relative;
    width: 34px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .eye {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
    animation: blink 4.6s infinite;
  }

  .beak {
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #f8d77a;
  }

  .wing {
    position: absolute;
    width: 23px;
    height: 32px;
    border-radius: 999px 999px 12px 12px;
    background: linear-gradient(180deg, #f8d77a, #c9a24a);
    top: 22px;
    opacity: 0.95;
    animation: wingFlap 1.2s ease-in-out infinite;
  }

  .leftWing {
    left: -8px;
    transform-origin: top right;
  }

  .rightWing {
    right: -8px;
    transform-origin: top left;
    animation-delay: 0.12s;
  }

  .musicNote {
    position: absolute;
    right: -5px;
    top: -13px;
    color: #c9a24a;
    font-size: 25px;
    font-weight: 950;
    animation: noteRise 2.6s ease-in-out infinite;
  }

  .aiMascot:hover .birdBody {
    transform: scale(1.07);
    box-shadow: 0 24px 55px rgba(6, 26, 47, 0.34);
  }

  .aiMascot:hover .speechBubble {
    background: #fff8dc;
  }

  @keyframes floatMascot {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -11px; }
  }

  @keyframes wingFlap {
    0%, 100% { transform: rotate(12deg); }
    50% { transform: rotate(-18deg); }
  }

  @keyframes noteRise {
    0%, 100% { transform: translateY(0); opacity: 0.75; }
    50% { transform: translateY(-7px); opacity: 1; }
  }

  @keyframes blink {
    0%, 92%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.12); }
  }

  @media (max-width: 720px) {
    .aiMascot {
      right: 14px !important;
      bottom: 14px !important;
      gap: 9px;
    }

    .speechBubble {
      width: min(190px, 54vw);
      padding: 11px 13px;
      font-size: 12px;
    }

    .birdBody {
      width: 56px;
      height: 56px;
    }

    .aiPageMascot {
      width: 84px;
      height: 84px;
      margin-bottom: 14px;
    }

    .aiPageMascot .birdBody {
      width: 68px;
      height: 68px;
    }
  }
`;
