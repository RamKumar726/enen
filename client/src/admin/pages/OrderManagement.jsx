import React, { useEffect, useState } from 'react';
import { adminService, orderService, paymentService } from '../../services/api';
import api from '../../services/api';
import { PackageCheck, Search, Printer, Truck, Wifi, ExternalLink, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('success');
  const [shippingOrderId, setShippingOrderId] = useState(null); // which order is being shipped
  const [srConnected, setSrConnected] = useState(null); // null=untested, true, false
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(null), 5000);
  };

  const loadOrders = (requestedPage = page) => {
    setLoading(true);
    adminService.getAllOrders({ page: requestedPage, limit: 50, status: statusFilter, search })
      .then(res => { if (res.success) { setOrders(res.orders || []); setPage(res.page || requestedPage); setPages(res.pages || 1); setTotalOrders(res.totalOrders || 0); } })
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => loadOrders(1), 250);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      if (res.success) { showMsg(`Order updated to ${newStatus}`); loadOrders(); }
    } catch (err) { showMsg(err.message || 'Failed to update order status', 'error'); loadOrders(); }
  };

  // Test Shiprocket connection
  const testSRConnection = async () => {
    try {
      const res = await api.get('/shiprocket/test-connection');
      setSrConnected(true);
      showMsg('Shiprocket connected successfully!');
    } catch (err) {
      setSrConnected(false);
      showMsg('Shiprocket connection failed. Check your credentials in .env', 'error');
    }
  };

  // Create a Shiprocket shipment for an order
  const handleShipOrder = async (orderId) => {
    setShippingOrderId(orderId);
    try {
      const res = await api.post(`/shiprocket/ship/${orderId}`);
      if (res.success) {
        showMsg(res.message || `Shipment created! AWB: ${res.awbNumber}`);
        loadOrders();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      showMsg('Shiprocket error: ' + errMsg, 'error');
    } finally {
      setShippingOrderId(null);
    }
  };

  const handlePrintInvoice = (order) => {
    const customerName = order.userId
      ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`
      : order.shippingAddress?.name || 'Customer';
    const customerEmail = order.userId?.email || '';
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showMsg('Allow popups to print the invoice', 'error'); return; }
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    printWindow.document.write(`<html><head><title>ENEN Invoice - ${escapeHtml(order.trackingNumber || order._id)}</title>
      <style>body{font-family:sans-serif;padding:40px;}.header{display:flex;justify-content:space-between;border-bottom:2px solid #E85D3D;padding-bottom:20px;}.logo{font-size:26px;font-weight:900;color:#E85D3D;}.table{width:100%;border-collapse:collapse;margin-top:25px;}.table th,.table td{border:1px solid #ddd;padding:10px;text-align:left;}.table th{background:#f4f4f4;}</style>
      </head><body>
      <div class="header"><div><div class="logo">ENEN</div><div>UNLEASH THE BLAZE</div></div>
      <div><h3>INVOICE</h3><p>Order: ${escapeHtml(order._id)}</p><p>Tracking: ${escapeHtml(order.trackingNumber || 'N/A')}</p><p>Date: ${new Date(order.createdAt||Date.now()).toLocaleDateString()}</p><p>Customer: ${escapeHtml(customerName)}</p></div></div>
      <p>Ship To: ${escapeHtml(order.shippingAddress?.street)}, ${escapeHtml(order.shippingAddress?.city)}, ${escapeHtml(order.shippingAddress?.state)} - ${escapeHtml(order.shippingAddress?.pincode)}</p>
      <table class="table"><thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${(order.products||[]).map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.size)}</td><td>${escapeHtml(p.quantity)}</td><td>&#8377;${escapeHtml(p.price)}</td><td>&#8377;${(p.price*p.quantity).toFixed(2)}</td></tr>`).join('')}</tbody></table>
      <h3 style="text-align:right;margin-top:20px;">Total: &#8377;${(order.totalAmount||0).toFixed(2)} (${escapeHtml(order.paymentMethod)} — ${escapeHtml(order.paymentStatus)})</h3>
      </body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const filteredOrders = orders.filter(o => {
    const customerName = o.userId
      ? `${o.userId.firstName || ''} ${o.userId.lastName || ''}`.toLowerCase()
      : (o.shippingAddress?.name || '').toLowerCase();
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      (o._id || '').toLowerCase().includes(searchLower) ||
      customerName.includes(searchLower) ||
      (o.trackingNumber || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Delivered': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Return Requested': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Returned': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <PackageCheck className="w-4 h-4 text-[#FF7A00]" />
            <span>ENEN ORDER MANAGEMENT</span>
          </div>
          <h1 className="text-3xl font-black text-white">ALL CUSTOMER <span className="text-[#E85D3D]">ORDERS</span></h1>
        </div>

        {/* Shiprocket connection test */}
        <button
          onClick={testSRConnection}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
            srConnected === true
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : srConnected === false
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-[#18181F] border-[#282834] text-gray-400 hover:border-[#E85D3D] hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          {srConnected === true ? '✅ Shiprocket Connected' : srConnected === false ? '❌ Shiprocket Failed' : '🔌 Test Shiprocket'}
        </button>
      </div>

      {/* MESSAGE */}
      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
          msgType === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msgType === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {msg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input type="text" placeholder="Search by Order ID, customer name, or tracking..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]" />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121218] border border-[#282834] text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#E85D3D]">
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Return Requested">Return Requested</option>
            <option value="Returned">Returned</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-white">
          Order Vault ({filteredOrders.length} on this page, {totalOrders} total)
        </h3>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#121218] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#282834]">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment & Refund</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tracking / Ship</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282834]">
                {filteredOrders.map((ord) => {
                  const customerName = ord.userId
                    ? `${ord.userId.firstName || ''} ${ord.userId.lastName || ''}`
                    : ord.shippingAddress?.name || 'Customer';
                  const customerEmail = ord.userId?.email || '';
                  const isBeingShipped = shippingOrderId === ord._id;
                  const alreadyShipped = !!ord.shiprocketOrderId;

                  return (
                    <tr key={ord._id} className="hover:bg-[#22222D]">
                      {/* Order ID */}
                      <td className="p-4">
                        <p className="font-mono font-bold text-white text-[11px]">{ord._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{new Date(ord.createdAt || Date.now()).toLocaleDateString()}</p>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-extrabold text-white">{customerName}</p>
                        {customerEmail && <p className="text-[10px] text-gray-400">{customerEmail}</p>}
                        <p className="text-[10px] text-gray-500">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</p>
                        <p className="text-[10px] text-gray-600 font-mono">📍 {ord.shippingAddress?.pincode}</p>
                      </td>

                      {/* Items */}
                      <td className="p-4 max-w-[180px] text-gray-300 text-[11px]">
                        {(ord.products || []).map(p => (
                          <div key={p.productId}>{p.name} · {p.size} × {p.quantity}</div>
                        ))}
                      </td>

                      {/* Total */}
                      <td className="p-4 font-extrabold text-[#E85D3D] text-sm">₹{(ord.totalAmount || 0).toFixed(2)}</td>

                      {/* Payment & Refund */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : ord.paymentStatus === 'Refunded'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : ord.paymentStatus === 'Refund Pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : ord.paymentStatus === 'Failed'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}>
                          {ord.paymentMethod}<br />{ord.paymentStatus}
                        </span>
                        {ord.customerUpiForRefund && (
                          <p className="text-[10px] text-purple-400 font-mono mt-1">UPI: {ord.customerUpiForRefund}</p>
                        )}
                        {ord.paymentStatus === 'Refund Pending' && ['Online', 'UPI'].includes(ord.paymentMethod) && ord.refundStatus !== 'Processing' && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await paymentService.refundOrder(ord._id);
                                showMsg(res.message || 'Refund request sent to Razorpay');
                                loadOrders();
                              } catch (err) { showMsg(err.message || 'Refund request failed', 'error'); }
                            }}
                            className="mt-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold rounded"
                          >
                            Process Razorpay Refund
                          </button>
                        )}
                        {ord.refundStatus === 'Processing' && <p className="text-[10px] text-amber-300 mt-1">Refund processing with Razorpay</p>}
                        {ord.paymentStatus === 'Refund Pending' && ord.paymentMethod === 'Cash on Delivery' && (
                          <button onClick={async () => {
                            if (!window.confirm('Confirm the COD refund has actually been sent to the customer?')) return;
                            try {
                              await orderService.updateOrderStatus(ord._id, { paymentStatus: 'Refunded' });
                              showMsg('External COD refund recorded'); loadOrders();
                            } catch (err) { showMsg(err.message || 'Could not record COD refund', 'error'); }
                          }} className="mt-1 px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-bold rounded">
                            Record COD Refund
                          </button>
                        )}
                      </td>

                      {/* Status dropdown */}
                      <td className="p-4">
                        <select
                          value={ord.orderStatus || 'Processing'}
                          onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none border ${getStatusBadgeClass(ord.orderStatus)} bg-[#121218]`}
                        >
                          <option value="Processing">🟡 Processing</option>
                          <option value="Shipped">🔵 Shipped</option>
                          <option value="Delivered">🟢 Delivered</option>
                          <option value="Return Requested">🟣 Return Requested</option>
                          <option value="Returned">🔷 Returned</option>
                          <option value="Cancelled">🔴 Cancelled</option>
                        </select>
                        {ord.cancelReason && (
                          <p className="text-[9px] text-red-400 mt-1 max-w-[120px] truncate" title={ord.cancelReason}>Reason: {ord.cancelReason}</p>
                        )}
                        {ord.returnReason && (
                          <p className="text-[9px] text-purple-400 mt-1 max-w-[120px] truncate" title={ord.returnReason}>Return Reason: {ord.returnReason}</p>
                        )}
                      </td>

                      {/* Tracking / Shiprocket button */}
                      <td className="p-4 min-w-[160px]">
                        {['Needs Reconciliation', 'Creating'].includes(ord.shiprocketStatus) && (
                          <div className="mb-2 space-y-1">
                            <p className="text-[10px] text-amber-300">Carrier status needs review</p>
                            <button onClick={async () => {
                              if (!window.confirm('Confirm you checked Shiprocket and this order was not created there.')) return;
                              try { await api.post(`/shiprocket/resolve/${ord._id}`, { resolution: 'no_shipment' }); showMsg('Shipment can be retried'); loadOrders(); }
                              catch (err) { showMsg(err.message || 'Could not reconcile shipment', 'error'); }
                            }} className="block text-[10px] text-amber-300 underline">Confirm no shipment exists</button>
                            <button onClick={async () => {
                              const srOrderId = window.prompt('Shiprocket order ID', ord.shiprocketOrderId || '');
                              if (!srOrderId) return;
                              const shipmentId = window.prompt('Shiprocket shipment ID', ord.shiprocketShipmentId || '');
                              if (!shipmentId) return;
                              const awb = window.prompt('AWB (leave blank if not assigned)', ord.trackingNumber || '');
                              if (awb === null) return;
                              try { await api.post(`/shiprocket/resolve/${ord._id}`, { resolution: 'shipment_exists', shiprocketOrderId: srOrderId, shiprocketShipmentId: shipmentId, trackingNumber: awb }); showMsg('Carrier shipment linked'); loadOrders(); }
                              catch (err) { showMsg(err.message || 'Could not reconcile shipment', 'error'); }
                            }} className="block text-[10px] text-blue-300 underline">Link existing shipment</button>
                          </div>
                        )}
                        {alreadyShipped ? (
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">AWB:</p>
                            <p className="font-mono text-[11px] text-white font-bold">{ord.trackingNumber || '(pending)'}</p>
                            {ord.trackingNumber && (
                              <a
                                href={`https://shiprocket.co/tracking/${ord.trackingNumber}`}
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" /> Track Package
                              </a>
                            )}
                            {!ord.trackingNumber && ord.shiprocketStatus === 'Created' && (
                              <button onClick={async () => {
                                const awb = window.prompt('Enter the AWB shown in Shiprocket');
                                if (!awb) return;
                                try { await orderService.updateOrderStatus(ord._id, { trackingNumber: awb.trim() }); showMsg('AWB saved'); loadOrders(); }
                                catch (err) { showMsg(err.message || 'Could not save AWB', 'error'); }
                              }} className="text-[10px] text-amber-300 underline">Enter AWB</button>
                            )}
                          </div>
                        ) : (
                          <button
                            disabled={isBeingShipped || ord.orderStatus === 'Cancelled'}
                            onClick={() => handleShipOrder(ord._id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-[10px] font-extrabold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {isBeingShipped
                              ? <><Loader2 className="w-3 h-3 animate-spin" /> Shipping...</>
                              : <><Truck className="w-3 h-3" /> Ship via Shiprocket</>
                            }
                          </button>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-gray-400 text-[11px]">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      {/* Print invoice */}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#282834] pt-4 text-xs text-gray-300">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => loadOrders(page - 1)} className="rounded-lg border border-[#282834] px-3 py-2 disabled:opacity-40">Previous</button>
              <button disabled={page >= pages} onClick={() => loadOrders(page + 1)} className="rounded-lg border border-[#282834] px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Shiprocket Info Panel */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6">
        <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#E85D3D]" /> How Shiprocket Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-[11px] text-gray-400">
          {[
            { n: '1', t: 'Click Ship', d: 'Click "Ship via Shiprocket" on any Processing order' },
            { n: '2', t: 'Auto-create', d: 'ENEN creates the shipment in Shiprocket and assigns best courier' },
            { n: '3', t: 'AWB saved', d: 'AWB tracking number auto-saves to the order in ENEN' },
            { n: '4', t: 'Customer tracks', d: 'Customer sees a live "Track Package" button on their orders page' },
          ].map(({ n, t, d }) => (
            <div key={n} className="bg-[#121218] rounded-2xl p-4 border border-[#282834]">
              <div className="w-7 h-7 bg-[#E85D3D]/20 rounded-lg flex items-center justify-center text-[#E85D3D] font-black text-xs mb-3">{n}</div>
              <p className="font-bold text-white mb-1">{t}</p>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-[11px]">
          <strong>Setup required:</strong> Add <code className="bg-black/30 px-1 py-0.5 rounded">SHIPROCKET_EMAIL</code> and <code className="bg-black/30 px-1 py-0.5 rounded">SHIPROCKET_PASSWORD</code> to your <code className="bg-black/30 px-1 py-0.5 rounded">server/.env</code> file, then click "Test Shiprocket" above to verify the connection.
        </div>
      </div>

    </div>
  );
};

export default OrderManagement;
