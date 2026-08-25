import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { PackageCheck, Flame, Printer, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ENEN Invoice - ${order.trackingNumber || order._id}</title>
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
              <p>Order ID: ${order._id}</p>
              <p>Tracking: ${order.trackingNumber || 'N/A'}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <h4>Shipping Address:</h4>
          <p>${order.shippingAddress?.name || ''}<br/>${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}</p>

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
                  <td>${p.name}</td>
                  <td>${p.size}</td>
                  <td>${p.quantity}</td>
                  <td>$${p.price}</td>
                  <td>$${(p.price * p.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Total Amount Paid: $${(order.totalAmount || 0).toFixed(2)} (${order.paymentMethod})
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="LOADING YOUR FLAME ORDERS..." />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Shipped':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'Processing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#282834] pb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4" />
            <span>ENEN ORDER VAULT</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            MY ORDER <span className="text-flame-gradient">HISTORY</span>
          </h1>
        </div>
      </div>

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
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl"
            >
              {/* ORDER HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono">ID: {order._id}</span>
                    <span className={`px-3 py-0.5 text-[10px] uppercase font-extrabold rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                      ● {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • Payment: <strong className="text-white">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-bold">
                    Tracking: <strong className="text-[#FF7A00] font-mono">{order.trackingNumber || 'ENEN-882391'}</strong>
                  </span>

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
                      <span className="text-xs font-bold text-[#E85D3D]">${item.price}</span>
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
                  <span className="text-gray-400 mr-2">Total Paid:</span>
                  <span className="text-lg font-extrabold text-flame-gradient">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OrdersPage;
