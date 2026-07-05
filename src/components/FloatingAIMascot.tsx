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
  const [hatched, setHatched] = useState(false);

  useEffect(() => {
    if (isAIPage) return;
    const hatchTimer = window.setTimeout(() => setHatched(true), 1600);
    return () => window.clearTimeout(hatchTimer);
  }, [isAIPage]);

  useEffect(() => {
    if (isAIPage) return;
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [isAIPage]);

  if (isAIPage) return null;

  return (
    <Link href="/ai" className="aiMascot" aria-label="Open AI Assistant">
      <div className={`speechBubble ${hatched ? "showBubble" : ""}`}>
        {messages[messageIndex]}
      </div>

      <div className={`hatchStage ${hatched ? "hatched" : ""}`}>
        <div className="egg">
          <div className="crack crackOne" />
          <div className="crack crackTwo" />
          <div className="crack crackThree" />
        </div>

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
      </div>

      <style jsx>{`
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
          max-width: calc(100vw - 32px);
          text-decoration: none;
          pointer-events: auto;

          opacity: 1;
          visibility: visible;
          animation: enterMascot 0.45s ease-out both, floatMascot 4s ease-in-out 1.7s infinite;
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
          opacity: 0;
          transform: translateX(12px) scale(0.96);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .showBubble {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .hatchStage {
          position: relative;
          width: 76px;
          height: 76px;
          flex: 0 0 auto;
        }

        .egg {
          position: absolute;
          inset: 4px 8px;
          border-radius: 50% 50% 46% 46%;
          background:
            radial-gradient(circle at 35% 24%, rgba(255,255,255,.95) 0 12%, transparent 13%),
            linear-gradient(145deg, #fff8dc, #f1d98b);
          border: 2px solid rgba(201, 162, 74, 0.72);
          box-shadow: 0 18px 44px rgba(6, 26, 47, 0.20);
          animation: eggWiggle 1.35s ease-in-out both;
        }

        .crack {
          position: absolute;
          background: #8b6f22;
          opacity: 0;
          transform-origin: left center;
          animation: showCrack 0.4s ease forwards;
        }

        .crackOne {
          width: 18px;
          height: 2px;
          top: 27px;
          left: 20px;
          transform: rotate(28deg);
          animation-delay: 0.62s;
        }

        .crackTwo {
          width: 16px;
          height: 2px;
          top: 36px;
          left: 32px;
          transform: rotate(-34deg);
          animation-delay: 0.82s;
        }

        .crackThree {
          width: 20px;
          height: 2px;
          top: 45px;
          left: 18px;
          transform: rotate(18deg);
          animation-delay: 1.02s;
        }

        .birdBody {
          position: absolute;
          right: 5px;
          bottom: 5px;
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
          opacity: 0;
          transform: scale(0.35) translateY(18px);
          transition: transform 0.42s cubic-bezier(.2,1.35,.45,1), opacity 0.28s ease;
        }

        .hatched .egg {
          opacity: 0;
          transform: scale(0.75) translateY(10px);
          transition: opacity 0.28s ease, transform 0.28s ease;
        }

        .hatched .birdBody {
          opacity: 1;
          transform: scale(1) translateY(0);
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

        @keyframes enterMascot {
          from { opacity: 0; transform: translateY(18px) scale(.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes eggWiggle {
          0%, 100% { transform: rotate(0deg); }
          18% { transform: rotate(-7deg); }
          36% { transform: rotate(7deg); }
          54% { transform: rotate(-5deg); }
          72% { transform: rotate(5deg); }
        }

        @keyframes showCrack {
          to { opacity: 1; }
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
            width: min(185px, 52vw);
            padding: 11px 13px;
            font-size: 12px;
          }

          .hatchStage {
            width: 64px;
            height: 64px;
          }

          .birdBody {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </Link>
  );
}
