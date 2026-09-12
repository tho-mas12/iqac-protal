'use client';

import React, { forwardRef } from 'react';
import { Calendar, Clock, MapPin, Award, Sparkles, Building2, User } from 'lucide-react';

export interface PosterData {
  templateId: 'classic-royal' | 'maroon-heritage' | 'modern-tech' | 'clean-academic';
  programTitle: string;
  category: string;
  tagline: string;
  departmentName: string;
  shift: string;
  collaboration: string;
  dateStr: string;
  timeStr: string;
  venueStr: string;
  platformStr: string;
  speakerName: string;
  speakerDesignation: string;
  speakerOrg: string;
  speakerPhotoUrl: string | null;
  patronName: string;
  convenerName: string;
  coordinatorName: string;
  showSjcLogo: boolean;
  showIqacLogo: boolean;
  showNaacBadge: boolean;
  primaryColor?: string;
}

interface PosterPreviewProps {
  data: PosterData;
  scale?: number;
}

export const PosterCanvas = forwardRef<HTMLDivElement, PosterPreviewProps>(({ data, scale = 1 }, ref) => {
  const {
    templateId,
    programTitle,
    category,
    tagline,
    departmentName,
    shift,
    collaboration,
    dateStr,
    timeStr,
    venueStr,
    platformStr,
    speakerName,
    speakerDesignation,
    speakerOrg,
    speakerPhotoUrl,
    patronName,
    convenerName,
    coordinatorName,
    showSjcLogo,
    showIqacLogo,
    showNaacBadge,
  } = data;

  // -------------------------------------------------------------
  // TEMPLATE 1: CLASSIC ROYAL BLUE & GOLD (Traditional SJC Heritage)
  // -------------------------------------------------------------
  if (templateId === 'classic-royal') {
    return (
      <div
        ref={ref}
        id="iqac-poster-canvas"
        style={{
          width: '600px',
          minHeight: '850px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className="relative bg-gradient-to-b from-[#081326] via-[#0e2142] to-[#081326] text-white p-8 flex flex-col justify-between shadow-2xl overflow-hidden font-sans border-4 border-[#d4af37]"
      >
        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#d4af37]" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#d4af37]" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#d4af37]" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#d4af37]" />

        {/* Header Section */}
        <div>
          <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-4 mb-4">
            {showSjcLogo && (
              <div className="w-16 h-16 rounded-full bg-white/10 p-1 flex items-center justify-center border border-[#d4af37]/40 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sjc-logo.png" alt="SJC Logo" className="w-14 h-14 object-contain filter drop-shadow" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}

            <div className="text-center flex-1 px-3">
              <h4 className="text-[11px] font-semibold tracking-widest text-[#d4af37] uppercase">
                Autonomous &bull; Affiliated to Bharathidasan University
              </h4>
              <h1 className="text-xl font-bold tracking-wide text-white uppercase mt-0.5" style={{ fontFamily: 'serif' }}>
                St. Joseph&apos;s College (Autonomous)
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">
                Special Heritage Status &bull; Tiruchirappalli - 620 002, Tamil Nadu
              </p>
            </div>

            {showNaacBadge && (
              <div className="bg-[#d4af37]/20 border border-[#d4af37] px-2.5 py-1.5 rounded text-center">
                <div className="text-[9px] uppercase font-bold text-amber-300 tracking-wider">NAAC (4th Cycle)</div>
                <div className="text-xs font-black text-white">A++ Grade</div>
              </div>
            )}
          </div>

          {/* Department Banner */}
          <div className="text-center my-3">
            <div className="inline-block bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent px-6 py-1 border-y border-[#d4af37]/40">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-200">
                Department of {departmentName || 'Computer Science'} ({shift})
              </h3>
            </div>
            {collaboration && (
              <p className="text-[11px] text-slate-300 italic mt-1 font-light">
                In Association with {collaboration}
              </p>
            )}
            <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mt-2">
              Cordially invites you to the
            </p>
          </div>

          {/* Program Category & Title */}
          <div className="text-center my-4">
            <span className="inline-block bg-[#d4af37] text-[#081326] text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider shadow">
              {category || 'National Seminar'}
            </span>
            <h2 className="text-2xl font-black text-white mt-2 leading-tight tracking-tight px-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {programTitle || 'Recent Advancements in Science and Technology'}
            </h2>
            {tagline && (
              <p className="text-xs text-amber-200/90 italic mt-1 font-normal max-w-md mx-auto">
                &ldquo;{tagline}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Resource Person / Chief Guest Spotlight */}
        {(speakerName || speakerDesignation) && (
          <div className="bg-gradient-to-r from-[#0d2347] via-[#133060] to-[#0d2347] border border-[#d4af37]/50 rounded-xl p-4 my-2 shadow-xl flex items-center gap-4">
            {speakerPhotoUrl ? (
              <div className="relative w-20 h-20 rounded-full border-2 border-[#d4af37] overflow-hidden flex-shrink-0 shadow-lg bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={speakerPhotoUrl} alt={speakerName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full border border-[#d4af37]/60 bg-[#081326] flex items-center justify-center flex-shrink-0 text-[#d4af37]">
                <User className="w-8 h-8 opacity-80" />
              </div>
            )}
            <div className="flex-1">
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase block mb-0.5">
                ★ Chief Guest &amp; Resource Person
              </span>
              <h4 className="text-base font-bold text-white leading-snug">
                {speakerName || 'Dr. Resource Person'}
              </h4>
              <p className="text-xs text-amber-200/90 font-medium">
                {speakerDesignation || 'Designation'}
              </p>
              <p className="text-[11px] text-slate-300">
                {speakerOrg || 'Organization / Institution'}
              </p>
            </div>
          </div>
        )}

        {/* Date, Time, Venue Cards */}
        <div className="grid grid-cols-3 gap-2 my-3">
          <div className="bg-[#0b1d3a]/80 border border-slate-700/80 rounded-lg p-2.5 text-center">
            <Calendar className="w-4 h-4 text-[#d4af37] mx-auto mb-1" />
            <div className="text-[9px] font-bold text-slate-400 uppercase">Date</div>
            <div className="text-[11px] font-bold text-white mt-0.5">{dateStr || '25th Sept 2026'}</div>
          </div>
          <div className="bg-[#0b1d3a]/80 border border-slate-700/80 rounded-lg p-2.5 text-center">
            <Clock className="w-4 h-4 text-[#d4af37] mx-auto mb-1" />
            <div className="text-[9px] font-bold text-slate-400 uppercase">Time</div>
            <div className="text-[11px] font-bold text-white mt-0.5">{timeStr || '10:00 AM IST'}</div>
          </div>
          <div className="bg-[#0b1d3a]/80 border border-slate-700/80 rounded-lg p-2.5 text-center">
            <MapPin className="w-4 h-4 text-[#d4af37] mx-auto mb-1" />
            <div className="text-[9px] font-bold text-slate-400 uppercase">Venue</div>
            <div className="text-[11px] font-bold text-white mt-0.5 truncate">{venueStr || 'Sail Hall, SJC'}</div>
          </div>
        </div>

        {platformStr && (
          <div className="text-center text-[11px] text-amber-300 font-medium bg-[#0b1d3a] py-1 px-3 rounded-full border border-[#d4af37]/30 max-w-xs mx-auto mb-2">
            🔗 Online Platform: {platformStr}
          </div>
        )}

        {/* Footer / Organizing Committee */}
        <div className="border-t border-[#d4af37]/30 pt-3 mt-1">
          <div className="flex justify-between items-center text-center text-[10px] text-slate-300">
            <div>
              <div className="font-bold text-white">{patronName || 'Rev. Dr. Principal SJ'}</div>
              <div className="text-[9px] text-[#d4af37]">Patron / Principal</div>
            </div>
            <div>
              <div className="font-bold text-white">{convenerName || 'Head of the Department'}</div>
              <div className="text-[9px] text-[#d4af37]">Convener</div>
            </div>
            <div>
              <div className="font-bold text-white">{coordinatorName || 'Faculty Coordinator'}</div>
              <div className="text-[9px] text-[#d4af37]">Staff Coordinator</div>
            </div>
          </div>
          <div className="text-center mt-2 text-[9px] text-slate-400 tracking-wider">
            ALL ARE CORDIALLY INVITED
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 2: MAROON & IVORY PRESTIGE (Heritage & Celebrations)
  // -------------------------------------------------------------
  if (templateId === 'maroon-heritage') {
    return (
      <div
        ref={ref}
        id="iqac-poster-canvas"
        style={{
          width: '600px',
          minHeight: '850px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className="relative bg-gradient-to-b from-[#4a0808] via-[#6d1313] to-[#3a0606] text-white p-8 flex flex-col justify-between shadow-2xl overflow-hidden font-sans border-4 border-[#e6ca65]"
      >
        <div className="border border-[#e6ca65]/40 p-4 h-full flex flex-col justify-between rounded">
          {/* Header */}
          <div>
            <div className="text-center">
              <h3 className="text-[10px] uppercase tracking-widest text-[#e6ca65] font-semibold">
                Since 1844 &bull; Special Heritage Status
              </h3>
              <h1 className="text-2xl font-black uppercase text-white tracking-wide mt-1" style={{ fontFamily: 'serif' }}>
                St. Joseph&apos;s College (Autonomous)
              </h1>
              <p className="text-[11px] text-rose-100 font-medium">
                Tiruchirappalli - 620 002, Tamil Nadu, India
              </p>
              <div className="w-24 h-0.5 bg-[#e6ca65] mx-auto my-2" />
            </div>

            <div className="text-center my-2">
              <span className="text-xs uppercase font-bold text-amber-200 tracking-wider">
                PG &amp; Research Department of {departmentName || 'English'}
              </span>
              <div className="text-[10px] text-rose-200">({shift})</div>
            </div>

            <div className="text-center my-4 bg-[#2b0404]/80 border-y-2 border-[#e6ca65] py-3 px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e6ca65] block mb-1">
                {category || 'Endowment Lecture'}
              </span>
              <h2 className="text-2xl font-black text-amber-100 leading-tight">
                {programTitle || 'Literature and Society in the Digital Era'}
              </h2>
              {tagline && (
                <p className="text-xs text-rose-200 italic mt-1 font-light">
                  {tagline}
                </p>
              )}
            </div>
          </div>

          {/* Speaker Spotlight */}
          {(speakerName || speakerDesignation) && (
            <div className="bg-[#240303]/90 border border-[#e6ca65]/60 rounded-lg p-4 my-2 flex items-center gap-4 shadow-lg">
              {speakerPhotoUrl ? (
                <div className="w-20 h-20 rounded-full border-2 border-[#e6ca65] overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={speakerPhotoUrl} alt={speakerName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border border-[#e6ca65]/50 bg-[#3a0606] flex items-center justify-center flex-shrink-0 text-[#e6ca65]">
                  <User className="w-8 h-8 opacity-80" />
                </div>
              )}
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#e6ca65] block">
                  Distinguished Speaker
                </span>
                <h4 className="text-base font-bold text-white">{speakerName || 'Dr. Chief Guest'}</h4>
                <p className="text-xs text-amber-200">{speakerDesignation || 'Professor & Dean'}</p>
                <p className="text-[11px] text-rose-200">{speakerOrg || 'University of Madras'}</p>
              </div>
            </div>
          )}

          {/* Date / Venue */}
          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="bg-[#240303]/80 border border-rose-900/60 p-2.5 rounded text-center">
              <div className="text-[9px] font-bold uppercase text-[#e6ca65]">Date &amp; Time</div>
              <div className="text-xs font-bold text-white mt-0.5">{dateStr || '25th Sept 2026'} &bull; {timeStr || '10:30 AM'}</div>
            </div>
            <div className="bg-[#240303]/80 border border-rose-900/60 p-2.5 rounded text-center">
              <div className="text-[9px] font-bold uppercase text-[#e6ca65]">Venue</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">{venueStr || 'Rev. Fr. Principal Hall'}</div>
            </div>
          </div>

          {/* Committee */}
          <div className="border-t border-[#e6ca65]/40 pt-3 text-center">
            <div className="flex justify-around text-[10px]">
              <div>
                <div className="font-bold text-amber-100">{patronName || 'Rev. Dr. Principal SJ'}</div>
                <div className="text-[9px] text-[#e6ca65]">Principal</div>
              </div>
              <div>
                <div className="font-bold text-amber-100">{convenerName || 'Head of the Dept.'}</div>
                <div className="text-[9px] text-[#e6ca65]">Convener</div>
              </div>
              <div>
                <div className="font-bold text-amber-100">{coordinatorName || 'Faculty In-Charge'}</div>
                <div className="text-[9px] text-[#e6ca65]">Coordinator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 3: MODERN TECH & AI (Modern Indigo & Cyan)
  // -------------------------------------------------------------
  if (templateId === 'modern-tech') {
    return (
      <div
        ref={ref}
        id="iqac-poster-canvas"
        style={{
          width: '600px',
          minHeight: '850px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className="relative bg-[#090d16] text-white p-8 flex flex-col justify-between shadow-2xl overflow-hidden font-sans border-2 border-cyan-500/40"
      >
        {/* Modern glowing background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                St. Joseph&apos;s College (Autonomous)
              </span>
              <p className="text-[10px] text-slate-400">Tiruchirappalli &bull; NAAC A++ (4th Cycle)</p>
            </div>
            <div className="bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 font-bold">
              {shift.toUpperCase()}
            </div>
          </div>

          <div className="my-2">
            <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider block">
              Department of {departmentName || 'Information Technology'}
            </span>
          </div>

          {/* Title */}
          <div className="my-4">
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block mb-2">
              {category || 'Hands-on Technical Workshop'}
            </span>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
              {programTitle || 'Full-Stack Agentic AI & Cloud Deployments'}
            </h2>
            {tagline && (
              <p className="text-xs text-slate-400 mt-1">
                {tagline}
              </p>
            )}
          </div>
        </div>

        {/* Speaker Card */}
        {(speakerName || speakerDesignation) && (
          <div className="relative z-10 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 my-2 flex items-center gap-4">
            {speakerPhotoUrl ? (
              <div className="w-18 h-18 rounded-xl border border-cyan-400/50 overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={speakerPhotoUrl} alt={speakerName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center flex-shrink-0 text-cyan-400">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">
                // Speaker &amp; Industry Mentor
              </span>
              <h4 className="text-base font-bold text-white">{speakerName || 'Mr. Tech Specialist'}</h4>
              <p className="text-xs text-cyan-200">{speakerDesignation || 'Staff Architect'}</p>
              <p className="text-[11px] text-slate-400">{speakerOrg || 'Microsoft / Google'}</p>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-2 my-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-center">
            <div className="text-[9px] font-mono text-cyan-400">DATE</div>
            <div className="text-xs font-bold text-white mt-0.5">{dateStr || '25-09-2026'}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-center">
            <div className="text-[9px] font-mono text-cyan-400">TIME</div>
            <div className="text-xs font-bold text-white mt-0.5">{timeStr || '09:30 AM'}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-center">
            <div className="text-[9px] font-mono text-cyan-400">VENUE</div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">{venueStr || 'MCA Lab / Sail Hall'}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-slate-800 pt-3 mt-1 flex justify-between text-[10px] text-slate-400">
          <div>
            <div className="font-bold text-slate-200">{patronName || 'Rev. Dr. Principal SJ'}</div>
            <div className="text-[9px]">Principal</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-200">{convenerName || 'Head of Department'}</div>
            <div className="text-[9px]">Convener</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-200">{coordinatorName || 'Faculty Coordinator'}</div>
            <div className="text-[9px]">Staff In-Charge</div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEMPLATE 4: CLEAN WHITE & NAVY MINIMAL (Print & High Contrast)
  // -------------------------------------------------------------
  return (
    <div
      ref={ref}
      id="iqac-poster-canvas"
      style={{
        width: '600px',
        minHeight: '850px',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
      className="relative bg-white text-slate-900 p-8 flex flex-col justify-between shadow-2xl overflow-hidden font-sans border-8 border-[#1e3a8a]"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-[#1e3a8a] pb-3 mb-3">
          {showSjcLogo && (
            <div className="w-14 h-14 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sjc-logo.png" alt="SJC Logo" className="w-14 h-14 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
          <div className="text-center flex-1 px-2">
            <h1 className="text-lg font-black tracking-wide text-[#1e3a8a] uppercase" style={{ fontFamily: 'serif' }}>
              St. Joseph&apos;s College (Autonomous)
            </h1>
            <p className="text-[10px] text-slate-600 font-semibold">
              Special Heritage Status &bull; NAAC A++ Grade &bull; Tiruchirappalli - 620 002
            </p>
          </div>
        </div>

        <div className="text-center my-3">
          <h3 className="text-sm font-bold uppercase text-[#1e3a8a] tracking-wider">
            Department of {departmentName || 'Commerce'} ({shift})
          </h3>
          {collaboration && (
            <p className="text-[11px] text-slate-600 italic">
              In Association with {collaboration}
            </p>
          )}
        </div>

        <div className="text-center my-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="bg-[#1e3a8a] text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-full tracking-wider">
            {category || 'National Conference'}
          </span>
          <h2 className="text-2xl font-black text-[#1e3a8a] mt-2 leading-tight">
            {programTitle || 'Emerging Trends in Global Business & Financial Markets'}
          </h2>
          {tagline && (
            <p className="text-xs text-slate-600 italic mt-1">
              &ldquo;{tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Speaker Card */}
      {(speakerName || speakerDesignation) && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 my-2 flex items-center gap-4">
          {speakerPhotoUrl ? (
            <div className="w-18 h-18 rounded-full border-2 border-[#1e3a8a] overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={speakerPhotoUrl} alt={speakerName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full border border-slate-300 bg-white flex items-center justify-center flex-shrink-0 text-[#1e3a8a]">
              <User className="w-8 h-8 opacity-70" />
            </div>
          )}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1e3a8a] block">
              Resource Person
            </span>
            <h4 className="text-base font-bold text-slate-900">{speakerName || 'Dr. Keynote Speaker'}</h4>
            <p className="text-xs text-slate-700 font-medium">{speakerDesignation || 'Professor & Head'}</p>
            <p className="text-[11px] text-slate-500">{speakerOrg || 'IIM Bangalore'}</p>
          </div>
        </div>
      )}

      {/* Date / Time / Venue */}
      <div className="grid grid-cols-3 gap-2 my-2 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <div className="text-[9px] font-bold uppercase text-slate-500">Date</div>
          <div className="text-xs font-bold text-[#1e3a8a] mt-0.5">{dateStr || '25th Sept 2026'}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <div className="text-[9px] font-bold uppercase text-slate-500">Time</div>
          <div className="text-xs font-bold text-[#1e3a8a] mt-0.5">{timeStr || '10:00 AM'}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <div className="text-[9px] font-bold uppercase text-slate-500">Venue</div>
          <div className="text-xs font-bold text-[#1e3a8a] mt-0.5 truncate">{venueStr || 'Jubilee Hall'}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-[#1e3a8a] pt-3 mt-1 flex justify-between text-center text-[10px]">
        <div>
          <div className="font-bold text-slate-900">{patronName || 'Rev. Dr. Principal SJ'}</div>
          <div className="text-[9px] text-[#1e3a8a] font-semibold">Principal</div>
        </div>
        <div>
          <div className="font-bold text-slate-900">{convenerName || 'Head of the Dept.'}</div>
          <div className="text-[9px] text-[#1e3a8a] font-semibold">Convener</div>
        </div>
        <div>
          <div className="font-bold text-slate-900">{coordinatorName || 'Faculty Coordinator'}</div>
          <div className="text-[9px] text-[#1e3a8a] font-semibold">Coordinator</div>
        </div>
      </div>
    </div>
  );
});

PosterCanvas.displayName = 'PosterCanvas';
