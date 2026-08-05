// Formats a date as a relative "N units ago" string (e.g. "3 days ago").
// Shared by any component that displays review/appointment timestamps.
const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secondsInUnit] of units) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${name}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

export default timeAgo;
