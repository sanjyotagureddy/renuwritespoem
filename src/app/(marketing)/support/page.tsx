import type { Metadata } from "next";
import Link from "next/link";
import LegalFooterNav from "@/components/ui/legal-footer-nav";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with orders, accounts, comments, or any other query on Renu Writes Poem.",
  alternates: { canonical: "/support" },
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = "renewritespoem@gmail.com";
const RESPONSE_TIME = "2–3 business days";

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 font-[family-name:var(--font-inter)]">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35 mb-3">
          Help Centre
        </p>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] text-white mb-4">
          Support &amp; Contact Policy
        </h1>
        <p className="text-sm text-white/55 leading-7 max-w-xl">
          We&apos;re here to help. Reach out for anything related to orders,
          accounts, content, or general questions and we&apos;ll get back to you
          as soon as we can.
        </p>
      </div>

      {/* Quick contact card */}
      <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35 mb-1">
            Email us directly
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-1 text-xs text-white/35">
            We typically respond within {RESPONSE_TIME}.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/8 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/75 transition-all hover:bg-white/12 hover:text-white whitespace-nowrap"
        >
          Use Contact Form →
        </Link>
      </div>

      <div className="prose-legal">
        <Section title="What We Can Help With">
          <TopicGrid />
        </Section>

        <Section title="Order Queries">
          <p>
            For questions about a book order — including shipping status,
            delivery issues, or a damaged item — please email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with your <strong className="text-white/80">order number</strong> in
            the subject line. See our{" "}
            <Link
              href="/shipping"
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              Shipping &amp; Refund Policy
            </Link>{" "}
            for full details on what is covered.
          </p>
        </Section>

        <Section title="Account & Sign-in Issues">
          <p>
            If you are having trouble signing in, your comments are not
            appearing, or you wish to delete your account, email us with a
            description of the problem. For sign-in issues, please also include
            the email address associated with your Google account.
          </p>
        </Section>

        <Section title="Content & Copyright">
          <p>
            To report copyright infringement or request permission to reproduce
            poems or other content, email us with the specific work in question
            and how you intend to use it. All content on the site is the
            intellectual property of Renu — please review our{" "}
            <Link
              href="/terms"
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              Terms of Use
            </Link>{" "}
            before reaching out.
          </p>
        </Section>

        <Section title="Community & Moderation">
          <p>
            If you believe a comment has been incorrectly removed or you wish to
            report abusive content, please email us with the relevant details. We
            review all moderation disputes on a case-by-case basis.
          </p>
        </Section>

        <Section title="Privacy Requests">
          <p>
            To request access to, correction of, or deletion of your personal
            data, email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            . We will respond within 30 days. See our{" "}
            <Link
              href="/privacy"
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              Privacy Policy
            </Link>{" "}
            for more information.
          </p>
        </Section>

        <Section title="Response Times">
          <p>
            We aim to respond to all enquiries within{" "}
            <strong className="text-white/80">{RESPONSE_TIME}</strong>. During
            high-volume periods or public holidays it may take a little longer.
            If your query is urgent (e.g. a failed payment or undelivered order),
            please include &quot;URGENT&quot; in your email subject line.
          </p>
        </Section>
      </div>

      <LegalFooterNav current="/support" />
    </div>
  );
}

function TopicGrid() {
  const topics = [
    { icon: "📦", label: "Book orders & shipping" },
    { icon: "🔑", label: "Account & sign-in" },
    { icon: "💬", label: "Comments & moderation" },
    { icon: "📋", label: "Copyright & permissions" },
    { icon: "🔒", label: "Privacy & data requests" },
    { icon: "✉️", label: "General enquiries" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 not-prose">
      {topics.map((t) => (
        <li
          key={t.label}
          className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-white/55"
        >
          <span className="text-base">{t.icon}</span>
          {t.label}
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/55">{children}</div>
    </section>
  );
}


