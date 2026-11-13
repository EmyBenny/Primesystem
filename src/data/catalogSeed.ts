import { Product, ProductCategory } from '../types';
import heroPrimeImg from '../assets/images/hero_prime_architecture_1794572192524.webp';
import glassDoorsImg from '../assets/images/product_glass_doors_1794572193933.webp';
import aluminiumSystemsImg from '../assets/images/product_aluminium_systems_1794572194445.webp';
import securityGlassImg from '../assets/images/product_security_glass_1794572193692.webp';
import architecturalCeilingsImg from '../assets/images/product_architectural_ceilings_1794572194497.webp';
import heavyMachineryImg from '../assets/images/product_heavy_machinery_1794572195586.webp';
import poolSystemsImg from '../assets/images/product_pool_systems_1794572196621.webp';

export const COMPANY_INFO = {
  name: 'Prime System Group',
  headquarters: 'Tokyo & Osaka Industrial Corridor, Japan',
  officeLocation: 'Japan',
  whatsappNumber: '+818089422578',
  whatsappLink: 'https://wa.me/818089422578',
  email: 'trade@primesystemgroup.jp',
  registrationCode: 'JP-CORP-PSG-0819',
  vision:
    'To become a respected Japanese international industrial group recognized for quality, innovation, engineering excellence and reliable business partnerships worldwide.',
  mission:
    'To connect Japanese craftsmanship and international industrial opportunities by supplying quality products, developing manufacturing capabilities and providing dependable engineering and trading solutions.',
  coreValues: [
    {
      title: 'Japanese Precision & Craftsmanship',
      detail: 'Sub-millimeter extrusion tolerances and meticulous assembly discipline.',
    },
    {
      title: 'Quality & Reliability',
      detail: 'Certified structural performance, acoustic insulation, and ballistic safety testing.',
    },
    {
      title: 'Integrity & Transparency',
      detail: 'Clear itemized invoicing, verified batch provenance, and dependable lead times.',
    },
    {
      title: 'Innovation & Continuous Improvement',
      detail: 'Kaizen-driven material engineering for thermal break and protective glazing.',
    },
    {
      title: 'International Cooperation',
      detail: 'Cross-border engineering logistics spanning Japan, Europe, Asia, and Taiwan.',
    },
    {
      title: 'Long-Term Customer Relationships',
      detail: 'Dedicated after-sales technical support, spare parts supply, and project advisory.',
    },
  ],
};

export const HERO_IMAGE = heroPrimeImg;

export const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  'Glass Doors & Windows': glassDoorsImg,
  'Aluminium Systems': aluminiumSystemsImg,
  'Security Glass': securityGlassImg,
  'Architectural Ceilings': architecturalCeilingsImg,
  'Heavy Machinery': heavyMachineryImg,
  'Swimming Pool Systems': poolSystemsImg,
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Glass Doors & Windows',
  'Aluminium Systems',
  'Security Glass',
  'Architectural Ceilings',
  'Heavy Machinery',
  'Swimming Pool Systems',
];

