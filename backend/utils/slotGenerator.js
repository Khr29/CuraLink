// Pure slot-computation logic shared between the schedule endpoints
// (backend/controllers/scheduleController.js) and appointment booking
// (backend/controllers/userController.js) — one source of truth for
// "what times can this doctor be booked at on this date."
//
// Every Date here is IST-calendar-anchored via istCalendarDate/nowIST (see
// utils/istTime.js) and read back with the UTC accessors — never the local
// ones — so slot generation is correct regardless of the host server's own
// timezone. Mixing local and UTC accessors on these dates would silently
// reintroduce the bug this fixes.
import { istCalendarDate, nowIST } from "./istTime.js";

// slotDate is this codebase's "D_M_YYYY" convention (no leading zeros).
export const parseSlotDate = (slotDate) => {
  if (typeof slotDate !== "string") return null;
  const parts = slotDate.split("_");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  const date = istCalendarDate(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Accepts both legacy locale-formatted "10:00 AM" (everything booked before
// this module existed) and the canonical 24h "HH:mm" this module generates
// going forward — so slots_booked entries in either format are recognized.
export const parseSlotTime = (slotTime) => {
  if (typeof slotTime !== "string") return null;
  const trimmed = slotTime.trim();
  let match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return { hour, minute };
  }
  match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match) return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
  return null;
};

const pad2 = (n) => String(n).padStart(2, "0");
const toHHmm = ({ hour, minute }) => `${pad2(hour)}:${pad2(minute)}`;
const toMinutes = ({ hour, minute }) => hour * 60 + minute;

// Every doctor has zero schedule documents on the day this feature ships —
// this fallback replicates the exact hardcoded window the frontend used to
// generate client-side (10:00-21:00, 30-minute steps, every day), so
// booking behaves identically for any doctor until someone explicitly
// configures a real schedule. This is the load-bearing backward-compat path.
const LEGACY_FALLBACK_SCHEDULE = {
  weeklyPattern: Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isWorking: true,
    shifts: [{ startTime: "10:00", endTime: "21:00" }],
    breaks: [],
  })),
  slotDurationMinutes: 30,
  unavailableDates: [],
};

/**
 * @param {object|null} scheduleDoc - a doctorScheduleModel document (or plain object), or null/undefined to use the legacy fallback
 * @param {Date} dateObj - the calendar date to generate slots for (IST-anchored — see istCalendarDate)
 * @param {string[]} bookedTimesForDate - raw slots_booked[dateKey] values (legacy or canonical format)
 * @param {Date} [now] - injectable for testing; defaults to the current IST instant (nowIST())
 * @returns {string[]} canonical "HH:mm" slot times, already excluding booked/past/break times
 */
export function computeAvailableSlots(scheduleDoc, dateObj, bookedTimesForDate = [], now = nowIST()) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return [];

  const schedule = scheduleDoc || LEGACY_FALLBACK_SCHEDULE;
  const dateISO = `${dateObj.getUTCFullYear()}-${pad2(dateObj.getUTCMonth() + 1)}-${pad2(dateObj.getUTCDate())}`;
  if (schedule.unavailableDates?.includes(dateISO)) return [];

  const dayOfWeek = dateObj.getUTCDay();
  const dayPattern = (schedule.weeklyPattern || []).find((p) => p.dayOfWeek === dayOfWeek);
  if (!dayPattern || dayPattern.isWorking === false) return [];

  const slotDuration = schedule.slotDurationMinutes || 30;

  const breakWindows = (dayPattern.breaks || [])
    .map((b) => {
      const start = parseSlotTime(b.startTime);
      const end = parseSlotTime(b.endTime);
      return start && end ? { start: toMinutes(start), end: toMinutes(end) } : null;
    })
    .filter(Boolean);

  const bookedSet = new Set(
    (bookedTimesForDate || [])
      .map((t) => {
        const parsed = parseSlotTime(t);
        return parsed ? toHHmm(parsed) : null;
      })
      .filter(Boolean)
  );

  const isToday =
    dateObj.getUTCFullYear() === now.getUTCFullYear() &&
    dateObj.getUTCMonth() === now.getUTCMonth() &&
    dateObj.getUTCDate() === now.getUTCDate();
  const nowMinutes = toMinutes({ hour: now.getUTCHours(), minute: now.getUTCMinutes() });

  const slots = [];
  for (const shift of dayPattern.shifts || []) {
    const shiftStart = parseSlotTime(shift.startTime);
    const shiftEnd = parseSlotTime(shift.endTime);
    if (!shiftStart || !shiftEnd) continue;

    const shiftEndMinutes = toMinutes(shiftEnd);
    for (let cursor = toMinutes(shiftStart); cursor + slotDuration <= shiftEndMinutes; cursor += slotDuration) {
      const overlapsBreak = breakWindows.some((b) => cursor < b.end && cursor + slotDuration > b.start);
      if (overlapsBreak) continue;
      if (isToday && cursor <= nowMinutes) continue;

      const hhmm = toHHmm({ hour: Math.floor(cursor / 60), minute: cursor % 60 });
      if (!bookedSet.has(hhmm)) slots.push(hhmm);
    }
  }

  return slots;
}
