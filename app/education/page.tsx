'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Monitor, BookOpen, GraduationCap, Clock, Sun, ArrowRight, Filter } from 'lucide-react';

const categories = [
  { id: 'computer', name: 'Computer Training', icon: Monitor },
  { id: 'consultancy', name: 'Education Consultancy', icon: GraduationCap },
  { id: 'tutorial', name: 'Tutorial Point', icon: BookOpen },
  { id: 'crash', name: 'Crash Courses', icon: Clock },
  { id: 'summer', name: 'Summer Camp', icon: Sun },
];

const courses = [
  {
    id: 'full-stack-web',
    title: 'Full Stack Web Development',
    category: 'computer',
    duration: '6 Months',
    mode: 'Online / Offline',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    description: 'Master modern web technologies including React, Node.js, and Next.js.',
  },
  {
    id: 'data-science',
    title: 'Data Science & Machine Learning',
    category: 'computer',
    duration: '8 Months',
    mode: 'Online',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    description: 'Learn Python, Pandas, Scikit-learn, and build predictive models.',
  },
  {
    id: 'study-abroad',
    title: 'Study Abroad Counseling',
    category: 'consultancy',
    duration: 'Flexible',
    mode: 'Offline',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    description: 'Expert guidance for admissions to top universities worldwide.',
  },
  {
    id: 'math-physics-crash',
    title: 'Math & Physics Crash Course',
    category: 'crash',
    duration: '45 Days',
    mode: 'Online / Offline',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    description: 'Intensive preparation for board exams and competitive tests.',
  },
  {
    id: 'coding-camp',
    title: 'Kids Coding Summer Camp',
    category: 'summer',
    duration: '4 Weeks',
    mode: 'Offline',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    description: 'Fun and interactive coding basics for children aged 8-14.',
  },
  {
    id: 'english-speaking',
    title: 'Spoken English Mastery',
    category: 'tutorial',
    duration: '3 Months',
    mode: 'Online',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    description: 'Improve your fluency, vocabulary, and confidence in English.',
  },
];

export default function EducationPortal() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-blue-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 font-display"
          >
            Skill Courses for <span className="text-amber-500">TS &amp; AP Students</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto mb-4"
          >
            Professional training programs, expert consultancy, and career-ready courses — designed for students and professionals in Telangana and Andhra Pradesh.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 rounded-full px-4 py-2 mb-6"
          >
            <span className="text-xs font-semibold text-blue-200">📍 Serving Telangana &amp; Andhra Pradesh</span>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for courses, training, or consultancy..."
                className="w-full pl-12 pr-4 py-4 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 font-display">Explore Categories</h2>
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all ${
              activeCategory === 'all' 
                ? 'bg-blue-900 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Programs
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === cat.id 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Course Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-900 uppercase tracking-wider shadow-sm">
                  {categories.find(c => c.id === course.category)?.name}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display line-clamp-2">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-grow">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Monitor className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium">{course.mode}</span>
                  </div>
                </div>
                
                <Link
                  href={`/education/${course.id}`}
                  className="w-full block text-center bg-blue-50 text-blue-900 hover:bg-blue-900 hover:text-white font-semibold py-3 rounded-xl transition-colors duration-300"
                >
                  View Details & Enroll
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No programs found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
