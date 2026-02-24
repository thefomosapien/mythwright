import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mythwright",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-foreground-subtle">
        Last updated: February 24, 2026
      </p>

      <div className="mt-8 space-y-6 font-prose text-void-200 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            1. Information We Collect
          </h2>
          <p className="mt-2">We collect information you provide directly:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Account information (email, username, display name)</li>
            <li>Profile data (avatar, bio)</li>
            <li>Content you create (universes, comics, lore entries)</li>
            <li>Interactions (follows, reports)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            2. How We Use Your Information
          </h2>
          <p className="mt-2">We use collected information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide and maintain the Platform</li>
            <li>Display your public profile and published content</li>
            <li>Send account-related notifications</li>
            <li>Enforce our Terms of Service and content policies</li>
            <li>Improve and develop Platform features</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            3. Public Information
          </h2>
          <p className="mt-2">
            Your username, display name, avatar, and published content are publicly
            visible. Your email address is never displayed publicly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            4. Data Storage
          </h2>
          <p className="mt-2">
            Your data is stored securely using industry-standard practices. Uploaded
            images and content are stored in secure cloud storage. We retain your data
            for as long as your account is active.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            5. Cookies and Analytics
          </h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management. We may
            use analytics to understand Platform usage and improve the experience.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            6. Third-Party Services
          </h2>
          <p className="mt-2">
            We use third-party services for authentication, image storage, and hosting.
            These services have their own privacy policies governing their use of your
            data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            7. Your Rights
          </h2>
          <p className="mt-2">You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your content</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            8. Children&apos;s Privacy
          </h2>
          <p className="mt-2">
            Mythwright is not directed at children under 13. We do not knowingly
            collect personal information from children under 13. Content ratings help
            users identify age-appropriate material.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-void-50">
            9. Changes to This Policy
          </h2>
          <p className="mt-2">
            We may update this Privacy Policy periodically. We will notify users of
            significant changes through the Platform.
          </p>
        </section>
      </div>
    </div>
  );
}
