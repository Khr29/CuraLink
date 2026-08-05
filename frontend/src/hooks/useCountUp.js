import { useEffect, useState } from "react";

// Animates a number from 0 up to `target` once `active` becomes true.
// Shared by the hero stats grid and the Platform Numbers section so the
// count-up logic only lives in one place. `decimals` supports non-integer
// targets like an average rating (e.g. 4.8).
const useCountUp = (target, active, { duration = 1200, decimals = 0 } = {}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target == null) return;
    const factor = 10 ** decimals;
    let start = null;
    let frame;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target * factor) / factor);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration, decimals]);

  return value;
};

export default useCountUp;
