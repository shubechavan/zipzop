import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ZipZop Tools",
  description: "Privacy policy for ZipZop.tools — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="section-label mb-3">Legal</div>
      <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Privacy Policy</h1>
      <p className="text-sm mb-12" style={{ color: "var(--muted)" }}>Last updated: May 2025</p>

      <div className="space-y-10 text-sm leading-7" style={{ color: "#b0b0c0" }}>

        <section>
          <h2 className="text-white font-bold text-base mb-3">1. Files stay on your device</h2>
          <p>
            All file processing on ZipZop Tools happens entirely in your browser. Your files are never
            uploaded to our servers. We do not store, read, or transmit any files you process on this site.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">2. Advertising (Google AdSense)</h2>
          <p>
            We use Google AdSense to display advertisements. Google may use cookies and web beacons to
            serve ads based on your prior visits to this or other websites. You can opt out of personalised
            advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}>
              Google Ad Settings
            </a>.
          </p>
          <p className="mt-3">
            Google's use of advertising cookies enables it and its partners to serve ads based on your
            visit to our site and/or other sites on the Internet. For more information, see{" "}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}>
              Google's advertising policies
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">3. Cookies</h2>
          <p>
            We do not set any first-party cookies. Third-party services (Google AdSense, Google Fonts)
            may set cookies. You can disable cookies in your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">4. Analytics</h2>
          <p>
            We may use anonymous analytics (e.g. Vercel Analytics) to understand aggregate traffic.
            This data does not identify individual users.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">5. Children</h2>
          <p>
            This site is not directed at children under 13. We do not knowingly collect data from children.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-3">6. Contact</h2>
          <p>
            For privacy questions, contact us at{" "}
            <a href="mailto:privacy@zipzop.tools" style={{ color: "var(--accent)" }}>
              privacy@zipzop.tools
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
