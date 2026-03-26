import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase, type SurveyInsert } from "@/lib/supabase";

const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year or More",
] as const;

const BUILDING_OPTIONS = [
  "Pappajohn Business Building",
  "Pomerantz Center",
  "Chemistry Building",
  "Macbride Hall",
  "Shaeffer Hall",
  "Other",
] as const;

const NOTE_DEVICE_OPTIONS = [
  "Laptop (Mac/PC)",
  "Tablet (iPad/Surface)",
  "Pen and Paper",
  "Phone",
] as const;

const APP_OPTIONS = [
  "Canvas / ICON",
  "Microsoft Word / Microsoft Excel",
  "Microsoft Teams / Zoom",
  "Notion / GoodNotes",
  "ChatGPT / AI Tools",
  "Other",
] as const;

interface FormData {
  major: string;
  year_in_college: string;
  study_spot: string;
  primary_building: string;
  other_building: string;
  note_device: string;
  apps: string[];
  other_app: string;
  curriculum_suggestion: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  major: "",
  year_in_college: "",
  study_spot: "",
  primary_building: "",
  other_building: "",
  note_device: "",
  apps: [],
  other_app: "",
  curriculum_suggestion: "",
};

const ACCENT = "#FFB6C1";
const DARK = "#1a1a1a";
const BG = "#fdf8f0";
const BORDER = "#d6d0c9";
const ERROR_COLOR = "#b91c1c";

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-sm flex items-center gap-1"
      style={{ color: ERROR_COLOR }}
    >
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

interface ThankYouProps {
  data: FormData;
  onReset: () => void;
}

