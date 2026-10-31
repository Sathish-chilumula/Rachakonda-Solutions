'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, Mail, MapPin, Send, CheckCircle2, GraduationCap, Clock, ExternalLink, Navigation, Compass } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  state: z.enum(['Telangana', 'Andhra Pradesh', 'Other'], {
    required_error: 'Please select your state',
  }),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log('Contact form submission:', data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 7000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/images/abstract_education_bg.webp')" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-3.5 py-1.5 mb-4"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs sm:text-sm font-semibold text-blue-300">Head Office: Gajwel, Telangana | Serving TS &amp; AP</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 font-display tracking-tight"
          >
            Connect With <span className="text-amber-400">Our Counselors</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto font-medium"
          >
            Have questions regarding college admissions, entrance exams, or career choices? Visit our campus or get in touch below.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            
            {/* Main Office Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 font-display flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" /> Office &amp; Campus Location
              </h3>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Rachakonda Solutions</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      Prashantha Complex, 2nd &amp; 3rd Floor,<br />
                      Above LIC office,<br />
                      Beside Gajwel Bus Stand Main Road,<br />
                      Gajwel, Telangana — 502278
                    </p>
                    <a
                      href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-blue-200/60"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Get Directions on Google Maps
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-0.5">Phone &amp; WhatsApp</h4>
                    <a href="tel:+919640333313" className="text-slate-700 hover:text-blue-600 text-sm font-semibold transition-colors">
                      +91 9640333313
                    </a>
                    <p className="text-xs text-slate-400 mt-0.5">Call or WhatsApp for immediate assistance</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-0.5">Email Inquiries</h4>
                    <a href="mailto:contact@rachakondasolutions.com" className="text-slate-700 hover:text-blue-600 text-sm font-semibold transition-colors break-all">
                      contact@rachakondasolutions.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Area Badge */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-900 text-sm">Focus Service Area</h4>
              </div>
              <p className="text-blue-950/80 text-sm leading-relaxed font-medium">
                We specialize in student opportunities across all 33 districts of <strong>Telangana</strong> and 26 districts of <strong>Andhra Pradesh</strong>, covering TS EAMCET, AP EAPCET, POLYCET, TSPSC, APPSC, DOST, and national entrance exams.
              </p>
            </div>

            {/* Hours */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold">Consulting Hours</h4>
              </div>
              <ul className="space-y-2 text-slate-300 text-sm font-medium">
                <li className="flex justify-between py-1 border-b border-white/5">
                  <span>Monday – Friday</span>
                  <span className="font-bold text-white">9:00 AM – 6:30 PM</span>
                </li>
                <li className="flex justify-between py-1 border-b border-white/5">
                  <span>Saturday</span>
                  <span className="font-bold text-white">9:30 AM – 5:00 PM</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Sunday</span>
                  <span className="font-semibold text-amber-400">By Prior Appointment</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-xs border border-slate-200">
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-1 sm:mb-2 font-display">Send Us a Message</h3>
              <p className="text-slate-500 text-xs sm:text-base mb-6 sm:mb-8 font-medium">Fill out the form below. An academic counselor will contact you within 4 business hours.</p>

              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h4 className="text-2xl font-black text-emerald-900 mb-2 font-display">Inquiry Received!</h4>
                  <p className="text-emerald-700 font-medium max-w-md mx-auto">Thank you for reaching out. A Rachakonda Solutions career advisor will call or message you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Student / Parent Name *</label>
                      <input
                        {...register('name')}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/70 focus:bg-white text-sm font-medium"
                        placeholder="e.g. Ramesh Kumar"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/70 focus:bg-white text-sm font-medium"
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Phone + State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mobile / WhatsApp Number *</label>
                      <input
                        {...register('phone')}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/70 focus:bg-white text-sm font-medium"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Your State *</label>
                      <select
                        {...register('state')}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/70 focus:bg-white text-sm font-medium text-slate-700"
                      >
                        <option value="">Select your state</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Other">Other State</option>
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.state.message}</p>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Counseling Interest / Topic *</label>
                    <input
                      {...register('subject')}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/70 focus:bg-white text-sm font-medium"
                      placeholder="e.g. Guidance after 10th / TS EAMCET counseling / Govt job coaching"
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.subject.message}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Message / Query *</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/70 focus:bg-white resize-none text-sm font-medium"
                      placeholder="Tell us about your current qualification, target colleges, questions or preferred counseling time..."
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Submitting Inquiry...</span>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Inquiry</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Google Maps Visual Embed Card */}
            <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                    Interactive Map
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 mt-2 font-display">Visit Us in Gajwel</h4>
                  <p className="text-slate-500 text-sm">Located centrally above the LIC Office beside Gajwel Bus Stand</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-colors"
                >
                  <Navigation className="w-4 h-4 text-amber-400" />
                  Open in Google Maps App
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Map embed iframe */}
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                <iframe
                  title="Rachakonda Solutions Office Location"
                  src="https://maps.google.com/maps?q=Prashantha+Complex+Gajwel+Telangana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
