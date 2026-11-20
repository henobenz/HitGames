import React, { useState } from 'react';
import { ShieldAlert, Check, EyeOff, Trophy } from 'lucide-react';

export const CLOAK_OPTIONS = [
  { id: 'default', label: 'Default (NexArcade)', title: 'NexArcade — Neon Arcade Hub', faviconUrl: './favicon.svg' },
  { id: 'classroom', label: 'Google Classroom', title: 'Classes — Google Classroom', faviconUrl: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { id: 'drive', label: 'Google Drive', title: 'My Drive — Google Drive', faviconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
  { id: 'docs', label: 'Google Docs', title: 'Untitled Document — Google Docs', faviconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' },
  { id: 'canvas', label: 'Canvas LMS', title: 'Dashboard — Canvas', faviconUrl: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
  { id: 'wikipedia', label: 'Wikipedia', title: 'Calculus — Wikipedia', faviconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' }
];

export const Navbar = ({
  currentCategory,
  onSelectCategory,
  onOpenLeaderboard,
  isLeaderboardOpen,
  onTriggerPanic,
  currentCloak,
  onSelectCloak
}) => {
  const [isCloakOpen, setIsCloakOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050716]/90 backdrop-blur-md border-b border-purple-500/25 shadow-[0_4px_24px_rgba(34,211,238,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f163b] via-[#090d26] to-[#04050f] border border-cyan-400/50 shadow-[0_0_16px_rgba(34,211,238,0.28),inset_0_0_10px_rgba(168,85,247,0.2)] flex items-center justify-center group-hover:border-cyan-300 group-hover:shadow-[0_0_22px_rgba(34,211,238,0.45),0_0_28px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-all">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5" aria-hidden="true">
              <path d="M6 23V9L14 23V9" stroke="#22d3ee" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 9L26 23M26 9L18 23" stroke="#c084fc" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-wide leading-none flex items-baseline">
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Nex</span>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.45)] group-hover:brightness-110 transition-all">
              Arcade
            </span>
          </span>
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {['All', 'Action', 'Puzzle', 'Retro', 'Favorites'].map((cat) => {
            const label = cat === 'All' ? 'All Games' : cat;
            const active = !isLeaderboardOpen && currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]'
                    : 'hover:text-white'
                }`}
              >
                <span>{label}</span>
                {active && (
                  <span className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
          <button
            onClick={onOpenLeaderboard}
            className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLeaderboardOpen
                ? 'text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]'
                : 'hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Leaderboard</span>
            {isLeaderboardOpen && (
              <span className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Mobile Leaderboard Quick Access */}
          <button
            onClick={onOpenLeaderboard}
            title="Leaderboard"
            className={`md:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
              isLeaderboardOpen ? 'neon-btn-purple' : 'neon-btn-outline'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline">Ranks</span>
          </button>

          {/* Stealth Tab Cloaker dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCloakOpen(!isCloakOpen)}
              title="Stealth Tab Cloaker (Disguise browser tab)"
              className="neon-btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Cloak Tab</span>
            </button>

            {isCloakOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCloakOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#0a0e26] border border-purple-500/40 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.2)] py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-cyan-300 tracking-wide border-b border-purple-500/20">
                    Disguise Tab Title &amp; Icon
                  </div>
                  {CLOAK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectCloak(opt);
                        setIsCloakOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-purple-500/15 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate">{opt.label}</span>
                      {currentCloak === opt.id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Panic Button */}
          <button
            onClick={onTriggerPanic}
            title="Emergency Panic Screen (Press Esc or click to disguise as Google Classroom)"
            className="neon-btn-danger flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panic (Esc)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
