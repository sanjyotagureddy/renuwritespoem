import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import AchievementTracker from "../src/components/account/achievement-tracker";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/poems/some-poem"),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn().mockReturnValue({
    data: { user: { id: "user-123", email: "test@example.com" } },
    status: "authenticated",
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
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

describe("AchievementTracker Component", () => {
  let mockFetch: any;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      status: "authenticated",
    });

    vi.mocked(usePathname).mockReturnValue("/poems/some-poem");

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "first-verse",
            name: "First Verse",
            description: "Read your first poem",
            unlocked: true,
            tone: "amber",
          },
        ]),
    });
    global.fetch = mockFetch;
  });

  afterEach(() => {
    cleanup();
  });

  it("should render nothing when user is unauthenticated", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { container } = render(<AchievementTracker />);
    expect(container.firstChild).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should render nothing and not fetch when page is /account", async () => {
    vi.mocked(usePathname).mockReturnValue("/account");

    const { container } = render(<AchievementTracker />);
    expect(container.firstChild).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should fetch badges on mount and display celebration modal for uncelebrated unlocked badge", async () => {
    let rendered: any;
    await act(async () => {
      rendered = render(<AchievementTracker />);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/account/badges");
    expect(screen.getByText("First Verse")).toBeDefined();
    expect(screen.getByText(/Read your first poem/)).toBeDefined();

    // Click "Keep reading" to close/celebrate
    const keepReadingButton = screen.getByText("Keep reading");
    await act(async () => {
      fireEvent.click(keepReadingButton);
    });

    // It should save to localStorage
    const celebrated = JSON.parse(localStorage.getItem("renuwritespoem:celebrated-badges") || "[]");
    expect(celebrated).toContain("first-verse");

    // Modal should be gone
    expect(screen.queryByText("First Verse")).toBeNull();
  });

  it("should not display celebration modal if badge is already marked celebrated in localStorage", async () => {
    localStorage.setItem("renuwritespoem:celebrated-badges", JSON.stringify(["first-verse"]));

    await act(async () => {
      render(<AchievementTracker />);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/account/badges");
    expect(screen.queryByText("First Verse")).toBeNull();
  });

  it("should listen to window achievement-check event and trigger fetch", async () => {
    let rendered: any;
    await act(async () => {
      rendered = render(<AchievementTracker />);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Dispatch the achievement-check custom event
    await act(async () => {
      window.dispatchEvent(new CustomEvent("achievement-check"));
    });

    // Should fetch again
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
