"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl uppercase">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => reset()}
            className="bg-navy text-navy-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
