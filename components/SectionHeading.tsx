export default function SectionHeading({
  kicker,
  title,
  className,
}: {
  kicker?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {kicker && (
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          {kicker}
        </p>
      )}
      <h2 className="text-3xl font-bold text-[var(--txt)]">{title}</h2>
    </div>
  );
}
