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

export const getFeaturedMediaEvent = () =>
  call("getFeaturedMediaEvent");

export const getEventMedia = (folderId: string) =>
  call("getEventMedia", { folderId });
