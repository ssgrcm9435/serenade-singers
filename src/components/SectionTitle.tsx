export default function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-10">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C9A24A]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#061A2F] md:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-4 max-w-2xl text-[#1F2933]/70">{text}</p>}
    </div>
  );
}
