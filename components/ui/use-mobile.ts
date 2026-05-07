import * as React from "react";

// This breakpoint matches the app's mobile layout switch so responsive components stay in sync.
const MOBILE_BREAKPOINT = 768;

// The hook centralizes width checks so components do not each reimplement their own media query logic.
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Listen to viewport changes instead of reading width once so the result updates live on resize.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