export const BUSINESS_DIVISIONS = [
  {
    index: '01',
    title: 'Manufacturing & Fabrication',
    summary:
      'Custom architectural and industrial fabrication executed at our Japanese partner facilities with strict dimensional inspection.',
    capabilities: [
      'Aluminium and architectural components',
      'Industrial materials and customized products',
      'Product development and quality improvement',
    ],
    categoryFilter: 'Aluminium Systems' as ProductCategory,
    imageUrl: CATEGORY_IMAGES['Aluminium Systems'],
  },
  {
    index: '02',
    title: 'Construction & Building Materials',
    summary:
      'Complete architectural envelope systems engineered for commercial towers, civic facilities, and luxury residences.',
    capabilities: [
      'Premium construction materials & building supplies',
      'Architectural glass doors, windows, and ceiling systems',
      'Tested bullet-resistant and protective security glazing',
    ],
    categoryFilter: 'Glass Doors & Windows' as ProductCategory,
    imageUrl: CATEGORY_IMAGES['Glass Doors & Windows'],
  },
  {
    index: '03',
    title: 'Heavy Machinery & Equipment',
    summary:
      'Industrial earthmoving, tractor fleets, and certified OEM spare parts sourced and distributed internationally.',
    capabilities: [
      'Tractors and heavy-duty construction machinery',
      'Heavy-duty industrial site equipment',
      'Machinery sourcing, distribution, and spare parts trading',
    ],
    categoryFilter: 'Heavy Machinery' as ProductCategory,
    imageUrl: CATEGORY_IMAGES['Heavy Machinery'],
  },
  {
    index: '04',
    title: 'Swimming Pool & Architectural Systems',
    summary:
      'Structural underwater glass viewing walls, high-efficiency circulation plants, and architectural outdoor finishes.',
    capabilities: [
      'Swimming pool construction materials',
      'Pool filtration and circulation equipment',
      'Premium glass swimming pool features & outdoor installations',
    ],
    categoryFilter: 'Swimming Pool Systems' as ProductCategory,
    imageUrl: CATEGORY_IMAGES['Swimming Pool Systems'],
  },
  {
    index: '05',
    title: 'International Trading & Distribution',
    summary:
      'End-to-end export compliance, container consolidation, and direct wholesale distribution from Japan to global partners.',
    capabilities: [
      'Import and export of certified industrial products',
      'International procurement and supplier sourcing',
      'Wholesale distribution and global partner alliances',
    ],
    categoryFilter: 'Security Glass' as ProductCategory,
    imageUrl: CATEGORY_IMAGES['Security Glass'],
  },
];

