import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { COMPANY_INFO, HERO_IMAGE } from '../data/catalogSeed';
import { ResilientImage } from '../components/ResilientImage';

export function AboutPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-16">
      {/* Japan HQ Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch border-b border-[#E2D8C5] pb-14">
        <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            Headquarters Identity · Japan
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1815]">
            Connecting Japanese craftsmanship with global construction and industrial markets.
          </h1>
          <p className="text-base text-[#584B44] leading-relaxed">
            Headquartered in Japan, {COMPANY_INFO.name} operates at the intersection of precision manufacturing, custom architectural fabrication, heavy machinery supply, and international industrial trading.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
            <div className="p-4 bg-[#FFFDF7] border border-[#E2D8C5]">
              <div className="text-xs text-[#7C6E65]">Corporate Office</div>
              <div className="font-semibold text-[#1F1815] mt-1">
                {COMPANY_INFO.headquarters}
              </div>
            </div>
            <div className="p-4 bg-[#FFFDF7] border border-[#E2D8C5]">
              <div className="text-xs text-[#7C6E65]">Direct WhatsApp Desk</div>
              <div className="font-mono font-semibold text-[#5A1418] tabular-nums mt-1">
                {COMPANY_INFO.whatsappNumber}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/markets"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors"
            >
              International Markets
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={COMPANY_INFO.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full min-h-[300px] border border-[#E2D8C5] bg-[#EFE7D6] overflow-hidden">
            <ResilientImage
              src={HERO_IMAGE}
              alt="Prime System Group Japan Corporate Pavilion"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-[#FFFDF7] border border-[#E2D8C5] space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            Our Vision
          </div>
          <h2 className="text-2xl font-bold text-[#1F1815]">
            Global Japanese Industrial Leadership
          </h2>
          <p className="text-base text-[#584B44] leading-relaxed">
            {COMPANY_INFO.vision}
          </p>
        </div>

        <div className="p-8 bg-[#FFFDF7] border border-[#E2D8C5] space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            Our Mission
          </div>
          <h2 className="text-2xl font-bold text-[#1F1815]">
            Precision Supply & Engineering Solutions
          </h2>
          <p className="text-base text-[#584B44] leading-relaxed">
            {COMPANY_INFO.mission}
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            Operating Principles
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1F1815]">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPANY_INFO.coreValues.map((val, idx) => (
            <div
              key={val.title}
              className="p-6 bg-[#FFFDF7] border border-[#E2D8C5] space-y-2"
            >
              <div className="text-xs font-mono text-[#5A1418]">
                0{idx + 1}. Principle
              </div>
              <h3 className="text-base font-bold text-[#1F1815]">{val.title}</h3>
              <p className="text-sm text-[#584B44] leading-relaxed">{val.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
