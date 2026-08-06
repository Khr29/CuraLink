// Mirrors admin/src/utils/experience.js — displays whatever is stored for a
// doctor's years of experience with correct singular/plural formatting.
// Handles both the new free-form values and legacy "N Year" (always singular)
// strings from before this was fixed, without requiring any backend change.

export const parseExperienceYears = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const match = String(value).match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const n = parseFloat(match[0])
  return Number.isFinite(n) ? n : null
}

export const formatExperience = (value) => {
  const years = parseExperienceYears(value)
  if (years === null) return value ?? ''
  return `${years} Year${years === 1 ? '' : 's'}`
}
