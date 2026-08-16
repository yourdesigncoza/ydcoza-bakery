"use client";

import { useEffect, useRef } from "react";

/**
 * Submits the enclosing PayFast form once the page has painted.
 *
 * The visible button stays as a fallback for anyone with scripting disabled,
 * so the handover works either way.
 */
export function AutoSubmit() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = marker.current?.closest("form");
    if (!form) return;

    // A short pause lets the customer read what is about to happen.
    const timer = setTimeout(() => form.submit(), 900);
    return () => clearTimeout(timer);
  }, []);

  return <span ref={marker} hidden />;
}
