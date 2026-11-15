import React, { useState } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { COMPANY_INFO, INTERNATIONAL_MARKETS } from '../data/catalogSeed';
import { createInquiry } from '../services/firestoreService';
import { getOrCreateGuestClientId } from '../utils/guestSession';

export function MarketsPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [market, setMarket] = useState<'Japan' | 'Europe' | 'Asia' | 'Taiwan' | 'Other'>('Europe');
  const [division, setDivision] = useState('International Trading & Distribution');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const clientId = getOrCreateGuestClientId();
      const id = await createInquiry({
        userId: clientId,
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        market,
        division,
        message: message.trim(),
      });
      setSubmittedId(id);
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-16">
      <div className="border-b border-[#E2D8C5] pb-8 space-y-3 max-w-3xl">
        <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
          Global Commercial Corridors
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1815]">
          International Markets & Distribution
        </h1>
        <p className="text-base text-[#584B44] leading-relaxed">
          From our corporate headquarters in Japan, Prime System Group builds enduring industrial partnerships, wholesale supply agreements, and machinery exports across Japan, Europe, Asia, and Taiwan.
        </p>
      </div>

      {/* Four Target Regions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {INTERNATIONAL_MARKETS.map((m, index) => (
          <div
            key={m.region}
            className="p-8 bg-[#FFFDF7] border border-[#E2D8C5] space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="text-xs font-mono text-[#7C6E65]">
                0{index + 1} · Regional Operations
              </div>
              <h2 className="text-2xl font-bold text-[#5A1418]">{m.region}</h2>
              <div className="text-sm font-semibold text-[#1F1815]">{m.role}</div>
              <p className="text-sm text-[#584B44] leading-relaxed">{m.summary}</p>
            </div>
            <div className="pt-4 border-t border-[#E2D8C5] flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-[#584B44]">
              {m.highlights.map((h) => (
                <span key={h}>· {h}</span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* International Procurement & Trading Inquiry Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6 border-t border-[#E2D8C5]">
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            International Trading Desk
          </div>
          <h2 className="text-2xl font-bold text-[#1F1815]">
            Request wholesale pricing or export documentation
          </h2>
          <p className="text-sm text-[#584B44] leading-relaxed">
            Whether sourcing bulk architectural aluminium profiles, container loads of security glass, or heavy construction machinery for Taiwan, Asia, or Europe, our Japan export desk responds within one business day.
          </p>
          <a
            href={COMPANY_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Trade Desk ({COMPANY_INFO.whatsappNumber})
          </a>
        </div>

        <div className="lg:col-span-7 bg-[#FFFDF7] border border-[#E2D8C5] p-6 sm:p-8">
          {submittedId ? (
            <div className="py-8 space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#5A1418] mx-auto" />
              <h3 className="text-lg font-bold text-[#1F1815]">
                Export Inquiry Logged ({submittedId})
              </h3>
              <p className="text-sm text-[#584B44]">
                Our Tokyo international trading desk has received your specification inquiry.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedId('')}
                className="px-4 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    maxLength={140}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Target Market *
                  </label>
                  <select
                    value={market}
                    onChange={(e) =>
                      setMarket(
                        e.target.value as 'Japan' | 'Europe' | 'Asia' | 'Taiwan' | 'Other'
                      )
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  >
                    <option value="Japan">Japan</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Other">Other International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Division *
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  >
                    <option value="Manufacturing & Fabrication">Manufacturing & Fabrication</option>
                    <option value="Construction & Building Materials">Construction & Building Materials</option>
                    <option value="Heavy Machinery & Equipment">Heavy Machinery & Equipment</option>
                    <option value="Swimming Pool & Architectural Systems">Swimming Pool & Architectural Systems</option>
                    <option value="International Trading & Distribution">International Trading & Distribution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Project / Procurement Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe product quantities, destination port, or custom engineering specifications..."
                  className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submitting ? 'Submitting Inquiry...' : 'Submit Trade Inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
