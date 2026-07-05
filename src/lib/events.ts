const API = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;

async function call(action: string, body = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...body }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("API Error");
  return res.json();
}

export const getFeaturedMediaEvent = () => call("getFeaturedMediaEvent");

export async function getEventMedia(routeId: string) {
  let folderId = routeId;

  if (/^EVT-/i.test(routeId)) {
    const data = await getFeaturedMediaEvent();
    const event = data?.events?.find(
      (item: any) => String(item.eventId).toLowerCase() === routeId.toLowerCase()
    );

    if (event?.folderId) {
      folderId = event.folderId;
    }
  }

  return call("getEventMedia", { folderId });
}
