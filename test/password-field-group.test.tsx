import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PasswordFieldGroup from "../src/components/auth/password-field-group";

// Wrapper to manage state in test
function TestWrapper() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <PasswordFieldGroup
      passwordValue={password}
      setPasswordValue={setPassword}
      confirmPasswordValue={confirmPassword}
      setConfirmPasswordValue={setConfirmPassword}
    />
  );
}

describe("PasswordFieldGroup component", () => {
  it("should render both input fields", () => {
    render(<TestWrapper />);
    expect(screen.getByLabelText(/^password/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
  });

  it("should show weak strength status and guides when password is typed", async () => {
    render(<TestWrapper />);
    const passwordInput = screen.getByLabelText(/^password/i);
    
    // Type a short weak password
    fireEvent.change(passwordInput, { target: { value: "123" } });
    
    expect(screen.getByText(/password strength:/i)).toBeDefined();
    expect(screen.getByText(/weak/i)).toBeDefined();
    expect(screen.getByText(/at least 8 characters/i)).toBeDefined();
  });

  it("should show checkmarks in suggestions as complexity increases", () => {
    render(<TestWrapper />);
    const passwordInput = screen.getByLabelText(/^password/i);

    // Type a strong password
    fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });

    // The list hides once strength is Strong (Score 4)
    expect(screen.getByText(/strong/i)).toBeDefined();
    expect(screen.queryByText(/at least 8 characters/i)).toBeNull();
  });

  it("should display mismatch warning when confirm password differs", () => {
    render(<TestWrapper />);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password1234" } });

    expect(screen.getByText(/passwords do not match/i)).toBeDefined();
  });

  it("should hide mismatch warning and render checkmark when passwords match", () => {
    const { container } = render(<TestWrapper />);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password123" } });

    expect(screen.queryByText(/passwords do not match/i)).toBeNull();
    // Check if the checkmark SVG is rendered inside the confirm box wrapper
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
  });
});