function ThankYou({ data, onReset }: ThankYouProps) {
  const [, navigate] = useLocation();

  const buildingDisplay =
    data.primary_building === "Other"
      ? data.other_building || "Other"
      : data.primary_building;

  const appsDisplay = data.apps
    .map((a) => (a === "Other" ? `Other (${data.other_app})` : a))
    .join(", ");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: BG }}
    >
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div
            className="rounded-xl p-8 mb-8 text-center"
            style={{
              backgroundColor: "#fff7f9",
              border: `1.5px solid ${ACCENT}`,
            }}
          >
            <div className="text-4xl mb-3" aria-hidden="true">
              🎉
            </div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: DARK }}
            >
              Thank you for your response!
            </h1>
            <p className="text-base" style={{ color: DARK }}>
              Your answers have been submitted successfully.
            </p>
          </div>

          <div
            className="rounded-xl p-6 mb-8"
            style={{
              backgroundColor: "#fff",
              border: `1px solid ${BORDER}`,
            }}
          >
            <h2
              className="text-lg font-semibold mb-5"
              style={{ color: DARK }}
            >
              Your Answers
            </h2>
            <dl className="space-y-4">
              {[
                { label: "Major", value: data.major },
                { label: "Year in College", value: data.year_in_college },
                { label: "Favorite Study Spot", value: data.study_spot },
                { label: "Primary Building", value: buildingDisplay },
                { label: "Primary Note-Taking Device", value: data.note_device },
                { label: "Daily Apps/Software", value: appsDisplay },
                {
                  label: "Digital Tool Suggestion",
                  value: data.curriculum_suggestion,
                },
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <dt className="font-medium text-sm" style={{ color: "#555" }}>
                    {label}
                  </dt>
                  <dd
                    className="sm:col-span-2 text-sm"
                    style={{ color: DARK }}
                  >
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onReset}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-base transition-opacity hover:opacity-90 focus:outline-none"
              style={{
                backgroundColor: ACCENT,
                color: DARK,
                border: `1px solid #f097a8`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                e.currentTarget.style.outlineOffset = "3px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              Submit Another Response
            </button>
            <button
              onClick={() => navigate("/results")}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-base transition-opacity hover:opacity-80 focus:outline-none"
              style={{
                backgroundColor: "transparent",
                color: DARK,
                border: `1.5px solid ${DARK}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                e.currentTarget.style.outlineOffset = "3px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              View Results
            </button>
          </div>
        </div>
      </main>

      <footer
        className="py-6 px-4 text-center text-sm border-t"
        style={{ color: DARK, borderColor: "#e0ddd8" }}
      >
        Survey by Mia Maiers, BAIS:3300 &mdash; Spring 2026.
      </footer>
    </div>
  );
}

export default function SurveyForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const otherBuildingRef = useRef<HTMLInputElement>(null);
  const otherAppRef = useRef<HTMLInputElement>(null);

  const showOtherBuilding = formData.primary_building === "Other";
  const showOtherApp = formData.apps.includes("Other");

  useEffect(() => {
    if (showOtherBuilding) {
      otherBuildingRef.current?.focus();
    }
  }, [showOtherBuilding]);

  useEffect(() => {
    if (showOtherApp) {
      otherAppRef.current?.focus();
    }
  }, [showOtherApp]);

  function handleReset() {
    setFormData(initialFormData);
    setErrors({});
    setSubmitting(false);
    setSubmitted(false);
    setSubmitError("");
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.major.trim()) errs.major = "Please enter your major.";
    if (!formData.year_in_college)
      errs.year_in_college = "Please select your year in college.";
    if (!formData.study_spot.trim())
      errs.study_spot = "Please enter your favorite study spot.";
    if (!formData.primary_building)
      errs.primary_building = "Please select your primary building.";
    if (formData.primary_building === "Other" && !formData.other_building.trim())
      errs.other_building = "Please describe the building.";
    if (!formData.note_device)
      errs.note_device = "Please select your primary note-taking device.";
    if (formData.apps.length === 0)
      errs.apps = "Please select at least one app or software.";
    if (formData.apps.includes("Other") && !formData.other_app.trim())
      errs.other_app = "Please describe your other software.";
    if (!formData.curriculum_suggestion.trim())
      errs.curriculum_suggestion = "Please enter your suggestion.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrKey = Object.keys(errs)[0] as keyof FormData;
      document.getElementById(firstErrKey)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const building =
      formData.primary_building === "Other"
        ? formData.other_building.trim()
        : formData.primary_building;

    const payload: SurveyInsert = {
      major: formData.major.trim(),
      year_in_college: formData.year_in_college,
      study_spot: formData.study_spot.trim(),
      primary_building: building,
      note_device: formData.note_device,
      apps: formData.apps,
      other_app: formData.apps.includes("Other")
        ? formData.other_app.trim()
        : "",
      curriculum_suggestion: formData.curriculum_suggestion.trim(),
    };

    const { error } = await supabase
      .from("digital_experience_results")
      .insert(payload);

    if (error) {
      console.error("Supabase insert error:", error);
      let msg: string;
      if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        msg = "Database table not found — please run the SQL setup in your Supabase SQL Editor first.";
      } else if (
        error.code === "PGRST301" ||
        error.code === "401" ||
        error.message?.includes("JWT") ||
        error.message?.includes("Invalid API key") ||
        error.message?.includes("apikey") ||
        error.message?.includes("401")
      ) {
        msg = "Invalid Supabase credentials — double-check your Supabase URL and anon key.";
      } else if (error.message) {
        msg = error.message;
      } else {
        msg = "Something went wrong submitting your response. Please try again.";
      }
      setSubmitError(msg);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  function handleAppToggle(app: string) {
    setFormData((prev) => {
      const alreadyChecked = prev.apps.includes(app);
      return {
        ...prev,
        apps: alreadyChecked
          ? prev.apps.filter((a) => a !== app)
          : [...prev.apps, app],
      };
    });
    if (errors.apps || errors.other_app) {
      setErrors((prev) => ({ ...prev, apps: undefined, other_app: undefined }));
    }
  }

  if (submitted) {
    return <ThankYou data={formData} onReset={handleReset} />;
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    color: DARK,
    border: `1.5px solid ${BORDER}`,
    borderRadius: "0.5rem",
    padding: "0.625rem 0.875rem",
    width: "100%",
    fontSize: "0.9375rem",
    outline: "none",
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    border: `1.5px solid ${ERROR_COLOR}`,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <header
        className="px-4 py-4 border-b flex items-center justify-between max-w-2xl mx-auto w-full"
        style={{ borderColor: "#e0ddd8" }}
      >
        <Link
          href="/"
          className="text-sm font-medium hover:underline"
          style={{ color: DARK, textDecoration: "none" }}
        >
          ← Home
        </Link>
        <Link
          href="/results"
          className="text-sm font-medium hover:underline"
          style={{ color: DARK, textDecoration: "none" }}
        >
          View Results →
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2" style={{ color: DARK }}>
            The Digital Student Experience
          </h1>
          <p className="mb-8 text-base" style={{ color: "#555" }}>
            All fields are required.
          </p>

          {submitError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-lg text-sm"
              style={{
                backgroundColor: "#fef2f2",
                border: `1px solid ${ERROR_COLOR}`,
                color: ERROR_COLOR,
              }}
            >
              <span aria-hidden="true">⚠ </span>
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Q1 — Major */}
            <div className="mb-8">
              <label
                htmlFor="major"
                className="block font-semibold mb-2 text-base"
                style={{ color: DARK }}
              >
                1. What is your major?
              </label>
              <input
                id="major"
                type="text"
                value={formData.major}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, major: e.target.value }));
                  if (errors.major) setErrors((p) => ({ ...p, major: undefined }));
                }}
                placeholder="e.g. Business Analytics"
                required
                aria-required="true"
                aria-describedby={errors.major ? "major-error" : undefined}
                aria-invalid={!!errors.major}
                style={errors.major ? errorInputStyle : inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              />
              <FieldError id="major-error" message={errors.major} />
            </div>

            {/* Q2 — Year in College */}
            <fieldset className="mb-8">
              <legend
                className="font-semibold mb-3 text-base"
                style={{ color: DARK }}
              >
                2. What year are you in college?
              </legend>
              <div
                className="space-y-2"
                role="group"
                aria-describedby={
                  errors.year_in_college ? "year_in_college-error" : undefined
                }
              >
                {YEAR_OPTIONS.map((year) => (
                  <label
                    key={year}
                    className="flex items-center gap-3 cursor-pointer"
                    style={{ color: DARK }}
                  >
                    <input
                      type="radio"
                      name="year_in_college"
                      id={`year-${year}`}
                      value={year}
                      checked={formData.year_in_college === year}
                      onChange={() => {
                        setFormData((p) => ({ ...p, year_in_college: year }));
                        if (errors.year_in_college)
                          setErrors((p) => ({ ...p, year_in_college: undefined }));
                      }}
                      required
                      aria-required="true"
                      style={{
                        accentColor: ACCENT,
                        width: "1.125rem",
                        height: "1.125rem",
                        cursor: "pointer",
                      }}
                    />
                    <span className="text-sm">{year}</span>
                  </label>
                ))}
              </div>
              <FieldError
                id="year_in_college-error"
                message={errors.year_in_college}
              />
            </fieldset>

            {/* Q3 — Favorite Study Spot */}
            <div className="mb-8">
              <label
                htmlFor="study_spot"
                className="block font-semibold mb-2 text-base"
                style={{ color: DARK }}
              >
                3. What is your favorite study spot on campus?
              </label>
              <input
                id="study_spot"
                type="text"
                value={formData.study_spot}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, study_spot: e.target.value }));
                  if (errors.study_spot)
                    setErrors((p) => ({ ...p, study_spot: undefined }));
                }}
                placeholder="e.g. BizHub"
                required
                aria-required="true"
                aria-describedby={
                  errors.study_spot ? "study_spot-error" : undefined
                }
                aria-invalid={!!errors.study_spot}
                style={errors.study_spot ? errorInputStyle : inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              />
              <FieldError id="study_spot-error" message={errors.study_spot} />
            </div>

            {/* Q4 — Primary Building */}
            <div className="mb-8">
              <label
                htmlFor="primary_building"
                className="block font-semibold mb-2 text-base"
                style={{ color: DARK }}
              >
                4. Which building do you have the most classes in?
              </label>
              <select
                id="primary_building"
                value={formData.primary_building}
                onChange={(e) => {
                  setFormData((p) => ({
                    ...p,
                    primary_building: e.target.value,
                    other_building: "",
                  }));
                  if (errors.primary_building || errors.other_building)
                    setErrors((p) => ({
                      ...p,
                      primary_building: undefined,
                      other_building: undefined,
                    }));
                }}
                required
                aria-required="true"
                aria-describedby={
                  errors.primary_building ? "primary_building-error" : undefined
                }
                aria-invalid={!!errors.primary_building}
                style={{
                  ...(errors.primary_building ? errorInputStyle : inputStyle),
                  appearance: "auto",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              >
                <option value="">Select a building…</option>
                {BUILDING_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <FieldError
                id="primary_building-error"
                message={errors.primary_building}
              />

              {showOtherBuilding && (
                <div className="mt-3">
                  <label
                    htmlFor="other_building"
                    className="block text-sm font-medium mb-1"
                    style={{ color: DARK }}
                  >
                    Please specify the building:
                  </label>
                  <input
                    id="other_building"
                    ref={otherBuildingRef}
                    type="text"
                    value={formData.other_building}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        other_building: e.target.value,
                      }));
                      if (errors.other_building)
                        setErrors((p) => ({ ...p, other_building: undefined }));
                    }}
                    placeholder="Enter building name"
                    required
                    aria-required="true"
                    aria-describedby={
                      errors.other_building ? "other_building-error" : undefined
                    }
                    aria-invalid={!!errors.other_building}
                    style={errors.other_building ? errorInputStyle : inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                      e.currentTarget.style.outlineOffset = "2px";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  />
                  <FieldError
                    id="other_building-error"
                    message={errors.other_building}
                  />
                </div>
              )}
            </div>

            {/* Q5 — Note-Taking Device */}
            <fieldset className="mb-8">
              <legend
                className="font-semibold mb-3 text-base"
                style={{ color: DARK }}
              >
                5. What is your primary device for taking notes?
              </legend>
              <div
                className="space-y-2"
                role="group"
                aria-describedby={
                  errors.note_device ? "note_device-error" : undefined
                }
              >
                {NOTE_DEVICE_OPTIONS.map((device) => (
                  <label
                    key={device}
                    className="flex items-center gap-3 cursor-pointer"
                    style={{ color: DARK }}
                  >
                    <input
                      type="radio"
                      name="note_device"
                      id={`device-${device}`}
                      value={device}
                      checked={formData.note_device === device}
                      onChange={() => {
                        setFormData((p) => ({ ...p, note_device: device }));
                        if (errors.note_device)
                          setErrors((p) => ({ ...p, note_device: undefined }));
                      }}
                      required
                      aria-required="true"
                      style={{
                        accentColor: ACCENT,
                        width: "1.125rem",
                        height: "1.125rem",
                        cursor: "pointer",
                      }}
                    />
                    <span className="text-sm">{device}</span>
                  </label>
                ))}
              </div>
              <FieldError id="note_device-error" message={errors.note_device} />
            </fieldset>

            {/* Q6 — Apps/Software */}
            <fieldset className="mb-8">
              <legend
                className="font-semibold mb-3 text-base"
                style={{ color: DARK }}
              >
                6. Which software/apps do you use daily for school?
                <span className="block text-sm font-normal mt-0.5" style={{ color: "#666" }}>
                  Select all that apply.
                </span>
              </legend>
              <div
                className="space-y-2"
                role="group"
                aria-describedby={errors.apps ? "apps-error" : undefined}
              >
                {APP_OPTIONS.map((app) => (
                  <label
                    key={app}
                    className="flex items-center gap-3 cursor-pointer"
                    style={{ color: DARK }}
                  >
                    <input
                      type="checkbox"
                      id={`app-${app}`}
                      value={app}
                      checked={formData.apps.includes(app)}
                      onChange={() => handleAppToggle(app)}
                      style={{
                        accentColor: ACCENT,
                        width: "1.125rem",
                        height: "1.125rem",
                        cursor: "pointer",
                      }}
                    />
                    <span className="text-sm">{app}</span>
                  </label>
                ))}
              </div>
              <FieldError id="apps-error" message={errors.apps} />

              {showOtherApp && (
                <div className="mt-3">
                  <label
                    htmlFor="other_app"
                    className="block text-sm font-medium mb-1"
                    style={{ color: DARK }}
                  >
                    Please describe your other software:
                  </label>
                  <input
                    id="other_app"
                    ref={otherAppRef}
                    type="text"
                    value={formData.other_app}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        other_app: e.target.value,
                      }));
                      if (errors.other_app)
                        setErrors((p) => ({ ...p, other_app: undefined }));
                    }}
                    placeholder="e.g. Slack, Figma, Obsidian"
                    required
                    aria-required="true"
                    aria-describedby={
                      errors.other_app ? "other_app-error" : undefined
                    }
                    aria-invalid={!!errors.other_app}
                    style={errors.other_app ? errorInputStyle : inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                      e.currentTarget.style.outlineOffset = "2px";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  />
                  <FieldError id="other_app-error" message={errors.other_app} />
                </div>
              )}
            </fieldset>

            {/* Q7 — Curriculum Suggestion */}
            <div className="mb-10">
              <label
                htmlFor="curriculum_suggestion"
                className="block font-semibold mb-2 text-base"
                style={{ color: DARK }}
              >
                7. If you could add one digital tool to your major&rsquo;s
                curriculum, what would it be?
              </label>
              <textarea
                id="curriculum_suggestion"
                value={formData.curriculum_suggestion}
                onChange={(e) => {
                  setFormData((p) => ({
                    ...p,
                    curriculum_suggestion: e.target.value,
                  }));
                  if (errors.curriculum_suggestion)
                    setErrors((p) => ({
                      ...p,
                      curriculum_suggestion: undefined,
                    }));
                }}
                placeholder="What digital tool should be added to your major?"
                required
                aria-required="true"
                aria-describedby={
                  errors.curriculum_suggestion
                    ? "curriculum_suggestion-error"
                    : undefined
                }
                aria-invalid={!!errors.curriculum_suggestion}
                rows={4}
                style={
                  errors.curriculum_suggestion
                    ? { ...errorInputStyle, resize: "vertical" }
                    : { ...inputStyle, resize: "vertical" }
                }
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              />
              <FieldError
                id="curriculum_suggestion-error"
                message={errors.curriculum_suggestion}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 rounded-lg font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
              style={{
                backgroundColor: ACCENT,
                color: DARK,
                border: `1px solid #f097a8`,
              }}
              onFocus={(e) => {
                if (!submitting) {
                  e.currentTarget.style.outline = `2px solid ${ACCENT}`;
                  e.currentTarget.style.outlineOffset = "3px";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </form>
        </div>
      </main>

      <footer
        className="py-6 px-4 text-center text-sm border-t"
        style={{ color: DARK, borderColor: "#e0ddd8" }}
      >
        Survey by Mia Maiers, BAIS:3300 &mdash; Spring 2026.
      </footer>
    </div>
  );
}
