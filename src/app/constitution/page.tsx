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

      <div className="mt-8">
        <a
          href="/constitution.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white"
        >
          📄 Download Constitution (PDF)
        </a>
      </div>

      <section className="mt-12 rounded-3xl border border-slate-200 p-8">
        <h2 className="text-3xl font-black">Read Online</h2>

        <p className="mt-4 text-slate-600">
          The official Constitution of Serenade Singers is available for download using the button above.
        </p>

        <p className="mt-4 text-slate-600">
          Upload your final Constitution PDF as:
        </p>

        <code className="mt-3 block rounded-xl bg-slate-100 p-4">
          public/constitution.pdf
        </code>
      </section>
    </main>
  );
}
