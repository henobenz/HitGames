import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Gamepad2, 
  Flame, 
  Plus, 
  ArrowRight,
  SlidersHorizontal,
  Code2
} from 'lucide-react';
import { Navbar, CLOAK_OPTIONS } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { TheaterPlayer } from './components/TheaterPlayer';
import { AddGameModal } from './components/AddGameModal';
import { JsonViewerModal } from './components/JsonViewerModal';
import { PanicOverlay } from './components/PanicOverlay';
import arcadeHeroThumbnail from './assets/images/playvault_arcade_thumbnail_1795159396107.jpg';

export default function App() {
  const [heroThumbError, setHeroThumbError] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [currentCloak, setCurrentCloak] = useState('default');

  useEffect(() => {
    async function loadGames() {
      try {
        let res = await fetch('./games.json');
        if (!res.ok) {
          res = await fetch('./public/games.json');
        }
        let initialGames = [];
        if (res.ok) {
          initialGames = await res.json();
        }

        const storedCustom = localStorage.getItem('playvault_custom_games');
        if (storedCustom) {
          try {
            const parsedCustom = JSON.parse(storedCustom);
            const cleanedCustom = parsedCustom.filter(
              g => !/8[\s-]*ball[\s-]*pool/i.test(`${g.id || ''} ${g.title || ''}`)
            );
            if (cleanedCustom.length !== parsedCustom.length) {
              localStorage.setItem('playvault_custom_games', JSON.stringify(cleanedCustom));
            }
            const initialIds = new Set(initialGames.map(g => g.id));
            const uniqueCustom = cleanedCustom.filter(g => !initialIds.has(g.id));
            initialGames = [...uniqueCustom, ...initialGames];
          } catch (e) {}
        }

        setGames(initialGames);

        const urlParams = new URLSearchParams(window.location.search);
        const gameParam = urlParams.get('game');
        if (gameParam) {
          const matched = initialGames.find(g => g.id === gameParam);
          if (matched) {
            setSelectedGame(matched);
          }
        }
      } catch (err) {
        console.error('Failed to load games.json:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGames();

    const storedFavs = localStorage.getItem('playvault_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {}
    }

    const storedCloak = localStorage.getItem('playvault_cloak');
    if (storedCloak) {
      const option = CLOAK_OPTIONS.find(o => o.id === storedCloak);
      if (option) {
        applyCloak(option);
      }
    }
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === '`') {
        if (!isPanicOpen) {
          setIsPanicOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPanicOpen]);

  const applyCloak = (option) => {
    setCurrentCloak(option.id);
    localStorage.setItem('playvault_cloak', option.id);
    document.title = option.title;

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = option.faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
    link.href = option.faviconUrl;
  };

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('playvault_favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleAddGame = (newGame) => {
    setGames(prev => [newGame, ...prev]);

    const storedCustom = localStorage.getItem('playvault_custom_games');
    let currentCustom = [];
    if (storedCustom) {
      try { currentCustom = JSON.parse(storedCustom); } catch (e) {}
    }
    currentCustom = [newGame, ...currentCustom.filter(g => g.id !== newGame.id)];
    localStorage.setItem('playvault_custom_games', JSON.stringify(currentCustom));

    setSelectedGame(newGame);
  };

  const handleImportJson = (importedList) => {
    setGames(importedList);
    const customOnly = importedList.filter(g => g.isCustom);
    localStorage.setItem('playvault_custom_games', JSON.stringify(customOnly));
  };

  const handleRemoveGame = (id, e) => {
    if (e) e.stopPropagation();
    setGames(prev => prev.filter(g => g.id !== id));
    setSelectedGame(prev => (prev && prev.id === id ? null : prev));
    const storedCustom = localStorage.getItem('playvault_custom_games');
    if (storedCustom) {
      try {
        const parsed = JSON.parse(storedCustom);
        localStorage.setItem(
          'playvault_custom_games',
          JSON.stringify(parsed.filter(g => g.id !== id))
        );
      } catch (err) {}
    }
  };

  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        if (selectedCategory === 'Featured') {
          if (!game.featured) return false;
        } else if (selectedCategory === 'Favorites') {
          if (!favorites.includes(game.id)) return false;
        } else if (selectedCategory !== 'All') {
          if (game.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchCategory = game.category.toLowerCase().includes(q);
          const matchDesc = game.description.toLowerCase().includes(q);
          const matchTags = game.tags.some(t => t.toLowerCase().includes(q));
          return matchTitle || matchCategory || matchDesc || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.playedCount - a.playedCount;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [games, selectedCategory, searchQuery, sortBy, favorites]);

  const featuredSpotlight = useMemo(() => {
    return games.find(g => g.id === 'snake') || games[0];
  }, [games]);

  const CATEGORIES = [
    'All',
    'Featured',
    'Favorites',
    'Retro',
    'Arcade',
    'Puzzle',
    'Action',
    'Casual',
    'Strategy'
  ];

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-cyan-400/30 selection:text-cyan-200">
      
      {/* Panic Cloak Fullscreen Screen */}
      <PanicOverlay isOpen={isPanicOpen} onExit={() => setIsPanicOpen(false)} />

      {/* Top Navigation */}
      <Navbar
        currentCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedGame(null);
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onTriggerPanic={() => setIsPanicOpen(true)}
        currentCloak={currentCloak}
        onSelectCloak={applyCloak}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {selectedGame ? (
          <TheaterPlayer
            game={selectedGame}
            isFavorite={favorites.includes(selectedGame.id)}
            onToggleFavorite={handleToggleFavorite}
            onRemoveGame={handleRemoveGame}
            onClose={() => {
              setSelectedGame(null);
              const url = new URL(window.location.href);
              url.searchParams.delete('game');
              window.history.replaceState({}, '', url.toString());
            }}
            onSelectGame={(g) => setSelectedGame(g)}
            allGames={games}
          />
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Hero Spotlight Section */}
            {selectedCategory === 'All' && !searchQuery && featuredSpotlight && (
              <div className="relative rounded-2xl bg-gradient-to-br from-[#0e1230] via-[#080b1f] to-[#050714] border border-purple-500/35 p-6 sm:p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_32px_rgba(168,85,247,0.14)]">
                <div className="absolute -top-20 right-10 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Flame className="w-4 h-4 text-purple-400" />
                      <span>Featured Neon Arcade Spotlight</span>
                      <span aria-hidden="true" className="text-purple-400/50">·</span>
                      <span className="text-slate-300">{featuredSpotlight.category}</span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance drop-shadow-[0_0_16px_rgba(34,211,238,0.22)]">
                      {featuredSpotlight.title}
                    </h1>

                    <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                      {featuredSpotlight.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => setSelectedGame(featuredSpotlight)}
                        className="neon-btn-cyan flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                      >
                        <span>Play Instantly</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-300 tabular-nums">
                        <span className="text-amber-300 font-semibold">★ {featuredSpotlight.rating.toFixed(1)}</span>
                        <span aria-hidden="true" className="text-purple-400/60">·</span>
                        <span>{featuredSpotlight.playedCount.toLocaleString()} plays</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedGame(featuredSpotlight)}
                    className="lg:col-span-5 relative aspect-[16/9] lg:aspect-auto min-h-[190px] rounded-xl overflow-hidden border border-cyan-400/35 bg-[#050716] cursor-pointer group shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                  >
                    {!heroThumbError ? (
                      <img
                        src={arcadeHeroThumbnail}
                        alt="PlayVault Neon Arcade Cabinet Thumbnail"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroThumbError(true)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0e1438] to-[#050716] text-cyan-300 gap-2">
                        <Gamepad2 className="w-10 h-10" />
                        <span className="font-display text-sm font-bold text-white">{featuredSpotlight.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04050f]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filter Controls Bar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/80 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games, tags, or categories..."
                    className="w-full pl-10 pr-9 py-2.5 bg-[#080b1f]/90 border border-purple-500/30 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_16px_rgba(34,211,238,0.2)] transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-[#080b1f] border border-purple-500/30 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="alphabetical">Title (A-Z)</option>
                  </select>
                </div>

              </div>

              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map(category => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_14px_rgba(34,211,238,0.22)]'
                          : 'bg-[#080b1f]/60 text-slate-400 border border-purple-500/15 hover:text-white hover:border-purple-400/40'
                      }`}
                    >
                      {category}
                      {category === 'Favorites' && favorites.length > 0 && (
                        <span className="ml-1 text-[10px] text-amber-300 tabular-nums">({favorites.length})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Counter & Meta */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-purple-500/20">
              <div className="flex items-center gap-2 tabular-nums">
                <span>Showing <strong className="text-cyan-300 font-semibold">{filteredGames.length}</strong> games</span>
                {searchQuery && (
                  <>
                    <span aria-hidden="true" className="text-purple-400/50">·</span>
                    <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                  </>
                )}
                {selectedCategory !== 'All' && (
                  <>
                    <span aria-hidden="true" className="text-purple-400/50">·</span>
                    <span>Category: {selectedCategory}</span>
                  </>
                )}
              </div>

              <div className="text-[11px] text-slate-400 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 bg-[#0a0e26] border border-purple-500/40 rounded font-mono text-[10px] text-cyan-300">Esc</kbd> anytime for Panic Cloak
              </div>
            </div>

            {/* Games Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-[#0a0d22]/70 border border-purple-500/20 animate-pulse" />
                ))}
              </div>
            ) : filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onRemoveGame={handleRemoveGame}
                    onSelectGame={(g) => setSelectedGame(g)}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#080b1f]/80 rounded-2xl border border-purple-500/25">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-cyan-300 mb-3 shadow-[0_0_16px_rgba(168,85,247,0.3)]">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-base font-bold text-white mb-1">No Games Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  {selectedCategory === 'Favorites'
                    ? "You haven't bookmarked any games yet. Click the star icon on any game to pin it here!"
                    : "No games matched your active search query or filter. Try a different search term or add your own iframe game!"}
                </p>
                <div className="flex items-center gap-3">
                  {(searchQuery || selectedCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="neon-btn-outline px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="neon-btn-cyan px-4 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Game</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-purple-500/20 bg-[#04050f]/95 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-cyan-300">PlayVault</span>
            <span aria-hidden="true" className="text-purple-400/50">·</span>
            <span>Neon Arcade Portal</span>
            <span aria-hidden="true" className="text-purple-400/50">·</span>
            <span>All games stored as client-side iframes</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect games.json</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Game Iframe</span>
            </button>
            <button
              onClick={() => setIsPanicOpen(true)}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              Panic Mode
            </button>
          </div>
        </div>
      </footer>

      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        games={games}
        onImportJson={handleImportJson}
      />

    </div>
  );
}
