import { useState } from "react";
import SubjectRow from "./SubjectRow";
import { calculateSGPA } from "../utils/calculations";
import { useToast } from "../context/ToastContext";

export default function SemesterGPA() {
  const [subjects, setSubjects] = useState([{ credit: "", grade: "S" }]);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const addSubject = () => setSubjects([...subjects, { credit: "", grade: "S" }]);

  const removeSubject = (i) => {
    if (subjects.length === 1) return;
    setSubjects(subjects.filter((_, idx) => idx !== i));
  };

  const updateSubject = (i, field, value) => {
    const updated = [...subjects];
    updated[i][field] = value;
    setSubjects(updated);
  };

  const handleCalculate = () => {
    const valid = subjects.filter((s) => s.credit !== "");
    if (!valid.length) {
      toast?.push("Add at least one subject with credits.", "error");
      return;
    }
    const res = calculateSGPA(valid);
    setResult(res);
    toast?.push(`GPA calculated: ${res.sgpa}`, "success");
  };

  return (
    <div className="animate-fadeIn">
      <p className="gw-section-title">Subjects this semester</p>

      {subjects.map((s, i) => (
        <SubjectRow
          key={i}
          subject={s}
          index={i}
          updateSubject={updateSubject}
          onRemove={removeSubject}
        />
      ))}

      <div className="gw-action-row">
        <button className="gw-btn-ghost" onClick={addSubject}>+ Add subject</button>
        <button className="gw-btn-primary" onClick={handleCalculate}>Calculate GPA</button>
      </div>

      {result && (
        <div className="gw-result">
          <div className="gw-result-label">Semester GPA</div>
          <div className="gw-result-number">{result.sgpa}</div>
          <div className="gw-result-meta-row">
            <div className="gw-result-meta">Total credits <span>{result.totalCredits}</span></div>
            <div className="gw-result-meta">Total grade points <span>{result.totalPoints}</span></div>
            <div className="gw-result-meta">Subjects <span>{subjects.filter(s=>s.credit).length}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}