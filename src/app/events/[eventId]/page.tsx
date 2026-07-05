"use client";

import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { getEventMedia } from "@/lib/events";

export default function EventGallery(){

const params=useParams();
const[event,setEvent]=useState<any>();

useEffect(()=>{
getEventMedia(params.eventId as string)
.then(setEvent);
},[params]);

if(!event) return <div className="p-20 text-center">Loading...</div>;

return(

<div className="mx-auto max-w-7xl px-6 py-12">

<h1 className="text-5xl font-bold mb-10">
{event.title}
</h1>

<div className="grid md:grid-cols-3 gap-6">

{event.media.map((m:any)=>(

m.type==="image"

?

<img
key={m.fileId}
src={m.thumbnailUrl}
className="rounded-xl w-full aspect-square object-cover"
/>

:

<iframe
key={m.fileId}
src={m.embedUrl}
className="rounded-xl w-full aspect-video"
/>

))}

</div>

</div>

);

}
