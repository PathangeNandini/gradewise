export const gradePoints = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
export const GRADE_ORDER = ["S", "A", "B", "C", "D", "E", "F"];
export const nextGrade = (g) => GRADE_ORDER[(GRADE_ORDER.indexOf(g) + 1) % GRADE_ORDER.length];