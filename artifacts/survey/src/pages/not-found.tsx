import { Link } from "wouter";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#fdf8f0" }}
    >
      <h1 className="text-4xl font-bold mb-3" style={{ color: "#1a1a1a" }}>
        404
      </h1>
      <p className="text-lg mb-8" style={{ color: "#555" }}>
        Page not found.
      </p>
      <Link href="/">
        <button
          className="px-6 py-2 rounded-lg font-medium text-sm"
          style={{
            backgroundColor: "#FFB6C1",
            color: "#1a1a1a",
            border: "1px solid #f097a8",
          }}
        >
          ← Back to Home
        </button>
      </Link>
    </div>
  );
}
