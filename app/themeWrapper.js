"use client";
import { useEffect, useState } from "react";

export default function ThemeWrapper({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) return null;

  return children;
}
