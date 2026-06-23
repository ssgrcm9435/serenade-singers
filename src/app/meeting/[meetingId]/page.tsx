"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://serenade-backend-ly1w.onrender.com";

export default function MeetingRoomPage() {
  const params = useParams();
  const meetingId = String(params.meetingId || "");

  const [approved, setApproved] = useState(false);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const joinData = JSON.parse(
      sessionStorage.getItem("meetingAccess") || "{}"
    );

    async function requestJoin() {
      try {
        await fetch(`${API}/meetings/waiting-room/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingId,
            participantName:
              joinData.name || joinData.displayName || "Guest",
          }),
        });

        pollApproval();
      } catch (e) {
        console.error(e);
      }
    }

    async function pollApproval() {
      const timer = setInterval(async () => {
        try {
          const res = await fetch(
            `${API}/meetings/${meetingId}/waiting-room`
          );

          const data = await res.json();

          const me = data.find(
            (x: any) =>
              x.participantName ===
              (joinData.name || joinData.displayName || "Guest")
          );

          if (!me) return;

          if (me.status === "APPROVED") {
            clearInterval(timer);
            setApproved(true);
            setStatus("approved");
          }

          if (me.status === "REJECTED") {
            clearInterval(timer);
            setStatus("rejected");
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }

    requestJoin();
  }, [meetingId]);

  if (status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">
          Host rejected your request.
        </h1>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Waiting for Host Approval
          </h1>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">
        Meeting Room - {meetingId}
      </h1>

      <p className="mt-4 text-green-500">
        Host approved your request.
      </p>
    </div>
  );
}
