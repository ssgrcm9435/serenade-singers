export default function ConstitutionPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-5xl font-black text-slate-900">
        Constitution of Serenade Singers
      </h1>

      <p className="mt-4 text-xl text-slate-600">
        Official Organizational Framework
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Last Updated: June 2026
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="/constitution.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white"
        >
          📄 Download Constitution (PDF)
        </a>
      </div>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-3xl font-black mb-6">
          Read Online
        </h2>

        <iframe
          src="/constitution.pdf"
          className="w-full h-[1200px] rounded-2xl border"
          title="Serenade Singers Constitution"
        />
      </section>
    </main>
  );
}
