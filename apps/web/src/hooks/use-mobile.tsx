import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
    } else if (typeof mql.addListener === "function") {
      mql.addListener(onChange);
    }
    setIsMobile(mql.matches);
    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", onChange);
      } else if (typeof mql.removeListener === "function") {
        mql.removeListener(onChange);
      }
    };
  }, []);

  return !!isMobile;
}
