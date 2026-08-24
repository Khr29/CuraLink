import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";

// Animated 5→1 star breakdown bars, used on Doctor/Hospital profile pages.
// `distribution` is a { 5: n, 4: n, 3: n, 2: n, 1: n } count map.
const RatingDistribution = ({ distribution, total = 0, averageRating = 0 }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [distribution]);

  const counts = distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const safeTotal = total || Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
      {/* Average summary */}
      <div className="flex flex-col items-center flex-shrink-0 sm:w-32">
        <p className="text-4xl font-extrabold text-text-primary leading-none">
          {safeTotal > 0 ? averageRating.toFixed(1) : "New"}
        </p>
        <div className="mt-2">
          <StarRating rating={averageRating} />
        </div>
        <p className="text-xs text-text-muted mt-1.5">
          {safeTotal} review{safeTotal === 1 ? "" : "s"}
        </p>
      </div>

      {/* Bars */}
      <div className="flex-1 w-full flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = counts[star] || 0;
          const percent = safeTotal > 0 ? (count / safeTotal) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-text-muted w-8 flex-shrink-0">
                {star} ★
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: animate ? `${percent}%` : "0%",
                    background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                    transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                    transitionDelay: `${(5 - star) * 0.08}s`,
                  }}
                />
              </div>
              <span className="text-xs text-text-muted w-6 flex-shrink-0 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistribution;
