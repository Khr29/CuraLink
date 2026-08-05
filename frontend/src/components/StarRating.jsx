import React from "react";

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const SIZES = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

// Read-only star display (supports partial fill, e.g. 4.6) or an
// interactive 1-5 picker when `interactive` is passed (used by ReviewForm).
const StarRating = ({ rating = 0, size = "md", interactive = false, value = 0, onChange }) => {
  const sizeClass = SIZES[size] || SIZES.md;

  if (interactive) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i)}
            className="focus:outline-none"
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
          >
            <svg
              className={`${sizeClass === SIZES.sm ? "w-6 h-6" : "w-8 h-8"} ${
                i <= value ? "text-yellow-400" : "text-slate-200"
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        ))}
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(5, rating || 0));
  const fillPercent = (clamped / 5) * 100;

  return (
    // Note: no width class here — the wrapper must size itself to the
    // background star row's natural width (5 stars + gaps), not a single
    // star's width, otherwise the absolute-positioned filled overlay below
    // (which clips via `inset-0` + a % width relative to this wrapper)
    // collapses to one star wide and the sibling rating text overlaps it.
    <span className="relative inline-flex" style={{ lineHeight: 0 }}>
      {/* Empty stars (background) */}
      <span className="flex gap-0.5 text-slate-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className={sizeClass} fill="currentColor" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
        ))}
      </span>
      {/* Filled stars (clipped overlay) */}
      <span
        className="absolute inset-0 flex gap-0.5 text-yellow-400 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className={`${sizeClass} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
        ))}
      </span>
    </span>
  );
};

export default StarRating;
