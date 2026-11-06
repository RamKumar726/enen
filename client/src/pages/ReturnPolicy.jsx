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
        <p className="text-xs text-gray-500">Last updated: November 2026 | ENEN Apparel Co.</p>
    </div>
    <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 space-y-8">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
        <p className="text-emerald-400 font-bold text-sm">Returns and refunds are handled by Amazon for Amazon purchases.</p>
      </div>
      <Section title="Eligible Returns">
        <p>Check the product's return eligibility and current return window on Amazon before placing your order.</p>
      </Section>
      <Section title="Non-Returnable Items">
        <p>Amazon displays any product-specific return restrictions on its product page and in your order details.</p>
      </Section>
      <Section title="How to Initiate a Return">
        <p>Open your Amazon order and follow Amazon's return or replacement instructions. ENEN cannot access or manage Amazon orders.</p>
      </Section>
      <Section title="Refund Method">
        <p>Amazon displays the refund method and timing for your order.</p>
      </Section>
      <Section title="Exchange">
        <p>Check the options available from Amazon for your order.</p>
      </Section>
      <Section title="Contact">
        <p>For an Amazon order, contact Amazon through your order details. For questions about this website, contact support@enen.com.</p>
      </Section>
    </div>
  </div>
);

export default ReturnPolicy;
