"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFeaturedMediaEvent } from "@/lib/events";

export default function RecentEvent() {
  const [event,setEvent]=useState<any>(null);

  useEffect(()=>{
    getFeaturedMediaEvent()
      .then(r=>setEvent(r.event))
      .catch(console.error);
  },[]);

  if(!event) return null;

  return(
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl border bg-white overflow-hidden shadow-sm">

        <img
          src={event.coverUrl}
          className="w-full aspect-video object-cover"
        />

        <div className="p-8">

          <p className="text-sm font-semibold text-amber-600 uppercase">
            Recent Activity
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {event.title}
          </h2>

          <div className="mt-6 flex gap-6 text-gray-600">

            <span>📷 {event.photoCount} Photos</span>

            <span>🎥 {event.videoCount} Videos</span>

          </div>

          <Link
            href={"/events/"+event.folderId}
            className="inline-flex mt-8 rounded-xl bg-slate-900 text-white px-6 py-3"
          >
            View Gallery
          </Link>

        </div>

      </div>
    </section>
  );
}
