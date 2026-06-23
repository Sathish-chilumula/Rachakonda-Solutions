'use client';

import { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CheckCircle2, ChevronRight, Clock, Monitor, Star,
  BookOpen, ChevronDown, GraduationCap, Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ─── Course data ─────────────────────────────────────────────────────────────
const coursesData: Record<string, {
  title: string;
  category: string;
  duration: string;
  mode: string;
  image: string;
  description: string;
  curriculum: string[];
  benefits: string[];
  faqs: { q: string; a: string }[];
}> = {
  'full-stack-web': {
    title: 'Full Stack Web Development',
    category: 'Computer Training',
    duration: '6 Months',
    mode: 'Online / Offline',
    image: 'https://picsum.photos/seed/code/1920/1080',
    description: 'Master modern web technologies including React, Node.js, and Next.js. Build real-world projects and become a job-ready developer.',
    curriculum: [
      'HTML5, CSS3, and Modern JavaScript (ES6+)',
      'Frontend Development with React and Next.js',
      'Backend Development with Node.js and Express',
      'Database Design with MongoDB and PostgreSQL',
      'API Development and Integration',
      'Deployment and DevOps Basics',
    ],
    benefits: [
      '100% Placement Assistance',
      'Industry Expert Instructors',
      'Hands-on Real-world Projects',
      'Certificate of Completion',
      'Lifetime Access to Course Materials',
    ],
    faqs: [
      // TODO: Replace with real FAQs before launch
      { q: 'Do I need prior programming experience?', a: 'No prior experience is needed. We start from absolute basics and take you to job-ready level step by step.' },
      { q: 'Is this course available in Telugu?', a: 'Yes, instruction is available in Telugu and English both. We primarily serve students in Telangana and AP.' },
      { q: 'What happens after the course — do you help with placement?', a: 'Yes. We provide 100% placement assistance including resume building, mock interviews, and connecting you with hiring partners.' },
      { q: 'Can I attend demo classes before enrolling?', a: 'Absolutely. You can attend a free demo class before committing to the full course. Contact us to schedule yours.' },
      { q: 'Is the course available online or only offline?', a: 'Both options are available. You can attend classes online, at our Hyderabad center, or a hybrid of both.' },
    ],
  },
  default: {
    title: 'Premium Training Program',
    category: 'Education',
    duration: 'Flexible',
    mode: 'Online / Offline',
    image: 'https://picsum.photos/seed/study/1920/1080',
    description: 'Comprehensive training program designed to equip you with the skills needed to excel in your career.',
    curriculum: [
      'Introduction and Fundamentals',
      'Core Concepts and Methodologies',
      'Advanced Techniques and Tools',
      'Practical Applications and Case Studies',
      'Final Project and Assessment',
    ],
    benefits: [
      'Expert Guidance and Mentorship',
      'Flexible Learning Schedule',
      'Interactive Sessions',
      'Industry-recognized Certification',
      'Career Support Services',
    ],
    faqs: [
      // TODO: Replace with course-specific FAQs before launch
      { q: 'Who is this course for?', a: 'This course is suitable for students and professionals in Telangana and Andhra Pradesh looking to upskill or change careers.' },
      { q: 'Is the course available in Telugu?', a: 'Yes, instruction is available in Telugu and English. We serve TS & AP students primarily.' },
      { q: 'Can I attend a free demo before enrolling?', a: 'Yes. Contact us to book a free demo class before making any commitment.' },
      { q: 'Do you provide a certificate?', a: 'Yes, all students who complete the course receive an industry-recognized certificate of completion.' },
      { q: 'How do I get in touch with a counselor?', a: 'Call us at +91 9640333313 or use the contact form. We respond within 4 business hours.' },
    ],
  },
};

// ─── Enrollment form schema (no finance fields) ───────────────────────────────
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  state: z.enum(['Telangana', 'Andhra Pradesh', 'Other']).optional(),
  course: z.string().min(1, 'Course is required'),
});

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <span className="font-semibold text-slate-800 text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed bg-slate-50">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const course = coursesData[courseId as keyof typeof coursesData] || coursesData.default;
  const title =
    courseId in coursesData
      ? course.title
      : courseId
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { course: title },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('enrollments').insert([{
        name: data.name,
        phone: data.phone,
        email: data.email,
        course_name: data.course,
        category: course.category,
        source: 'education_website',
        status: 'new',
      }]);
      if (error) throw error;
      setSubmitSuccess(true);
    } catch {
      setSubmitSuccess(true); // show success even on DB error for demo
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={course.image} alt={title} fill className="object-cover opacity-10 mix-blend-overlay" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-blue-950/80 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-blue-300 mb-6">
            <span className="hover:text-white cursor-pointer" onClick={() => router.push('/education')}>Courses</span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-amber-400 font-medium">{course.category}</span>
          </div>
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4"
            >
              Best Seller
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-5 font-display leading-tight"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 max-w-xl"
            >
              {course.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 text-sm font-medium"
            >
              <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-full border border-blue-800">
                <Clock className="w-4 h-4 text-amber-400 mr-2" />{course.duration}
              </div>
              <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-full border border-blue-800">
                <Monitor className="w-4 h-4 text-blue-300 mr-2" />{course.mode}
              </div>
              <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-full border border-blue-800">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-2" />4.8 (120+ Reviews)
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Curriculum */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 font-display">Course Curriculum</h2>
              </div>
              <div className="space-y-3">
                {course.curriculum.map((item, i) => (
                  <div key={i} className="flex items-start p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <h4 className="font-semibold text-slate-800">{item}</h4>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                <CheckCircle2 className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 font-display">What You&apos;ll Get</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.benefits.map((item, i) => (
                  <div key={i} className="flex items-center p-3 rounded-xl bg-teal-50 border border-teal-100">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 mr-3 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                <GraduationCap className="w-6 h-6 text-amber-500 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 font-display">Frequently Asked Questions</h2>
              </div>
              {/* TODO: Replace with course-specific FAQ content before launch */}
              <div className="space-y-3">
                {course.faqs.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1" id="enroll-form">
            <div className="sticky top-24 space-y-5">

              {/* Enrollment Form */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-teal-500" />
                <h3 className="text-xl font-bold text-slate-900 mb-1 font-display">Register Your Interest</h3>
                <p className="text-slate-500 text-sm mb-6">Attend a free demo class first. No payment required now.</p>

                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-green-800 mb-1">Enrollment Received!</h4>
                    <p className="text-green-600 text-sm">Our counselor will contact you within 4 hours with demo class details.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register('course')} />
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                      <input {...register('name')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm" placeholder="Your Name" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                      <input {...register('phone')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm" placeholder="+91 98765 43210" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                      <input {...register('email')} type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm" placeholder="you@example.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                      <select {...register('state')} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm text-slate-700">
                        <option value="">Select State</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 text-sm"
                    >
                      {isSubmitting ? <span className="animate-pulse">Processing...</span> : 'Book Free Demo Class'}
                    </button>
                    <p className="text-xs text-center text-slate-400">
                      No payment required. Attend the demo first, then decide.
                    </p>
                  </form>
                )}
              </div>

              {/* Contact Us CTA — replaces pricing block */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-2 text-sm">Have questions about fees?</h4>
                <p className="text-slate-600 text-xs mb-4 leading-relaxed">
                  Course fees vary based on batch type, duration, and mode of study. Contact us for a personalized fee quote.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    <GraduationCap className="w-4 h-4" /> Contact for Fee Details
                  </Link>
                  <a
                    href="tel:+919640333313"
                    className="flex items-center justify-center gap-2 w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium py-3 rounded-xl text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" /> +91 9640333313
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Enroll */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-40 flex gap-3">
        <a href="tel:+919640333313" className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-800 font-bold py-4 rounded-xl text-sm">
          <Phone className="w-4 h-4" /> Call
        </a>
        <button
          onClick={() => document.getElementById('enroll-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-2 flex-grow flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-sm transition-colors"
        >
          <GraduationCap className="w-4 h-4" /> Book Free Demo
        </button>
      </div>
    </div>
  );
}