export const INTERNATIONAL_MARKETS = [
  {
    region: 'Japan',
    role: 'Corporate Headquarters & Industrial Partnerships',
    summary:
      'Central engineering design, precision extrusion quality assurance, executive procurement desk, and domestic Japanese logistics.',
    highlights: ['Tokyo / Osaka Operations', 'JIS Quality Compliance', 'WhatsApp Desk: +818089422578'],
  },
  {
    region: 'Europe',
    role: 'Industrial Products, Construction Materials & Engineering Markets',
    summary:
      'Supplying EN-compliant thermal-break aluminium profiles, architectural skylight glazing, and bullet-resistant glass assemblies.',
    highlights: ['EN 1063 Ballistic Glazing', 'Thermal-Break Profiles', 'Architectural Spec Support'],
  },
  {
    region: 'Asia',
    role: 'Manufacturing, Procurement & Regional Distribution',
    summary:
      'High-volume building materials supply, heavy machinery distribution, and synchronized fabrication supply chains across Asian hubs.',
    highlights: ['Bulk Container Export', 'Heavy Machinery Spare Parts', 'Hospitality Pool Systems'],
  },
  {
    region: 'Taiwan',
    role: 'Construction Materials, Machinery, Infrastructure & Industrial Development',
    summary:
      'Strategic partnership corridor supporting civil infrastructure, high-seismic glazing envelopes, and industrial plant equipment.',
    highlights: ['Seismic Curtain Wall Tech', 'Infrastructure Machinery', 'Direct Port Freight'],
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'psg-gdw-01',
    sku: 'PSG-GDW-101',
    name: 'Kurogane Minimalist Sliding Glass Door System',
    category: 'Glass Doors & Windows',
    division: 'Construction & Building Materials',
    description:
      'Floor-to-ceiling precision sliding glass door engineered with slim anodized thermal-break aluminium rails, concealed stainless rollers, and low-iron acoustic double glazing.',
    specifications: [
      '22mm ultra-slim sightline interlock',
      'Double tempered low-iron glass (32mm IGU)',
      'Acoustic rating STC 42 · Wind load 2400 Pa',
      'Horse-blood bronze or matte charcoal anodize',
    ],
    priceUsd: 2850,
    unit: 'per assembly',
    stockStatus: 'In Stock',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Glass Doors & Windows'],
    featured: true,
  },
  {
    id: 'psg-gdw-02',
    sku: 'PSG-GDW-204',
    name: 'Shinano Tilt-and-Turn Thermal Casement Window',
    category: 'Glass Doors & Windows',
    division: 'Construction & Building Materials',
    description:
      'Multi-point locking architectural window unit featuring polyamide thermal barrier chambers and triple-gasket weather sealing for commercial and luxury residential envelopes.',
    specifications: [
      'U-Value 1.1 W/m2K thermal performance',
      'Multi-point Japanese stainless hardware',
      'Custom fabrication widths 600mm to 1800mm',
    ],
    priceUsd: 980,
    unit: 'per unit',
    stockStatus: 'Made to Order',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Glass Doors & Windows'],
    featured: false,
  },
  {
    id: 'psg-alu-01',
    sku: 'PSG-ALU-301',
    name: '6063-T6 Thermal-Break Curtain Wall Profile Kit',
    category: 'Aluminium Systems',
    division: 'Manufacturing & Fabrication',
    description:
      'High-rigidity extruded architectural aluminium mullion and transom system engineered for high-rise curtain walls, seismic drift absorption, and custom facade fabrication.',
    specifications: [
      'Alloy 6063-T6 precision JIS H4100 extrusion',
      '34mm polyamide PA66 GF25 thermal break',
      'Anodized 25-micron or PVDF fluorocarbon finish',
    ],
    priceUsd: 420,
    unit: 'per 6m bundle',
    stockStatus: 'In Stock',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Aluminium Systems'],
    featured: true,
  },
  {
    id: 'psg-alu-02',
    sku: 'PSG-ALU-318',
    name: 'Heavy-Duty Structural Partition & Louver Extrusions',
    category: 'Aluminium Systems',
    division: 'Manufacturing & Fabrication',
    description:
      'Custom-machined architectural aluminium louvers, sun-shading blades, and structural sub-frames CNC-processed to project CAD tolerances.',
    specifications: [
      'CNC 5-axis precision cutting & mitering',
      'Corrosion-resistant marine grade anodizing',
      'Bulk export palletization available',
    ],
    priceUsd: 1650,
    unit: 'per metric ton',
    stockStatus: 'Made to Order',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Aluminium Systems'],
    featured: false,
  },
  {
    id: 'psg-sec-01',
    sku: 'PSG-SEC-401',
    name: 'Aegis BR6 Multi-Layer Bullet-Resistant Glazing',
    category: 'Security Glass',
    division: 'Construction & Building Materials',
    description:
      'Tested multi-laminated ballistic and forced-entry protective glass assembly utilizing optical polycarbonate and PVB interlayers for embassies, banks, and secure compounds.',
    specifications: [
      'Certified EN 1063 BR6 / UL 752 Level 8',
      '58mm total laminated optical thickness',
      'Zero-spall interior safety backing film',
    ],
    priceUsd: 1450,
    unit: 'per sqm',
    stockStatus: 'Made to Order',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Security Glass'],
    featured: true,
  },
  {
    id: 'psg-sec-02',
    sku: 'PSG-SEC-412',
    name: 'SGP Sentry Laminated Blast & Cyclone Glass',
    category: 'Security Glass',
    division: 'International Trading & Distribution',
    description:
      'High-load structural ionoplast laminated security glazing offering exceptional post-breakage retention for coastal infrastructure and high-security retail storefronts.',
    specifications: [
      '10+10mm tempered low-iron + 1.52mm SGP interlayer',
      'Post-breakage structural load retention',
      'UV filtration 99.4%',
    ],
    priceUsd: 640,
    unit: 'per sqm',
    stockStatus: 'In Stock',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Security Glass'],
    featured: false,
  },
  {
    id: 'psg-ceil-01',
    sku: 'PSG-CEIL-501',
    name: 'Solaris Structural Atrium Skylight & Roof Glazing',
    category: 'Architectural Ceilings',
    division: 'Construction & Building Materials',
    description:
      'Engineered architectural glass ceiling and self-supporting aluminium space-frame skylight system with integrated concealed condensation drainage channels.',
    specifications: [
      'Laminated overhead safety glass + solar Low-E',
      'Integrated gutter & condensation weep channels',
      'Snow load capacity up to 3.5 kN/sqm',
    ],
    priceUsd: 1180,
    unit: 'per sqm',
    stockStatus: 'Made to Order',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Architectural Ceilings'],
    featured: true,
  },
  {
    id: 'psg-mach-01',
    sku: 'PSG-MCH-601',
    name: 'Kuroda 145HP Heavy-Duty Site Tractor & Loader',
    category: 'Heavy Machinery',
    division: 'Heavy Machinery & Equipment',
    description:
      'Commercial four-wheel-drive heavy construction tractor equipped with reinforced front hydraulic bucket linkage, high-torque diesel powertrain, and export certification.',
    specifications: [
      '145 HP turbocharged Tier-4 industrial diesel',
      '2.4-ton hydraulic front loader capacity',
      'Full Japanese pre-shipment inspection & spare kit',
    ],
    priceUsd: 54000,
    unit: 'per machine',
    stockStatus: 'In Stock',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Heavy Machinery'],
    featured: true,
  },
  {
    id: 'psg-mach-02',
    sku: 'PSG-MCH-608',
    name: 'PSG-85X Compact Hydraulic Crawler Excavator',
    category: 'Heavy Machinery',
    division: 'Heavy Machinery & Equipment',
    description:
      '8.5-ton zero-tail-swing hydraulic excavator engineered for urban civil works, foundation trenching, and continuous heavy commercial deployment.',
    specifications: [
      '8,520 kg operating weight · 4.6m dig depth',
      'Auxiliary hydraulic hammer & auger piping',
      'OEM spare parts package included',
    ],
    priceUsd: 68500,
    unit: 'per machine',
    stockStatus: 'Pre-Order',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Heavy Machinery'],
    featured: false,
  },
  {
    id: 'psg-pool-01',
    sku: 'PSG-POL-701',
    name: 'Aquaview Structural Glass Swimming Pool Panel',
    category: 'Swimming Pool Systems',
    division: 'Swimming Pool & Architectural Systems',
    description:
      'Precision-bonded multi-laminated structural glass and cast-acrylic underwater viewing wall engineered for infinity pools, luxury resorts, and architectural water features.',
    specifications: [
      '65mm–110mm structural hydrostatic laminate',
      'Marine-grade 316L stainless perimeter rebate frame',
      'Waterproof structural silicone sealing kit',
    ],
    priceUsd: 3900,
    unit: 'per linear meter',
    stockStatus: 'Made to Order',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Swimming Pool Systems'],
    featured: true,
  },
  {
    id: 'psg-pool-02',
    sku: 'PSG-POL-715',
    name: 'HydroFlow Commercial Pool Filtration & Circulation Plant',
    category: 'Swimming Pool Systems',
    division: 'Swimming Pool & Architectural Systems',
    description:
      'Complete variable-speed circulation pump skid, high-rate glass media sand filtration vessel, and automated UV-ozone water treatment manifold.',
    specifications: [
      'Flow rate 45 m3/hr commercial turnover',
      '316L stainless steel header & pressure gauges',
      'Low-noise variable frequency drive controller',
    ],
    priceUsd: 6200,
    unit: 'per system',
    stockStatus: 'In Stock',
    bookable: true,
    imageUrl: CATEGORY_IMAGES['Swimming Pool Systems'],
    featured: false,
  },
];
