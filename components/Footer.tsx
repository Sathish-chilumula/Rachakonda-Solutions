import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowRight, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-20 pb-10 overflow-hidden border-t border-white/10">
      {/* Glassy Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-3xl font-bold text-white tracking-tight">
                Rachakonda <span className="text-amber-500">Solutions</span>
              </h3>
            </Link>
            <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
              Empowering individuals and businesses through premium education and comprehensive financial services. Your trusted partner in growth and success.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3 md:col-start-7">
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <span className="w-8 h-[2px] bg-amber-500 mr-3"></span> Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Education Portal', path: '/education' },
                { name: 'Finance Portal', path: '/finance' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="group flex items-center text-slate-400 hover:text-amber-400 transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <span className="w-8 h-[2px] bg-blue-500 mr-3"></span> Contact Us
            </h4>
            <div className="space-y-4">
              <div className="group flex items-start p-3 -ml-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mr-4 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-slate-300 group-hover:text-white transition-colors">+91 9640333313</p>
                </div>
              </div>
              
              <div className="group flex items-start p-3 -ml-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mr-4 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-slate-300 group-hover:text-white transition-colors">contact@rachakondasolutions.com</p>
                </div>
              </div>
              
              <div className="group flex items-start p-3 -ml-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mr-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-slate-300 group-hover:text-white transition-colors">Hyderabad, Telangana, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Rachakonda Solutions. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/crm" className="text-slate-500 hover:text-white transition-colors">CRM Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
