import type { Metadata } from "next";
import Link from "next/link";
import LegalFooterNav from "@/components/ui/legal-footer-nav";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the terms and conditions that govern your use of Renu Writes Poem.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "12 July 2026";
const CONTACT_EMAIL = "renewritespoem@gmail.com";
const SITE_NAME = "Renu Writes Poem";
const SITE_URL = "https://www.renuwritespoem.com";

export default function TermsOfUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 font-[family-name:var(--font-inter)]">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35 mb-3">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] text-white mb-4">
          Terms of Use
        </h1>
        <p className="text-sm text-white/40">
          Effective date: {EFFECTIVE_DATE}
        </p>
      </div>

      <div className="prose-legal">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using {SITE_NAME} at{" "}
            <a
              href={SITE_URL}
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              {SITE_URL}
            </a>{" "}
            (&quot;the Site&quot;), you agree to these Terms of Use. If you do not
            agree, please do not use the Site.
          </p>
        </Section>

        <Section title="2. Intellectual Property">
          <p>
            All poems, prose, images, audio recordings, and other content
            published on this Site are the original creative work of Renu and are
            protected by copyright. You may not reproduce, distribute, publicly
            perform, or create derivative works from any content on this Site
            without express written permission.
          </p>
          <p>
            <strong className="text-white/80">Personal, non-commercial sharing</strong> is welcome
            — you may quote short excerpts (up to 4 lines of a poem) on social
            media provided you credit{" "}
            <em>Renu Writes Poem</em> and link back to the original page.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>
            You may create an account by signing in with Google. You are
            responsible for maintaining the confidentiality of your account and
            for all activity that occurs under it. You must:
          </p>
          <ul>
            <li>Be at least 13 years old to create an account.</li>
            <li>Provide accurate information when prompted.</li>
            <li>Notify us immediately of any unauthorised use of your account.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </p>
        </Section>

        <Section title="4. Comments & Community">
          <p>
            When you post a comment on the Site you grant us a non-exclusive,
            royalty-free licence to display that comment. You agree not to post
            content that:
          </p>
          <ul>
            <li>Is hateful, abusive, harassing, or discriminatory.</li>
            <li>Infringes the copyright or other rights of any third party.</li>
            <li>Contains spam, unsolicited advertisements, or malicious links.</li>
            <li>Is false, misleading, or defamatory.</li>
          </ul>
          <p>
            We reserve the right to remove any comment and to moderate or ban
            users who repeatedly violate these guidelines.
          </p>
        </Section>

        <Section title="5. Invitations">
          <p>
            The Site allows signed-in readers to email poem invitations to
            friends. By using this feature you confirm that you have the
            recipient&apos;s consent to receive such an email and that the email
            address belongs to a real person who has agreed to hear from you. We
            may limit the number of invitations per user to prevent abuse.
          </p>
        </Section>

        <Section title="6. Book Purchases">
          <p>
            Book orders placed through the Site are subject to our{" "}
            <Link
              href="/shipping"
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              Shipping & Refund Policy
            </Link>
            . By placing an order you confirm that the delivery details you
            provide are accurate.
          </p>
        </Section>

        <Section title="7. Third-Party Links">
          <p>
            The Site may contain links to third-party websites. We do not endorse
            and are not responsible for the content or practices of those sites.
            Accessing them is at your own risk.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>
            The Site is provided &quot;as is&quot; without any warranty of any kind, express
            or implied. We do not warrant that the Site will be uninterrupted,
            error-free, or free of viruses or other harmful components.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, {SITE_NAME} and its owners
            shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the Site or its
            content.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These terms are governed by the laws of India. Any disputes arising
            shall be subject to the exclusive jurisdiction of the courts of India.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>
            We may revise these terms at any time. The updated version will be
            posted on this page with a new effective date. Continued use of the
            Site after changes are posted constitutes your acceptance.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these terms? Email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/80 underline underline-offset-2 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>

      <LegalFooterNav current="/terms" />
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


