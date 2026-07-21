"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
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
              {/* Plain anchor intentionally: the root layout itself just crashed, so this
                  falls back to a full reload instead of depending on router internals. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
