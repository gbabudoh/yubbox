import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const LAST_UPDATED = 'June 1, 2026';

export const metadata = {
  title: 'Privacy Policy — Yubbox',
  description: 'Yubbox Privacy Policy',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect the following categories of information:\n\n**Account data:** Name, email address, and hashed password provided at registration.\n\n**Listing data:** Ad titles, descriptions, images, web links, and targeting preferences you provide.\n\n**Behavioural signals:** When a visitor views or clicks your ad, we record anonymised signals including scroll depth, time on ad, device type, session ID, and geographic country (derived from IP address). We do not store raw IP addresses beyond 24 hours.\n\n**Payment data:** Payments are processed by Stripe. We store only the transaction amount, status, and date — never your card details.\n\n**Usage data:** Pages visited, actions taken, and feature usage within the platform, used to improve the product.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use collected data to:\n• Operate and improve the Yubbox platform\n• Deliver your ads to the correct target audiences\n• Provide analytics and intelligence insights to advertisers\n• Process payments and send receipts\n• Send important account notifications (expiry alerts, policy updates)\n• Detect and prevent fraud and abuse\n\nWe do not use your data for automated decision-making that produces legal effects.`,
  },
  {
    title: '3. How We Share Your Information',
    body: `We do not sell your personal data. We share data only in these limited circumstances:\n\n• **Stripe:** For payment processing. Governed by Stripe's Privacy Policy.\n• **Infrastructure providers:** Hosting, storage, and CDN providers operate under strict data processing agreements.\n• **Legal obligation:** If required by law, court order, or to protect the rights and safety of Yubbox and its users.\n\nAll intelligence benchmarks shown in the platform (Yubbox Spy, category comparisons) are fully anonymised and aggregated across a minimum cohort of 5 advertisers before being displayed.`,
  },
  {
    title: '4. Cookies & Tracking',
    body: `Yubbox uses:\n• **Session cookies:** Required for authentication and to keep you logged in.\n• **Analytics signals:** Behavioural data (scroll depth, time on page) is collected server-side via our own analytics system — we do not use third-party tracking pixels or Google Analytics.\n\nYou can disable cookies in your browser settings, but this will prevent login functionality.`,
  },
  {
    title: '5. Data Retention',
    body: `• **Account data:** Retained for the lifetime of your account plus 90 days after deletion.\n• **Analytics events:** Retained for 24 months, then aggregated and anonymised.\n• **Payment records:** Retained for 7 years as required by financial regulations.\n• **Ad content:** Removed 30 days after listing expiry unless you relist.`,
  },
  {
    title: '6. Your Rights',
    body: `Depending on your jurisdiction, you may have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your account and associated data\n• Object to or restrict certain processing\n• Data portability (receive your data in a machine-readable format)\n\nTo exercise any of these rights, contact us at privacy@yubbox.com. We will respond within 30 days.`,
  },
  {
    title: '7. Data Security',
    body: `We implement industry-standard security measures including:\n• Passwords hashed with bcrypt\n• All data transmitted over HTTPS/TLS\n• Database access restricted to application servers only\n• Regular security reviews\n\nNo system is completely secure. If you suspect unauthorised access to your account, contact us immediately.`,
  },
  {
    title: '8. International Transfers',
    body: `Yubbox operates globally. Your data may be stored and processed in countries outside your own. We ensure appropriate safeguards are in place for all international transfers, including standard contractual clauses where required.`,
  },
  {
    title: '9. Children\'s Privacy',
    body: `Yubbox is not directed at children under 16. We do not knowingly collect personal data from minors. If you believe a child has provided us with their data, please contact us and we will delete it promptly.`,
  },
  {
    title: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify registered users by email for material changes. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact',
    body: `For privacy-related enquiries, contact our Data Protection contact at:\nprivacy@yubbox.com`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#790e61' }}>Legal</p>
            <h1 className="text-4xl font-black text-neutral-900 mb-3">Privacy Policy</h1>
            <p className="text-sm text-neutral-400">Last updated: {LAST_UPDATED}</p>
          </div>

          {/* Intro */}
          <div className="p-6 rounded-2xl mb-8 border" style={{ background: 'rgba(121,14,97,0.04)', borderColor: 'rgba(121,14,97,0.12)' }}>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Your privacy matters to us. This policy explains what data Yubbox collects, why we collect it, and how we protect it. We are committed to transparency and handling your data responsibly.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.title} className="bg-white rounded-2xl p-6 border border-neutral-100">
                <h2 className="text-base font-black text-neutral-900 mb-3">{s.title}</h2>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{s.body}</p>
              </section>
            ))}
          </div>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center gap-4 text-sm">
            <Link href="/terms" className="font-bold hover:underline" style={{ color: '#790e61' }}>
              Terms of Service →
            </Link>
            <Link href="/" className="text-neutral-400 hover:text-neutral-700 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
