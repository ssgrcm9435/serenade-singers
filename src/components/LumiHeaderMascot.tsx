"use client";

import { useEffect, useState } from "react";

export default function LumiHeaderMascot() {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    function startTyping() {
      setTyping(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTyping(false), 2200);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") startTyping();
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const text = target.textContent?.toLowerCase() || "";
      if (text.includes("send") || text.includes("chat") || text.includes("ask")) {
        startTyping();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="lumiHeaderMascot">
      <div className={`lumiBird ${typing ? "typing" : ""}`}>
        <div className="wing leftWing" />
        <div className="wing rightWing" />
        <div className="face">
          <span />
          <span />
          <i />
        </div>
        <b>♪</b>
      </div>

      <div className="laptop">
        <div className="screen">
          <span className={typing ? "cursor typingCursor" : "cursor"} />
        </div>
        <div className="base" />
      </div>

      <div className="status">
        <strong>Lumi</strong>
        <span>{typing ? "typing..." : "Your Serenade Guide"}</span>
      </div>

      <style jsx>{`
        .lumiHeaderMascot {
          margin: 18px 0 22px;
          padding: 18px;
          border-radius: 28px;
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(201,162,74,.28);
          box-shadow: 0 18px 45px rgba(6,26,47,.08);
          display: flex;
          align-items: center;
          gap: 16px;
          width: fit-content;
          max-width: 100%;
        }

        .lumiBird {
          position: relative;
          width: 62px;
          height: 62px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #061a2f, #12355b);
          border: 2px solid rgba(248,215,122,.82);
          box-shadow: 0 14px 34px rgba(6,26,47,.22);
          animation: idleFloat 3.4s ease-in-out infinite;
        }

        .typing {
          animation: typingBounce .42s ease-in-out infinite;
        }

        .wing {
          position: absolute;
          top: 22px;
          width: 22px;
          height: 30px;
          border-radius: 999px 999px 12px 12px;
          background: linear-gradient(180deg, #f8d77a, #c9a24a);
        }

        .leftWing {
          left: -8px;
          transform-origin: top right;
        }

        .rightWing {
          right: -8px;
          transform-origin: top left;
        }

        .typing .wing {
          animation: wingTap .32s ease-in-out infinite;
        }

        .face {
          position: relative;
          display: flex;
          gap: 7px;
          align-items: center;
          justify-content: center;
        }

        .face span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
        }

        .face i {
          position: absolute;
          top: 13px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #f8d77a;
        }

        .lumiBird b {
          position: absolute;
          top: -13px;
          right: -3px;
          color: #c9a24a;
          font-size: 24px;
        }

        .laptop {
          width: 76px;
        }

        .screen {
          height: 46px;
          border-radius: 10px;
          background: #061a2f;
          border: 3px solid #c9a24a;
          display: flex;
          align-items: center;
          padding-left: 14px;
        }

        .cursor {
          width: 20px;
          height: 4px;
          border-radius: 999px;
          background: rgba(248,215,122,.45);
        }

        .typingCursor {
          animation: cursorTap .28s steps(2) infinite;
        }

        .base {
          width: 88px;
          height: 8px;
          margin-left: -6px;
          border-radius: 0 0 14px 14px;
          background: #c9a24a;
        }

        .status {
          display: grid;
          gap: 3px;
        }

        .status strong {
          color: #061a2f;
          font-size: 18px;
          font-weight: 950;
        }

        .status span {
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        @keyframes idleFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes typingBounce {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(3deg); }
        }

        @keyframes wingTap {
          0%,100% { transform: rotate(12deg); }
          50% { transform: rotate(-20deg); }
        }

        @keyframes cursorTap {
          0% { opacity: .35; transform: translateX(0); }
          100% { opacity: 1; transform: translateX(16px); }
        }

        @media (max-width: 720px) {
          .lumiHeaderMascot {
            width: 100%;
            justify-content: flex-start;
            padding: 14px;
          }

          .laptop {
            width: 64px;
          }

          .screen {
            height: 40px;
          }

          .base {
            width: 74px;
          }
        }
      `}</style>
    </div>
  );
}
