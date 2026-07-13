import type { Metadata } from "next";
import Link from "next/link";
import LegalFooterNav from "@/components/ui/legal-footer-nav";

export const metadata: Metadata = {
  title: "Shipping & Refund Policy",
  description:
    "Understand how Renu Writes Poem handles book shipping, delivery timelines, and our no-refund policy.",
  alternates: { canonical: "/shipping" },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "12 July 2026";
const CONTACT_EMAIL = "renewritespoem@gmail.com";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 font-[family-name:var(--font-inter)]">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35 mb-3">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] text-white mb-4">
          Shipping &amp; Refund Policy
        </h1>
        <p className="text-sm text-white/40">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      {/* No-refund notice */}
      <div className="mb-10 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] px-6 py-5">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/60 mb-2 font-semibold">
          Important Notice
        </p>
        <p className="text-sm leading-7 text-amber-100/70">
          All book sales are <strong className="text-amber-200">final</strong>.
          We do not offer refunds or exchanges at this time. Please read the
          product description carefully before placing an order.
        </p>
      </div>

      <div className="prose-legal">
        <Section title="1. Scope">
          <p>
            This policy applies to all physical book orders placed through Renu
            Writes Poem. It does not apply to digital content, which is
            accessible immediately after purchase.
          </p>
        </Section>

        <Section title="2. Order Processing">
          <p>
            Orders are reviewed and confirmed manually. You will receive a
            confirmation email once your order has been accepted. Processing
            typically takes <strong className="text-white/80">1–3 business days</strong> after
            payment is verified.
          </p>
          <p>
            We reserve the right to cancel an order if the item is out of stock,
            if we are unable to verify payment, or if we suspect fraudulent
            activity. In such cases you will be notified promptly.
          </p>
        </Section>

        <Section title="3. Shipping">
          <p>
            We currently ship <strong className="text-white/80">within India only</strong>. A flat
            shipping charge is applied at checkout and displayed before you
            confirm your order.
          </p>
          <p>
            Estimated delivery times after dispatch:
          </p>
          <ul>
            <li>
              <strong className="text-white/80">Metro cities</strong> — 3–5 business days
            </li>
            <li>
              <strong className="text-white/80">Other cities &amp; towns</strong> — 5–10 business days
            </li>
            <li>
              <strong className="text-white/80">Remote areas</strong> — up to 14 business days
            </li>
          </ul>
          <p>
            Delivery timelines are estimates and may vary due to courier delays,
            public holidays, or circumstances beyond our control. We are not
            responsible for delays caused by the courier once the shipment has
            been handed over.
          </p>
        </Section>

        <Section title="4. Tracking">
          <p>
            Once your order is dispatched, we will share a tracking number and
            courier details via email. You can use these to monitor delivery
            status directly with the courier.
          </p>
        </Section>

        <Section title="5. Damaged or Incorrect Items">
          <p>
            While we do not offer refunds, if your book arrives{" "}
            <strong className="text-white/80">damaged</strong> or you receive the{" "}
            <strong className="text-white/80">wrong item</strong>, please contact us within{" "}
            <strong className="text-white/80">48 hours</strong> of delivery with:
          </p>
          <ul>
            <li>Your order number.</li>
            <li>A clear photo of the damaged or incorrect item.</li>
            <li>A brief description of the issue.</li>
          </ul>
          <p>
            We will assess each case individually and, at our discretion, arrange
            a replacement shipment at no additional cost to you.
          </p>
        </Section>

        <Section title="6. Undelivered Orders">
          <p>
            If an order is returned to us due to an incorrect address provided by
            the customer, a failed delivery attempt, or refusal of delivery, re-
            shipping charges will apply. We will contact you to arrange
            redelivery.
          </p>
          <p>
            If you believe your order is lost in transit, contact us after the
            maximum estimated delivery window has passed and we will investigate
            with the courier.
          </p>
        </Section>

        <Section title="7. No Refund Policy">
          <p>
            We do not accept returns or provide monetary refunds for any reason
            other than our error (wrong or damaged item as described in Section
            5). This policy exists because each book order is fulfilled
            individually and shipping costs are non-recoverable.
          </p>
          <p>
            By completing a purchase you acknowledge and accept this policy.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            For all order-related queries, email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with your order number in the subject line, or use our{" "}
            <Link
              href="/contact"
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              contact form
            </Link>
            .
          </p>
        </Section>
      </div>

      <LegalFooterNav current="/shipping" />
    </div>
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


