import React, { useState } from 'react';
import { Gamepad2, Plus, Code2, ShieldAlert, Check, EyeOff } from 'lucide-react';

export const CLOAK_OPTIONS = [
  { id: 'default', label: 'Default (PlayVault)', title: 'PlayVault — Neon Arcade Hub', faviconUrl: './favicon.ico' },
  { id: 'classroom', label: 'Google Classroom', title: 'Classes — Google Classroom', faviconUrl: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { id: 'drive', label: 'Google Drive', title: 'My Drive — Google Drive', faviconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
  { id: 'docs', label: 'Google Docs', title: 'Untitled Document — Google Docs', faviconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' },
  { id: 'canvas', label: 'Canvas LMS', title: 'Dashboard — Canvas', faviconUrl: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
  { id: 'wikipedia', label: 'Wikipedia', title: 'Calculus — Wikipedia', faviconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' }
];

export const Navbar = ({
  currentCategory,
  onSelectCategory,
  onOpenAddModal,
  onOpenJsonModal,
  onTriggerPanic,
  currentCloak,
  onSelectCloak
}) => {
  const [isCloakOpen, setIsCloakOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050716]/90 backdrop-blur-md border-b border-purple-500/25 shadow-[0_4px_24px_rgba(34,211,238,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => onSelectCategory('All')} 
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-500/20 border border-cyan-400/50 shadow-[0_0_14px_rgba(34,211,238,0.3)] flex items-center justify-center text-cyan-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-all">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
            PlayVault
          </span>
        </div>

        {/* Zone 2: Single-line category links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {['All', 'Retro', 'Puzzle', 'Action', 'Favorites'].map((cat) => {
            const label = cat === 'All' ? 'All Games' : cat;
            const active = currentCategory === cat;
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
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          
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

          {/* Raw JSON viewer */}
          <button
            onClick={onOpenJsonModal}
            title="Inspect games.json (All iframe records)"
            className="neon-btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">games.json</span>
          </button>

          {/* Add Game CTA */}
          <button
            onClick={onOpenAddModal}
            className="neon-btn-cyan flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
          </button>
        </div>

      </div>
    </header>
  );
};
