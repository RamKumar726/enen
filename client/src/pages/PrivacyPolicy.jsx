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
        <p>We collect information you provide when creating an account (name, email, phone), placing orders (shipping address, payment confirmation), and browsing our site (cookies, device info, IP address).</p>
        <p>We do NOT store card numbers. All payment processing is handled by Razorpay, which is PCI-DSS compliant.</p>
      </Section>
      <Section title="2. How We Use Your Information">
        <p>We use your data to: process and deliver orders, send order confirmation and shipping updates, respond to customer support queries, improve our website experience, and send marketing communications (only with your consent).</p>
      </Section>
      <Section title="3. Data Sharing">
        <p>We share your information only with: Razorpay (payment processing), courier partners (delivery), and email service providers. We do not sell your personal data to third parties.</p>
      </Section>
      <Section title="4. Cookies">
        <p>We use essential cookies for authentication and cart functionality. Analytics cookies help us understand site usage. You can disable cookies in your browser, though some features may not work correctly.</p>
      </Section>
      <Section title="5. Data Security">
        <p>We use industry-standard encryption (HTTPS/TLS) for all data transmission. Passwords are hashed using bcrypt. JWT tokens expire after 24 hours.</p>
      </Section>
      <Section title="6. Your Rights (DPDP Act, India)">
        <p>You have the right to: access your personal data, correct inaccurate data, delete your account and data, and withdraw consent. Contact us at support@enen.com to exercise these rights.</p>
      </Section>
      <Section title="7. Retention">
        <p>We retain order records for 7 years as required by Indian tax laws. Account data is deleted within 30 days of account deletion request.</p>
      </Section>
      <Section title="8. Contact">
        <p>For privacy concerns: support@enen.com · ENEN Apparel Co., India</p>
      </Section>
    </div>
  </div>
);

export default PrivacyPolicy;
