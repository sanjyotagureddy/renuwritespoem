"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

// Initializer to apply scroll snap classes to HTML & Body on mount
export function ScrollSnapInitializer() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const origHtmlClass = html.className;
    const origBodyClass = body.className;

    // Apply scroll-snapping and full-screen constraints
    html.classList.add("snap-y", "snap-mandatory", "scroll-smooth", "h-screen", "overflow-hidden");
    body.classList.add("h-screen", "overflow-hidden");

    return () => {
      // Restore previous styling when leaving the page
      html.className = origHtmlClass;
      body.className = origBodyClass;
    };
  }, []);

  return null;
}

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out (cubic-bezier)
      className={className}
    >
      {children}
    </motion.div>
  );
}
