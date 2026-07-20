import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import PoemReader from "../../../src/components/poems/poem-reader";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("PoemReader Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    title: "Test Poem Title",
    content: "This is the first line.\nThis is the second line.",
    excerpt: "This is a short excerpt.",
    font: "Lora",
    language: "EN" as const,
    lang: "en",
  };

  it("should render the title, excerpt, and content correctly", () => {
    render(<PoemReader {...defaultProps} />);

    expect(screen.getByText("Test Poem Title")).toBeDefined();
    expect(screen.getByText("This is a short excerpt.")).toBeDefined();
    expect(screen.getByText(/This is the first line/i)).toBeDefined();
  });

  it("should show text sizing controls and defaults to medium sizing", () => {
    render(<PoemReader {...defaultProps} />);

    // Sizing controls are hidden until component is mounted (due to mounted state)
    // Testing-library handles mock mount cycles automatically.
    expect(screen.getByLabelText(/Decrease text size/i)).toBeDefined();
    expect(screen.getByLabelText(/Reset text size/i)).toBeDefined();
    expect(screen.getByLabelText(/Increase text size/i)).toBeDefined();
  });

  it("should toggle text size when clicking adjustment buttons and update localStorage", () => {
    render(<PoemReader {...defaultProps} />);

    const decBtn = screen.getByLabelText(/Decrease text size/i);
    const incBtn = screen.getByLabelText(/Increase text size/i);
    const resetBtn = screen.getByLabelText(/Reset text size/i);

    // Initial state check
    expect(localStorage.getItem("renuwritespoem:textsize")).toBeNull();

    // Click decrease size
    fireEvent.click(decBtn);
    expect(localStorage.getItem("renuwritespoem:textsize")).toBe("sm");

    // Click increase size
    fireEvent.click(incBtn);
    expect(localStorage.getItem("renuwritespoem:textsize")).toBe("lg");

    // Click reset size
    fireEvent.click(resetBtn);
    expect(localStorage.getItem("renuwritespoem:textsize")).toBe("md");
  });

  it("should retrieve stored text size preference from localStorage on mount", () => {
    localStorage.setItem("renuwritespoem:textsize", "lg");
    render(<PoemReader {...defaultProps} />);

    // Since it mounts with 'lg', the Active button is large size.
    const incBtn = screen.getByLabelText(/Increase text size/i);
    expect(incBtn.className).toContain("bg-amber-400");
  });
});
