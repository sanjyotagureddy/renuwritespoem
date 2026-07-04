"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateContactMessageTone } from "@/lib/contact-guard";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputClassName = "min-h-12 px-4 text-base md:text-base";
  const textareaClassName =
    "min-h-56 resize-y px-4 py-4 text-base leading-7 md:text-base";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSuccess(false);
    setError("");

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const toneError = validateContactMessageTone({
      subject: String(values.subject ?? ""),
      message: String(values.message ?? ""),
    });

    if (toneError) {
      setError(toneError);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error ?? "We couldn't send your message.");
      form.reset();
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't send your message.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="absolute -left-[10000px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          placeholder="Your name"
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={20}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          required
          maxLength={150}
          placeholder="What's this about?"
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100/80">
          Please be respectful. Messages with abusive, threatening, spammy, or
          repeated text will not be sent.
        </div>
        <Textarea
          id="message"
          name="message"
          rows={9}
          required
          maxLength={5000}
          placeholder="Write your message here..."
          className={textareaClassName}
        />
      </div>

      {success && (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          Message sent. Thank you — we&apos;ll get back to you soon.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </p>
      )}

      <div className="flex justify-stretch sm:justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="min-h-13 w-full px-8 text-sm sm:w-auto"
        >
          {submitting ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
