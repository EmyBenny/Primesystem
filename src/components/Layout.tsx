import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { COMPANY_INFO } from '../data/catalogSeed';
import { useCart } from '../context/CartContext';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

const PRIMARY_NAV = [
  { label: 'Products', to: '/products' },
  { label: 'Manufacturing', to: '/manufacturing' },
  { label: 'About', to: '/about' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'Admin', to: '/admin' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { totalItems, setDrawerOpen, activeInvoice, setActiveInvoice } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EA] text-[#1F1815]">
      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="no-print sticky top-0 z-40 bg-[#FAF6EA]/95 backdrop-blur-sm border-b border-[#E2D8C5]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-[#5A1418] whitespace-nowrap shrink-0"
          >
            Prime System Group
          </Link>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#584B44]"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#5A1418] border-[#5A1418]'
                      : 'border-transparent hover:text-[#1F1815] hover:border-[#E2D8C5]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Bag</span>
              <span className="font-mono tabular-nums">({totalItems})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-[#1F1815] hover:text-[#5A1418] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2D8C5] bg-[#F3ECE0] px-6 py-4 space-y-2">
            {[
              { label: 'Home', to: '/' },
              ...PRIMARY_NAV,
              { label: 'Markets', to: '/markets' },
              { label: 'Contact', to: '/contact' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-sm font-medium ${
                    isActive ? 'text-[#5A1418]' : 'text-[#1F1815]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet Corporate Footer */}
      <footer className="no-print border-t border-[#E2D8C5] bg-[#F3ECE0] text-[#1F1815]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 space-y-3">
              <div className="text-lg font-bold tracking-tight text-[#5A1418]">
                {COMPANY_INFO.name}
              </div>
              <p className="text-sm text-[#584B44] leading-relaxed max-w-md">
                Japanese industrial manufacturing, custom architectural fabrication, heavy machinery supply, and international trading group.
              </p>
              <div className="pt-2 space-y-1 text-xs text-[#584B44]">
                <div>Headquarters: {COMPANY_INFO.headquarters}</div>
                <div className="font-mono tabular-nums">
                  WhatsApp Direct: {COMPANY_INFO.whatsappNumber}
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={COMPANY_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat on WhatsApp ({COMPANY_INFO.whatsappNumber})
                </a>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2.5 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6E65] mb-3">
                Navigation
              </div>
              <Link to="/" className="block text-[#584B44] hover:text-[#5A1418]">
                Home
              </Link>
              <Link to="/products" className="block text-[#584B44] hover:text-[#5A1418]">
                E-Commerce Catalog
              </Link>
              <Link to="/manufacturing" className="block text-[#584B44] hover:text-[#5A1418]">
                Manufacturing & Divisions
              </Link>
              <Link to="/markets" className="block text-[#584B44] hover:text-[#5A1418]">
                International Markets
              </Link>
            </div>

            <div className="md:col-span-4 space-y-2.5 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6E65] mb-3">
                Operations & Portals
              </div>
              <Link to="/about" className="block text-[#584B44] hover:text-[#5A1418]">
                About Us · Vision & Mission
              </Link>
              <Link to="/invoices" className="block text-[#584B44] hover:text-[#5A1418]">
                Orders & Invoice Receipts
              </Link>
              <Link to="/contact" className="block text-[#584B44] hover:text-[#5A1418]">
                Japan Office & Trade Desk
              </Link>
              <Link to="/admin" className="block font-medium text-[#5A1418] hover:underline">
                Admin Dashboard Portal
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#E2D8C5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#7C6E65]">
            <span>
              © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
            </span>
            <span>Office Location: Japan · Reg {COMPANY_INFO.registrationCode}</span>
          </div>
        </div>
      </footer>

      {/* Global Order Drawer & Official Invoice Modal */}
      <CartCheckoutDrawer />
      <InvoiceReceiptModal
        order={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />
    </div>
  );
}
