import { cn } from '@/lib/cn';

export function Badge({ 
  children, 
  tone = 'neutral', 
  className 
}: { 
  children: React.ReactNode; 
  tone?: 'neutral' | 'success' | 'accent' | 'danger' | 'blush' | 'default'; 
  className?: string 
}) {
  const tones: Record<string, string> = { 
    neutral: 'bg-[var(--surface-muted)] text-[var(--muted-strong)] border border-[var(--border)]',
    default: 'bg-[var(--surface-muted)] text-[var(--muted-strong)] border border-[var(--border)]',
    success: 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border)] font-semibold', 
    accent: 'bg-[#FAF3EC] text-[#8C5D30] border border-[#EAD7C5] font-semibold', 
    blush: 'bg-[#FCEFF2] text-[#A7586A] border border-[#E9DDE0] font-semibold',
    danger: 'bg-rose-50 text-[var(--danger)] border border-rose-200/80 font-semibold' 
  };

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight shadow-[0_1px_2px_rgba(0,0,0,0.03)]', tones[tone] || tones.neutral, className)}>
      {children}
    </span>
  );
}
