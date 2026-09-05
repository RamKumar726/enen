import React from "react";
import { FileText } from "lucide-react";

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-lg font-extrabold text-white border-l-4 border-[#E85D3D] pl-4">{title}</h2>
    <div className="text-sm text-gray-400 leading-relaxed space-y-2 pl-4">{children}</div>
  </div>
);

const TermsPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
    <div className="text-center space-y-3">
      <div className="w-14 h-14 bg-[#E85D3D]/20 rounded-2xl flex items-center justify-center mx-auto"><FileText className="w-7 h-7 text-[#E85D3D]" /></div>
      <h1 className="text-3xl font-black text-white">Terms & Conditions</h1>
      <p className="text-xs text-gray-500">Last updated: September 2026 | ENEN Apparel Co.</p>
    </div>
    <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 space-y-8">
      <Section title="1. Acceptance of Terms">
        <p>By accessing and using ENEN (enen.com), you agree to be bound by these Terms and Conditions. If you disagree, please do not use our services.</p>
      </Section>
      <Section title="2. Products & Pricing">
        <p>All prices are in Indian Rupees (INR) and inclusive of applicable GST. We reserve the right to change prices at any time. Product images are for representation purposes; slight color variations may exist due to screen calibration.</p>
      </Section>
      <Section title="3. Orders & Payment">
        <p>By placing an order, you confirm you are authorized to use the payment method provided. Orders are confirmed only after successful payment. We reserve the right to cancel any order for reasons including product unavailability, pricing errors, or suspected fraud.</p>
      </Section>
      <Section title="4. Intellectual Property">
        <p>All designs, logos, and content on ENEN are owned by ENEN Apparel Co. Anime characters and series names are properties of their respective copyright holders. Our original graphic designs and branding are proprietary.</p>
      </Section>
      <Section title="5. User Accounts">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use. We are not liable for any losses from unauthorized account access.</p>
      </Section>
      <Section title="6. Limitation of Liability">
        <p>ENEN shall not be liable for indirect, incidental, or consequential damages arising from your use of our products or services. Our maximum liability shall not exceed the purchase price of the relevant order.</p>
      </Section>
      <Section title="7. Governing Law">
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
      </Section>
      <Section title="8. Contact">
        <p>Questions? Contact us at support@enen.com</p>
      </Section>
    </div>
  </div>
);

export default TermsPage;
