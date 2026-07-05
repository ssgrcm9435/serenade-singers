"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const messages = [
  "Welcome to Serenade Singers.",
  "Ask about events, classes, or rehearsals.",
  "Need help joining as a member?",
  "Voice assessment and practice guidance available.",
  "Tap me to continue with Lumi.",
];

type IntroState = "waiting" | "flight-in" | "center-show" | "fly-corner" | "idle";

export default function FloatingAIMascot() {
  const pathname = usePathname();
  const router = useRouter();
  const isAIPage = pathname === "/ai" || pathname?.startsWith("/ai/");

  const [introState, setIntroState] = useState<IntroState>("waiting");
  const [messageIndex, setMessageIndex] = useState(0);
  const [stageOpen, setStageOpen] = useState(false);

  useEffect(() => {
    if (isAIPage) return;

    const t0 = window.setTimeout(() => setIntroState("flight-in"), 2200);
    const t1 = window.setTimeout(() => setIntroState("center-show"), 3300);
    const t2 = window.setTimeout(() => setIntroState("fly-corner"), 7400);
    const t3 = window.setTimeout(() => setIntroState("idle"), 8700);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [isAIPage]);

  useEffect(() => {
    if (isAIPage) return;

    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isAIPage]);

  if (isAIPage) return null;

  const isWaiting = introState === "waiting";
  const isCenter = introState === "flight-in" || introState === "center-show" || introState === "fly-corner";
  const showCenterContent = introState === "center-show";
  const showCornerBubble = introState === "idle";

  return (
    <>
      <button
        type="button"
        className={`mascotButton ${stageOpen || isWaiting ? "hiddenMascot" : ""} ${isCenter ? "centerMode" : "cornerMode"} ${introState}`}
        aria-label="Open Lumi Mascot"
        onClick={() => {
          if (introState === "idle") setStageOpen(true);
        }}
      >
        <div className={`speechBubble cornerBubble ${showCornerBubble ? "visible" : ""}`}>
          {messages[messageIndex]}
        </div>

        <div className={`centerBubble ${showCenterContent ? "visible" : ""}`}>
          <strong>Hello!</strong>
          <span>I can help you explore Serenade Singers.</span>
        </div>

        <div className={`noteField ${showCenterContent ? "visible" : ""}`} aria-hidden="true">
          <span>♪</span>
          <span>♫</span>
          <span>♬</span>
          <span>♩</span>
          <span>𝄞</span>
          <span>♪</span>
        </div>

        <MascotBody large={isCenter} dancing={showCenterContent} />
      </button>

      {stageOpen && (
        <div className="stageOverlay" role="dialog" aria-modal="true">
          <div className="stageCard">
            <button
              type="button"
              className="closeButton"
              aria-label="Close mascot dialog"
              onClick={() => setStageOpen(false)}
            >
              ×
            </button>

            <div className="stageNotes" aria-hidden="true">
              <span>♪</span>
              <span>♫</span>
              <span>♬</span>
              <span>♩</span>
              <span>𝄞</span>
            </div>

            <div className="stageMascot">
              <MascotBody large dancing />
            </div>

            <h2>How can I help?</h2>
            <p>
              I can guide you about Serenade Singers events, membership, classes, rehearsals,
              volunteers, and voice assessment.
            </p>

            <div className="stageActions">
              <button type="button" className="primaryAction" onClick={() => router.push("/ai")}>
                Chat with Lumi
              </button>
              <button type="button" className="secondaryAction" onClick={() => setStageOpen(false)}>
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hiddenMascot {
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        .mascotButton {
          position: fixed !important;
          z-index: 2147483647 !important;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          pointer-events: auto;
        }

        .centerMode {
          left: 50% !important;
          top: 50% !important;
          right: auto !important;
          bottom: auto !important;
          transform: translate(-50%, -50%);
        }

        .cornerMode {
          right: 24px !important;
          bottom: 24px !important;
          left: auto !important;
          top: auto !important;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 14px;
          animation: cornerFloat 4s ease-in-out infinite;
        }

        .flight-in {
          animation: flyInToCenter 1.1s cubic-bezier(.2,.9,.25,1) both;
        }

        .center-show {
          animation: centerDance 1.2s ease-in-out infinite;
        }

        .fly-corner {
          animation: flyBackToCorner 1.3s cubic-bezier(.25,.9,.25,1) both;
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

        .cornerBubble.visible {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .centerBubble {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 22px);
          width: min(340px, 78vw);
          transform: translateX(-50%) translateY(10px) scale(.96);
          padding: 16px 18px;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(201, 162, 74, 0.45);
          box-shadow: 0 22px 58px rgba(6, 26, 47, 0.20);
          color: #061a2f;
          opacity: 0;
          transition: opacity .35s ease, transform .35s ease;
        }

        .centerBubble strong {
          display: block;
          font-size: 22px;
          font-weight: 950;
          margin-bottom: 4px;
        }

        .centerBubble span {
          display: block;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.55;
          color: #475569;
        }

        .centerBubble.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .noteField {
          position: absolute;
          inset: -150px;
          pointer-events: none;
          opacity: 0;
          transition: opacity .35s ease;
        }

        .noteField.visible {
          opacity: 1;
        }

        .noteField span {
          position: absolute;
          color: #c9a24a;
          font-size: 34px;
          font-weight: 950;
          opacity: 0;
          animation: noteFloat 2.8s ease-in-out infinite;
        }

        .noteField span:nth-child(1) { left: 12%; top: 48%; animation-delay: 0s; }
        .noteField span:nth-child(2) { right: 12%; top: 42%; animation-delay: .25s; }
        .noteField span:nth-child(3) { left: 26%; top: 18%; animation-delay: .5s; }
        .noteField span:nth-child(4) { right: 26%; top: 16%; animation-delay: .75s; }
        .noteField span:nth-child(5) { left: 46%; top: 4%; animation-delay: 1s; }
        .noteField span:nth-child(6) { right: 42%; top: 64%; animation-delay: 1.25s; }

        .stageOverlay {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(6, 26, 47, 0.58);
          backdrop-filter: blur(10px);
          animation: fadeIn .25s ease both;
        }

        .stageCard {
          position: relative;
          width: min(620px, 94vw);
          min-height: 560px;
          overflow: hidden;
          border-radius: 36px;
          padding: 64px 36px 36px;
          text-align: center;
          background:
            radial-gradient(circle at 50% 20%, rgba(248, 215, 122, 0.30), transparent 36%),
            linear-gradient(180deg, #ffffff, #f8f6f2);
          border: 1px solid rgba(248, 215, 122, 0.5);
          box-shadow: 0 34px 90px rgba(0, 0, 0, 0.34);
          animation: stagePop .38s cubic-bezier(.2,1.2,.35,1) both;
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

        .stageNotes {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .stageNotes span {
          position: absolute;
          color: #c9a24a;
          font-size: 32px;
          font-weight: 950;
          opacity: 0;
          animation: noteFloat 3s ease-in-out infinite;
        }

        .stageNotes span:nth-child(1) { left: 25%; top: 28%; animation-delay: 0s; }
        .stageNotes span:nth-child(2) { right: 25%; top: 28%; animation-delay: .35s; }
        .stageNotes span:nth-child(3) { left: 28%; top: 48%; animation-delay: .7s; }
        .stageNotes span:nth-child(4) { right: 28%; top: 48%; animation-delay: 1.05s; }
        .stageNotes span:nth-child(5) { left: 48%; top: 22%; animation-delay: 1.4s; }

        .stageMascot {
          position: relative;
          z-index: 2;
          display: inline-flex;
          margin-top: 18px;
          margin-bottom: 26px;
          transform-origin: center;
          animation: stageMascotDance 1.25s ease-in-out infinite;
        }

        .stageCard h2 {
          position: relative;
          z-index: 2;
          margin: 0 0 14px;
          color: #061a2f;
          font-size: clamp(1.7rem, 5vw, 2.35rem);
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .stageCard p {
          position: relative;
          z-index: 2;
          max-width: 440px;
          margin: 0 auto 28px;
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

        @keyframes flyInToCenter {
          0% {
            left: calc(100vw + 120px);
            top: calc(100vh + 80px);
            transform: translate(-50%, -50%) scale(.55) rotate(18deg);
            opacity: 0;
          }
          45% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(.85) rotate(-8deg);
          }
          100% {
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.15) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes flyBackToCorner {
          0% {
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.15) rotate(0deg);
            opacity: 1;
          }
          100% {
            left: calc(100vw - 62px);
            top: calc(100vh - 62px);
            transform: translate(-50%, -50%) scale(.72) rotate(8deg);
            opacity: 1;
          }
        }

        @keyframes cornerFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -11px; }
        }

        @keyframes stageMascotDance {
          0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); }
          25% { transform: translateY(-8px) rotate(4deg) scale(1.03); }
          50% { transform: translateY(0) rotate(0deg) scale(1); }
          75% { transform: translateY(-7px) rotate(-4deg) scale(1.03); }
        }

        @keyframes centerDance {
          0%, 100% { transform: translate(-50%, -50%) scale(1.15) rotate(-2deg); }
          25% { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); }
          50% { transform: translate(-50%, -50%) scale(1.15) rotate(0deg); }
          75% { transform: translate(-50%, -50%) scale(1.2) rotate(-5deg); }
        }

        @keyframes noteFloat {
          0% { opacity: 0; transform: translateY(18px) scale(.8) rotate(0deg); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-72px) scale(1.18) rotate(18deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes stagePop {
          from { opacity: 0; transform: translateY(30px) scale(.86); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 720px) {
          .cornerMode {
            right: 14px !important;
            bottom: 14px !important;
            gap: 9px;
          }

          .speechBubble {
            width: min(185px, 52vw);
            padding: 11px 13px;
            font-size: 12px;
          }

          .centerBubble {
            width: min(300px, 82vw);
          }

          .stageCard {
            width: min(430px, 94vw);
            min-height: 500px;
            padding: 54px 22px 28px;
          }

          .stageMascot {
            margin-top: 12px;
            margin-bottom: 22px;
          }
        }
      `}</style>
    </>
  );
}

function MascotBody({ large, dancing }: { large: boolean; dancing: boolean }) {
  return (
    <div className={`mascotBody ${large ? "large" : "small"} ${dancing ? "dancing" : ""}`}>
      <div className="wing leftWing" />
      <div className="wing rightWing" />
      <div className="birdFace">
        <span className="eye" />
        <span className="eye" />
        <span className="beak" />
      </div>
      <span className="musicNote">♪</span>

      <style jsx>{`
        .mascotBody {
          position: relative;
          flex: 0 0 auto;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 34% 28%, #ffffff 0 8%, transparent 9%),
            linear-gradient(135deg, #061a2f, #12355b);
          border: 2px solid rgba(248, 215, 122, 0.82);
          box-shadow: 0 18px 44px rgba(6, 26, 47, 0.28);
        }

        .small {
          width: 66px;
          height: 66px;
        }

        .large {
          width: 118px;
          height: 118px;
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
          animation-delay: .12s;
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

        @keyframes wingFlap {
          0%, 100% { transform: rotate(12deg); }
          50% { transform: rotate(-18deg); }
        }

        @keyframes noteRise {
          0%, 100% { transform: translateY(0); opacity: .75; }
          50% { transform: translateY(-7px); opacity: 1; }
        }

        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(.12); }
        }
      `}</style>
    </div>
  );
}
