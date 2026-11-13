import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BUSINESS_DIVISIONS, CATEGORY_IMAGES } from '../data/catalogSeed';
import { ResilientImage } from '../components/ResilientImage';

const CORE_SYSTEMS = [
  {
    num: '01',
    title: 'Glass Doors and Windows',
    subtitle: 'Premium doors, windows and glazing systems.',
    image: CATEGORY_IMAGES['Glass Doors & Windows'],
    category: 'Glass Doors & Windows',
    details:
      'Engineered sliding glass portals, tilt-and-turn thermal casement windows, and high-acoustic architectural frames tailored for commercial and luxury residential envelopes.',
  },
  {
    num: '02',
    title: 'Aluminium Systems',
    subtitle: 'High-quality aluminium frames and profiles.',
    image: CATEGORY_IMAGES['Aluminium Systems'],
    category: 'Aluminium Systems',
    details:
      'Precision 6063-T6 extruded curtain wall mullions, thermal-break barriers, structural louvers, and custom anodized or PVDF architectural finishes.',
  },
  {
    num: '03',
    title: 'Security Glass',
    subtitle: 'Tested bullet-resistant and protective glazing.',
    image: CATEGORY_IMAGES['Security Glass'],
    category: 'Security Glass',
    details:
      'Multi-laminated ballistic, forced-entry, and cyclone-resistant glass assemblies certified to international impact and zero-spall protection benchmarks.',
  },
  {
    num: '04',
    title: 'Architectural Ceilings',
    subtitle: 'Glass ceilings, skylights and roof glazing.',
    image: CATEGORY_IMAGES['Architectural Ceilings'],
    category: 'Architectural Ceilings',
    details:
      'Self-supporting overhead structural skylight grids, solar-control glass roofs, and engineered drainage mullions built for snow and seismic resilience.',
  },
];

export function ManufacturingPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-16">
      {/* Page Header */}
      <div className="border-b border-[#E2D8C5] pb-8 space-y-3 max-w-3xl">
        <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
          Manufacturing, Fabrication & Supply
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1815]">
          Precision fabrication across architectural glazing, heavy machinery, and pool systems.
        </h1>
        <p className="text-base text-[#584B44] leading-relaxed">
          From Japanese extrusion and laminated glass lines to heavy construction machinery sourcing and international distribution, Prime System Group operates five integrated industrial divisions.
        </p>
      </div>

      {/* Four Flagship Architectural & Glazing Lines */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-[#1F1815]">
          Core Architectural & Glazing Product Lines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CORE_SYSTEMS.map((sys) => (
            <div
              key={sys.num}
              className="bg-[#FFFDF7] border border-[#E2D8C5] grid grid-cols-1 sm:grid-cols-12 overflow-hidden"
            >
              <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto bg-[#EFE7D6] border-b sm:border-b-0 sm:border-r border-[#E2D8C5]">
                <ResilientImage
                  src={sys.image}
                  alt={sys.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#5A1418]">
                    {sys.num}. System Line
                  </div>
                  <h3 className="text-lg font-bold text-[#1F1815]">{sys.title}</h3>
                  <div className="text-xs font-medium text-[#7C6E65]">{sys.subtitle}</div>
                  <p className="text-sm text-[#584B44] leading-relaxed">
                    {sys.details}
                  </p>
                </div>
                <Link
                  to={`/products?category=${encodeURIComponent(sys.category)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A1418] hover:underline"
                >
                  Order or book {sys.title}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Five Corporate Divisions */}
      <section className="space-y-8 pt-6 border-t border-[#E2D8C5]">
        <h2 className="text-2xl font-bold text-[#1F1815]">
          Five Industrial & Trading Pillars
        </h2>
        <div className="divide-y divide-[#E2D8C5] border border-[#E2D8C5] bg-[#FFFDF7]">
          {BUSINESS_DIVISIONS.map((div) => (
            <div
              key={div.index}
              className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-4 aspect-[4/3] bg-[#EFE7D6] border border-[#E2D8C5] overflow-hidden">
                <ResilientImage
                  src={div.imageUrl}
                  alt={div.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="text-xs font-mono text-[#5A1418]">
                  {div.index}. Operational Pillar
                </div>
                <h3 className="text-xl font-bold text-[#1F1815]">{div.title}</h3>
                <p className="text-sm text-[#584B44] leading-relaxed">{div.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {div.capabilities.map((cap) => (
                    <div
                      key={cap}
                      className="text-xs text-[#1F1815] bg-[#FAF6EA] border border-[#E2D8C5] px-3 py-2"
                    >
                      {cap}
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <Link
                    to={`/products?category=${encodeURIComponent(div.categoryFilter)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors"
                  >
                    Browse Division Products
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
