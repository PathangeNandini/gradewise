import { useState } from "react";
import { predictFutureCGPA } from "../utils/calculations";
import { useToast } from "../context/ToastContext";

const MAX_SEMS = 8;

export default function FutureCGPA() {
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [completedSems, setCompletedSems] = useState("");
  const [rows, setRows] = useState([]);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleCompletedSems = (val) => {
    setCompletedSems(val);
    setResult(null);
    const done = Number(val);
    if (done >= 1 && done < MAX_SEMS) {
      const future = [];
      for (let i = done + 1; i <= MAX_SEMS; i++) {
        future.push({ sem: String(i), gpa: "" });
      }
      setRows(future);
    } else {
      setRows([]);
    }
  };

  const updateRow = (i, value) => {
    const updated = [...rows];
    updated[i].gpa = value;
    setRows(updated);
  };

  const calculate = () => {
    if (!currentCGPA || !completedSems) {
      toast?.push("Enter your current CGPA and semesters completed.", "error");
      return;
    }
    const valid = rows.filter((r) => r.gpa);
    if (!valid.length) {
      toast?.push("Enter at least one expected GPA.", "error");
      return;
    }
    const predicted = predictFutureCGPA(
      Number(currentCGPA),
      Number(completedSems),
      valid.map((r) => r.gpa)
    );
    const diff = (predicted - Number(currentCGPA)).toFixed(4);
    setResult({ predicted, diff, added: valid.length });
    toast?.push(`Predicted CGPA: ${predicted}`, "success");
  };

  const remaining = MAX_SEMS - Number(completedSems || 0);

  return (
    <div className="animate-fadeIn">
      <div className="gw-row">
        <input type="number" placeholder="Current CGPA" step="0.0001" min="0" max="10"
          value={currentCGPA} onChange={(e) => { setCurrentCGPA(e.target.value); setResult(null); }} />
        <input type="number" placeholder="Completed semesters (1–7)" min="1" max="7"
          value={completedSems} onChange={(e) => handleCompletedSems(e.target.value)} />
      </div>

      {completedSems && Number(completedSems) >= MAX_SEMS && (
        <div className="gw-info-card" style={{ borderColor: "rgba(239,68,68,0.3)", background: "var(--danger-dim)", color: "var(--danger)" }}>
          You've already completed all {MAX_SEMS} semesters. Use the Semester GPA tab to view your final GPA.
        </div>
      )}

      {rows.length > 0 && (
        <>
          <p className="gw-section-title">
            Expected GPA for remaining {remaining} semester{remaining > 1 ? "s" : ""}
          </p>
          {rows.map((r, i) => (
            <div key={i} className="gw-future-row">
              <label>Sem {r.sem}</label>
              <input type="number" placeholder="Expected GPA (leave blank to skip)"
                step="0.01" min="0" max="10"
                value={r.gpa} onChange={(e) => updateRow(i, e.target.value)} />
            </div>
          ))}
          <div className="gw-action-row">
            <button className="gw-btn-primary" onClick={calculate}>Predict final CGPA</button>
          </div>
        </>
      )}

      {result && (
        <div className="gw-result">
          <div className="gw-result-label">
            Predicted final CGPA (after {result.added} more sem{result.added > 1 ? "s" : ""})
          </div>
          <div className="gw-result-number">{result.predicted}</div>
          <div className={Number(result.diff) >= 0 ? "gw-badge-up" : "gw-badge-down"}>
            {Number(result.diff) >= 0 ? "↑ +" : "↓ "}{result.diff} from current
          </div>
          <div className="gw-result-meta-row">
            <div className="gw-result-meta">Current CGPA <span>{currentCGPA}</span></div>
            <div className="gw-result-meta">Completed sems <span>{completedSems}</span></div>
            <div className="gw-result-meta">Sems predicted <span>{result.added}</span></div>
            <div className="gw-result-meta">Total sems <span>{MAX_SEMS}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}