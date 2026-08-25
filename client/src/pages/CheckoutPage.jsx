import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createNewOrder } from '../redux/slices/orderSlice';
import { paymentService, userService } from '../services/api';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Flame, 
  CheckCircle, 
  MapPin, 
  Phone, 
  User, 
  Building, 
  Sparkles,
  Lock
} from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { cartItems, subtotal, discountAmount, taxAmount, shippingAmount, grandTotal, clearCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [shippingForm, setShippingForm] = useState({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}` : '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user) {
      userService.getAddresses().then(res => {
        if (res.success && res.addresses?.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find(a => a.isDefault) || res.addresses[0];
          setSelectedAddressId(defaultAddr._id);
          setShippingForm(defaultAddr);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-[#E85D3D] text-white font-bold rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr._id);
    setShippingForm({
      name: addr.name || `${user?.firstName} ${user?.lastName}`,
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India'
    });
  };

  const handleFormChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async (orderPayload) => {
    try {
      // 1. Create Razorpay order on backend
      const rzpRes = await paymentService.createRazorpayOrder({ amount: grandTotal });
      
      const razorpayKey = rzpRes.key || import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_ENENBlazeKey123';

      const options = {
        key: razorpayKey,
        amount: rzpRes.amount,
        currency: 'INR',
        name: 'ENEN Apparel Co.',
        description: 'UNLEASH THE BLAZE - Order Checkout',
        image: '/favicon.svg',
        order_id: rzpRes.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id || rzpRes.orderId,
              razorpay_payment_id: response.razorpay_payment_id || 'pay_' + Date.now(),
              razorpay_signature: response.razorpay_signature || 'mock_sig'
            });

            // Dispatch order creation
            const created = await dispatch(createNewOrder({
              ...orderPayload,
              paymentStatus: 'Paid',
              paymentId: response.razorpay_payment_id || 'pay_' + Date.now()
            }));

            clearCart();
            setIsSubmitting(false);
            navigate('/orders');
          } catch (err) {
            setErrorMsg('Payment verification failed: ' + err.message);
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingForm.name,
          email: user?.email || 'customer@enen.com',
          contact: shippingForm.phone
        },
        theme: {
          color: '#E85D3D'
        }
      };

      // Check if Razorpay SDK loaded in window
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation when SDK script is blocked or offline
        setTimeout(async () => {
          await dispatch(createNewOrder({
            ...orderPayload,
            paymentStatus: 'Paid',
            paymentId: 'pay_sim_' + Date.now()
          }));
          clearCart();
          setIsSubmitting(false);
          navigate('/orders');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Razorpay error: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!shippingForm.street || !shippingForm.city || !shippingForm.pincode || !shippingForm.phone) {
      setErrorMsg('Please fill in all shipping address fields');
      return;
    }

    setIsSubmitting(true);

    const orderProducts = cartItems.map(i => ({
      productId: i.product?._id || i.product?.id || i.id,
      name: i.product?.name || 'ENEN Graphic Tee',
      image: i.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
      price: i.product?.price || i.price || 24.99,
      quantity: i.quantity,
      size: i.size || 'L',
      color: i.color || 'Black'
    }));

    const orderPayload = {
      products: orderProducts,
      shippingAddress: shippingForm,
      billingAddress: shippingForm,
      paymentMethod,
      totalAmount: grandTotal,
      taxPrice: taxAmount,
      shippingPrice: shippingAmount,
      itemsPrice: subtotal - discountAmount
    };

    if (paymentMethod === 'Razorpay') {
      await handleRazorpayPayment(orderPayload);
    } else {
      // COD or direct card simulation
      try {
        await dispatch(createNewOrder(orderPayload));
        clearCart();
        setIsSubmitting(false);
        navigate('/orders');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to place order');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#282834] pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>100% SECURE ENCRYPTED CHECKOUT</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          FINAL <span className="text-flame-gradient">ORDER CHECKOUT</span>
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-400 text-sm font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SHIPPING ADDRESS & PAYMENT METHOD */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* SAVED ADDRESSES QUICK SELECTION */}
          {savedAddresses.length > 0 && (
            <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E85D3D]" /> Saved Shipping Addresses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => handleAddressSelect(addr)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? 'bg-[#1E1E28] border-[#E85D3D] shadow-flame-glow'
                        : 'bg-[#121218] border-[#282834] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>{addr.name}</span>
                      {addr.isDefault && <span className="text-[10px] text-[#E85D3D] uppercase">Default</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{addr.street}, {addr.city}</p>
                    <p className="text-xs text-gray-500">{addr.pincode} • {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHIPPING ADDRESS FORM */}
          <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-extrabold text-white border-b border-[#282834] pb-4">
              SHIPPING ADDRESS DETAILS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={shippingForm.name}
                  onChange={handleFormChange}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={shippingForm.phone}
                  onChange={handleFormChange}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Street Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="House / Apartment / Street Name"
                  value={shippingForm.street}
                  onChange={handleFormChange}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingForm.city}
                  onChange={handleFormChange}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingForm.state}
                  onChange={handleFormChange}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={shippingForm.pincode}
                  onChange={handleFormChange}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Country</label>
                <input
                  type="text"
                  name="country"
                  readOnly
                  value={shippingForm.country}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-extrabold text-white border-b border-[#282834] pb-4">
              PAYMENT METHOD
            </h3>

            <div className="space-y-3">
              {[
                { id: 'Razorpay', label: 'Razorpay (Credit/Debit Cards, UPI, Netbanking)', desc: 'Instant 256-bit SSL secured gateway', recommended: true },
                { id: 'UPI', label: 'Direct UPI / QR Code', desc: 'Google Pay, PhonePe, Paytm' },
                { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon delivery' }
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === pm.id
                      ? 'bg-[#1E1E28] border-[#E85D3D] shadow-flame-glow'
                      : 'bg-[#121218] border-[#282834] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === pm.id ? 'border-[#E85D3D] bg-[#E85D3D]' : 'border-gray-500'
                    }`}>
                      {paymentMethod === pm.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                        {pm.label}
                        {pm.recommended && (
                          <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-[#E85D3D]/20 text-[#E85D3D] rounded">
                            Recommended
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400">{pm.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
        <div className="lg:col-span-5 bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-2xl sticky top-24">
          <h3 className="text-xl font-extrabold text-white border-b border-[#282834] pb-4">
            ORDER ITEMS ({cartItems.length})
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {cartItems.map((item, idx) => {
              const prod = item.product || {};
              const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';
              const price = prod.price || item.price || 0;

              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={image} alt="Tee" className="w-12 h-14 object-cover rounded-xl bg-[#121218]" />
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{prod.name}</h4>
                      <p className="text-gray-400 text-[11px]">Qty: {item.quantity} • Size: {item.size}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white">${(price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-xs text-gray-300 border-t border-[#282834] pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#FF7A00] font-bold">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (18%)</span>
              <span className="font-bold text-white">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-white">{shippingAmount === 0 ? 'FREE' : `$${shippingAmount.toFixed(2)}`}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-[#282834]">
              <span>Payable Amount</span>
              <span className="text-flame-gradient text-xl">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-sm rounded-2xl shadow-flame-glow flex items-center justify-center gap-2 hover:shadow-flame-intense transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>PROCESSING PAYMENT...</span>
            ) : (
              <>
                <Flame className="w-5 h-5" />
                <span>PAY ${grandTotal.toFixed(2)} & IGNITE ORDER</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default CheckoutPage;
