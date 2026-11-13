import React, { useEffect, useState } from 'react';
import { Calendar, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrderWithItems, upsertUserProfile } from '../services/firestoreService';
import { DestinationRegion } from '../types';
import { ResilientImage } from './ResilientImage';

const REGIONS: DestinationRegion[] = [
  'Japan',
  'Europe',
  'Asia',
  'Taiwan',
  'International',
];

export function CartCheckoutDrawer() {
  const { user, profile, signIn } = useAuth();
  const {
    items,
    orderMode,
    setOrderMode,
    drawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalUsd,
    setActiveInvoice,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [destinationRegion, setDestinationRegion] = useState<DestinationRegion>('Japan');
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || profile?.displayName || user.displayName || '');
      setCustomerEmail((prev) => prev || profile?.email || user.email || '');
      setCompanyName((prev) => prev || profile?.companyName || '');
      setCustomerPhone((prev) => prev || profile?.phone || '');
      setShippingAddress((prev) => prev || profile?.shippingAddress || '');
    }
  }, [user, profile]);

  if (!drawerOpen) return null;

  const taxUsd = destinationRegion === 'Japan' ? Number((subtotalUsd * 0.1).toFixed(2)) : 0;
  const totalUsd = Number((subtotalUsd + taxUsd).toFixed(2));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Please add at least one product before submitting.');
      return;
    }

    if (orderMode === 'booking' && !bookingDate) {
      setErrorMsg('Please select a preferred fabrication or equipment booking date.');
      return;
    }

    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await signIn();
      }
      if (!activeUser) {
        setErrorMsg('Sign-in is required to issue an official numbered invoice.');
        setSubmitting(false);
        return;
      }

      const finalName = customerName.trim() || activeUser.displayName || 'Valued Client';
      const finalEmail = customerEmail.trim() || activeUser.email || '';

      await upsertUserProfile({
        uid: activeUser.uid,
        displayName: finalName,
        email: finalEmail,
        companyName: companyName.trim(),
        phone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
      });

      const createdOrder = await createOrderWithItems({
        userId: activeUser.uid,
        orderType: orderMode,
        customerName: finalName,
        companyName: companyName.trim(),
        customerEmail: finalEmail,
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        destinationRegion,
        bookingDate: orderMode === 'booking' ? bookingDate : '',
        notes: notes.trim(),
        cartItems: items,
      });

      clearCart();
      setDrawerOpen(false);
      setActiveInvoice(createdOrder);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to complete order. Please verify your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true" aria-label="Order and Booking Bag">
      <div className="w-full max-w-xl bg-[#FAF6EA] border-l border-[#E2D8C5] h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2D8C5] bg-[#F3ECE0]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#5A1418]" />
            <h2 className="text-lg font-semibold text-[#1F1815]">
              Order & Fabrication Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close order bag"
            className="p-2 text-[#584B44] hover:text-[#1F1815] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Segmented Mode Selector */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#7C6E65] mb-2">
              Transaction Mode
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFE7D6] border border-[#E2D8C5]">
              <button
                type="button"
                onClick={() => setOrderMode('order')}
                className={`py-2 px-3 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  orderMode === 'order'
                    ? 'bg-[#5A1418] text-[#FAF6EA]'
                    : 'text-[#584B44] hover:text-[#1F1815]'
                }`}
              >
                Direct E-Commerce Order
              </button>
              <button
                type="button"
                onClick={() => setOrderMode('booking')}
                className={`py-2 px-3 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  orderMode === 'booking'
                    ? 'bg-[#5A1418] text-[#FAF6EA]'
                    : 'text-[#584B44] hover:text-[#1F1815]'
                }`}
              >
                Book Item / Fabrication Slot
              </button>
            </div>
          </div>

          {/* Cart Line Items */}
          {items.length === 0 ? (
            <div className="py-12 text-center border border-[#E2D8C5] bg-[#FFFDF7] px-6">
              <p className="text-sm font-medium text-[#1F1815]">Your order bag is empty.</p>
              <p className="text-xs text-[#584B44] mt-1">
                Browse glass systems, aluminium extrusions, security glass, machinery, or pool equipment to generate an instant order or booking invoice.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2D8C5] border border-[#E2D8C5] bg-[#FFFDF7]">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 shrink-0 bg-[#EFE7D6] overflow-hidden border border-[#E2D8C5]">
                    <ResilientImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-[#7C6E65] truncate">
                      {product.sku} · {product.category}
                    </div>
                    <div className="text-sm font-semibold text-[#1F1815] truncate">
                      {product.name}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[#5A1418] mt-1">
                      ${product.priceUsd.toLocaleString()} {product.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-[#E2D8C5] bg-[#FAF6EA]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 text-[#584B44] hover:text-[#1F1815] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-mono tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 text-[#584B44] hover:text-[#1F1815] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      aria-label="Remove item"
                      className="p-1.5 text-[#7C6E65] hover:text-[#5A1418] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout & Invoice Issuance Form */}
          {items.length > 0 && (
            <form id="psg-checkout-form" onSubmit={handleCheckout} className="space-y-4">
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-medium uppercase tracking-wider text-[#7C6E65]">
                  Billing & Delivery Details (For Official Invoice)
                </div>
                {!user && (
                  <button
                    type="button"
                    onClick={() => signIn()}
                    className="text-xs font-semibold text-[#5A1418] hover:underline cursor-pointer"
                  >
                    Sign in to auto-fill
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Kenji Takahashi"
                    className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    maxLength={140}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Kansai Builders Ltd."
                    className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={160}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="procurement@company.jp"
                    className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={5}
                    maxLength={40}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+81 80 0000 0000"
                    className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Destination Market *
                  </label>
                  <select
                    value={destinationRegion}
                    onChange={(e) => setDestinationRegion(e.target.value as DestinationRegion)}
                    className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {orderMode === 'booking' && (
                  <div>
                    <label className="block text-xs font-medium text-[#584B44] mb-1">
                      Preferred Booking Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#7C6E65] absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Delivery / Project Site Address *
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={300}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="2-14-8 Minato-ku, Tokyo, Japan"
                  className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Custom Dimensions / Fabrication Notes
                </label>
                <textarea
                  rows={2}
                  maxLength={600}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional glazing thickness, RAL/anodized color, or port instructions..."
                  className="w-full px-3 py-2 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Sticky Totals & Checkout Button */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#E2D8C5] bg-[#F3ECE0] space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[#584B44]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  ${subtotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#584B44]">
                <span>
                  {destinationRegion === 'Japan'
                    ? 'Japan Consumption Tax (10%)'
                    : 'International Export Tax (0%)'}
                </span>
                <span className="font-mono tabular-nums">
                  ${taxUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-[#E2D8C5] text-base font-bold text-[#1F1815]">
                <span>Invoice Total</span>
                <span className="font-mono tabular-nums text-[#5A1418]">
                  ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="psg-checkout-form"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#5A1418] text-[#FAF6EA] text-sm font-semibold hover:bg-[#400D10] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting
                ? 'Issuing Official Invoice...'
                : user
                ? orderMode === 'booking'
                  ? 'Confirm Booking & Issue Invoice'
                  : 'Place Order & Issue Invoice'
                : 'Sign In with Google & Issue Invoice'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
