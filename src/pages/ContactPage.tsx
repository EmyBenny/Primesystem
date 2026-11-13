import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/catalogSeed';
import { useAuth } from '../context/AuthContext';
import { createInquiry } from '../services/firestoreService';

export function ContactPage() {
  const { user, signIn } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState('Manufacturing & Fabrication');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await signIn();
      }
      if (!activeUser) {
        setErrorMsg('Sign-in is required to register an inquiry with our Japan desk.');
        setSubmitting(false);
        return;
      }
      await createInquiry({
        userId: activeUser.uid,
        name: name.trim() || activeUser.displayName || 'Client',
        company: company.trim(),
        email: email.trim() || activeUser.email || '',
        phone: phone.trim(),
        market: 'Japan',
        division,
        message: message.trim(),
      });
      setSent(true);
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-12">
      <div className="border-b border-[#E2D8C5] pb-8 space-y-2 max-w-2xl">
        <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
          Japan Headquarters & Direct Desk
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1815]">
          Contact Prime System Group
        </h1>
        <p className="text-sm text-[#584B44]">
          Reach our Japanese engineering, fabrication, and international sales coordination team directly via WhatsApp or our inquiry desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Office Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#FFFDF7] border border-[#E2D8C5] space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#5A1418] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6E65]">
                  Office Location
                </div>
                <div className="text-base font-bold text-[#1F1815] mt-0.5">
                  Japan
                </div>
                <div className="text-sm text-[#584B44]">
                  {COMPANY_INFO.headquarters}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-[#E2D8C5]">
              <Phone className="w-5 h-5 text-[#5A1418] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6E65]">
                  WhatsApp Direct Line
                </div>
                <div className="text-base font-mono font-bold text-[#5A1418] tabular-nums mt-0.5">
                  {COMPANY_INFO.whatsappNumber}
                </div>
                <div className="text-xs text-[#584B44] mt-1">
                  Direct dispatch for custom quotes, architectural drawings, and freight tracking.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-[#E2D8C5]">
              <Mail className="w-5 h-5 text-[#5A1418] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6E65]">
                  Corporate Email
                </div>
                <div className="text-sm font-mono text-[#1F1815] mt-0.5">
                  {COMPANY_INFO.email}
                </div>
              </div>
            </div>

            <a
              href={COMPANY_INFO.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#5A1418] text-[#FAF6EA] text-sm font-semibold hover:bg-[#400D10] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp Chat ({COMPANY_INFO.whatsappNumber})
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#FFFDF7] border border-[#E2D8C5] p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#5A1418] mx-auto" />
              <h2 className="text-xl font-bold text-[#1F1815]">
                Message Received by Japan HQ
              </h2>
              <p className="text-sm text-[#584B44]">
                Thank you for contacting Prime System Group. An engineering coordinator will respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-[#1F1815]">
                Engineering & Sales Inquiry
              </h2>
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
                    Company
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

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Product / Service Division *
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

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Inquiry Details *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share project drawings, dimensions, machinery model, or shipping destination..."
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
                {submitting
                  ? 'Sending...'
                  : user
                  ? 'Send Message'
                  : 'Sign In with Google & Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
