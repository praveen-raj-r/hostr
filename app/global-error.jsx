"use client";

// Catches errors thrown inside the root layout itself (e.g. Header, which
// calls Convex hooks directly). app/error.jsx only covers pages rendered
// below the layout, so this is a separate, required file — Next.js replaces
// the whole document with this component when it fires, hence the full
// <html>/<body>.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 px-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-400 max-w-md">
            {error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-md bg-white text-black font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
