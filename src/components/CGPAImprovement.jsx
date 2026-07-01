import { useState } from "react";
import { gradePoints } from "../utils/gradePoints";
import { calculateSGPA } from "../utils/calculations";
import { useToast } from "../context/ToastContext";

const GRADES = ["S", "A", "B", "C", "D", "E", "F"];

const newSem = () => ({
  gpa: "",
  credits: "",
  useCalculator: false,
  calcSubjects: [{ credit: "", grade: "S" }],
  calcResult: null,
  subjects: [{ credit: "", oldGrade: "C", newGrade: "A" }],
});

export default function CGPAImprovement() {
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [completedSems, setCompletedSems] = useState("");
  const [semesters, setSemesters] = useState([newSem()]);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const update = (fn) => setSemesters((prev) => { const next = JSON.parse(JSON.stringify(prev)); fn(next); return next; });

  const addSem = () => setSemesters((p) => [...p, newSem()]);
  const removeSem = (si) => setSemesters((p) => p.filter((_, i) => i !== si));

  const addCalcSubject = (si) => update((s) => s[si].calcSubjects.push({ credit: "", grade: "S" }));
  const removeCalcSubject = (si, subi) => update((s) => {
    if (s[si].calcSubjects.length > 1) s[si].calcSubjects.splice(subi, 1);
  });
  const updateCalcSubject = (si, subi, field, val) => update((s) => { s[si].calcSubjects[subi][field] = val; });
  const calcSemGPA = (si) => {
    const sem = semesters[si];
    const valid = sem.calcSubjects.filter((s) => s.credit);
    if (!valid.length) return;
    const res = calculateSGPA(valid);
    update((s) => {
      s[si].calcResult = res;
      s[si].gpa = res.sgpa;
      s[si].credits = String(res.totalCredits);
    });
    toast?.push(`Sem ${si + 1} GPA: ${res.sgpa}`, "success");
  };

  const addSubject = (si) => update((s) => s[si].subjects.push({ credit: "", oldGrade: "C", newGrade: "A" }));
  const removeSubject = (si, subi) => update((s) => { if (s[si].subjects.length > 1) s[si].subjects.splice(subi, 1); });
  const updateSubject = (si, subi, field, val) => update((s) => { s[si].subjects[subi][field] = val; });

  const calculate = () => {
    if (!currentCGPA || !completedSems) {
      toast?.push("Enter current CGPA and completed semesters.", "error");
      return;
    }
    let total = Number(currentCGPA) * Number(completedSems);
    const details = [];
    for (const sem of semesters) {
      if (!sem.gpa || !sem.credits) {
        toast?.push("Fill in GPA and credits for all semesters.", "error");
        return;
      }
      const oldGPA = Number(sem.gpa);
      const credits = Number(sem.credits);
      let pts = oldGPA * credits;
      sem.subjects.forEach((sub) => {
        if (!sub.credit) return;
        pts -= Number(sub.credit) * gradePoints[sub.oldGrade];
        pts += Number(sub.credit) * gradePoints[sub.newGrade];
      });
      const newGPA = pts / credits;
      total = total - oldGPA + newGPA;
      details.push({ oldGPA: oldGPA.toFixed(4), newGPA: newGPA.toFixed(4) });
    }
    const newCGPA = (total / Number(completedSems)).toFixed(4);
    const diff = (newCGPA - Number(currentCGPA)).toFixed(4);
    setResult({ newCGPA, diff, details });
    toast?.push("New CGPA calculated!", "success");
  };

  return (
    <div className="animate-fadeIn">
      <div className="gw-row">
        <input type="number" placeholder="Current CGPA (e.g. 7.76)" step="0.0001"
          value={currentCGPA} onChange={(e) => setCurrentCGPA(e.target.value)} />
        <input type="number" placeholder="Completed semesters" min="1" max="8"
          value={completedSems} onChange={(e) => setCompletedSems(e.target.value)} />
      </div>

      <p className="gw-section-title">Semesters to improve</p>

      {semesters.map((sem, si) => (
        <div key={si} className="gw-sem-block">
          <div className="gw-sem-header">
            <span className="gw-sem-title">Semester {si + 1}</span>
            {semesters.length > 1 && (
              <button className="gw-btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}
                onClick={() => removeSem(si)}>Remove</button>
            )}
          </div>

          <div className="toggle-pills">
            <button
              className={`toggle-pill${!sem.useCalculator ? " active" : ""}`}
              onClick={() => update((s) => { s[si].useCalculator = false; })}>
              I know the GPA
            </button>
            <button
              className={`toggle-pill${sem.useCalculator ? " active" : ""}`}
              onClick={() => update((s) => { s[si].useCalculator = true; })}>
              Calculate GPA first
            </button>
          </div>

          {!sem.useCalculator ? (
            <div className="gw-row">
              <input type="number" placeholder="Semester GPA" step="0.0001"
                value={sem.gpa} onChange={(e) => update((s) => { s[si].gpa = e.target.value; })} />
              <input type="number" placeholder="Semester credits"
                value={sem.credits} onChange={(e) => update((s) => { s[si].credits = e.target.value; })} />
            </div>
          ) : (
            <div className="gw-sem-block" style={{ background: "var(--bg-elevated)", marginBottom: "10px" }}>
              <p className="gw-label">Add your subjects to calculate this sem's GPA</p>
              {sem.calcSubjects.map((sub, subi) => (
                <div key={subi} className="gw-row">
                  <input className="gw-fixed-80" type="number" placeholder="Credits"
                    value={sub.credit}
                    onChange={(e) => updateCalcSubject(si, subi, "credit", e.target.value)} />
                  <select className="gw-fixed-90" value={sub.grade}
                    onChange={(e) => updateCalcSubject(si, subi, "grade", e.target.value)}>
                    {GRADES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <button className="gw-btn-icon" onClick={() => removeCalcSubject(si, subi)}>×</button>
                </div>
              ))}
              <div className="gw-action-row" style={{ marginTop: "8px" }}>
                <button className="gw-btn-ghost" style={{ fontSize: "12px", padding: "5px 12px" }}
                  onClick={() => addCalcSubject(si)}>+ Add subject</button>
                <button className="gw-btn-primary" style={{ fontSize: "12px", padding: "5px 12px" }}
                  onClick={() => calcSemGPA(si)}>Calculate GPA</button>
              </div>
              {sem.calcResult && (
                <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "var(--r-md)", background: "var(--brand-dim)", border: "1.5px solid var(--border-brand)" }}>
                  <span style={{ fontSize: "13px", color: "var(--gw-purple-light)" }}>
                    GPA: <strong style={{ color: "var(--text-primary)", fontSize: "16px" }}>{sem.calcResult.sgpa}</strong>
                    &nbsp;·&nbsp; Credits: <strong>{sem.calcResult.totalCredits}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="gw-label" style={{ marginTop: "8px" }}>
            Subjects to improve (old → new grade)
          </p>
          {sem.subjects.map((sub, subi) => (
            <div key={subi} className="gw-row">
              <input className="gw-fixed-80" type="number" placeholder="Credits"
                value={sub.credit}
                onChange={(e) => updateSubject(si, subi, "credit", e.target.value)} />
              <select className="gw-fixed-90" value={sub.oldGrade}
                onChange={(e) => updateSubject(si, subi, "oldGrade", e.target.value)}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <span className="gw-arrow">→</span>
              <select className="gw-fixed-90" value={sub.newGrade}
                onChange={(e) => updateSubject(si, subi, "newGrade", e.target.value)}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
              <button className="gw-btn-icon" onClick={() => removeSubject(si, subi)}>×</button>
            </div>
          ))}
          <button className="gw-btn-ghost"
            style={{ marginTop: "4px", padding: "6px 12px", fontSize: "13px" }}
            onClick={() => addSubject(si)}>+ Add subject</button>
        </div>
      ))}

      <div className="gw-action-row">
        <button className="gw-btn-ghost" onClick={addSem}>+ Add semester</button>
        <button className="gw-btn-primary" onClick={calculate}>Calculate new CGPA</button>
      </div>

      {result && (
        <div className="gw-result">
          <div className="gw-result-label">New CGPA</div>
          <div className="gw-result-number">{result.newCGPA}</div>
          <div className={Number(result.diff) >= 0 ? "gw-badge-up" : "gw-badge-down"}>
            {Number(result.diff) >= 0 ? "↑ +" : "↓ "}{result.diff} from {currentCGPA}
          </div>
          <div className="gw-result-meta-row">
            {result.details.map((d, i) => (
              <div key={i} className="gw-result-meta">
                Sem {i + 1} <span>{d.oldGPA} → {d.newGPA}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}