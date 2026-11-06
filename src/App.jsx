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

export default function App() {
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

  // Load games from /games.json and localStorage
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/games.json');
        let initialGames = [];
        if (res.ok) {
          initialGames = await res.json();
        }

        // Merge custom games from localStorage
        const storedCustom = localStorage.getItem('playvault_custom_games');
        if (storedCustom) {
          try {
            const parsedCustom = JSON.parse(storedCustom);
            const initialIds = new Set(initialGames.map(g => g.id));
            const uniqueCustom = parsedCustom.filter(g => !initialIds.has(g.id));
            initialGames = [...uniqueCustom, ...initialGames];
          } catch (e) {}
        }

        setGames(initialGames);

        // Check if URL specifies a game
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

    // Load favorites
    const storedFavs = localStorage.getItem('playvault_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {}
    }

    // Load cloak preference
    const storedCloak = localStorage.getItem('playvault_cloak');
    if (storedCloak) {
      const option = CLOAK_OPTIONS.find(o => o.id === storedCloak);
      if (option) {
        applyCloak(option);
      }
    }
  }, []);

  // Global Panic Key Listener (Esc or `)
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

  // Tab Cloaking logic
  const applyCloak = (option) => {
    setCurrentCloak(option.id);
    localStorage.setItem('playvault_cloak', option.id);
    document.title = option.title;

    // Change favicon
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
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

    // Save to custom games localStorage
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
    // Also save custom games to localStorage
    const customOnly = importedList.filter(g => g.isCustom);
    localStorage.setItem('playvault_custom_games', JSON.stringify(customOnly));
  };

  // Filter & Sort
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Category filter
        if (selectedCategory === 'Featured') {
          if (!game.featured) return false;
        } else if (selectedCategory === 'Favorites') {
          if (!favorites.includes(game.id)) return false;
        } else if (selectedCategory !== 'All') {
          if (game.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        // Search query filter
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
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Panic Cloak Fullscreen Screen */}
      <PanicOverlay isOpen={isPanicOpen} onExit={() => setIsPanicOpen(false)} />

      {/* Top 3-Zone Navigation */}
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
        
        {/* If Game is Selected: Theater Player View */}
        {selectedGame ? (
          <TheaterPlayer
            game={selectedGame}
            isFavorite={favorites.includes(selectedGame.id)}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => {
              setSelectedGame(null);
              // Clean query param
              const url = new URL(window.location.href);
              url.searchParams.delete('game');
              window.history.replaceState({}, '', url.toString());
            }}
            onSelectGame={(g) => setSelectedGame(g)}
            allGames={games}
          />
        ) : (
          /* Catalog Browse View */
          <div className="flex flex-col gap-8">
            
            {/* Hero Spotlight Section */}
            {selectedCategory === 'All' && !searchQuery && featuredSpotlight && (
              <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span>POPULAR UNBLOCKED SPOTLIGHT</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400">{featuredSpotlight.category}</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                    {featuredSpotlight.title}
                  </h1>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    {featuredSpotlight.description}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => setSelectedGame(featuredSpotlight)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400 text-slate-950 font-bold text-sm hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                    >
                      <span>Play Instantly</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>★ {featuredSpotlight.rating.toFixed(1)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredSpotlight.playedCount.toLocaleString()} plays</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filter Controls Bar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games, tags, or categories..."
                    className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="alphabetical">Title (A-Z)</option>
                  </select>
                </div>

              </div>

              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {category}
                    {category === 'Favorites' && favorites.length > 0 && (
                      <span className="ml-1 text-[10px] text-amber-400">({favorites.length})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter & Meta */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span>Showing <strong className="text-white font-semibold">{filteredGames.length}</strong> games</span>
                {searchQuery && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                  </>
                )}
                {selectedCategory !== 'All' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Category: {selectedCategory}</span>
                  </>
                )}
              </div>

              <div className="text-[11px] text-slate-500 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-[10px] text-slate-300">Esc</kbd> anytime for Panic Cloak
              </div>
            </div>

            {/* Games Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse" />
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
                    onSelectGame={(g) => setSelectedGame(g)}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No Games Found</h3>
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
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
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
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PlayVault</span>
            <span aria-hidden="true">·</span>
            <span>Unblocked Games Portal</span>
            <span aria-hidden="true">·</span>
            <span>All games stored as client-side iframes</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Inspect games.json</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        games={games}
        onImportJson={handleImportJson}
      />

    </div>
  );
}
