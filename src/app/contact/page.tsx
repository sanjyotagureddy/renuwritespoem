import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Renu for collaborations, feedback, or just to say hello.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
        Get in Touch
      </h1>
      <p className="mb-12 font-[family-name:var(--font-inter)] text-lg text-white/50">
        Have a question, feedback, or just want to say hello? I&apos;d love to
        hear from you.
      </p>

      <ContactForm />

      {/* Alternative Contact */}
      <div className="mt-16 border-t border-white/10 pt-10">
        <h2 className="mb-6 text-2xl font-bold text-white">
          Other Ways to Reach Me
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-[family-name:var(--font-inter)] text-sm tracking-wider text-white/40 uppercase">
              Email
            </h3>
            <a
              href="mailto:renuwritespoem@gmail.com"
              className="font-[family-name:var(--font-inter)] text-white/70 transition-colors hover:text-white"
            >
              renuwritespoem@gmail.com
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-[family-name:var(--font-inter)] text-sm tracking-wider text-white/40 uppercase">
              Social
            </h3>
            <a
              href="https://www.instagram.com/renuwrites_poem/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-inter)] text-white/70 transition-colors hover:text-white"
            >
              @renuwrites_poem on Instagram
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-[family-name:var(--font-inter)] text-sm tracking-wider text-white/40 uppercase">
              Blog
            </h3>
            <a
              href="https://pillayrenu.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-inter)] text-white/70 transition-colors hover:text-white"
            >
              pillayrenu.blogspot.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
