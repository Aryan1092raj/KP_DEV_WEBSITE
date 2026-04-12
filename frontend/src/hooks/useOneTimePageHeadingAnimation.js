import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { animate, splitText, stagger } from "animejs";

const playedVisits = new Set();

export function useOneTimePageHeadingAnimation({
  enabled,
  scopeRef,
  selector = ".page-heading-anim",
  visitTag = "default",
}) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const scope = scopeRef?.current;
    if (!scope) {
      return;
    }

    const visitId = `${location.pathname}:${location.key}:${visitTag}`;
    if (playedVisits.has(visitId)) {
      return;
    }

    const targets = Array.from(scope.querySelectorAll(selector));
    if (targets.length === 0) {
      return;
    }

    const animations = targets
      .map((target) => {
        if (!(target instanceof HTMLElement)) {
          return null;
        }

        try {
          const { words, revert } = splitText(target, {
            words: { wrap: "clip" },
          });

          let restored = false;
          const safeRevert = () => {
            if (restored) {
              return;
            }

            restored = true;
            try {
              revert?.();
            } catch {
              // Guard against route-switch timing where the node is already detached.
            }
          };

          const animation = animate(words, {
            y: ["100%", "0%"],
            opacity: [0, 1],
            duration: 500,
            ease: "out(3)",
            delay: stagger(100),
            onComplete: safeRevert,
          });

          return { animation, safeRevert };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (animations.length === 0) {
      return;
    }

    playedVisits.add(visitId);

    return () => {
      animations.forEach(({ animation, safeRevert }) => {
        animation?.pause?.();
        safeRevert?.();
      });
    };
  }, [enabled, location.key, location.pathname, scopeRef, selector, visitTag]);
}
