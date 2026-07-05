"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const messages = [
  "Need help joining Serenade Singers?",
  "Ask about events, classes, or rehearsals.",
  "I can guide members and volunteers.",
  "Voice assessment and practice info available.",
  "Tap me for a little welcome performance.",
];

export default function FloatingAIMascot() {
  const pathname = usePathname();
  const router = useRouter();
  const isAIPage = pathname === "/ai" || pathname?.startsWith("/ai/");

  const [messageIndex, setMessageIndex] = useState(0);
  const [hatched, setHatched] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);

  useEffect(() => {
    if (isAIPage) return;

    const hatchTimer = window.setTimeout(() => setHatched(true), 1200);
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
    <>
      <button
        type="button"
        className="aiMascot"
        aria-label="Open AI Mascot Performance"
        onClick={() => setStageOpen(true)}
      >
        <div className={`speechBubble ${hatched ? "showBubble" : ""}`}>
          {messages[messageIndex]}
        </div>

        <MascotBody hatched={hatched} small />
      </button>

      {stageOpen && (
        <div className="stageOverlay" role="dialog" aria-modal="true">
          <div className="stageCard">
            <button
              type="button"
              className="closeButton"
              aria-label="Close mascot performance"
              onClick={() => setStageOpen(false)}
            >
              ×
            </button>

            <div className="stageLights" />
            <div className="musicNotes">
              <span>♪</span>
              <span>♫</span>
              <span>♬</span>
              <span>♩</span>
              <span>𝄞</span>
            </div>

            <div className="centerMascot">
              <MascotBody hatched small={false} />
            </div>

            <h2 className="stageTitle">Welcome to Serenade Singers</h2>
            <p className="stageText">
              I can help you with events, classes, membership, volunteers, rehearsals, and voice assessment.
            </p>

            <div className="stageActions">
              <button type="button" className="primaryAction" onClick={() => router.push("/ai")}>
                Chat with AI Assistant
              </button>
              <button type="button" className="secondaryAction" onClick={() => setStageOpen(false)}>
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .aiMascot {
          position: fixed !important;
          right: 24px !important;
          bottom: 24px !important;
          left: auto !important;
          top: auto !important;
          z-index: 2147483647 !important;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 14px;
          width: auto;
          height: auto;
          max-width: calc(100vw - 32px);
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          animation: enterMascot 0.45s ease-out both, floatMascot 4s ease-in-out 1.4s infinite;
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
          text-align: left;
          box-shadow: 0 18px 44px rgba(6, 26, 47, 0.16);
          opacity: 0;
          transform: translateX(12px) scale(0.96);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .showBubble {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .stageOverlay {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(6, 26, 47, 0.58);
          backdrop-filter: blur(10px);
          animation: fadeIn 0.25s ease both;
        }

        .stageCard {
          position: relative;
          width: min(520px, 94vw);
          min-height: 520px;
          overflow: hidden;
          border-radius: 34px;
          padding: 44px 28px 30px;
          text-align: center;
          background:
            radial-gradient(circle at 50% 18%, rgba(248, 215, 122, 0.34), transparent 34%),
            linear-gradient(180deg, #ffffff, #f8f6f2);
          border: 1px solid rgba(248, 215, 122, 0.5);
          box-shadow: 0 34px 90px rgba(0, 0, 0, 0.34);
          animation: stagePop 0.38s cubic-bezier(.2,1.2,.35,1) both;
        }

        .closeButton {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid #e8dfcc;
          background: #ffffff;
          color: #061a2f;
          font-size: 24px;
          font-weight: 800;
          cursor: pointer;
          z-index: 3;
        }

        .stageLights {
          position: absolute;
          left: 50%;
          top: -130px;
          width: 320px;
          height: 320px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(248, 215, 122, 0.52), transparent 62%);
          animation: pulseLight 2.4s ease-in-out infinite;
        }

        .musicNotes {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .musicNotes span {
          position: absolute;
          color: #c9a24a;
          font-size: 32px;
          font-weight: 950;
          opacity: 0;
          animation: floatNote 3s ease-in-out infinite;
        }

        .musicNotes span:nth-child(1) { left: 18%; top: 28%; animation-delay: 0s; }
        .musicNotes span:nth-child(2) { right: 18%; top: 26%; animation-delay: .35s; }
        .musicNotes span:nth-child(3) { left: 24%; top: 52%; animation-delay: .7s; }
        .musicNotes span:nth-child(4) { right: 24%; top: 54%; animation-delay: 1.05s; }
        .musicNotes span:nth-child(5) { left: 48%; top: 18%; animation-delay: 1.4s; }

        .centerMascot {
          position: relative;
          z-index: 2;
          display: inline-flex;
          justify-content: center;
          margin-top: 28px;
          animation: danceMascot 1.15s ease-in-out infinite;
        }

        .stageTitle {
          position: relative;
          z-index: 2;
          margin: 28px 0 10px;
          color: #061a2f;
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .stageText {
          position: relative;
          z-index: 2;
          max-width: 410px;
          margin: 0 auto 24px;
          color: #64748b;
          font-weight: 650;
          line-height: 1.75;
        }

        .stageActions {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .primaryAction,
        .secondaryAction {
          min-height: 46px;
          border-radius: 999px;
          padding: 0 20px;
          font-weight: 900;
          cursor: pointer;
        }

        .primaryAction {
          border: 0;
          background: #061a2f;
          color: #ffffff;
          box-shadow: 0 12px 28px rgba(6, 26, 47, 0.22);
        }

        .secondaryAction {
          border: 1px solid #e8dfcc;
          background: #ffffff;
          color: #061a2f;
        }

        @keyframes enterMascot {
          from { opacity: 0; transform: translateY(18px) scale(.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes floatMascot {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -11px; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes stagePop {
          from { opacity: 0; transform: translateY(30px) scale(.86); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pulseLight {
          0%, 100% { opacity: .55; transform: translateX(-50%) scale(.95); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.08); }
        }

        @keyframes danceMascot {
          0%, 100% { transform: translateY(0) rotate(-2deg) scale(1.35); }
          25% { transform: translateY(-10px) rotate(5deg) scale(1.4); }
          50% { transform: translateY(0) rotate(0deg) scale(1.35); }
          75% { transform: translateY(-8px) rotate(-5deg) scale(1.4); }
        }

        @keyframes floatNote {
          0% { opacity: 0; transform: translateY(18px) scale(.8) rotate(0deg); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-72px) scale(1.18) rotate(18deg); }
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

          .stageCard {
            min-height: 500px;
            padding: 42px 20px 26px;
          }
        }
      `}</style>
    </>
  );
}

function MascotBody({ hatched, small }: { hatched: boolean; small: boolean }) {
  return (
    <div className={`hatchStage ${hatched ? "hatched" : ""} ${small ? "small" : "large"}`}>
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

      <style jsx>{`
        .hatchStage {
          position: relative;
          flex: 0 0 auto;
        }

        .small {
          width: 76px;
          height: 76px;
        }

        .large {
          width: 128px;
          height: 128px;
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
          animation: eggWiggle 1.2s ease-in-out both;
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
          animation-delay: 0.45s;
        }

        .crackTwo {
          width: 16px;
          height: 2px;
          top: 36px;
          left: 32px;
          transform: rotate(-34deg);
          animation-delay: 0.65s;
        }

        .crackThree {
          width: 20px;
          height: 2px;
          top: 45px;
          left: 18px;
          transform: rotate(18deg);
          animation-delay: 0.85s;
        }

        .birdBody {
          position: absolute;
          right: 5px;
          bottom: 5px;
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

        .small .birdBody {
          width: 66px;
          height: 66px;
        }

        .large .birdBody {
          width: 118px;
          height: 118px;
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

        .large .birdFace {
          transform: scale(1.45);
        }

        .eye {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #ffffff;
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

        .large .wing {
          width: 42px;
          height: 56px;
          top: 42px;
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

        .large .musicNote {
          font-size: 42px;
          right: -12px;
          top: -24px;
        }

        @keyframes eggWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-7deg); }
          50% { transform: rotate(7deg); }
          75% { transform: rotate(-5deg); }
        }

        @keyframes showCrack {
          to { opacity: 1; }
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
      `}</style>
    </div>
  );
}
