import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FAQPage from "../../../src/app/(marketing)/faq/page";

describe("FAQPage Component", () => {
  it("should render FAQ page successfully with all accordion questions and legal footer", () => {
    render(<FAQPage />);

    // Verify header sections
    expect(screen.getByText("Frequently Asked Questions")).toBeDefined();
    expect(screen.getByText("Readers Ask")).toBeDefined();
    expect(
      screen.getByText(
        "Find answers to common questions about collaborations, invitations, ordering signed books, and how to get in touch."
      )
    ).toBeDefined();

    // Verify all 5 FAQ questions are present
    expect(screen.getByText("When did you start writing?")).toBeDefined();
    expect(screen.getByText("Can I collaborate?")).toBeDefined();
    expect(screen.getByText("Can I invite you?")).toBeDefined();
    expect(screen.getByText("Can I purchase signed books?")).toBeDefined();
    expect(screen.getByText("How do I contact you?")).toBeDefined();

    // Verify legal footer is rendered (e.g. check that at least Privacy Policy, FAQ, terms, shipping, support links are in document)
    expect(screen.getAllByText("FAQ")).toBeDefined();
    expect(screen.getAllByText("Privacy Policy")).toBeDefined();
    expect(screen.getAllByText("Terms of Use")).toBeDefined();
    expect(screen.getAllByText("Shipping & Refunds")).toBeDefined();
    expect(screen.getAllByText("Support")).toBeDefined();
  });
});
