import { z } from "zod";
import { zfd } from "zod-form-data";

// Shared primitive validations
export const idSchema = z.string().min(1, "ID is required");
export const emailSchema = z.string().email("Invalid email address");
export const phoneSchema = z.string().regex(/^[+\d][\d\s().-]{6,19}$/, "Invalid phone number");
export const booleanStringSchema = z.enum(["true", "false"]).transform((val) => val === "true");

// Contact Route Validation
export const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(1, "Subject is required").max(150, "Subject is too long"),
  message: z.string().min(1, "Message is required").max(5000, "Message is too long"),
  website: z.string().optional(), // honeypot
});

// Invite Route Validation
export const InviteSchema = z.object({
  senderName: z.string().min(2, "Please enter your name (minimum 2 characters)."),
  inviteeName: z.string().min(2, "Please enter your friend's name (minimum 2 characters)."),
  recipientEmail: emailSchema.transform(val => val.toLowerCase()),
  personalNote: z.string().max(100, "Personal note cannot exceed 100 characters.").optional(),
  poemId: z.string().optional(),
});

// Unsubscribe Route Validation
export const UnsubscribeSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Subscriber Validation
export const SubscriberSchema = z.object({
  email: emailSchema.transform(val => val.toLowerCase()),
  name: z.string().max(100).optional().nullable(),
});

// Order Route Validation
export const OrderSchema = zfd.formData({
  bookId: zfd.text(idSchema),
  name: zfd.text(z.string().min(1, "Name is required").max(100)),
  email: zfd.text(emailSchema),
  phone: zfd.text(phoneSchema),
  address: zfd.text(z.string().min(1, "Address is required").max(500)),
  city: zfd.text(z.string().min(1, "City is required").max(100)),
  state: zfd.text(z.string().min(1, "State is required").max(100)),
  pincode: zfd.text(z.string().regex(/^\d{6}$/, "Pincode must be 6 digits.")),
  copies: zfd.numeric(z.number().int().min(1).max(50)),
  idempotencyKey: zfd.text(z.string().regex(/^[0-9a-f-]{36}$/i, "Invalid order request.")),
});

// Comments API Validation
export const CommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
  parentId: z.string().optional().nullable(),
});

// Server Actions (zod-form-data)

// User Actions
export const UpdateUserRoleSchema = zfd.formData({
  userId: zfd.text(idSchema),
  role: zfd.text(z.enum(["ADMIN", "READER"])),
});

export const UpdateUserModerationSchema = zfd.formData({
  userId: zfd.text(idSchema),
  action: zfd.text(z.enum(["flag", "disable", "restore"])),
  moderationNote: zfd.text(z.string().optional()),
});

// Comment Actions
export const UpdateCommentStatusSchema = zfd.formData({
  commentId: zfd.text(idSchema),
  modelType: zfd.text(z.enum(["poem", "book", "audio"])),
  status: zfd.text(z.enum(["APPROVED", "PENDING", "REJECTED"])),
});

export const ToggleCommentPinSchema = zfd.formData({
  commentId: zfd.text(idSchema),
  modelType: zfd.text(z.enum(["poem", "book", "audio"])),
  pinned: zfd.text(booleanStringSchema),
});

export const DeleteCommentSchema = zfd.formData({
  commentId: zfd.text(idSchema),
  modelType: zfd.text(z.enum(["poem", "book", "audio"])),
});

// Poem Actions
export const TogglePoemPublishSchema = zfd.formData({
  id: zfd.text(idSchema),
  published: zfd.text(booleanStringSchema),
});

export const TogglePoemFeaturedSchema = zfd.formData({
  id: zfd.text(idSchema),
  featured: zfd.text(booleanStringSchema),
});

export const DeletePoemSchema = zfd.formData({
  id: zfd.text(idSchema),
});

// Book Actions
export const ToggleBookFeaturedSchema = zfd.formData({
  id: zfd.text(idSchema),
  featured: zfd.text(booleanStringSchema),
});

export const UpdateBookStatusSchema = zfd.formData({
  id: zfd.text(idSchema),
  status: zfd.text(z.enum(["AVAILABLE", "COMING_SOON", "ARCHIVED"])),
});

export const DeleteBookSchema = zfd.formData({
  id: zfd.text(idSchema),
});

export const UpsertBookPricesSchema = zfd.formData({
  id: zfd.text(idSchema),
  price: zfd.numeric(z.number().min(0).optional()),
  discountedPrice: zfd.numeric(z.number().min(0).optional()),
  shippingCharge: zfd.numeric(z.number().min(0).optional()),
});

// Audio Actions
export const ToggleAudioPublishSchema = zfd.formData({
  id: zfd.text(idSchema),
  published: zfd.text(booleanStringSchema),
});

export const DeleteAudioSchema = zfd.formData({
  id: zfd.text(idSchema),
});

// Order Actions
export const UpdateOrderStatusSchema = zfd.formData({
  id: zfd.text(idSchema),
  status: zfd.text(z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])),
  trackingUrl: zfd.text(z.string().optional()),
});

export const DeleteOrderSchema = zfd.formData({
  id: zfd.text(idSchema),
});

// Contact/Message Actions
export const UpdateMessageStatusSchema = zfd.formData({
  id: zfd.text(idSchema),
  status: zfd.text(z.enum(["UNREAD", "READ", "REPLIED", "ARCHIVED"])),
});

export const DeleteMessageSchema = zfd.formData({
  id: zfd.text(idSchema),
});

// Genre Actions
export const UpdateGenreSchema = zfd.formData({
  id: zfd.text(idSchema),
  name: zfd.text(z.string().min(1, "Name is required")),
  slug: zfd.text(z.string().min(1, "Slug is required")),
});

export const DeleteGenreSchema = zfd.formData({
  id: zfd.text(idSchema),
});
