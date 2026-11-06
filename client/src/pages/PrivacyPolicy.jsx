import React from "react";
import { Shield } from "lucide-react";

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-lg font-extrabold text-white border-l-4 border-[#E85D3D] pl-4">{title}</h2>
    <div className="text-sm text-gray-400 leading-relaxed space-y-2 pl-4">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
    <div className="text-center space-y-3">
      <div className="w-14 h-14 bg-[#E85D3D]/20 rounded-2xl flex items-center justify-center mx-auto"><Shield className="w-7 h-7 text-[#E85D3D]" /></div>
      <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
      <p className="text-xs text-gray-500">Last updated: September 2026 · ENEN Apparel Co.</p>
    </div>
    <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 space-y-8">
      <Section title="1. Information We Collect">
        <p>We collect account details you provide (such as name and email), wishlist data, and basic technical information needed to operate and secure this site. Purchases are completed on Amazon, which handles checkout information.</p>
      </Section>
      <Section title="2. How We Use Your Information">
        <p>We use account and wishlist data to provide this site's features, maintain security, and respond to support requests. Amazon handles purchase, delivery, and order updates.</p>
      </Section>
      <Section title="3. Data Sharing">
        <p>When you choose to shop on Amazon, your browser follows the Amazon product link. Amazon's privacy policy governs information you provide there. We do not receive your Amazon order or payment details through this site.</p>
      </Section>
      <Section title="4. Cookies">
        <p>We use essential cookies for authentication. You can disable cookies in your browser, though sign-in features may not work correctly.</p>
      </Section>
      <Section title="5. Data Security">
        <p>We use industry-standard encryption (HTTPS/TLS) for all data transmission. Passwords are hashed using bcrypt. JWT tokens expire after 24 hours.</p>
      </Section>
      <Section title="6. Your Rights (DPDP Act, India)">
        <p>You have the right to: access your personal data, correct inaccurate data, delete your account and data, and withdraw consent. Contact us at support@enen.com to exercise these rights.</p>
      </Section>
      <Section title="7. Retention">
        <p>We do not store Amazon order records. Account data is retained while your account is active and handled in response to account deletion requests.</p>
      </Section>
      <Section title="8. Contact">
        <p>For privacy concerns: support@enen.com · ENEN Apparel Co., India</p>
      </Section>
    </div>
  </div>
);

export default PrivacyPolicy;
