import React, { useState } from 'react';
import { Gamepad2, Plus, Code2, ShieldAlert, Check, EyeOff } from 'lucide-react';

export const CLOAK_OPTIONS = [
  { id: 'default', label: 'Default (PlayVault)', title: 'PlayVault — Unblocked Games Hub', faviconUrl: '/favicon.ico' },
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
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div 
          onClick={() => onSelectCategory('All')} 
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 group-hover:scale-105 transition-all">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              PlayVault
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 single line category links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectCategory('All')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentCategory === 'All' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => onSelectCategory('Retro')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentCategory === 'Retro' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Retro
          </button>
          <button
            onClick={() => onSelectCategory('Puzzle')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentCategory === 'Puzzle' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Puzzle
          </button>
          <button
            onClick={() => onSelectCategory('Action')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentCategory === 'Action' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Action
          </button>
          <button
            onClick={() => onSelectCategory('Favorites')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              currentCategory === 'Favorites' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Favorites
          </button>
        </nav>

        {/* Zone 3: Primary Action & Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Stealth Tab Cloaker dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCloakOpen(!isCloakOpen)}
              title="Stealth Tab Cloaker (Disguise browser tab)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-slate-600 hover:text-white transition-all whitespace-nowrap shrink-0"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Cloak Tab</span>
            </button>

            {isCloakOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCloakOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Disguise Tab Title & Icon
                  </div>
                  {CLOAK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectCloak(opt);
                        setIsCloakOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate">{opt.label}</span>
                      {currentCloak === opt.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 hover:border-rose-400 transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panic (Esc)</span>
          </button>

          {/* Raw JSON viewer */}
          <button
            onClick={onOpenJsonModal}
            title="Inspect games.json (All iframe records)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-slate-600 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">games.json</span>
          </button>

          {/* Add Game CTA */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
          </button>
        </div>

      </div>
    </header>
  );
};
