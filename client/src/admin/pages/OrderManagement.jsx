import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/api';
import { PackageCheck, Search, Filter, Printer, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    orderService.getUserOrders()
      .then(res => {
        if (res.success) {
          setOrders(res.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res.success) {
        setMsg(`Order ${orderId} updated to ${newStatus}`);
        loadOrders();
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {}
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ENEN Official Invoice - ${order._id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-b: 2px solid #E85D3D; padding-bottom: 20px; }
            .logo { font-size: 26px; font-weight: 900; color: #E85D3D; }
            .table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .table th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ENEN</div>
              <div>UNLEASH THE BLAZE</div>
            </div>
            <div>
              <h3>OFFICIAL INVOICE</h3>
              <p>Order ID: ${order._id}</p>
              <p>Tracking: ${order.trackingNumber || 'ENEN-991201'}</p>
              <p>Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
          <h4>Customer Shipping Address:</h4>
          <p>${order.shippingAddress?.name || ''}<br/>${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}</p>
          <table class="table">
            <thead>
              <tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${(order.products || []).map(p => `
                <tr><td>${p.name}</td><td>${p.size}</td><td>${p.quantity}</td><td>$${p.price}</td><td>$${(p.price * p.quantity).toFixed(2)}</td></tr>
              `).join('')}
            </tbody>
          </table>
          <h3 style="text-align: right; margin-top: 20px;">Total Paid: $${(order.totalAmount || 0).toFixed(2)} (${order.paymentMethod})</h3>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id.toLowerCase().includes(search.toLowerCase()) || 
                          (o.shippingAddress?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <PackageCheck className="w-4 h-4 text-[#FF7A00]" />
            <span>ENEN ORDER MANAGEMENT SYSTEM</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            CUSTOMER <span className="text-flame-gradient">ORDERS</span>
          </h1>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121218] border border-[#282834] text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#E85D3D]"
          >
            <option value="All">All Order Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-white">Order Vault ({filteredOrders.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121218] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#282834]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Ordered Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status & Action</th>
                <th className="p-4">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282834]">
              {filteredOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-[#22222D]">
                  <td className="p-4 font-mono font-bold text-white text-xs">{ord._id}</td>
                  <td className="p-4">
                    <p className="font-extrabold text-white">{ord.shippingAddress?.name || 'Customer'}</p>
                    <p className="text-[10px] text-gray-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</p>
                  </td>
                  <td className="p-4 max-w-xs text-gray-300">
                    {(ord.products || []).map(p => `${p.name} (${p.size})`).join(', ')}
                  </td>
                  <td className="p-4 font-extrabold text-[#E85D3D] text-sm">${(ord.totalAmount || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#121218] text-gray-300 rounded border border-[#282834]">
                      {ord.paymentMethod} ({ord.paymentStatus})
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={ord.orderStatus || 'Processing'}
                      onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                      className="bg-[#121218] border border-[#282834] text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#E85D3D]"
                    >
                      <option value="Processing">🟡 Processing</option>
                      <option value="Shipped">🔵 Shipped</option>
                      <option value="Delivered">🟢 Delivered</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handlePrintInvoice(ord)}
                      className="p-2 bg-[#22222D] hover:bg-[#E85D3D] text-white rounded-xl transition-colors border border-[#282834]"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OrderManagement;
