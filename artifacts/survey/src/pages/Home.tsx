import { Link } from "wouter";

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 32px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "1rem",
  textDecoration: "none",
  backgroundColor: "#FFB6C1",
  color: "#1a1a1a",
  border: "1px solid #f097a8",
  transition: "opacity 0.15s",
};

const btnOutline: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 32px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "1rem",
  textDecoration: "none",
  backgroundColor: "transparent",
  color: "#1a1a1a",
  border: "1.5px solid #1a1a1a",
  transition: "opacity 0.15s",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#fdf8f0" }}>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "#1a1a1a" }}
          >
            The Digital Student Experience
          </h1>
          <p
            className="text-lg mb-10 leading-relaxed"
            style={{ color: "#1a1a1a" }}
          >
            Help us understand how undergraduate students use technology on
            campus. This short survey takes about 2&ndash;3 minutes to complete.
            All responses are anonymous and aggregated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/survey" style={btnPrimary}>
              Take the Survey
            </Link>
            <Link href="/results" style={btnOutline}>
              View Results
            </Link>
          </div>
        </div>
      </main>

      <footer
        className="py-6 px-4 text-center text-sm border-t"
        style={{ color: "#1a1a1a", borderColor: "#e0ddd8" }}
      >
        Survey by Mia Maiers, BAIS:3300 &mdash; Spring 2026.
      </footer>
    </div>
  );
}
