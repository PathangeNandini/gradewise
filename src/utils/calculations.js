import { gradePoints } from "./gradePoints";

export const calculateSGPA = (subjects) => {
  let totalCredits = 0;
  let totalPoints = 0;
  subjects.forEach((s) => {
    totalCredits += Number(s.credit);
    totalPoints += Number(s.credit) * gradePoints[s.grade];
  });
  return {
    sgpa: (totalPoints / totalCredits).toFixed(4),
    totalCredits,
    totalPoints,
  };
};

export const calculateNewCGPA = (currentCGPA, completedSems, semesters) => {
  let total = currentCGPA * completedSems;
  semesters.forEach((sem) => {
    total -= Number(sem.oldGPA);
    total += Number(sem.newGPA);
  });
  return (total / completedSems).toFixed(4);
};

export const predictFutureCGPA = (currentCGPA, completedSems, futureGPAs) => {
  let total = currentCGPA * completedSems;
  futureGPAs.forEach((gpa) => { total += Number(gpa); });
  return (total / (completedSems + futureGPAs.length)).toFixed(4);
};

export const guessCredits = (courseCode) => {
  const CREDIT_MAP = {
    CSE: 4, MAT: 4, PHY: 4, CHY: 4, BIO: 4,
    MEE: 4, EEE: 4, ECE: 4, ECS: 2, HUM: 3,
    ENG: 3, MGT: 2, EVE: 2, NCC: 2, NSS: 2,
    PHE: 2, STS: 3, FRL: 2, EXC: 2,
  };
  const prefix = courseCode.replace(/[0-9]/g, "").toUpperCase();
  return CREDIT_MAP[prefix] || 3;
};

/**
 * Parses VTOP grade history format:
 * "1  CSE1012  Problem Solving using Python  ETL  4.0  A  Jan-2024  29-Mar-2024  UC"
 * Also handles plain format: "CSE1012 Problem Solving A"
 */
export const parseGradeHistory = (raw) => {
  const VALID_GRADES = new Set(Object.keys(gradePoints));
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const parsed = [];

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;

    let gradeIdx = -1;
    let courseCodeIdx = -1;
    let credits = null;

    for (let i = 0; i < parts.length; i++) {
      if (courseCodeIdx === -1 && /^[A-Z]{2,4}\d{3,4}$/i.test(parts[i])) {
        courseCodeIdx = i;
      }
      if (/^\d+\.\d+$/.test(parts[i])) {
        credits = parseFloat(parts[i]);
        for (let j = i + 1; j < parts.length; j++) {
          if (VALID_GRADES.has(parts[j].toUpperCase())) {
            gradeIdx = j;
            break;
          }
        }
        if (gradeIdx !== -1) break;
      }
    }

    if (gradeIdx === -1) {
      for (let i = parts.length - 1; i >= 0; i--) {
        if (VALID_GRADES.has(parts[i].toUpperCase())) {
          gradeIdx = i;
          break;
        }
      }
    }

    if (gradeIdx === -1 || courseCodeIdx === -1) continue;

    const grade = parts[gradeIdx].toUpperCase();
    const code = parts[courseCodeIdx].toUpperCase();

    const TYPE_TOKENS = new Set(["ETL", "TH", "PJT", "ETP", "NCC", "LO", "THL"]);
    let nameEnd = gradeIdx;
    for (let i = courseCodeIdx + 1; i < gradeIdx; i++) {
      if (TYPE_TOKENS.has(parts[i].toUpperCase())) { nameEnd = i; break; }
    }
    const name = parts.slice(courseCodeIdx + 1, nameEnd).join(" ") || code;
    const finalCredits = credits || guessCredits(code);

    parsed.push({ code, name, grade, credits: finalCredits });
  }

  return parsed;
};