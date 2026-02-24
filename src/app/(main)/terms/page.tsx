import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Mythwright",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-foreground-subtle">
        Last updated: February 24, 2026
      </p>

      <div className="mt-8 space-y-6 font-prose text-void-200 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2">
            By accessing or using Mythwright (&quot;the Platform&quot;), you agree to be
            bound by these Terms of Service. If you do not agree, you may not use the
            Platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            2. User Accounts
          </h2>
          <p className="mt-2">
            You must create an account to access certain features. You are responsible
            for maintaining the security of your account and for all activities under
            your account. You must be at least 13 years old to create an account.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            3. Content Ownership
          </h2>
          <p className="mt-2">
            You retain ownership of all content you create and publish on Mythwright,
            including comic pages, lore entries, and universe descriptions. By
            publishing content, you grant Mythwright a non-exclusive license to
            display, distribute, and promote your content on the Platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            4. Community Contributions
          </h2>
          <p className="mt-2">
            Content marked as &quot;Community&quot; canon may be expanded upon by other
            users in accordance with the universe creator&apos;s guidelines. Creators
            maintain editorial control over their universes and may moderate community
            contributions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            5. Prohibited Conduct
          </h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Upload content that infringes on intellectual property rights</li>
            <li>Post spam, misleading, or deceptive content</li>
            <li>Harass, threaten, or intimidate other users</li>
            <li>Attempt to gain unauthorized access to the Platform</li>
            <li>Use the Platform for any illegal activity</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            6. Content Moderation
          </h2>
          <p className="mt-2">
            Mythwright reserves the right to remove content that violates these terms
            or our content guidelines. Users may report content they believe is in
            violation, and our moderation team will review reports promptly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            7. Termination
          </h2>
          <p className="mt-2">
            We may suspend or terminate your account for violations of these terms.
            You may delete your account at any time. Upon termination, your published
            content may remain accessible unless you request its removal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            8. Disclaimer
          </h2>
          <p className="mt-2">
            The Platform is provided &quot;as is&quot; without warranties of any kind.
            Mythwright is not liable for user-generated content or any damages arising
            from use of the Platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            9. Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the Platform
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
