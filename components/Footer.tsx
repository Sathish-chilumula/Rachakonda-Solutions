import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowRight, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-16 pb-10 overflow-hidden border-t border-white/10">
      {/* Glassy Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">

          {/* Brand Section */}
          <div className="col-span-1 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white p-1 shadow-md border border-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/images/logo.webp"
                  alt="Rachakonda Solutions Official Logo"
                  fill
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                  Rachakonda <span className="text-amber-500">Solutions</span>
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  ESTD 2012 &bull; Pvt Ltd
                </span>
              </div>
            </Link>
            <p className="text-slate-400 mb-4 text-sm leading-relaxed max-w-sm">
              All Questions, One Place, One Solution. Premier education consultancy, competitive exam training, and career guidance for students across Telangana and Andhra Pradesh.
            </p>

            {/* TS/AP Service Area Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-blue-300">Serving Telangana &amp; Andhra Pradesh</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-2 md:col-start-6">
            <h4 className="text-sm font-bold mb-5 text-white uppercase tracking-widest">
              Student Paths
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'After 10th', path: '/after-10th' },
                { name: 'After Inter', path: '/after-inter' },
                { name: 'After Degree', path: '/after-degree' },
                { name: 'Colleges Explorer', path: '/colleges' },
                { name: 'Entrance Exams', path: '/exams' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="group flex items-center text-slate-400 hover:text-amber-400 transition-colors duration-300 text-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold mb-5 text-white uppercase tracking-widest">
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Government Jobs', path: '/government-jobs' },
                { name: 'Scholarships Hub', path: '/scholarships' },
                { name: 'Career Guidance', path: '/career-guidance' },
                { name: 'Study Resources', path: '/resources' },
                { name: 'Our Courses', path: '/education' },
                { name: 'About Us', path: '/about' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="group flex items-center text-slate-400 hover:text-amber-400 transition-colors duration-300 text-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Official Address */}
          <div className="col-span-1 md:col-span-4 md:col-start-9">
            <h4 className="text-sm font-bold mb-5 text-white uppercase tracking-widest">
              Head Office &amp; Campus
            </h4>
            <div className="space-y-4">
              <div className="group flex items-start p-3 -ml-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mr-3 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 font-bold">Office Address</p>
                  <p className="text-slate-300 group-hover:text-white transition-colors text-sm font-medium leading-relaxed">
                    <strong>Rachakonda Solutions</strong><br />
                    Prashantha Complex, 2nd &amp; 3rd Floor,<br />
                    Above LIC Office, Beside Gajwel Bus Stand Main Road,<br />
                    Gajwel, Telangana 502278
                  </p>
                  <a
                    href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold mt-2 group-hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="group flex items-start p-3 -ml-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mr-3 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 font-bold">Helpline / WhatsApp</p>
                  <a href="tel:+919640333313" className="text-slate-300 group-hover:text-white transition-colors text-sm font-medium">
                    +91 9640333313
                  </a>
                </div>
              </div>

              <div className="group flex items-start p-3 -ml-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mr-3 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 font-bold">Email</p>
                  <a href="mailto:contact@rachakondasolutions.com" className="text-slate-300 group-hover:text-white transition-colors text-sm font-medium break-all">
                    contact@rachakondasolutions.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Rachakonda Solutions. All rights reserved.
            <span className="mx-2 text-slate-700 hidden sm:inline">|</span>
            <span className="block sm:inline mt-1 sm:mt-0">Education &amp; Career Guidance — Gajwel, Telangana &amp; AP</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/crm" className="text-slate-500 hover:text-white transition-colors">CRM Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
