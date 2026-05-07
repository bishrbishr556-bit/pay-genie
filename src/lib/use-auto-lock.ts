import { useEffect, useRef } from "react";
import { actions, getState } from "./payment-store";
import { getSecurity } from "./security-store";

/**
 * Locks the app after a period of inactivity, or immediately when the
 * tab/app goes to the background (configurable via securityActions.setAutoLock).
 */
export function useAutoLock() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      const ms = getSecurity().autoLockMs;
      if (ms < 0) return; // Never
      if (ms === 0) return; // Immediate-on-bg only
      timer.current = setTimeout(() => {
        if (getState().unlocked) actions.lock();
      }, ms);
    };

    const onActivity = () => { if (getState().unlocked) reset(); };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        const ms = getSecurity().autoLockMs;
        if (ms === 0 && getState().unlocked) actions.lock();
      } else {
        onActivity();
      }
    };

    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
}