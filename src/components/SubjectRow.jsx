const GRADES = ["S", "A", "B", "C", "D", "E", "F"];

export default function SubjectRow({ subject, index, updateSubject, onRemove }) {
  return (
    <div className="gw-row">
      <input
        className="gw-fixed-80"
        type="number"
        placeholder="Credits"
        value={subject.credit}
        onChange={(e) => updateSubject(index, "credit", e.target.value)}
      />
      <select
        className="gw-fixed-90"
        value={subject.grade}
        onChange={(e) => updateSubject(index, "grade", e.target.value)}
      >
        {GRADES.map((g) => <option key={g}>{g}</option>)}
      </select>
      <button className="gw-btn-icon" onClick={() => onRemove(index)} aria-label="Remove subject">
        ×
      </button>
    </div>
  );
}