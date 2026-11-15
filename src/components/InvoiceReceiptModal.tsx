import { useEffect, useState } from 'react';
import { CheckCircle2, Download, MessageCircle, Printer, X } from 'lucide-react';
import { COMPANY_INFO } from '../data/catalogSeed';
import { useAuth } from '../context/AuthContext';
import { fetchOrderItems } from '../services/firestoreService';
import { Order, OrderItem } from '../types';

interface InvoiceReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

function formatDate(ts: unknown): string {
  if (!ts) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  if (ts instanceof Date) {
    return ts.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const maybeFirestore = ts as { toDate?: () => Date };
  if (typeof maybeFirestore.toDate === 'function') {
    return maybeFirestore.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function InvoiceReceiptModal({ order, onClose }: InvoiceReceiptModalProps) {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (!order) return;
    if (order.items && order.items.length > 0) {
      setItems(order.items);
      return;
    }
    const targetUserId = isAdmin ? user?.uid || order.userId : order.userId;
    if (!targetUserId) return;
    let active = true;
    setLoadingItems(true);
    fetchOrderItems(order.id, targetUserId, isAdmin)
      .then((fetched) => {
        if (active) setItems(fetched);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoadingItems(false);
      });
    return () => {
      active = false;
    };
  }, [order, user, isAdmin]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const lines = [
      'PRIME SYSTEM GROUP — OFFICIAL INVOICE RECEIPT',
      `Invoice Number: ${order.invoiceNumber}`,
      `Document Type: ${order.orderType === 'booking' ? 'Fabrication / Item Booking Receipt' : 'Commercial Purchase Invoice'}`,
      `Issued Date: ${formatDate(order.createdAt)}`,
      `Status: ${order.status}`,
      '',
      'SELLER:',
      `Prime System Group (${COMPANY_INFO.registrationCode})`,
      `Office Location: ${COMPANY_INFO.headquarters}`,
      `WhatsApp Dispatch: ${COMPANY_INFO.whatsappNumber}`,
      `Email: ${COMPANY_INFO.email}`,
      '',
      'BILL TO / DESTINATION:',
      `Customer: ${order.customerName}`,
      order.companyName ? `Company: ${order.companyName}` : '',
      `Email: ${order.customerEmail}`,
      `Phone / WhatsApp: ${order.customerPhone}`,
      `Region: ${order.destinationRegion}`,
      `Address: ${order.shippingAddress}`,
      order.bookingDate ? `Scheduled Date: ${order.bookingDate}` : '',
      '',
      'ITEMIZED SCHEDULE:',
      ...items.map(
        (it) =>
          `- [${it.sku}] ${it.productName} | ${it.quantity} ${it.unit} x $${it.unitPriceUsd.toLocaleString()} = $${it.lineTotalUsd.toLocaleString()}`
      ),
      '',
      `Subtotal: $${order.subtotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `Consumption / Export Tax: $${order.taxUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `TOTAL AMOUNT: $${order.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      order.notes ? `\nNotes: ${order.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const whatsappBody = encodeURIComponent(
    `Hello Prime System Group Japan, I have placed ${
      order.orderType === 'booking' ? 'a booking' : 'an order'
    } under Invoice ${order.invoiceNumber} totaling $${order.totalUsd.toLocaleString()}. Customer: ${
      order.customerName
    } (${order.destinationRegion}).`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-[#FFFDF7] border border-[#E2D8C5] text-[#1F1815] shadow-xl my-8">
        {/* Top Action Bar (hidden during print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#F3ECE0] border-b border-[#E2D8C5]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#5A1418]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Official Invoice Receipt Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Receipt
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice receipt"
              className="p-1.5 text-[#584B44] hover:text-[#1F1815] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#E2D8C5]">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[#5A1418] mb-1">
                {order.orderType === 'booking'
                  ? 'Official Booking & Fabrication Receipt'
                  : 'Official Commercial Invoice Receipt'}
              </p>
              <h2
                id="invoice-modal-title"
                className="text-2xl font-bold tracking-tight text-[#1F1815]"
              >
                {COMPANY_INFO.name}
              </h2>
              <p className="text-sm text-[#584B44] mt-1">
                Japan Corporate Headquarters · {COMPANY_INFO.headquarters}
              </p>
              <p className="text-xs font-mono text-[#7C6E65] mt-1">
                Reg: {COMPANY_INFO.registrationCode} · WhatsApp: {COMPANY_INFO.whatsappNumber}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-xs text-[#7C6E65] uppercase tracking-wider">
                Invoice Number
              </div>
              <div className="text-xl font-mono font-semibold text-[#5A1418] tabular-nums mt-0.5">
                {order.invoiceNumber}
              </div>
              <div className="text-xs text-[#584B44] mt-2 tabular-nums">
                Issued: {formatDate(order.createdAt)}
              </div>
              <div className="text-xs font-medium text-[#1F1815] mt-1">
                Status: {order.status}
              </div>
            </div>
          </div>

          {/* Client & Dispatch Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wider text-[#7C6E65]">
                Billed To
              </div>
              <div className="font-semibold text-[#1F1815]">{order.customerName}</div>
              {order.companyName && (
                <div className="text-[#584B44]">{order.companyName}</div>
              )}
              <div className="text-[#584B44]">{order.customerEmail}</div>
              <div className="text-[#584B44] font-mono text-xs tabular-nums">
                {order.customerPhone}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wider text-[#7C6E65]">
                Delivery & Schedule
              </div>
              <div className="font-medium text-[#1F1815]">
                Market Region: {order.destinationRegion}
              </div>
              <div className="text-[#584B44]">{order.shippingAddress}</div>
              {order.bookingDate && (
                <div className="text-xs font-mono text-[#5A1418] pt-1 tabular-nums">
                  Scheduled Slot: {order.bookingDate}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto border-t border-b border-[#E2D8C5]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2D8C5] text-xs font-medium uppercase tracking-wider text-[#7C6E65]">
                  <th className="py-3 pr-4">Item / SKU</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 pl-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D8C5]/70 text-sm">
                {loadingItems ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#7C6E65]">
                      Loading invoice schedule...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#7C6E65]">
                      {order.itemCount} item(s) covered under invoice {order.invoiceNumber}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-[#1F1815]">
                          {item.productName}
                        </div>
                        <div className="text-xs font-mono text-[#7C6E65] mt-0.5">
                          {item.sku} · {item.category}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#1F1815] whitespace-nowrap">
                        {item.quantity} <span className="text-xs text-[#7C6E65]">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#584B44]">
                        ${item.unitPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 pl-3 text-right font-mono font-medium tabular-nums text-[#1F1815]">
                        ${item.lineTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 items-start">
            <div className="text-xs text-[#584B44] max-w-sm space-y-2">
              {order.notes && (
                <div>
                  <span className="font-semibold text-[#1F1815]">Project / Fabrication Notes: </span>
                  {order.notes}
                </div>
              )}
              <p>
                Export shipments outside Japan are zero-rated for domestic consumption tax; domestic Japan deliveries include 10% consumption tax.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-[#584B44]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  ${order.subtotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#584B44]">
                <span>
                  {order.destinationRegion === 'Japan' ? 'Japan Consumption Tax (10%)' : 'Export Zero-Rated Tax (0%)'}
                </span>
                <span className="font-mono tabular-nums">
                  ${order.taxUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1F1815] text-base font-bold text-[#5A1418]">
                <span>Total Invoiced</span>
                <span className="font-mono tabular-nums">
                  ${order.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Confirmation Footer */}
          <div className="no-print pt-6 border-t border-[#E2D8C5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs text-[#7C6E65]">
              Need custom engineering clearance or freight coordination?
            </span>
            <a
              href={`${COMPANY_INFO.whatsappLink}?text=${whatsappBody}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Send Invoice via WhatsApp ({COMPANY_INFO.whatsappNumber})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
