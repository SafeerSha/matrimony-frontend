import { cn } from '@/lib/cn';

type Props = { src?: string; name: string; size?: 'sm'|'md'|'lg'|'xl'; className?: string };
export function Avatar({ src, name, size='md', className }: Props) {
  const sizes = { sm:'h-9 w-9 text-xs', md:'h-11 w-11 text-sm', lg:'h-16 w-16 text-base', xl:'h-24 w-24 text-xl' };
  return <div className={cn('relative shrink-0 overflow-hidden rounded-full bg-primary-light font-bold text-primary', sizes[size], className)}>{src ? <img src={src} alt={`${name} profile`} className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center">{name.split(' ').map(x=>x[0]).join('').slice(0,2)}</span>}</div>;
}
