"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Please try again. No sensitive error details are shown to the browser.</p>
        <button onClick={() => reset()} className="focus-ring mt-6 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">Try again</button>
      </div>
    </main>
  );
}