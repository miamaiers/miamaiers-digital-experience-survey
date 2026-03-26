import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase, type SurveyRow } from "@/lib/supabase";

const ACCENT = "#FFB6C1";
const DARK = "#1a1a1a";
const BG = "#fdf8f0";
const BORDER = "#e0ddd8";

const CHART_COLORS = [
  "#FFB6C1",
  "#f4879a",
  "#e86b80",
  "#7EC8C8",
  "#5aabab",
  "#a8d8a8",
  "#6dc06d",
  "#f4d06f",
  "#e8b24a",
];

const YEAR_ORDER = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year or More",
];

function countBy<T>(arr: T[], key: (item: T) => string): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  arr.forEach((item) => {
    const k = key(item);
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl p-6 mb-6"
      style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}
    >
      <h2 className="text-lg font-semibold mb-5" style={{ color: DARK }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const CustomTooltipStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  color: DARK,
  padding: "0.5rem 0.75rem",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div style={CustomTooltipStyle}>
        <p style={{ fontWeight: 600 }}>{label}</p>
        <p>Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export default function Results() {
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data, error: err } = await supabase
        .from("digital_experience_results")
        .select("*");
      if (err) {
        const msg =
          err.code === "42P01" || err.message?.includes("relation")
            ? "The database table hasn't been created yet. Please run the SQL setup script in your Supabase SQL Editor first."
            : `Failed to load results: ${err.message}`;
        setError(msg);
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const totalResponses = rows.length;

  const yearData = YEAR_ORDER.map((year) => ({
    name: year,
    count: rows.filter((r) => r.year_in_college === year).length,
  }));

  const appCounts: Record<string, number> = {};
  rows.forEach((row) => {
    row.apps.forEach((app) => {
      if (app === "Other" && row.other_app) {
        const normalized = row.other_app.trim().toLowerCase();
        if (normalized) {
          const displayKey = normalized.charAt(0).toUpperCase() + normalized.slice(1);
          appCounts[displayKey] = (appCounts[displayKey] || 0) + 1;
        }
      } else if (app !== "Other") {
        appCounts[app] = (appCounts[app] || 0) + 1;
      }
    });
  });
  const appData = Object.entries(appCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const majorCounts = countBy(rows, (r) => r.major.trim());
  const topMajors = majorCounts.sort((a, b) => b.count - a.count).slice(0, 10);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BG }}
      >
        <p className="text-base" style={{ color: DARK }}>
          Loading results…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: BG }}
      >
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p
              className="text-base mb-6"
              style={{ color: "#b91c1c" }}
              role="alert"
            >
              <span aria-hidden="true">⚠ </span>
              {error}
            </p>
            <Link
              href="/"
              className="px-6 py-2 rounded-lg font-medium text-sm"
              style={{
                display: "inline-block",
                textDecoration: "none",
                backgroundColor: ACCENT,
                color: DARK,
                border: `1px solid #f097a8`,
              }}
            >
              ← Home
            </Link>
          </div>
        </main>
        <footer
          className="py-6 px-4 text-center text-sm border-t"
          style={{ color: DARK, borderColor: BORDER }}
        >
          Survey by Mia Maiers, BAIS:3300 &mdash; Spring 2026.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <header
        className="px-4 py-4 border-b"
        style={{ borderColor: BORDER }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium hover:underline"
            style={{ color: DARK, textDecoration: "none" }}
          >
            ← Home
          </Link>
          <Link
            href="/survey"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              display: "inline-block",
              textDecoration: "none",
              backgroundColor: ACCENT,
              color: DARK,
              border: `1px solid #f097a8`,
            }}
          >
            Take the Survey
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2" style={{ color: DARK }}>
            Survey Results
          </h1>
          <p className="mb-8 text-sm" style={{ color: "#666" }}>
            Aggregated, anonymized data from all submissions. Individual
            responses are never shown.
          </p>

          {/* Total Responses */}
          <div
            className="rounded-xl p-8 mb-6 text-center"
            style={{
              backgroundColor: "#fff7f9",
              border: `1.5px solid ${ACCENT}`,
            }}
          >
            <p className="text-sm uppercase tracking-wide font-semibold mb-1" style={{ color: "#888" }}>
              Total Responses
            </p>
            <p
              className="text-7xl font-bold leading-none"
              style={{ color: DARK }}
            >
              {totalResponses}
            </p>
          </div>

          {totalResponses === 0 ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}` }}
            >
              <p style={{ color: "#888" }}>
                No responses yet. Be the first to take the survey!
              </p>
              <Link
                href="/survey"
                className="mt-4 px-6 py-2 rounded-lg font-medium text-sm"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  backgroundColor: ACCENT,
                  color: DARK,
                  border: `1px solid #f097a8`,
                }}
              >
                Take the Survey
              </Link>
            </div>
          ) : (
            <>
              {/* Year in College */}
              <SectionCard title="Year in College">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={yearData}
                    margin={{ top: 4, right: 16, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#555" }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#555" }}
                      width={32}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* App Usage */}
              {appData.length > 0 && (
                <SectionCard title="App Usage Popularity">
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(200, appData.length * 44)}
                  >
                    <BarChart
                      data={appData}
                      layout="vertical"
                      margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#555" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={180}
                        tick={{ fontSize: 12, fill: "#555" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        fill={ACCENT}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </SectionCard>
              )}

              {/* Major Distribution */}
              {topMajors.length > 0 && (
                <SectionCard title="Major Distribution">
                  {topMajors.length <= 6 ? (
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={topMajors}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) =>
                              `${name} (${Math.round(percent * 100)}%)`
                            }
                            labelLine={true}
                          >
                            {topMajors.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            formatter={(value) => (
                              <span style={{ color: DARK, fontSize: 12 }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(200, topMajors.length * 40)}
                    >
                      <BarChart
                        data={topMajors}
                        layout="vertical"
                        margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" horizontal={false} />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#555" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={180}
                          tick={{ fontSize: 12, fill: "#555" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="count"
                          radius={[0, 4, 4, 0]}
                        >
                          {topMajors.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </SectionCard>
              )}
            </>
          )}
        </div>
      </main>

      <footer
        className="py-6 px-4 text-center text-sm border-t"
        style={{ color: DARK, borderColor: BORDER }}
      >
        Survey by Mia Maiers, BAIS:3300 &mdash; Spring 2026.
      </footer>
    </div>
  );
}
