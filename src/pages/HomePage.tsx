import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import {
  BUSINESS_DIVISIONS,
  COMPANY_INFO,
  HERO_IMAGE,
  INTERNATIONAL_MARKETS,
} from '../data/catalogSeed';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

export function HomePage() {
  const { products } = useProducts();
  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div>
      {/* 1. Hero Section — Split Architectural Proposition + 16:9 Showcase */}
      <section className="border-b border-[#E2D8C5]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="text-xs font-medium tracking-wider uppercase text-[#5A1418]">
                Headquartered in Japan · Precision Manufacturing & Global Supply
              </div>
              <h1 className="text-4xl lg:text-[52px] font-bold tracking-tight text-[#1F1815] leading-[1.08]">
                Japanese architectural engineering and industrial fabrication.
              </h1>
              <p className="text-base lg:text-lg text-[#584B44] leading-relaxed max-w-xl">
                Prime System Group manufactures and supplies precision glass doors and windows, extruded aluminium systems, bullet-resistant security glass, structural ceilings, heavy construction machinery, and architectural swimming pool systems.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors whitespace-nowrap"
                >
                  Browse Products & Order
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={COMPANY_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Japan Desk
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] lg:min-h-[420px] border border-[#E2D8C5] bg-[#EFE7D6] overflow-hidden">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="Prime System Group architectural glass and aluminium engineering pavilion in Japan"
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Capability Strip below hero split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-[#E2D8C5]">
            <div>
              <div className="text-xs font-mono text-[#7C6E65]">01 · Glazing</div>
              <div className="text-base font-semibold text-[#1F1815] mt-1">
                Glass Doors & Windows
              </div>
              <p className="text-sm text-[#584B44] mt-1">
                Premium doors, thermal windows, and precision architectural glazing.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono text-[#7C6E65]">02 · Profiles</div>
              <div className="text-base font-semibold text-[#1F1815] mt-1">
                Aluminium Systems
              </div>
              <p className="text-sm text-[#584B44] mt-1">
                High-rigidity extruded aluminium frames and curtain wall profiles.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono text-[#7C6E65]">03 · Protection</div>
              <div className="text-base font-semibold text-[#1F1815] mt-1">
                Security Glass
              </div>
              <p className="text-sm text-[#584B44] mt-1">
                Tested bullet-resistant and laminated protective glazing systems.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono text-[#7C6E65]">04 · Overhead</div>
              <div className="text-base font-semibold text-[#1F1815] mt-1">
                Architectural Ceilings
              </div>
              <p className="text-sm text-[#584B44] mt-1">
                Structural glass ceilings, atrium skylights, and roof glazing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured E-Commerce & Booking Catalog */}
      <section className="py-16 lg:py-20 border-b border-[#E2D8C5]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
                Direct E-Commerce & Fabrication Booking
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1F1815]">
                Featured Industrial & Architectural Catalog
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A1418] hover:underline whitespace-nowrap"
            >
              View full catalog ({products.length} items)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Five Corporate Divisions */}
      <section className="py-16 lg:py-20 bg-[#F3ECE0] border-b border-[#E2D8C5]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
                Industrial Operations
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1F1815]">
                Five integrated manufacturing and trading divisions
              </h2>
            </div>
            <Link
              to="/manufacturing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A1418] hover:underline whitespace-nowrap"
            >
              Explore manufacturing capabilities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_DIVISIONS.map((div) => (
              <div
                key={div.index}
                className="bg-[#FFFDF7] border border-[#E2D8C5] p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#5A1418]">
                    {div.index}. Division
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1815]">
                    {div.title}
                  </h3>
                  <p className="text-sm text-[#584B44] leading-relaxed">
                    {div.summary}
                  </p>
                  <ul className="space-y-1.5 pt-2 border-t border-[#E2D8C5] text-xs text-[#584B44]">
                    {div.capabilities.map((cap) => (
                      <li key={cap}>· {cap}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={`/products?category=${encodeURIComponent(div.categoryFilter)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A1418] hover:underline pt-2"
                >
                  Browse division products
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Vision, Mission & Global Corridors */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
                Japan Corporate Mandate
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1F1815]">
                Craftsmanship built for international infrastructure.
              </h2>
              <p className="text-sm text-[#584B44] leading-relaxed">
                {COMPANY_INFO.vision}
              </p>
              <p className="text-sm text-[#584B44] leading-relaxed">
                {COMPANY_INFO.mission}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="text-sm font-semibold text-[#5A1418] hover:underline"
                >
                  Read full company profile →
                </Link>
                <Link
                  to="/invoices"
                  className="text-sm font-semibold text-[#1F1815] hover:text-[#5A1418]"
                >
                  Retrieve an invoice receipt →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTERNATIONAL_MARKETS.map((market) => (
                <div
                  key={market.region}
                  className="p-5 bg-[#FFFDF7] border border-[#E2D8C5] space-y-2"
                >
                  <div className="text-base font-bold text-[#5A1418]">
                    {market.region}
                  </div>
                  <div className="text-xs font-medium text-[#1F1815]">
                    {market.role}
                  </div>
                  <p className="text-xs text-[#584B44] leading-relaxed">
                    {market.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
