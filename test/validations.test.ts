import { describe, it, expect } from "vitest";
import { OrderSchema, InviteSchema, CommentSchema } from "../src/lib/validations";

describe("validation schemas", () => {
  describe("OrderSchema", () => {
    it("should validate a correct order form data", () => {
      const formData = new FormData();
      formData.append("bookId", "book-123");
      formData.append("name", "John Doe");
      formData.append("email", "john@example.com");
      formData.append("phone", "+919876543210");
      formData.append("address", "123 Street Name");
      formData.append("city", "Mumbai");
      formData.append("state", "Maharashtra");
      formData.append("pincode", "400001");
      formData.append("copies", "2");
      formData.append("idempotencyKey", "c83063f1-d0b4-4b5f-a311-2c09194e43cf");

      const result = OrderSchema.safeParse(formData);
      expect(result.success).toBe(true);
    });

    it("should fail if pincode is invalid", () => {
      const formData = new FormData();
      formData.append("bookId", "book-123");
      formData.append("name", "John Doe");
      formData.append("email", "john@example.com");
      formData.append("phone", "+919876543210");
      formData.append("address", "123 Street Name");
      formData.append("city", "Mumbai");
      formData.append("state", "Maharashtra");
      formData.append("pincode", "12345"); // should be 6 digits
      formData.append("copies", "2");
      formData.append("idempotencyKey", "c83063f1-d0b4-4b5f-a311-2c09194e43cf");

      const result = OrderSchema.safeParse(formData);
      expect(result.success).toBe(false);
    });
  });

  describe("InviteSchema", () => {
    it("should validate a correct invite payload", () => {
      const payload = {
        senderName: "Alice",
        inviteeName: "Bob",
        recipientEmail: "bob@example.com",
        personalNote: "Hey read this!"
      };
      const result = InviteSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recipientEmail).toBe("bob@example.com");
      }
    });

    it("should fail if email is invalid", () => {
      const payload = {
        senderName: "Alice",
        inviteeName: "Bob",
        recipientEmail: "not-an-email",
      };
      const result = InviteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("CommentSchema", () => {
    it("should validate a correct comment", () => {
      const payload = {
        body: "This is a wonderful poem!",
      };
      const result = CommentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should fail if comment is empty", () => {
      const payload = {
        body: "",
      };
      const result = CommentSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
