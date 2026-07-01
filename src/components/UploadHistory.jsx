import { useState, useMemo } from "react";
import { parseGradeHistory, calculateSGPA } from "../utils/calculations";
import { gradePoints } from "../utils/gradePoints";
import { useToast } from "../context/ToastContext";

const GRADE_ORDER = ["S", "A", "B", "C", "D", "E", "F"];
const nextGrade = (g) => GRADE_ORDER[(GRADE_ORDER.indexOf(g) + 1) % GRADE_ORDER.length];

export default function UploadHistory() {
  const [text, setText] = useState("");
  const [subjects, setSubjects] = useState(null);
  const [original, setOriginal] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handle = () => {
    if (!text.trim()) {
      toast?.push("Paste your grade history first.", "error");
      return;
    }
    setError("");
    setSubjects(null);
    setOriginal(null);
    setLoading(true);

    // small delay so the skeleton is visible — feels like real parsing work
    setTimeout(() => {
      const parsed = parseGradeHistory(text);
      setLoading(false);
      if (!parsed.length) {
        setError("Could not detect any grades. Make sure you copied the full table from VTOP — each row must contain a course code (e.g. CSE1012) and a grade (S/A/B/C/D/E/F).");
        return;
      }
      const gradable = parsed.filter((p) => gradePoints.hasOwnProperty(p.grade));
      setSubjects(gradable.map((p) => ({ ...p })));
      setOriginal(gradable.map((p) => ({ ...p })));
      toast?.push(`${gradable.length} subjects loaded successfully!`, "success");
    }, 350);
  };

  const cycleGrade = (idx) => {
    setSubjects((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], grade: nextGrade(next[idx].grade) };
      return next;
    });
  };

  const resetGrades = () => {
    setSubjects(original.map((p) => ({ ...p })));
    toast?.push("All grades reset to original.", "info");
  };

  const stats = useMemo(() => {
    if (!subjects) return null;
    return calculateSGPA(subjects.map((s) => ({ credit: s.credits, grade: s.grade })));
  }, [subjects]);

  const origStats = useMemo(() => {
    if (!original) return null;
    return calculateSGPA(original.map((s) => ({ credit: s.credits, grade: s.grade })));
  }, [original]);

  const changed = useMemo(() => {
    if (!subjects || !original) return [];
    return subjects
      .map((s, i) => ({ ...s, origGrade: original[i].grade, idx: i }))
      .filter((s) => s.grade !== s.origGrade);
  }, [subjects, original]);

  const filtered = useMemo(() => {
    if (!subjects) return [];
    const q = search.trim().toLowerCase();
    if (!q) return subjects.map((s, i) => ({ ...s, idx: i }));
    return subjects
      .map((s, i) => ({ ...s, idx: i }))
      .filter((s) =>
        s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
  }, [subjects, search]);

  const diff = stats && origStats
    ? (parseFloat(stats.sgpa) - parseFloat(origStats.sgpa)).toFixed(4)
    : null;

  return (
    <div className="animate-fadeIn">
      <div className="gw-info-card">
        Copy your grade history directly from VTOP — full rows with course code, name, type, credits, grade, and dates. Paste it all here as-is.
      </div>

      <label className="gw-label">Paste from VTOP</label>
      <textarea
        className="gw-textarea"
        value={text}
        onChange={(e) => { setText(e.target.value); setSubjects(null); setOriginal(null); setError(""); }}
        placeholder={`1  CSE1012  Problem Solving using Python  ETL  4.0  A  Jan-2024  29-Mar-2024  UC\n2  ECE1002  Fundamentals of Electrical...  ETL  4.0  S  Jan-2024  29-Mar-2024  UC\n...`}
      />

      <div className="gw-action-row">
        <button className="gw-btn-primary" onClick={handle} disabled={loading}>
          {loading ? "Extracting…" : "Extract grades & calculate"}
        </button>
        <button className="gw-btn-ghost" onClick={() => { setText(""); setSubjects(null); setOriginal(null); setError(""); setSearch(""); }}>Clear</button>
      </div>

      {error && (
        <div className="gw-info-card" style={{ marginTop: "14px", borderColor: "rgba(239,68,68,0.3)", background: "var(--danger-dim)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: "20px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <div className="gw-skeleton gw-skeleton-box" />
              <div style={{ flex: 1 }}>
                <div className="gw-skeleton gw-skeleton-line" style={{ width: "70%", marginBottom: "6px" }} />
                <div className="gw-skeleton gw-skeleton-line" style={{ width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {subjects && stats && !loading && (
        <>
          <div className="gw-result">
            <div className="gw-result-label">
              {changed.length > 0 ? "Simulated CGPA" : `Overall CGPA (${subjects.length} subjects)`}
            </div>
            <div className="gw-result-number">{stats.sgpa}</div>

            {changed.length > 0 && diff !== null && (
              <div className={parseFloat(diff) >= 0 ? "gw-badge-up" : "gw-badge-down"}>
                {parseFloat(diff) >= 0 ? "↑ +" : "↓ "}{diff} &nbsp;·&nbsp; was {origStats.sgpa}
              </div>
            )}

            <div className="gw-result-meta-row">
              <div className="gw-result-meta">Subjects <span>{subjects.length}</span></div>
              <div className="gw-result-meta">Credits <span>{stats.totalCredits}</span></div>
              <div className="gw-result-meta">Grade points <span>{stats.totalPoints}</span></div>
              {changed.length > 0 && (
                <div className="gw-result-meta">Changed <span>{changed.length} subject{changed.length > 1 ? "s" : ""}</span></div>
              )}
            </div>
          </div>

          {changed.length > 0 && (
            <div className="gw-info-card" style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px", fontSize: "13px" }}>
                  Grade changes
                </div>
                {changed.map((s) => (
                  <div key={s.idx} style={{ fontSize: "13px", marginBottom: "3px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{s.code}</span>
                    &nbsp;
                    <span className={`gb gb-${s.origGrade}`} style={{ width: "22px", height: "22px", fontSize: "11px" }}>{s.origGrade}</span>
                    &nbsp;→&nbsp;
                    <span className={`gb gb-${s.grade}`} style={{ width: "22px", height: "22px", fontSize: "11px" }}>{s.grade}</span>
                  </div>
                ))}
              </div>
              <button className="gw-btn-ghost" style={{ fontSize: "12px", padding: "5px 10px", whiteSpace: "nowrap", flexShrink: 0 }}
                onClick={resetGrades}>Reset all</button>
            </div>
          )}

          <div className="gw-search-wrap">
            <span className="gw-search-icon">⌕</span>
            <input
              type="text"
              className="gw-search-input"
              placeholder="Search by subject name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="gw-search-clear" onClick={() => setSearch("")}>×</button>
            )}
          </div>

          {search && (
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "8px" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
            </div>
          )}

          <div className="gw-hint">
            💡 Click any grade badge to simulate a better grade — CGPA updates live.
          </div>

          {filtered.length === 0 ? (
            <div className="gw-empty">
              <div className="gw-empty-icon">🔍</div>
              <p className="gw-empty-title">No subjects match "{search}"</p>
              <p className="gw-empty-desc">Try a different course code or name.</p>
            </div>
          ) : (
            <div className="gw-table-wrap">
              <table className="gw-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Course</th>
                    <th>Crd</th>
                    <th>Grade</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const isChanged = original[p.idx].grade !== p.grade;
                    return (
                      <tr key={p.idx} className={isChanged ? "row-changed" : ""}>
                        <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>{p.idx + 1}</td>
                        <td className="gw-code">{p.code}</td>
                        <td style={isChanged ? { color: "var(--gw-purple-light)", fontWeight: 600 } : {}}>{p.name}</td>
                        <td>{p.credits}</td>
                        <td>
                          <button className={`gb gb-${p.grade}`} onClick={() => cycleGrade(p.idx)} title="Click to cycle grade">
                            {p.grade}
                          </button>
                          {isChanged && (
                            <span style={{ marginLeft: "5px", fontSize: "11px", color: "var(--text-disabled)" }}>
                              was {original[p.idx].grade}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{(p.credits * gradePoints[p.grade]).toFixed(0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}