import { useState } from "react";
import Navbar from "../components/Navbar";
import SemesterGPA from "../components/SemesterGPA";
import CGPAImprovement from "../components/CGPAImprovement";
import FutureCGPA from "../components/FutureCGPA";
import UploadHistory from "../components/UploadHistory";

const TABS = [
  { id: "sgpa",    label: "Semester GPA" },
  { id: "improve", label: "Grade improvement" },
  { id: "future",  label: "Future CGPA" },
  { id: "upload",  label: "Upload history" },
];

export default function Home() {
  const [active, setActive] = useState("sgpa");

  return (
    <>
      <Navbar />
      <div className="gw-layout">
        <div className="gw-header">
          <div className="gw-tagline">CGPA calculator &amp; predictor for VIT-style grading</div>
        </div>

        <div className="gw-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`gw-tab${active === t.id ? " active" : ""}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {active === "sgpa"    && <SemesterGPA />}
        {active === "improve" && <CGPAImprovement />}
        {active === "future"  && <FutureCGPA />}
        {active === "upload"  && <UploadHistory />}
      </div>
    </>
  );
}