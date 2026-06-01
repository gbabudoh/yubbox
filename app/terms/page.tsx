import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const LAST_UPDATED = 'June 1, 2026';

export const metadata = {
  title: 'Terms of Service — Yubbox',
  description: 'Yubbox Terms of Service',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By creating an account or using Yubbox, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform. We reserve the right to update these terms at any time; continued use after changes constitutes acceptance.`,
  },
  {
    title: '2. Description of Service',
    body: `Yubbox is a global advertising platform that allows advertisers to publish listings ("Yubboxes") visible to users across 150+ countries. Each listing is active for 14 days from the date of payment. Premium placements (Top Lens, Stories) may be purchased separately.`,
  },
  {
    title: '3. Account Registration',
    body: `You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. Notify us immediately of any unauthorised use.`,
  },
  {
    title: '4. Advertiser Responsibilities',
    body: `You are solely responsible for the content of your listings. You warrant that your listings:\n• Are truthful, accurate, and not misleading\n• Do not infringe any third-party intellectual property rights\n• Do not contain illegal, offensive, or prohibited content\n• Comply with all applicable laws and regulations in your target countries\n\nYubbox reserves the right to remove any listing that violates these requirements without refund.`,
  },
  {
    title: '5. Payments & Refunds',
    body: `All payments are processed securely via Stripe. The fee for a standard listing is $1.00 USD for 14 days of active promotion. Premium placements are charged at their listed price. Payments are non-refundable once a listing has been activated and published. If a technical error on our part prevents your listing from going live, you are entitled to a full refund.`,
  },
  {
    title: '6. Prohibited Content',
    body: `The following content is strictly prohibited on Yubbox:\n• Adult or sexually explicit material\n• Weapons, drugs, or controlled substances\n• Counterfeit goods or scams\n• Content that promotes hate, violence, or discrimination\n• Malware, phishing, or deceptive links\n\nViolation may result in immediate account termination and reporting to relevant authorities.`,
  },
  {
    title: '7. Intellectual Property',
    body: `You retain ownership of the content you upload. By publishing a listing on Yubbox, you grant us a non-exclusive, worldwide, royalty-free licence to display and promote that content through our platform and associated marketing channels for the duration of your listing.`,
  },
  {
    title: '8. Analytics & Data',
    body: `Yubbox collects anonymised engagement data (views, clicks, scroll depth, session signals) to power its intelligence features. This data is used to improve your listing performance and provide benchmarks. Individual user data is never sold to third parties.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `Yubbox is provided "as is" without warranties of any kind. We do not guarantee a specific number of views, clicks, or conversions. To the maximum extent permitted by law, Yubbox shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.`,
  },
  {
    title: '10. Termination',
    body: `We may suspend or terminate your account at any time for violations of these Terms. You may close your account at any time from your dashboard settings. Termination does not entitle you to a refund of any paid listings.`,
  },
  {
    title: '11. Governing Law',
    body: `These Terms are governed by and construed in accordance with applicable international commerce law. Any disputes shall be resolved through binding arbitration before resorting to litigation.`,
  },
  {
    title: '12. Contact',
    body: `For questions about these Terms, contact us at legal@yubbox.com.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#790e61' }}>Legal</p>
            <h1 className="text-4xl font-black text-neutral-900 mb-3">Terms of Service</h1>
            <p className="text-sm text-neutral-400">Last updated: {LAST_UPDATED}</p>
          </div>

          {/* Intro */}
          <div className="p-6 rounded-2xl mb-8 border" style={{ background: 'rgba(121,14,97,0.04)', borderColor: 'rgba(121,14,97,0.12)' }}>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Please read these Terms of Service carefully before using Yubbox. These terms govern your access to and use of our global advertising platform.
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
            <Link href="/privacy" className="font-bold hover:underline" style={{ color: '#790e61' }}>
              Privacy Policy →
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
