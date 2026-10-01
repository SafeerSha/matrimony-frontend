import { cn } from '@/lib/cn';
export function Badge({ children, tone='neutral', className }: { children: React.ReactNode; tone?: 'neutral'|'success'|'accent'|'danger'; className?: string }) {
  const tones = { neutral:'bg-surface-muted text-muted-strong', success:'bg-primary-light text-primary', accent:'bg-accent/15 text-accent-foreground', danger:'bg-surface-muted text-danger' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>;
}
