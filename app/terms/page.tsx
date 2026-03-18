'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-6 font-display">Terms of Service</h1>
          <p className="text-slate-500 mb-10 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                By accessing and using the services provided by Rachakonda Solutions (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">2. Description of Services</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Rachakonda Solutions provides educational consultancy, training programs, and financial advisory services. We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">3. User Responsibilities</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                When using our services, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Provide accurate, current, and complete information during registration or application processes.</li>
                <li>Maintain the security of your account credentials.</li>
                <li>Promptly update any information to keep it accurate and complete.</li>
                <li>Use our services only for lawful purposes and in accordance with these Terms.</li>
                <li>Not engage in any activity that interferes with or disrupts our services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">4. Intellectual Property</h2>
              <p className="text-slate-600 leading-relaxed">
                All content, materials, and intellectual property provided through our services, including but not limited to course materials, logos, designs, text, graphics, and software, are the property of Rachakonda Solutions or its licensors and are protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our explicit written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">5. Financial Services Disclaimer</h2>
              <p className="text-slate-600 leading-relaxed">
                Our financial advisory and loan facilitation services are provided for informational purposes. We act as an intermediary between clients and financial institutions. Final approval, interest rates, and terms of any financial product are determined solely by the respective financial institution. We do not guarantee the approval of any loan application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">6. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed">
                To the maximum extent permitted by law, Rachakonda Solutions shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">7. Contact Information</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions or concerns regarding these Terms of Service, please <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
