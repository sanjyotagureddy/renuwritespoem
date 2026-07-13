import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DeliveryLogsClient from "../src/app/admin/campaigns/[id]/delivery-logs-client";

afterEach(() => {
  cleanup();
});

const mockDeliveries = [
  {
    id: "del-1",
    email: "reader1@example.com",
    status: "SUCCESS",
    error: null,
    sentAt: new Date("2026-07-13T12:00:00Z"),
    openedAt: null,
    openCount: 0,
    clicks: [],
  },
  {
    id: "del-2",
    email: "reader2@example.com",
    status: "SUCCESS",
    error: null,
    sentAt: new Date("2026-07-13T12:05:00Z"),
    openedAt: new Date("2026-07-13T12:10:00Z"),
    openCount: 2,
    clicks: [
      { id: "c-1", url: "https://renuwritespoem.com/books/my-book", clickedAt: new Date() }
    ],
  },
  {
    id: "del-3",
    email: "reader3@example.com",
    status: "FAILED",
    error: "SMTP rejection",
    sentAt: new Date("2026-07-13T12:00:00Z"),
    openedAt: null,
    openCount: 0,
    clicks: [],
  },
];

describe("DeliveryLogsClient component", () => {
  it("should render the toolbar, search inputs, and lists of recipients", () => {
    render(<DeliveryLogsClient deliveries={mockDeliveries} />);

    expect(screen.getByPlaceholderText(/search recipient email/i)).toBeDefined();
    expect(screen.getByText("reader1@example.com")).toBeDefined();
    expect(screen.getByText("reader2@example.com")).toBeDefined();
    expect(screen.getByText("reader3@example.com")).toBeDefined();
  });

  it("should display the appropriate status badges for each delivery", () => {
    render(<DeliveryLogsClient deliveries={mockDeliveries} />);

    expect(screen.getByText("Sent")).toBeDefined();
    expect(screen.getByText("Failed")).toBeDefined();
    expect(screen.getByText("Clicked")).toBeDefined();
  });

  it("should list the specific links clicked under the recipient email block", () => {
    render(<DeliveryLogsClient deliveries={mockDeliveries} />);

    expect(screen.getByText("Clicked Links:")).toBeDefined();
    expect(screen.getByText(/books\/my-book/i)).toBeDefined();
  });

  it("should filter the recipient logs by email search query", () => {
    render(<DeliveryLogsClient deliveries={mockDeliveries} />);

    const searchInput = screen.getByPlaceholderText(/search recipient email/i);
    
    // Search for reader1
    fireEvent.change(searchInput, { target: { value: "reader1" } });

    expect(screen.getByText("reader1@example.com")).toBeDefined();
    expect(screen.queryByText("reader2@example.com")).toBeNull();
    expect(screen.queryByText("reader3@example.com")).toBeNull();
  });

  it("should filter the recipient logs by status tabs", () => {
    render(<DeliveryLogsClient deliveries={mockDeliveries} />);

    // Click Failed tab
    const failedTab = screen.getAllByText((content, element) => {
      return element?.tagName === "BUTTON" && content.includes("Failed");
    })[0];
    fireEvent.click(failedTab);

    expect(screen.getByText("reader3@example.com")).toBeDefined();
    expect(screen.queryByText("reader1@example.com")).toBeNull();
    expect(screen.queryByText("reader2@example.com")).toBeNull();

    // Click Opened tab
    const openedTab = screen.getAllByText((content, element) => {
      return element?.tagName === "BUTTON" && content.includes("Opened");
    })[0];
    fireEvent.click(openedTab);

    expect(screen.getByText("reader2@example.com")).toBeDefined();
    expect(screen.queryByText("reader1@example.com")).toBeNull();
    expect(screen.queryByText("reader3@example.com")).toBeNull();
  });
});
