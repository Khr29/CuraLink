// Root cause of the "AVAILABLE TODAY but no slots" bug: slot generation
// (utils/slotGenerator.js), the availability API (scheduleController.js),
// and booking (userController.js) all computed "today"/"now" with plain
// `new Date()` + its local getters (getFullYear/getDate/getHours/...).
// Those are read in whatever timezone the Node PROCESS happens to be
// running in — which is the server's OS/container timezone, not India's.
// Patients are always in IST. If the backend host's timezone isn't IST
// (the common case on most hosting), the calendar day/time the backend
// computes as "today"/"now" silently disagrees with the day the frontend
// requested, so the slot map it builds is keyed to the wrong date (or
// filters out slots that haven't actually passed yet, or keeps ones that
// have) — producing exactly "no slots for today" while every other part
// of the UI still shows the doctor as available.
//
// India has a single fixed UTC+5:30 offset (no DST), so the fix isn't a
// random +/- hours patch — it's shifting the current instant by that fixed
// offset and then reading it back through the *UTC* accessors (which are
// never affected by host timezone), so the resulting year/month/date/day/
// hour/minute values are always India's true wall-clock values regardless
// of where the process runs. Every date built for this pipeline must be
// constructed the same way (via istCalendarDate, using Date.UTC) so
// comparisons between "now" and "the requested date" stay apples-to-apples.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// The current instant, shifted so its UTC-labelled fields equal India wall-
// clock time. Callers must read it with getUTCFullYear/getUTCMonth/
// getUTCDate/getUTCDay/getUTCHours/getUTCMinutes — the local getters on
// this object are meaningless (they'd re-apply the host's own timezone on
// top of the shift).
export const nowIST = () => new Date(Date.now() + IST_OFFSET_MS);

// A calendar-only "midnight IST" Date for the given Y/M(0-indexed)/D, built
// the same UTC-anchored way so it compares correctly (via plain <, >, ===)
// against nowIST() and other istCalendarDate() values. Date.UTC() also
// normalizes out-of-range components correctly (e.g. date 32 rolls into
// next month), so callers can freely do istCalendarDate(y, m, d + n).
export const istCalendarDate = (year, month, date) => new Date(Date.UTC(year, month, date));
