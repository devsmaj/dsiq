"use client";

import { useEffect } from "react";

export function useKeyboardOffset() {
  useEffect(() => {
    function updateKeyboardOffset() {
      const viewport = window.visualViewport;
      const keyboardOffset = viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;

      document.documentElement.style.setProperty(
        "--dsiq-keyboard-offset",
        `${keyboardOffset}px`,
      );
    }

    updateKeyboardOffset();
    window.addEventListener("resize", updateKeyboardOffset);
    window.visualViewport?.addEventListener("resize", updateKeyboardOffset);
    window.visualViewport?.addEventListener("scroll", updateKeyboardOffset);

    return () => {
      window.removeEventListener("resize", updateKeyboardOffset);
      window.visualViewport?.removeEventListener("resize", updateKeyboardOffset);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardOffset);
      document.documentElement.style.removeProperty("--dsiq-keyboard-offset");
    };
  }, []);
}
