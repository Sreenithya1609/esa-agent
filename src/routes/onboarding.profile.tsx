import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, Lock, Info, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { OnboardingSteps } from "@/components/OnboardingSteps";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({ meta: [{ title: "Create your profile — ESA" }] }),
  component: ProfilePage,
});

const ROLES = ["CEO", "VP", "Director", "Manager", "Analyst", "Researcher", "Consultant", "Other"];
const INDUSTRIES = ["SaaS", "BFSI", "Manufacturing", "Healthcare", "Retail", "E-commerce", "Education", "Real Estate", "Media", "Logistics", "Other"];
const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
  "Singapore", "UAE", "Japan", "Brazil", "Netherlands", "Sweden", "Israel", "South Korea",
  "Indonesia", "Malaysia", "South Africa", "Mexico", "Italy", "Spain", "New Zealand",
];

// Animated typewriter for subtitle
const SUBTITLES = [
  "Tell us a bit about yourself.",
  "We'll personalise ESA for you.",
  "This only takes a moment.",
];

function AnimatedSubtitle() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const full = SUBTITLES[idx];
    if (!deleting) {
      if (displayed.length < full.length) {
        timerRef.current = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 40);
      } else {
        timerRef.current = setTimeout(() => setDeleting(true), 2200);
      }
    } else {
      if (displayed.length > 0) {
        timerRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
      } else {
        setDeleting(false);
        setIdx((i) => (i + 1) % SUBTITLES.length);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [displayed, deleting, idx]);

  return (
    <p className="text-[14px] text-[#4B526B] mt-1 mb-7 h-5">
      {displayed}
      <span className="inline-block w-[1.5px] h-[14px] bg-[#4F6EF7] align-middle ml-0.5 animate-pulse" />
    </p>
  );
}

const inputClass = "w-full h-10 px-3.5 rounded-lg bg-white border border-[#D6DCF0] text-[14px] text-[#0F1117] placeholder:text-[#8A93B0] focus:outline-none focus:border-[#4F6EF7] transition-colors";
const selectClass = inputClass + " appearance-none cursor-pointer";

function Field({ label, required, locked, hint, children }: {
  label: string; required?: boolean; locked?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#0F1117] mb-1.5">
        {label}
        {required && <span className="text-[#DC2626]">*</span>}
        <Info className="w-3.5 h-3.5 text-[#8A93B0]" />
        {locked && <Lock className="w-3 h-3 text-[#8A93B0] ml-auto" />}
      </label>
      {children}
      {hint && <p className="text-[12px] text-[#8A93B0] mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, required, options, defaultValue }: {
  label: string; required?: boolean; options: string[]; defaultValue?: string;
}) {
  return (
    <Field label={label} required={required}>
      <div className="relative">
        <select className={selectClass} defaultValue={defaultValue}>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93B0] pointer-events-none" />
      </div>
    </Field>
  );
}

function ProfilePage() {
  const nav = useNavigate();
  const [role, setRole] = useState("VP");
  const [otherRole, setOtherRole] = useState("");
  const [country, setCountry] = useState("India");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #F7F8FC 0%, #EEF1FA 55%, #F0F4FF 100%)", backgroundAttachment: "fixed" }}
    >
      <OnboardingSteps active={1} />

      <div className="w-full max-w-[520px] bg-white rounded-[20px] border border-[#D6DCF0] p-10 mt-6"
           style={{ boxShadow: "0 20px 64px rgba(79,110,247,0.14), 0 4px 16px rgba(0,0,0,0.08)" }}>

        <h1 className="text-[22px] font-semibold text-[#0F1117]" style={{ fontFamily: "var(--font-display)" }}>
          Create your profile
        </h1>
        <AnimatedSubtitle />

        {/* Photo upload */}
        <div className="flex justify-center mb-6">
          <button className="w-[72px] h-[72px] rounded-full border border-dashed border-[#D6DCF0] flex flex-col items-center justify-center text-[#8A93B0] hover:bg-[#F0F2FA] transition-colors">
            <Camera className="w-5 h-5" />
            <span className="text-[10px] mt-1">Add photo</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <Field label="Full Name" required locked>
            <input className={inputClass} defaultValue="Arjun Mehta" />
          </Field>

          {/* Organization */}
          <Field label="Organization" required locked>
            <input className={inputClass} defaultValue="Acme Corp" />
          </Field>

          {/* Role */}
          <Field label="Role / Designation" required>
            <div className="relative">
              <select
                className={selectClass}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93B0] pointer-events-none" />
            </div>
            {role === "Other" && (
              <input
                className={inputClass + " mt-2"}
                placeholder="Please specify your role"
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
              />
            )}
          </Field>

          {/* Industry */}
          <Field label="Industry" required>
            <div className="relative">
              <select className={selectClass}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93B0] pointer-events-none" />
            </div>
          </Field>

          {/* Country — searchable */}
          <Field label="Country" required>
            <div className="relative">
              <div
                className={inputClass + " flex items-center justify-between cursor-pointer"}
                onClick={() => setCountryOpen(!countryOpen)}
              >
                <span className={country ? "text-[#0F1117]" : "text-[#8A93B0]"}>{country || "Select country"}</span>
                <ChevronDown className="w-4 h-4 text-[#8A93B0]" />
              </div>
              {countryOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#D6DCF0] rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-[#E4E8F4]">
                    <input
                      className="w-full h-8 px-3 text-[13px] bg-[#F7F8FC] border border-[#E4E8F4] rounded-md outline-none focus:border-[#4F6EF7]"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button
                        key={c}
                        className="w-full text-left px-3 py-2 text-[13px] text-[#0F1117] hover:bg-[#F0F2FA] transition-colors"
                        onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                      >
                        {c}
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-2 text-[13px] text-[#8A93B0]">No results</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Field>

          {/* Workspace Name */}
          <Field label="Workspace Name" required hint="This is your team workspace name">
            <input className={inputClass} defaultValue="Acme Strategy Hub" />
          </Field>
        </div>

        <p className="text-[12px] text-[#8A93B0] mt-4">* Required fields</p>

        <button
          onClick={() => nav({ to: "/onboarding/workspace" })}
          className="mt-6 w-full h-11 rounded-lg bg-[#4F6EF7] hover:bg-[#3D5BE8] text-white font-medium text-[14px] transition-colors"
          style={{ boxShadow: "0 0 20px rgba(79,110,247,0.22)" }}
        >
          Create Profile →
        </button>

        <Link to="/login" className="block text-center mt-4 text-[13px] text-[#4B526B] hover:text-[#0F1117]">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
