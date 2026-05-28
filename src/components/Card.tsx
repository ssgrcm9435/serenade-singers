export default function Card({
  title,
  subtitle,
  text,
}: {
  title: string;
  subtitle?: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-[#e8dfcc] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {subtitle && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#C9A24A]">
          {subtitle}
        </p>
      )}
      <h3 className="text-2xl font-bold text-[#061A2F]">{title}</h3>
      <p className="mt-4 text-[#1F2933]/70">{text}</p>
    </div>
  );
}
