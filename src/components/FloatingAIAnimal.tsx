"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const messages = [
  "Need help joining Serenade Singers?",
  "Ask me about events and rehearsals.",
  "I can guide volunteers and members.",
  "Want to know choir practice details?",
  "Tap me to chat with AI Assistant.",
];

export default function FloatingAIAnimal() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Link href="/ai-assistant" className="floating-ai-animal" aria-label="Open AI Assistant">
      <span className="floating-cloud">{messages[index]}</span>

      <span className="floating-bird-wrap">
        <span className="floating-bird">🐦</span>
      </span>

      <style jsx>{`
        .floating-ai-animal {
          position: fixed;
          right: 22px;
          bottom: 92px;
          z-index: 60;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          animation: floatWrap 4s ease-in-out infinite;
        }

        .floating-cloud {
          max-width: 230px;
          padding: 13px 16px;
          border-radius: 22px 22px 6px 22px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(201, 162, 74, 0.32);
          color: #061a2f;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.45;
          box-shadow: 0 18px 45px rgba(6, 26, 47, 0.16);
          backdrop-filter: blur(12px);
        }

        .floating-bird-wrap {
          width: 58px;
          height: 58px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #061a2f, #12355b);
          border: 2px solid rgba(248, 215, 122, 0.75);
          box-shadow: 0 18px 42px rgba(6, 26, 47, 0.28);
        }

        .floating-bird {
          font-size: 30px;
          transform-origin: center;
          animation: wing 0.9s ease-in-out infinite;
        }

        .floating-ai-animal:hover .floating-cloud {
          background: #fff8dc;
          transform: translateY(-2px);
        }

        .floating-ai-animal:hover .floating-bird-wrap {
          transform: scale(1.06);
        }

        @keyframes floatWrap {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes wing {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.08); }
        }

        @media (max-width: 720px) {
          .floating-ai-animal {
            right: 14px;
            bottom: 82px;
          }

          .floating-cloud {
            max-width: 185px;
            font-size: 12px;
            padding: 11px 13px;
          }

          .floating-bird-wrap {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </Link>
  );
}
