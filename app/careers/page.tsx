'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Briefcase,
  Users,
  Clock,
  Shirt,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  FileCheck,
  Maximize2,
  X,
  ExternalLink,
  MessageCircle,
  Building2,
  GraduationCap,
  Download,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { JOB_ROLES, HIRING_OVERVIEW, JobRole } from '@/lib/data/careers';
import { supabase } from '@/lib/supabase';

// Form validation schema supporting multiple positions
const formSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required (minimum 2 characters)'),
  fatherName: z.string().min(2, "Father's Name is required"),
  address: z.string().min(5, 'Complete residential address with village/town, mandal & district is required'),
  maritalStatus: z.enum(['Single', 'Married'], {
    required_error: 'Please select your marital status',
  }),
  gender: z.enum(['Female', 'Male', 'Other'], {
    required_error: 'Please select gender',
  }),
  qualification: z.string().min(2, 'Educational qualification is required'),
  mobileNo: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  mailId: z.string().email('Please enter a valid email address'),
  hasExperience: z.enum(['No', 'Yes']),
  experienceDetails: z.string().optional(),
  jobRoles: z.array(z.string()).min(1, 'Please select at least one job role you are applying for'),
  additionalNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CareersPage() {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<{
    referenceId: string;
    fullName: string;
    fatherName: string;
    jobRoles: string[];
    mobileNo: string;
    qualification: string;
  } | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasExperience: 'No',
      maritalStatus: 'Single',
      gender: 'Female',
      jobRoles: [],
    },
  });

  const watchHasExperience = watch('hasExperience');
  const watchJobRoles = watch('jobRoles') || [];

  // Toggle role in multi-select array
  const toggleRole = (roleTitle: string) => {
    const current = watch('jobRoles') || [];
    let updated: string[];
    if (current.includes(roleTitle)) {
      updated = current.filter((r) => r !== roleTitle);
    } else {
      updated = [...current, roleTitle];
    }
    setValue('jobRoles', updated, { shouldValidate: true });
  };

  const handleSelectFromCard = (roleTitle: string) => {
    const current = watch('jobRoles') || [];
    if (!current.includes(roleTitle)) {
      setValue('jobRoles', [...current, roleTitle], { shouldValidate: true });
    }
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter roles based on search and category
  const filteredRoles = JOB_ROLES.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.priorityRequirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedRoleFilter === 'all') return true;
    if (selectedRoleFilter === 'degree') return role.qualification.toLowerCase().includes('any degree');
    if (selectedRoleFilter === 'inter') return role.qualification.toLowerCase().includes('inter');
    if (selectedRoleFilter === 'tech')
      return (
        role.qualification.toLowerCase().includes('b.tech') ||
        role.qualification.toLowerCase().includes('diploma') ||
        role.qualification.toLowerCase().includes('b.ed')
      );
    return true;
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    let refId = `RS-2026-JOB-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      setDuplicateError(null);
      // 1. Submit via server API route (guaranteed bypass of RLS & duplicate restriction)
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.status === 409) {
        const errJson = await res.json();
        setDuplicateError(errJson.error || 'An application has already been submitted with this Mobile Number or Email ID.');
        setIsSubmitting(false);
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (res.ok) {
        const json = await res.json();
        if (json.referenceId) {
          refId = json.referenceId;
        }
      } else {
        // Fallback to client-side insert if API route fails
        const rolesString = data.jobRoles.join(', ');
        await supabase.from('leads').insert([
          {
            name: data.fullName,
            phone: data.mobileNo,
            city: data.address,
            address: data.address,
            designation: rolesString,
            remarks: `[CAREERS 95 STAFF] Roles: ${rolesString} | Father: ${data.fatherName} | Qual: ${data.qualification} | Gender: ${data.gender} | Marital: ${data.maritalStatus} | Exp: ${data.hasExperience === 'Yes' ? data.experienceDetails : 'Fresher'} | Email: ${data.mailId} | Ref: ${refId}`,
            status: 'new',
            priority: 'hot',
            source: 'careers_portal',
          },
        ]);
      }
    } catch (e) {
      console.warn('Form submission processed with local reference:', e);
    }

    setSubmittedData({
      referenceId: refId,
      fullName: data.fullName,
      fatherName: data.fatherName,
      jobRoles: data.jobRoles,
      mobileNo: data.mobileNo,
      qualification: data.qualification,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20 pb-20 selection:bg-amber-100 selection:text-amber-900">
      {/* ─── Hero Announcement Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-12 sm:py-20 border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/images/abstract_education_bg.webp')" }}
        />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Urgent Hiring Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border border-amber-400/40 rounded-full px-4 py-1.5 mb-5 shadow-lg"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black tracking-wider text-amber-300 uppercase">
              ★ Official Walk-in Drive &bull; TOTAL 95 STAFF OPENINGS ★
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display mb-4 leading-tight"
          >
            Grow Your Career With <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-400">
              Rachakonda Solutions Pvt Ltd
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto font-medium mb-8 leading-relaxed"
          >
            Join our dynamic team at our Gajwel Head Office. 95 open positions across Management, Telecalling, Administration, Academic Coaching, and Digital Media. Candidates can apply for multiple positions!
          </motion.p>

          {/* Quick Perks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-amber-400 font-black text-lg sm:text-2xl mb-0.5">₹2.5L – 3.0L</div>
              <div className="text-[11px] sm:text-xs text-blue-200 font-semibold">Annual CTC + Incentives</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-emerald-400 font-black text-lg sm:text-2xl mb-0.5 flex items-center justify-center gap-1">
                <ShieldCheck className="w-5 h-5" /> PF + ESI
              </div>
              <div className="text-[11px] sm:text-xs text-blue-200 font-semibold">Statutory Benefits Provided</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-amber-300 font-black text-lg sm:text-2xl mb-0.5 flex items-center justify-center gap-1">
                <Clock className="w-5 h-5" /> 9 AM – 5:30 PM
              </div>
              <div className="text-[11px] sm:text-xs text-blue-200 font-semibold">Day Shift Timings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-cyan-300 font-black text-lg sm:text-2xl mb-0.5 flex items-center justify-center gap-1">
                <Users className="w-5 h-5" /> 95 Posts
              </div>
              <div className="text-[11px] sm:text-xs text-blue-200 font-semibold">Immediate Joining</div>
            </div>
          </div>

          {/* Action Jump Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (formRef.current) {
                  formRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-full text-sm sm:text-base shadow-xl hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Fill Interview Application Form {watchJobRoles.length > 0 && `(${watchJobRoles.length} Selected)`}
            </button>
            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold px-6 py-3.5 rounded-full text-sm sm:text-base backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              View Official Hiring Flyer
            </button>
          </div>
        </div>
      </section>

      {/* ─── Office & Interview Notice Banner ──────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-3.5 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>Walk-in Interview Dates:</strong> Announcing very soon! Shortlisted applicants will receive WhatsApp and phone confirmation.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="tel:+919640333313" className="hover:text-amber-300 flex items-center gap-1 underline underline-offset-4">
              <Phone className="w-3.5 h-3.5" /> +91 9640333313
            </a>
            <a href="tel:08454315303" className="hover:text-amber-300 flex items-center gap-1 underline underline-offset-4">
              <Phone className="w-3.5 h-3.5" /> 08454-315303
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 space-y-14 sm:space-y-20">
        {/* ─── 11 Open Roles Section ─────────────────────────────────────── */}
        <section id="roles-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Final Fixed Staff List &bull; Multiple Selections Allowed
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 font-display">
                All 11 Open Designations
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                You can apply for multiple positions! Click on any role to add it to your selection.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All 11 Roles' },
                { id: 'degree', label: 'Any Degree' },
                { id: 'inter', label: 'Inter / Degree' },
                { id: 'tech', label: 'Specialized (Tech / B.Ed / Design)' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedRoleFilter(filter.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedRoleFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role title, qualification or priority skills (e.g. Tele Callers, Typing, MBA, Teaching)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-xs"
            />
          </div>

          {/* Selected Roles Sticky Floating Banner if > 0 */}
          {watchJobRoles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
            >
              <div>
                <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {watchJobRoles.length} Position{watchJobRoles.length > 1 ? 's' : ''} Selected for Application:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {watchJobRoles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-2xs"
                    >
                      {r}
                      <button
                        type="button"
                        onClick={() => toggleRole(r)}
                        className="hover:text-red-600 ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm transition-all"
              >
                Proceed to Fill Form &rarr;
              </button>
            </motion.div>
          )}

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRoles.map((role) => {
              const isSelected = watchJobRoles.includes(role.title);
              return (
                <motion.div
                  key={role.id}
                  layout
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-lg bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Role No and Gender Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                        #{role.no}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          role.genderNeeded.includes('Female') || role.genderNeeded.includes('Girls')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : role.genderNeeded.includes('Boys') || role.genderNeeded === 'Male'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {role.genderNeeded === 'Girls' ? 'Girls Only' : role.genderNeeded === 'Boys' ? 'Boys Only' : role.genderNeeded}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-display mb-1.5 flex items-center justify-between">
                      {role.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{role.department}</p>

                    <div className="space-y-2 text-xs mb-4">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800 block mb-0.5">🎓 Qualification:</span>
                        <span className="text-slate-600">{role.qualification}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/70">
                        <span className="font-bold text-amber-900 block mb-0.5">⭐ Priority / Requirements:</span>
                        <span className="text-amber-800">{role.priorityRequirement}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-5">
                      {role.description}
                    </p>
                  </div>

                  {/* Multi-Select Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleRole(role.title)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Selected &bull; Tap to Deselect
                      </>
                    ) : (
                      <>
                        + Select {role.title}
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── Official Flyer & Work Culture Section ────────────────────── */}
        <section className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Work Culture &amp; Benefits
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
                Professional Work Environment at Gajwel Campus
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Rachakonda Solutions is an established education &amp; career consultancy operating since 2012. We provide structured career ladders, employee welfare schemes, and comprehensive training for freshers and experienced candidates alike.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <Shirt className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Mandatory Dress Code</h4>
                    <p className="text-xs text-blue-200">Formal professional attire fostering corporate grooming.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Full PF &amp; ESI Coverage</h4>
                    <p className="text-xs text-blue-200">Government social security &amp; comprehensive medical support.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Fixed Day Timings</h4>
                    <p className="text-xs text-blue-200">9:00 AM to 5:30 PM with structured tea &amp; lunch breaks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <Briefcase className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Annual Appraisals</h4>
                    <p className="text-xs text-blue-200">Performance-based salary increments &amp; promotion tracks.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Poster Thumbnail Click-to-Zoom */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div
                onClick={() => setIsPosterModalOpen(true)}
                className="group relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/50 cursor-pointer bg-slate-900"
              >
                <Image
                  src="/images/hiring_poster.jpg"
                  alt="Rachakonda Solutions Official Hiring Poster"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600/90 backdrop-blur-sm self-start px-3 py-1.5 rounded-xl shadow">
                    <Maximize2 className="w-3.5 h-3.5" /> Click to Zoom Poster
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-200 mt-2 font-medium">Click image to inspect full high-resolution hiring poster</p>
            </div>
          </div>
        </section>

        {/* ─── The 10-Field Interview Application Form ─────────────────── */}
        <section ref={formRef} id="apply-form" className="scroll-mt-24">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                  <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                  Official Candidate Registration
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 font-display">
                  Interview Application Form
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
                  Please fill in all 10 mandatory fields accurately. You can select multiple roles if interested in more than one position.
                </p>
              </div>

              {/* Success View / Slip */}
              {submittedData ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                      Registration Confirmed
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                      Application Submitted Successfully!
                    </h3>
                    <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
                      Thank you, <strong>{submittedData.fullName}</strong>. Your registration for{' '}
                      <span className="text-emerald-700 font-bold">
                        {submittedData.jobRoles.length} position(s) ({submittedData.jobRoles.join(', ')})
                      </span>{' '}
                      has been received.
                    </p>
                  </div>

                  {/* Interview Pass Ticket */}
                  <div className="bg-white rounded-2xl p-5 border border-emerald-200 text-left max-w-md mx-auto shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500 font-bold">Application Reference:</span>
                      <span className="text-xs font-black font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {submittedData.referenceId}
                      </span>
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <p>
                        <strong>Candidate:</strong> {submittedData.fullName} (S/O or D/O {submittedData.fatherName})
                      </p>
                      <p>
                        <strong>Applied Positions ({submittedData.jobRoles.length}):</strong>{' '}
                        <span className="font-bold text-blue-700">{submittedData.jobRoles.join(', ')}</span>
                      </p>
                      <p>
                        <strong>Mobile:</strong> {submittedData.mobileNo}
                      </p>
                      <p>
                        <strong>Qualification:</strong> {submittedData.qualification}
                      </p>
                      <p>
                        <strong>Interview Venue:</strong> Prashantha Complex 2nd &amp; 3rd Floor, Above LIC Office, Gajwel
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/919640333313?text=${encodeURIComponent(
                        `Hello HR Team, I have submitted my job application on the website.\nReference ID: ${submittedData.referenceId}\nName: ${submittedData.fullName}\nApplied Positions: ${submittedData.jobRoles.join(', ')}\nMobile: ${submittedData.mobileNo}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Send Confirmation on WhatsApp (+91 9640333313)
                    </a>
                    <button
                      onClick={() => {
                        setSubmittedData(null);
                        reset();
                      }}
                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {duplicateError && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex items-start gap-3.5 shadow-sm animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-red-900">Application Already Registered</h4>
                        <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed font-medium">
                          {duplicateError}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <a
                            href="https://wa.me/919640333313?text=Hello%20HR,%20I%20have%20already%20applied%20for%20the%2095%20Staff%20Walk-in%20Drive%20and%20need%20assistance."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            Chat with HR on WhatsApp
                          </a>
                          <a
                            href="tel:+919640333313"
                            className="text-xs font-bold text-red-700 hover:underline"
                          >
                            Call: 9640333313
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Field 1: Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        1. Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="As per SSC / Aadhaar card"
                        {...register('fullName')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Field 2: Father Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        2. Father Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Father's / Guardian's full name"
                        {...register('fatherName')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.fatherName && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.fatherName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Field 3: Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      3. Residential Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="House No, Village / Town, Mandal, District (Telangana / Andhra Pradesh) with PIN code"
                      {...register('address')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600 font-medium mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Field 4: Marital Status */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        4. Marital Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('maritalStatus')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      >
                        <option value="Single">Single / Unmarried</option>
                        <option value="Married">Married</option>
                      </select>
                      {errors.maritalStatus && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.maritalStatus.message}</p>
                      )}
                    </div>

                    {/* Field 5: Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        5. Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('gender')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.gender.message}</p>
                      )}
                    </div>

                    {/* Field 6: Qualification */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        6. Qualification <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('qualification')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      >
                        <option value="">-- Select Highest Education --</option>
                        <option value="Intermediate">Intermediate (10+2)</option>
                        <option value="Any Degree (B.Sc, B.Com, B.A)">Degree (B.Sc, B.Com, B.A)</option>
                        <option value="B.Tech / B.E">B.Tech / B.E</option>
                        <option value="B.Pharm / M.Pharm">B.Pharm / M.Pharm</option>
                        <option value="MBA / PG">MBA / Post Graduate</option>
                        <option value="B.Ed / D.Ed">B.Ed / Teaching Degree</option>
                        <option value="Diploma / Polytechnic">Polytechnic / Diploma</option>
                        <option value="Other">Other Qualification</option>
                      </select>
                      {errors.qualification && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.qualification.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Field 7: Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        7. Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          {...register('mobileNo')}
                          className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">WhatsApp notifications will be sent to this number.</span>
                      {errors.mobileNo && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.mobileNo.message}</p>
                      )}
                    </div>

                    {/* Field 8: Mail ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        8. Email Address (Mail ID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        {...register('mailId')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">For receiving official interview call letters.</span>
                      {errors.mailId && (
                        <p className="text-xs text-red-600 font-medium mt-1">{errors.mailId.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Field 9: If Any Experience */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      9. Prior Work Experience?
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-6 mb-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          value="No"
                          {...register('hasExperience')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        No (Fresher — Freshers Welcome)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          value="Yes"
                          {...register('hasExperience')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        Yes (I have prior experience)
                      </label>
                    </div>

                    {watchHasExperience === 'Yes' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2"
                      >
                        <label className="block text-xs text-slate-800 font-bold mb-1">
                          Specify Years of Experience &amp; Previous Company / Role: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2 years as Telecaller at ABC Solutions / 1 year as Office Assistant"
                          {...register('experienceDetails')}
                          required={watchHasExperience === 'Yes'}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          This experience information will be reviewed by the interview panel.
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Field 10: Multi-Select Apply Job Roles */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-black text-blue-950">
                          10. Apply Job Role(s) <span className="text-red-500">*</span>{' '}
                          <span className="text-xs font-semibold text-blue-700">(Select One or Multiple Roles)</span>
                        </label>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Tap on the positions you are interested in. You can choose more than one option.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                          {watchJobRoles.length} Selected
                        </span>
                        {watchJobRoles.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setValue('jobRoles', [], { shouldValidate: true })}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Interactive Selection Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
                      {JOB_ROLES.map((role) => {
                        const isChecked = watchJobRoles.includes(role.title);
                        return (
                          <div
                            key={role.id}
                            onClick={() => toggleRole(role.title)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                              isChecked
                                ? 'bg-white border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                                : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold leading-tight ${isChecked ? 'text-blue-900' : 'text-slate-800'}`}>
                                #{role.no}. {role.title}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                  {role.qualification.split('(')[0].trim()}
                                </span>
                                <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                                  {role.genderNeeded}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {errors.jobRoles && (
                      <p className="text-xs text-red-600 font-bold mt-2.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.jobRoles.message}
                      </p>
                    )}
                  </div>

                  {/* Additional Remarks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Additional Remarks / Preferred Joining Date (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Can join immediately / Looking for Telecaller role in Telugu"
                      {...register('additionalNotes')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Submit Application &amp; Register for Interview
                        {watchJobRoles.length > 0 && ` (${watchJobRoles.length} Roles)`}
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    By submitting this form, you confirm that the details provided are true. Rachakonda Solutions Pvt Ltd does not charge any application or interview fees.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ─── Campus Location & Office Address ──────────────────────────── */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                Official Head Office &bull; Interview Venue
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display">
                Rachakonda Solutions Pvt Ltd
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Head Office Address:</strong>
                    Prashantha Complex 2nd &amp; 3rd Floor, Above LIC Office,
                    <br />
                    Beside Gajwel Bus Stand Main Road, Gajwel,
                    <br />
                    Telangana — 502278.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Mobile &amp; WhatsApp:</strong>{' '}
                    <a href="tel:+919640333313" className="text-blue-600 font-semibold hover:underline">
                      +91 9640333313
                    </a>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Landline:</strong>{' '}
                    <a href="tel:08454315303" className="text-blue-600 font-semibold hover:underline">
                      08454-315303
                    </a>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>HR Email:</strong>{' '}
                    <a href="mailto:hr@rachakondasolutions.com" className="text-blue-600 font-semibold hover:underline">
                      hr@rachakondasolutions.com
                    </a>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow"
                >
                  <ExternalLink className="w-4 h-4" /> Open in Google Maps
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="lg:col-span-7 h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                title="Rachakonda Solutions Gajwel Campus Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.8170298132924!2d78.6811466!3d17.8488053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb838cf4a17953%3A0x6b0ee693dc06ffda!2sPrashantha%20Complex!5e0!3m2!1sen!2sin!4v1711789456123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ─── Poster Modal Lightbox ─────────────────────────────────────── */}
      <AnimatePresence>
        {isPosterModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setIsPosterModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full max-h-[92vh] overflow-y-auto bg-slate-900 rounded-3xl border border-white/20 p-2 sm:p-4 shadow-2xl"
            >
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-white/20 transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
                <Image
                  src="/images/hiring_poster.jpg"
                  alt="Rachakonda Solutions Official Hiring Poster Full View"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
                <div className="text-white text-xs">
                  <strong>Rachakonda Solutions Pvt Ltd</strong> &bull; Total 95 Staff Openings
                </div>
                <button
                  onClick={() => {
                    setIsPosterModalOpen(false);
                    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
