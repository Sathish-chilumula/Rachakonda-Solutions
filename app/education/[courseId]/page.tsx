'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, ChevronRight, Clock, Monitor, Calendar, Users, Star, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

const coursesData = {
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
      'Deployment and DevOps Basics'
    ],
    benefits: [
      '100% Placement Assistance',
      'Industry Expert Instructors',
      'Hands-on Real-world Projects',
      'Certificate of Completion',
      'Lifetime Access to Course Materials'
    ]
  },
  // Fallback for other courses
  'default': {
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
      'Final Project and Assessment'
    ],
    benefits: [
      'Expert Guidance and Mentorship',
      'Flexible Learning Schedule',
      'Interactive Sessions',
      'Industry-recognized Certification',
      'Career Support Services'
    ]
  }
};

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  course: z.string().min(1, 'Course is required'),
});

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const course = coursesData[courseId as keyof typeof coursesData] || coursesData['default'];
  const title = courseId !== 'default' ? course.title : courseId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course: title
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.from('enrollments').insert([
          {
            name: data.name,
            phone: data.phone,
            email: data.email,
            course_name: data.course,
            category: course.category,
            source: 'education_website',
            status: 'new'
          },
        ]);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Mock enrollment:', data);
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      alert('Failed to submit enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-blue-950 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={course.image} alt={title} fill className="object-cover opacity-20 mix-blend-overlay" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/80 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-blue-200 mb-6">
            <span className="hover:text-white cursor-pointer" onClick={() => router.push('/education')}>Education</span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-amber-500 font-medium">{course.category}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-amber-500 text-blue-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4"
              >
                Best Seller
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-6 font-display leading-tight"
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
                className="flex flex-wrap gap-6 text-sm font-medium"
              >
                <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-800">
                  <Clock className="w-5 h-5 text-amber-500 mr-2" />
                  {course.duration}
                </div>
                <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-800">
                  <Monitor className="w-5 h-5 text-blue-400 mr-2" />
                  {course.mode}
                </div>
                <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-800">
                  <Star className="w-5 h-5 text-yellow-400 mr-2 fill-yellow-400" />
                  4.8 (120+ Reviews)
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Content Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Curriculum */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                <BookOpen className="w-6 h-6 text-blue-900 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 font-display">Course Curriculum</h2>
              </div>
              <div className="space-y-4">
                {course.curriculum.map((item, i) => (
                  <div key={i} className="flex items-start p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm mr-4 shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg">{item}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 font-display">What You&apos;ll Get</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.benefits.map((item, i) => (
                  <div key={i} className="flex items-center p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Enrollment Form */}
          <div className="lg:col-span-1" id="enroll-form">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-900 to-amber-500"></div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-display">Enroll Now</h3>
                <p className="text-slate-500 text-sm mb-6">Secure your spot in the next batch. Limited seats available.</p>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-green-800 mb-2">Enrollment Successful!</h4>
                    <p className="text-green-600 text-sm">Our counselor will contact you shortly with batch details.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register('course')} />
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        {...register('name')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        {...register('phone')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-6 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Course Fee</span>
                        <span className="font-bold text-slate-900">₹25,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Registration</span>
                        <span className="font-bold text-green-600">Free</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 mt-6 flex justify-center items-center disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        'Confirm Enrollment'
                      )}
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4">
                      No payment required right now. Pay after attending the demo class.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Enroll Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <button 
          onClick={() => {
            document.getElementById('enroll-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}
