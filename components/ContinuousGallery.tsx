'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Camera, Sparkles, MapPin } from 'lucide-react';

interface GalleryItem {
  id: number;
  src: string;
  fallback: string;
  title: string;
  category: string;
  location: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    src: '/gallery/item-1.webp',
    fallback: '/gallery/photo-1.jpg',
    title: 'Batch Celebration & Faculty Honor',
    category: 'Campus Event',
    location: 'Gajwel Campus',
  },
  {
    id: 6,
    src: '/gallery/item-6.webp',
    fallback: '/gallery/photo-6.jpg',
    title: 'Interactive Smart Classroom Training',
    category: 'Classroom',
    location: 'Training Hall 1',
  },
  {
    id: 11,
    src: '/gallery/item-11.webp',
    fallback: '/gallery/photo-11.jpg',
    title: 'National Day Celebration & Tribute',
    category: 'Cultural Event',
    location: 'Campus Terrace',
  },
  {
    id: 7,
    src: '/gallery/item-7.webp',
    fallback: '/gallery/photo-7.jpg',
    title: 'Career Mentorship & Guidance Session',
    category: 'Counseling',
    location: 'Lecture Hall',
  },
  {
    id: 3,
    src: '/gallery/item-3.webp',
    fallback: '/gallery/photo-3.jpg',
    title: 'Students & Mentors Group Felicitations',
    category: 'Achievement',
    location: 'Seminar Hall',
  },
  {
    id: 2,
    src: '/gallery/item-2.webp',
    fallback: '/gallery/photo-2.jpg',
    title: "Teachers' Day Celebration Cake",
    category: 'Celebration',
    location: 'Main Center',
  },
  {
    id: 9,
    src: '/gallery/item-9.webp',
    fallback: '/gallery/photo-9.jpg',
    title: 'Focused Competitive Exam Coaching',
    category: 'Exam Prep',
    location: 'Smart Lab',
  },
  {
    id: 4,
    src: '/gallery/item-4.webp',
    fallback: '/gallery/photo-4.jpg',
    title: 'Dedicated Student Batch Assembly',
    category: 'Batch 2025-26',
    location: 'Auditorium',
  },
  {
    id: 10,
    src: '/gallery/item-10.webp',
    fallback: '/gallery/photo-10.jpg',
    title: 'Interactive Whiteboard Problem Solving',
    category: 'Workshop',
    location: 'Training Room',
  },
  {
    id: 5,
    src: '/gallery/item-5.webp',
    fallback: '/gallery/photo-5.jpg',
    title: 'Faculty Guidance & Student Empowerment',
    category: 'Mentorship',
    location: 'Conference Room',
  },
  {
    id: 8,
    src: '/gallery/item-8.webp',
    fallback: '/gallery/photo-8.jpg',
    title: 'Individual Academic Counseling',
    category: 'Guidance',
    location: 'Counseling Cell',
  },
];

export default function ContinuousGallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Split into two rows for dynamic visual effect
  const row1 = galleryItems.slice(0, 6);
  const row2 = galleryItems.slice(6);

  // Duplicate arrays for seamless infinite continuous looping
  const infiniteRow1 = [...row1, ...row1, ...row1];
  const infiniteRow2 = [...row2, ...row2, ...row2];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden border-t border-slate-100">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-full px-4 py-1.5 mb-4 shadow-xs">
          <Camera className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Campus &amp; Student Life</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display mb-4">
          Life at <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Rachakonda Solutions</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg font-medium">
          Real students, real classrooms, and genuine mentorship across Telangana and Andhra Pradesh. Hover to pause and click any photo to inspect.
        </p>
      </div>

      {/* Track 1 — Moving Left */}
      <div className="overflow-hidden mb-6 relative">
        {/* Soft edge fade masks */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div className="marquee-track flex gap-5 py-2">
          {infiniteRow1.map((item, index) => (
            <div
              key={`row1-${item.id}-${index}`}
              onClick={() => setSelectedImage(item)}
              className="group relative w-72 sm:w-88 h-52 sm:h-60 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shrink-0 border border-slate-200/80 bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 288px, 352px"
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {item.category}
                </span>
              </div>

              {/* Zoom hint icon */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Info */}
              <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                <h4 className="font-bold text-sm sm:text-base leading-snug drop-shadow-sm mb-1 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-slate-300 text-xs flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-amber-400" /> {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Track 2 — Moving Right */}
      <div className="overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div className="marquee-track-reverse flex gap-5 py-2">
          {infiniteRow2.map((item, index) => (
            <div
              key={`row2-${item.id}-${index}`}
              onClick={() => setSelectedImage(item)}
              className="group relative w-72 sm:w-88 h-52 sm:h-60 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shrink-0 border border-slate-200/80 bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 288px, 352px"
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  {item.category}
                </span>
              </div>

              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                <h4 className="font-bold text-sm sm:text-base leading-snug drop-shadow-sm mb-1 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-slate-300 text-xs flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-teal-400" /> {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full aspect-video sm:aspect-16/10 bg-black">
                <Image
                  src={selectedImage.fallback}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="p-6 bg-slate-900 border-t border-white/10 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-1.5">
                    {selectedImage.category}
                  </div>
                  <h3 className="text-xl font-bold font-display">{selectedImage.title}</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {selectedImage.location}
                  </p>
                </div>
                <div className="text-xs text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  Rachakonda Solutions Education Center
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
