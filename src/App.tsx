/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

// Code-split secondary storefront routes and isolated Admin portal for sub-second startup
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const ManufacturingPage = lazy(() =>
  import('./pages/ManufacturingPage').then((m) => ({ default: m.ManufacturingPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const MarketsPage = lazy(() =>
  import('./pages/MarketsPage').then((m) => ({ default: m.MarketsPage }))
);
const InvoicesPage = lazy(() =>
  import('./pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

function RouteFallback() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14">
      <div className="h-48 bg-[#F3ECE0] border border-[#E2D8C5]" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Standalone Separated Admin Portal (no storefront header/footer) */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/*" element={<AdminPage />} />

                {/* Public Customer Storefront & Corporate Pages */}
                <Route
                  path="/*"
                  element={
                    <Layout>
                      <Suspense fallback={<RouteFallback />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/products/:id" element={<ProductDetailPage />} />
                          <Route path="/manufacturing" element={<ManufacturingPage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/markets" element={<MarketsPage />} />
                          <Route path="/invoices" element={<InvoicesPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  }
                />
              </Routes>
            </Suspense>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
