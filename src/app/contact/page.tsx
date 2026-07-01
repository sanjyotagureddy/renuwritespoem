import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Renu for collaborations, feedback, or just to say hello.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Get in Touch
      </h1>
      <p className="text-lg text-white/50 font-[family-name:var(--font-inter)] mb-12">
        Have a question, feedback, or just want to say hello? I&apos;d love to
        hear from you.
      </p>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            type="text"
            id="subject"
            name="subject"
            required
            placeholder="What's this about?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            rows={6}
            required
            placeholder="Write your message here..."
            className="resize-none"
          />
        </div>

        <Button type="submit" size="lg">
          Send Message
        </Button>
      </form>

      {/* Alternative Contact */}
      <div className="mt-16 pt-10 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">
          Other Ways to Reach Me
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-sm uppercase tracking-wider text-white/40 font-[family-name:var(--font-inter)] mb-2">
              Email
            </h3>
            <a
              href="mailto:renuwritespoem@gmail.com"
              className="text-white/70 hover:text-white transition-colors font-[family-name:var(--font-inter)]"
            >
              renuwritespoem@gmail.com
            </a>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-sm uppercase tracking-wider text-white/40 font-[family-name:var(--font-inter)] mb-2">
              Social
            </h3>
            <a
              href="https://www.instagram.com/renuwrites_poem/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors font-[family-name:var(--font-inter)]"
            >
              @renuwrites_poem on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
