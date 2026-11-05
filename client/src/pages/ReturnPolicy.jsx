import React from "react";
import { RefreshCw } from "lucide-react";

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-lg font-extrabold text-white border-l-4 border-[#E85D3D] pl-4">{title}</h2>
    <div className="text-sm text-gray-400 leading-relaxed space-y-2 pl-4">{children}</div>
  </div>
);

const ReturnPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
    <div className="text-center space-y-3">
      <div className="w-14 h-14 bg-[#E85D3D]/20 rounded-2xl flex items-center justify-center mx-auto"><RefreshCw className="w-7 h-7 text-[#E85D3D]" /></div>
      <h1 className="text-3xl font-black text-white">Return & Refund Policy</h1>
      <p className="text-xs text-gray-500">Last updated: September 2026 | ENEN Apparel Co.</p>
    </div>
    <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 space-y-8">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
        <p className="text-emerald-400 font-bold text-sm">7-Day Return Policy | Free Return Pickup | Full Refund</p>
      </div>
      <Section title="Eligible Returns">
        <p>We accept returns within 7 days of delivery for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Wrong size delivered</li>
          <li>Damaged or defective product</li>
          <li>Wrong product delivered</li>
          <li>Poor print quality</li>
        </ul>
      </Section>
      <Section title="Non-Returnable Items">
        <ul className="list-disc list-inside space-y-1">
          <li>Items worn, washed, or altered</li>
          <li>Items without original tags</li>
          <li>Custom/personalized orders</li>
          <li>Items returned after 7 days of delivery</li>
        </ul>
      </Section>
      <Section title="How to Initiate a Return">
        <p>1. Email support@enen.com with your Order ID and photos of the issue.</p>
        <p>2. Our team will review and approve within 24 hours.</p>
        <p>3. A free pickup will be scheduled at your address.</p>
        <p>4. Once received and inspected, your refund will be processed within 5–7 business days.</p>
      </Section>
      <Section title="Refund Method">
        <p>Refunds are credited to your original payment method. UPI/Card refunds: 5–7 business days. Bank transfers: 3–5 business days.</p>
        <p>COD orders will be refunded via bank transfer (account details required).</p>
      </Section>
      <Section title="Exchange">
        <p>We offer size exchanges for the same product. Email support@enen.com with your order ID and desired size. Subject to stock availability.</p>
      </Section>
      <Section title="Contact">
        <p>Returns & Refunds: support@enen.com | Response within 24 hours</p>
      </Section>
    </div>
  </div>
);

export default ReturnPolicy;
