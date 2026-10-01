export function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div>{eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p>}<h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}</div>{action}</div>;
}
