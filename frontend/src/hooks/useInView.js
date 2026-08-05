import { useEffect, useRef, useState } from "react";

// Reports once a ref'd element first scrolls into view, then stops
// observing — used to trigger "animate when loaded" effects (count-up,
// slide-up) exactly once per page visit instead of on every scroll.
const useInView = (threshold = 0.3) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

export default useInView;
