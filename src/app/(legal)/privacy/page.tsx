import type { Metadata } from "next";
import Link from "next/link";
import LegalFooterNav from "@/components/ui/legal-footer-nav";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Renu Writes Poem collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "12 July 2026";
const CONTACT_EMAIL = "renewritespoem@gmail.com";
const SITE_NAME = "Renu Writes Poem";
const SITE_URL = "https://renuwritespoem.vercel.app/";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 font-[family-name:var(--font-inter)]">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35 mb-3">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-white/40">
          Effective date: {EFFECTIVE_DATE}
        </p>
      </div>

      <div className="prose-legal">
        <Section title="1. Who We Are">
          <p>
            {SITE_NAME} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website at{" "}
            <a href={SITE_URL} className="text-white/80 underline underline-offset-2 hover:text-white">
              {SITE_URL}
            </a>
            . This policy explains what personal information we collect, how we
            use it, and your rights in relation to it.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information in the following ways:</p>
          <ul>
            <li>
              <strong className="text-white/80">Account information</strong> — when you sign in with
              Google or register an account, we receive your name, email address, and profile picture.
            </li>
            <li>
              <strong className="text-white/80">Newsletter subscriptions</strong> — when you subscribe to
              our updates, we store your email address, double opt-in status, and newsletter preferences.
            </li>
            <li>
              <strong className="text-white/80">Book orders</strong> — when you place a book order we
              collect your name, email, phone number, and delivery address to fulfill your purchase.
            </li>
            <li>
              <strong className="text-white/80">Comments &amp; interactions</strong> — any comment text,
              likes, or invitations you send through the platform.
            </li>
            <li>
              <strong className="text-white/80">Gamification &amp; badges</strong> — we compute reader milestones
              (e.g., number of books read, comments liked, or active status) to award reader achievement badges.
            </li>
            <li>
              <strong className="text-white/80">Contact messages</strong> — when you use the contact
              form we receive your name, email, phone, subject, and message.
            </li>
            <li>
              <strong className="text-white/80">Analytics &amp; attribution</strong> — if you consent, we log
              anonymous share-source events (e.g. WhatsApp, email referrals) and page views
              to understand how readers discover our content. No personally
              identifiable information is stored in these logs.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To operate and improve the website, its community features, and reading badges.</li>
            <li>To send you our email newsletter updates, new poem alerts, and book releases.</li>
            <li>To process and fulfil book orders and notify you of their status.</li>
            <li>To send you email invitations you initiate through the platform.</li>
            <li>To respond to contact/support enquiries.</li>
            <li>To moderate comments and maintain community safety.</li>
            <li>
              To understand traffic sources and improve our content — using only
              anonymised analytics and attribution data where consent has been provided.
            </li>
          </ul>
          <p>
            We do <strong className="text-white/80">not</strong> sell, rent, or share your personal
            information with third parties for marketing purposes.
          </p>
        </Section>

        <Section title="4. Cookies &amp; Local Storage">
          <p>
            We use session cookies provided by NextAuth.js solely to keep you
            signed in. We do not use third-party advertising cookies. Vercel
            Analytics may set anonymous performance cookies.
          </p>
          <p>
            We also use browser local storage to save your visual choices (e.g., poem text size adjustments),
            badge celebration triggers, and referral attribution tags (to remember how you first landed on our site).
            You can customize your tracking preferences or opt out of referral tracking at any time by selecting 
            &quot;Essential Only&quot; in our cookie preferences banner.
          </p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>
            We use the following services which may process your data under their
            own privacy policies:
          </p>
          <ul>
            <li>
              <strong className="text-white/80">Google OAuth</strong> — for sign-in (
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-white">Google Privacy Policy</a>
              ).
            </li>
            <li>
              <strong className="text-white/80">Vercel</strong> — for hosting and analytics (
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-white">Vercel Privacy Policy</a>
              ).
            </li>
            <li>
              <strong className="text-white/80">Resend</strong> — for transactional email delivery.
            </li>
            <li>
              <strong className="text-white/80">Vercel Blob</strong> — for media file storage.
            </li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active.
            Order records are retained for a minimum of three years for legal and
            accounting purposes. Contact messages are kept until resolved and then
            archived. You may request deletion at any time (see Section 7).
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, or delete your personal data. To exercise any of these
            rights, please email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/80 underline underline-offset-2 hover:text-white">
              {CONTACT_EMAIL}
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We use industry-standard measures (TLS encryption, restricted
            database access, environment-variable secrets) to protect your data.
            No method of transmission over the internet is 100% secure; we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            This website is not directed at children under the age of 13. We do
            not knowingly collect personal information from children.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this policy from time to time. Material changes will be
            announced on the website. Continued use of the site after changes are
            posted constitutes your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions or concerns? Reach us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/80 underline underline-offset-2 hover:text-white">
              {CONTACT_EMAIL}
            </a>{" "}
            or via our{" "}
            <Link href="/contact" className="text-white/80 underline underline-offset-2 hover:text-white">
              contact form
            </Link>
            .
          </p>
        </Section>
      </div>

      <LegalFooterNav current="/privacy" />
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


