// Shared helper for displaying/storing "years of experience" consistently.
// Historically the value was stored as a free string like "10 Year" (always
// singular, capped at 10 by the old dropdown). We keep the stored format
// backend-compatible ("<N> Year" / "<N> Years") but fix the pluralization
// and remove the artificial 10-year cap wherever the value is read or written.

// Pulls the leading integer out of a stored value, whether it's already a
// number, a clean "N Year(s)" string, or a legacy malformed string.
export const parseExperienceYears = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const match = String(value).match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const n = parseFloat(match[0])
  return Number.isFinite(n) ? n : null
}

// Formats a number of years into the correct singular/plural stored string,
// e.g. 1 -> "1 Year", 2 -> "2 Years", 12 -> "12 Years".
export const formatExperienceYears = (years) => {
  const n = Number(years)
  if (!Number.isFinite(n)) return ''
  return `${n} Year${n === 1 ? '' : 's'}`
}

// Formats whatever is currently stored (number OR legacy "N Year" string)
// into correct display text. Falls back to the raw value if unparseable,
// so unexpected legacy data never disappears from the UI.
export const formatExperience = (value) => {
  const years = parseExperienceYears(value)
  if (years === null) return value ?? ''
  return formatExperienceYears(years)
}
