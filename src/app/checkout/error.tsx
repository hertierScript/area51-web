"use client";

import { useEffect } from "react";
import ErrorReporter from "@/components/ErrorReporter";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Checkout error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">
            Checkout Error
          </h1>
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
          <a
            href="/"
            className="border border-input bg-background px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            Go Home
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.message}
              {error.stack && (
                <div className="mt-2 text-muted-foreground">{error.stack}</div>
              )}
              {error.digest && (
                <div className="mt-2 text-muted-foreground">
                  Digest: {error.digest}
                </div>
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
