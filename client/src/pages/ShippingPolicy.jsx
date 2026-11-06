import React from "react";
import { Truck } from "lucide-react";

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-lg font-extrabold text-white border-l-4 border-[#E85D3D] pl-4">{title}</h2>
    <div className="text-sm text-gray-400 leading-relaxed space-y-2 pl-4">{children}</div>
  </div>
);

const ShippingPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
    <div className="text-center space-y-3">
      <div className="w-14 h-14 bg-[#E85D3D]/20 rounded-2xl flex items-center justify-center mx-auto"><Truck className="w-7 h-7 text-[#E85D3D]" /></div>
      <h1 className="text-3xl font-black text-white">Shipping Policy</h1>
      <p className="text-xs text-gray-500">Last updated: September 2026 | ENEN Apparel Co.</p>
    </div>
    <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Orders", value: "Placed on Amazon" },
          { label: "Delivery", value: "Managed by Amazon" },
          { label: "Shipping Cost", value: "Shown on Amazon" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#121218] border border-[#282834] rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
            <p className="text-white font-extrabold mt-1">{value}</p>
          </div>
        ))}
      </div>
      <Section title="Shipping Charges">
        <p>Shipping options and charges are shown by Amazon during checkout.</p>
      </Section>
      <Section title="Delivery Coverage">
        <p>Amazon shows delivery availability for your address on the product page and during checkout.</p>
      </Section>
      <Section title="Order Tracking">
        <p>Amazon provides order tracking and delivery updates for purchases made on Amazon.</p>
      </Section>
      <Section title="Failed Delivery">
        <p>For a delivery issue, use Amazon's order support for the purchase.</p>
      </Section>
      <Section title="Damaged During Transit">
        <p>If your package arrives damaged, take photos immediately and email support@enen.com within 24 hours of delivery. We will arrange a free replacement.</p>
      </Section>
      <Section title="Contact">
        <p>Shipping questions: support@enen.com | Response within 24 hours</p>
      </Section>
    </div>
  </div>
);

export default ShippingPolicy;
