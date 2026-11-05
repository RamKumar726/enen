import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchUserOrders, setOrdersPage } from '../redux/slices/orderSlice';
import { orderService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PackageCheck, Flame, Printer, XCircle, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw, Search } from 'lucide-react';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, page, pages, totalOrders } = useSelector((state) => state.orders);
  const location = useLocation();
  const trackedOrderRef = useRef(null);

  // Read ?track= param from URL (from navbar tracking input)
  const trackParam = new URLSearchParams(location.search).get('track');
  const [trackedOrderId, setTrackedOrderId] = useState(trackParam || '');
  const [highlightedOrderId, setHighlightedOrderId] = useState(trackParam || '');

  // Cancel & Return states
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [customerUpi, setCustomerUpi] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMsg, setBannerMsg] = useState(null);
  const [bannerType, setBannerType] = useState('success');

  useEffect(() => {
    dispatch(fetchUserOrders(page));
  }, [dispatch, page]);

  // When orders load and there's a tracked ID, scroll to it
  useEffect(() => {
    if (highlightedOrderId && orders.length > 0) {
      setTimeout(() => {
        if (trackedOrderRef.current) {
          trackedOrderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    }
  }, [highlightedOrderId, orders]);

  const showBanner = (msg, type = 'success') => {
    setBannerMsg(msg);
    setBannerType(type);
    setTimeout(() => setBannerMsg(null), 5000);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setActionLoading(true);
    try {
      const res = await orderService.cancelOrder(cancelModalOrder._id, { reason: cancelReason });
      if (res.success) {
        showBanner(res.message || 'Order cancelled successfully');
        setCancelModalOrder(null);
        setCancelReason('');
        dispatch(fetchUserOrders(page));
      }
    } catch (err) {
      showBanner(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setActionLoading(true);
    try {
      const res = await orderService.requestReturn(returnModalOrder._id, {
        reason: returnReason,
        customerUpiForRefund: customerUpi
      });
      if (res.success) {
        showBanner(res.message || 'Return request submitted successfully');
        setReturnModalOrder(null);
        setReturnReason('');
        setCustomerUpi('');
        dispatch(fetchUserOrders(page));
      }
    } catch (err) {
      showBanner(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showBanner('Allow popups to print your invoice.', 'error');
      return;
    }
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    printWindow.document.write(`
      <html>
        <head>
          <title>ENEN Invoice - ${escapeHtml(order.trackingNumber || order._id)}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #111; }
            .header { display: flex; justify-content: space-between; border-b: 2px solid #E85D3D; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; color: #E85D3D; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background: #f8f8f8; }
            .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ENEN</div>
              <div>UNLEASH THE BLAZE</div>
            </div>
            <div>
              <h3>INVOICE</h3>
              <p>Order ID: ${escapeHtml(order._id)}</p>
              <p>Tracking: ${escapeHtml(order.trackingNumber || 'N/A')}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <h4>Shipping Address:</h4>
          <p>${escapeHtml(order.shippingAddress?.name)}<br/>${escapeHtml(order.shippingAddress?.street)}, ${escapeHtml(order.shippingAddress?.city)}</p>

          <table class="table">
            <thead>
              <tr>
                <th>Product Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.products || []).map(p => `
                <tr>
                  <td>${escapeHtml(p.name)}</td>
                  <td>${escapeHtml(p.size)}</td>
                  <td>${escapeHtml(p.quantity)}</td>
                  <td>&#8377;${escapeHtml(p.price)}</td>
                  <td>&#8377;${(p.price * p.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Total Amount Paid: &#8377;${(order.totalAmount || 0).toFixed(2)} (${escapeHtml(order.paymentMethod)})
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Shipped':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'Processing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Return Requested':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Returned':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Cancelled':
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="LOADING YOUR FLAME ORDERS..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#282834] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4" />
            <span>ENEN ORDER VAULT</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            MY ORDER <span className="text-flame-gradient">HISTORY</span>
          </h1>
        </div>
        {/* Inline order search */}
        <form
          onSubmit={(e) => { e.preventDefault(); setHighlightedOrderId(trackedOrderId); }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Order ID..."
              value={trackedOrderId}
              onChange={(e) => setTrackedOrderId(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#18181F] border border-[#282834] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D] w-48 transition-colors"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-[#E85D3D]/15 text-[#E85D3D] text-xs font-bold rounded-xl border border-[#E85D3D]/30 hover:bg-[#E85D3D]/25 transition-all">
            Find
          </button>
          {highlightedOrderId && (
            <button type="button" onClick={() => { setHighlightedOrderId(''); setTrackedOrderId(''); }} className="text-[10px] text-gray-500 hover:text-white transition-colors">
              ✕ Clear
            </button>
          )}
        </form>
      </div>

      {bannerMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
          bannerType === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {bannerType === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {bannerMsg}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-[#18181F] border border-[#282834] rounded-3xl space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#22222D] text-[#E85D3D] rounded-full flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Ignite your wardrobe! Check out our latest anime drops and track your packages right here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isHighlighted = highlightedOrderId && (
              order._id?.toLowerCase().includes(highlightedOrderId.toLowerCase()) ||
              order._id === highlightedOrderId
            );
            return (
            <div
              key={order._id}
              ref={isHighlighted ? trackedOrderRef : null}
              className={`bg-[#18181F] border rounded-3xl p-6 space-y-6 shadow-xl transition-all duration-500 ${
                isHighlighted
                  ? 'border-[#E85D3D] shadow-flame-glow ring-1 ring-[#E85D3D]/30'
                  : 'border-[#282834]'
              }`}
            >
              {/* ORDER HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">ID: {order._id}</span>
                    <span className={`px-3 py-0.5 text-[10px] uppercase font-extrabold rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                      ● {order.orderStatus}
                    </span>

                    {/* PAYMENT & REFUND BADGES */}
                    {order.paymentStatus === 'Refund Pending' && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        🔄 Refund Pending (₹{order.totalAmount})
                      </span>
                    )}
                    {order.paymentStatus === 'Refunded' && (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✅ Refunded (₹{order.totalAmount})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • Payment: <strong className="text-white">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </p>
                  {order.cancelReason && (
                    <p className="text-[11px] text-red-400 mt-1 font-semibold">Cancellation Reason: {order.cancelReason}</p>
                  )}
                  {order.returnReason && (
                    <p className="text-[11px] text-purple-400 mt-1 font-semibold">Return Reason: {order.returnReason}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400 font-bold">
                    Tracking: <strong className={order.trackingNumber ? 'text-[#FF7A00] font-mono' : 'text-gray-500'}>{order.trackingNumber || 'Pending Assignment'}</strong>
                  </span>

                  {/* ACTION BUTTONS: CANCEL & RETURN */}
                  {order.orderStatus === 'Processing' && (
                    <button
                      onClick={() => { setCancelModalOrder(order); setCancelReason(''); }}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  {order.orderStatus === 'Delivered' && (
                    <button
                      onClick={() => { setReturnModalOrder(order); setReturnReason(''); setCustomerUpi(''); }}
                      className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Return</span>
                    </button>
                  )}

                  <button
                    onClick={() => handlePrintInvoice(order)}
                    className="p-2 bg-[#22222D] hover:bg-[#E85D3D] text-white rounded-xl transition-colors border border-[#282834]"
                    title="Download / Print Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PRODUCTS LIST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(order.products || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#121218] border border-[#282834] rounded-2xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-xl bg-[#18181F]"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-gray-400">
                        Size: <strong className="text-gray-200">{item.size}</strong> • Qty: {item.quantity}
                      </p>
                      <span className="text-xs font-bold text-[#E85D3D]">₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ORDER FOOTER TOTAL */}
              <div className="flex items-center justify-between pt-2 border-t border-[#282834] text-xs">
                <span className="text-gray-400">
                  Shipping to: <strong className="text-white">{order.shippingAddress?.street}, {order.shippingAddress?.city}</strong>
                </span>
                <div className="text-right">
                  <span className="text-gray-400 mr-2">Total:</span>
                  <span className="text-lg font-extrabold text-flame-gradient">
                    ₹{(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
            );
          })}
          {pages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-[#282834] bg-[#18181F] p-4 text-xs text-gray-300">
              <span>Page {page} of {pages} · {totalOrders} orders</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => dispatch(setOrdersPage(page - 1))} className="rounded-lg border border-[#282834] px-3 py-2 disabled:opacity-40">Previous</button>
                <button disabled={page >= pages} onClick={() => dispatch(setOrdersPage(page + 1))} className="rounded-lg border border-[#282834] px-3 py-2 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#282834] pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" /> Cancel Order
              </h3>
              <button onClick={() => setCancelModalOrder(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-xs text-gray-300">
                Are you sure you want to cancel order <strong className="text-white">#{cancelModalOrder._id}</strong>?
                {['Online', 'UPI'].includes(cancelModalOrder.paymentMethod) && cancelModalOrder.paymentStatus === 'Paid' && (
                  <span className="block mt-1 text-amber-400 font-semibold">
                    ⚡ A full refund of ₹{cancelModalOrder.totalAmount} will be initiated to your payment account.
                  </span>
                )}
              </p>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Reason for Cancellation</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed my mind / Selected wrong size"
                  className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 py-2.5 bg-[#22222D] hover:bg-gray-700 text-white font-bold text-xs rounded-xl"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#282834] pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" /> Request Item Return
              </h3>
              <button onClick={() => setReturnModalOrder(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <p className="text-xs text-gray-300">
                Submitting return request for order <strong className="text-white">#{returnModalOrder._id}</strong>.
              </p>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Reason for Return</label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Size didn't fit / Defective item / Not as expected"
                  className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {returnModalOrder.paymentMethod === 'Cash on Delivery' && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Your UPI ID for Refund</label>
                  <input
                    type="text"
                    required
                    value={customerUpi}
                    onChange={(e) => setCustomerUpi(e.target.value)}
                    placeholder="yourname@upi (e.g. gpay / phonepe id)"
                    className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Needed to credit refund for COD order</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="flex-1 py-2.5 bg-[#22222D] hover:bg-gray-700 text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersPage;
