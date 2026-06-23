'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Tag, ChevronRight } from 'lucide-react';

const articles = [
  {
    title: 'What to Do After 10th Class in Telangana: Complete Guide 2025',
    category: 'After 10th',
    readTime: '8 min read',
    excerpt: 'Confused between MPC, BiPC, CEC, and HEC? A comprehensive guide for SSC students in TS & AP.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'TS EAMCET 2025: Complete Guide for Telangana Students',
    category: 'Engineering',
    readTime: '10 min read',
    excerpt: 'Everything you need to know about eligibility, syllabus, and top colleges for TS EAMCET.',
    image: 'https://images.unsplash.com/photo-1513258496099-48166c2a4689?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'Top Engineering Colleges in Telangana',
    category: 'Engineering',
    readTime: '6 min read',
    excerpt: 'A curated list of the best autonomous and affiliated engineering colleges under JNTUH and OU.',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'Government Jobs for Degree Holders in AP',
    category: 'Government Jobs',
    readTime: '7 min read',
    excerpt: 'Explore opportunities in APPSC Group 2, Secretariat jobs, and banking for graduates.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'TSPSC Group 2 Preparation Strategy',
    category: 'Government Jobs',
    readTime: '9 min read',
    excerpt: 'Expert tips on how to prepare for TSPSC Group 2, important books, and study plans.',
    image: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'Scholarships for SC/ST Students in AP',
    category: 'Scholarships',
    readTime: '5 min read',
    excerpt: 'Detailed guide on Jagananna Vidya Deevena and other schemes available in Andhra Pradesh.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'How to Crack NEET While Studying in Telangana',
    category: 'Medical',
    readTime: '8 min read',
    excerpt: 'Balancing TS Intermediate board exams with NEET preparation for aspiring doctors.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
  {
    title: 'MBA After Degree: ICET vs CAT for TS/AP Students',
    category: 'After Inter',
    readTime: '6 min read',
    excerpt: 'Deciding between state-level TS/AP ICET and national-level CAT for your MBA journey.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    slug: '#',
  },
];

const categories = ['All', 'After 10th', 'After Inter', 'Government Jobs', 'Scholarships', 'Engineering', 'Medical'];

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 font-display"
          >
            Career Guidance <span className="text-amber-400">Articles</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto"
          >
            In-depth guides, exam strategies, and career insights for students in Telangana & AP.
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {article.category}
                </div>
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
                  <Link href={article.slug} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    Read More <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4 font-display">Want Personalized Advice?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Our experts can provide targeted guidance based on your academic background and goals.</p>
        <Link href="/contact" className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-50 transition-colors">
          Book a Free Counseling Call
        </Link>
      </section>
    </div>
  );
}
