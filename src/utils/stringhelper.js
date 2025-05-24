// src/utils/stringHelpers.js

export function splitCommaToArray(text) {
  if (!text) return [];
  return text.split(',').map(s => s.trim());
}

export function calculateYearsExperience(startYear){
  const currentYear = new Date().getFullYear();
  const start = parseInt(startYear, 10);

  if (isNaN(start) || start > currentYear) return 0;

  return currentYear - start;
}