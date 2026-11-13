import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, LogIn, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { subscribeUserOrders, updateOrderStatus } from '../services/firestoreService';
import { Order } from '../types';

function formatTimestamp(ts: unknown): string {
  if (!ts) return '—';
  const maybe = ts as { toDate?: () => Date };
  if (typeof maybe.toDate === 'function') {
    return maybe.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return '—';
}

export function InvoicesPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { setActiveInvoice } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'order' | 'booking'>('all');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    const unsub = subscribeUserOrders(
      user.uid,
      (list) => {
        setOrders(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchType = typeFilter === 'all' || o.orderType === typeFilter;
      const q = searchInvoice.trim().toLowerCase();
      const matchSearch =
        !q ||
        o.invoiceNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.destinationRegion.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [orders, typeFilter, searchInvoice]);

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'Cancelled');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-10">
      <div className="border-b border-[#E2D8C5] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            Orders, Bookings & Billing Ledger
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1815]">
            Official Invoice Receipts
          </h1>
          <p className="text-sm text-[#584B44]">
            Access, print, or download official Prime System Group invoice receipts for every e-commerce order and scheduled fabrication booking.
          </p>
        </div>

        {user && (
          <div className="w-full lg:w-72 relative">
            <Search className="w-4 h-4 text-[#7C6E65] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="search"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Search PSG-2026-..."
              aria-label="Search invoice number"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
            />
          </div>
        )}
      </div>

      {authLoading ? (
        <div className="h-48 bg-[#F3ECE0] border border-[#E2D8C5]" />
      ) : !user ? (
        <div className="p-10 bg-[#FFFDF7] border border-[#E2D8C5] text-center space-y-4 max-w-xl mx-auto">
          <FileText className="w-8 h-8 text-[#5A1418] mx-auto" />
          <h2 className="text-xl font-bold text-[#1F1815]">
            Sign in to view your invoice receipts
          </h2>
          <p className="text-sm text-[#584B44]">
            For customer billing privacy, invoice receipts and fabrication booking records are bound to your verified Google account.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Google
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Segmented Type Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-[#EFE7D6] border border-[#E2D8C5]">
              {(['all', 'order', 'booking'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    typeFilter === t
                      ? 'bg-[#5A1418] text-[#FAF6EA]'
                      : 'text-[#584B44] hover:text-[#1F1815]'
                  }`}
                >
                  {t === 'all' ? 'All Receipts' : t === 'order' ? 'Direct Orders' : 'Item Bookings'}
                </button>
              ))}
            </div>
            <div className="text-xs font-mono tabular-nums text-[#7C6E65]">
              {filteredOrders.length} invoice record(s)
            </div>
          </div>

          {loading ? (
            <div className="h-48 bg-[#F3ECE0] border border-[#E2D8C5]" />
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFDF7] border border-[#E2D8C5] space-y-4">
              <p className="text-base font-semibold text-[#1F1815]">
                No orders or bookings recorded yet.
              </p>
              <p className="text-sm text-[#584B44]">
                Place an order or book a fabrication slot from our catalog to generate your first official invoice receipt.
              </p>
              <Link
                to="/products"
                className="inline-block px-5 py-2.5 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA]"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E2D8C5] bg-[#FFFDF7]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D8C5] bg-[#F3ECE0] text-xs font-semibold uppercase tracking-wider text-[#7C6E65]">
                    <th className="py-3.5 px-4">Invoice No.</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Issued</th>
                    <th className="py-3.5 px-4">Region</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Total (USD)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D8C5] text-sm">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF6EA]/70">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#5A1418] tabular-nums whitespace-nowrap">
                        {ord.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#1F1815] whitespace-nowrap">
                        {ord.orderType === 'booking' ? 'Item Booking' : 'Direct Order'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#584B44] tabular-nums whitespace-nowrap">
                        {formatTimestamp(ord.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-[#584B44] whitespace-nowrap">
                        {ord.destinationRegion}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1F1815] whitespace-nowrap">
                        {ord.status}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-[#1F1815] whitespace-nowrap">
                        ${ord.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => setActiveInvoice(ord)}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] cursor-pointer"
                        >
                          View Receipt
                        </button>
                        {ord.status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(ord.id)}
                            className="px-2.5 py-1.5 text-xs font-medium border border-[#E2D8C5] text-[#584B44] hover:border-[#5A1418] hover:text-[#5A1418] cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
