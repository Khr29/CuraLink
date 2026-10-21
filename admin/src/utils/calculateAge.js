// Age in whole years from a date of birth, or null when there is nothing
// usable to compute it from: missing, still the user model's default
// ("Not Selected"), unparseable, or in the future. Callers render "—" for
// null instead of "NaN".
export const calculateAge = (dob, today = new Date()) => {
  if (!dob || dob === "Not Selected") return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};
