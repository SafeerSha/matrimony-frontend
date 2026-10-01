import Link from "next/link";
export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 text-center"><div><p className="text-sm font-semibold text-[var(--primary)]">404</p><h1 className="mt-2 text-3xl font-bold">Page not found</h1><Link href="/" className="focus-ring mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">Back home</Link></div></main>;
}