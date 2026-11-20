import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  X, 
  Gamepad2, 
  Flame, 
  ArrowRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Trophy,
  History
} from 'lucide-react';
import { Navbar, CLOAK_OPTIONS } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { TheaterPlayer } from './components/TheaterPlayer';
import { PanicOverlay } from './components/PanicOverlay';
import { LeaderboardView } from './components/LeaderboardView';
import { PersistentLeaderboardDrawer } from './components/PersistentLeaderboardDrawer';
import {
  GLOBAL_LEADERBOARD_KEY,
  PER_GAME_LEADERBOARDS_KEY,
  LEGACY_LEADERBOARD_KEY,
  clearAllGameLocalHighScores,
  loadGlobalLeaderboard,
  saveGlobalLeaderboard,
  upsertAutoGameScore
} from './utils/leaderboardStore';
import arcadeHeroThumbnail from './assets/images/playvault_arcade_thumbnail_1795159396107.jpg';

export default function App() {
  const [heroThumbError, setHeroThumbError] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'leaderboard'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [playStats, setPlayStats] = useState({});
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState('global');
  const [leaderboardGameId, setLeaderboardGameId] = useState(null);
  const [playerHandle, setPlayerHandle] = useState('');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [currentCloak, setCurrentCloak] = useState('default');
  const searchInputRef = useRef(null);

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
        if (initialGames.length > 0) {
          setSpotlightIndex(Math.floor(Math.random() * initialGames.length));
        }

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

    try {
      const storedFavs = localStorage.getItem('playvault_favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (e) {}

    try {
      const storedRecent = localStorage.getItem('playvault_recent');
      if (storedRecent) setRecentIds(JSON.parse(storedRecent));
    } catch (e) {}

    try {
      const storedStats = localStorage.getItem('playvault_stats');
      if (storedStats) setPlayStats(JSON.parse(storedStats));
    } catch (e) {}

    const storedHandle = localStorage.getItem('playvault_player_name') || '';
    if (storedHandle) setPlayerHandle(storedHandle);

    setLeaderboardEntries(loadGlobalLeaderboard(storedHandle || 'Player 1'));

    const storedCloak = localStorage.getItem('playvault_cloak');
    if (storedCloak) {
      const option = CLOAK_OPTIONS.find(o => o.id === storedCloak);
      if (option) {
        applyCloak(option);
      }
    }

    const handleStorageSync = (e) => {
      if (
        !e.key ||
        e.key === GLOBAL_LEADERBOARD_KEY ||
        e.key === LEGACY_LEADERBOARD_KEY ||
        e.key.startsWith('playvault_')
      ) {
        setLeaderboardEntries(loadGlobalLeaderboard(localStorage.getItem('playvault_player_name') || 'Player 1'));
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === '`') {
        if (!isPanicOpen) {
          setIsPanicOpen(true);
        }
      } else if (
        e.key === '/' &&
        !isPanicOpen &&
        !selectedGame &&
        activeView === 'catalog' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPanicOpen, selectedGame, activeView]);

  // Auto-cycle Featured Spotlight across all games
  useEffect(() => {
    if (games.length <= 1 || isSpotlightPaused || selectedGame || activeView !== 'catalog') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      setSpotlightIndex(prev => (prev + 1) % games.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [games.length, isSpotlightPaused, selectedGame, activeView]);

  useEffect(() => {
    setHeroThumbError(false);
  }, [spotlightIndex]);

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

  const handleSelectGame = useCallback((game) => {
    if (!game) return;
    setSelectedGame(game);
    setActiveView('catalog');

    setRecentIds(prev => {
      const next = [game.id, ...prev.filter(id => id !== game.id)].slice(0, 6);
      localStorage.setItem('playvault_recent', JSON.stringify(next));
      return next;
    });

    setPlayStats(prev => {
      const current = prev[game.id] || { sessions: 0, totalSeconds: 0, lastPlayed: 0 };
      const next = {
        ...prev,
        [game.id]: {
          ...current,
          sessions: (current.sessions || 0) + 1,
          lastPlayed: Date.now()
        }
      };
      localStorage.setItem('playvault_stats', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleRecordPlaySeconds = useCallback((gameId, deltaSeconds) => {
    setPlayStats(prev => {
      const current = prev[gameId] || { sessions: 1, totalSeconds: 0, lastPlayed: Date.now() };
      const next = {
        ...prev,
        [gameId]: {
          ...current,
          totalSeconds: (current.totalSeconds || 0) + deltaSeconds,
          lastPlayed: Date.now()
        }
      };
      localStorage.setItem('playvault_stats', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleUpdatePlayerName = useCallback((newName) => {
    const cleanPlayer = (newName || '').trim().slice(0, 18) || 'Player 1';
    setPlayerHandle(cleanPlayer);
    localStorage.setItem('playvault_player_name', cleanPlayer);
  }, []);

  const handleAutoSyncScore = useCallback(({ gameId, score }) => {
    const activePlayer = localStorage.getItem('playvault_player_name') || playerHandle || 'Player 1';
    setLeaderboardEntries(prev => upsertAutoGameScore(prev, { gameId, player: activePlayer, score }));
  }, [playerHandle]);

  const handleDeleteScore = useCallback((entryId) => {
    setLeaderboardEntries(prev => saveGlobalLeaderboard(prev.filter(e => e.id !== entryId)));
  }, []);

  const handleResetStats = useCallback(() => {
    setPlayStats({});
    setRecentIds([]);
    setLeaderboardEntries([]);
    localStorage.removeItem('playvault_stats');
    localStorage.removeItem('playvault_recent');
    localStorage.removeItem(GLOBAL_LEADERBOARD_KEY);
    localStorage.removeItem(PER_GAME_LEADERBOARDS_KEY);
    localStorage.removeItem(LEGACY_LEADERBOARD_KEY);
    clearAllGameLocalHighScores();
  }, []);

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('playvault_favorites', JSON.stringify(next));
      return next;
    });
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

  const handleLaunchRandom = () => {
    if (games.length === 0) return;
    const pool = games.length > 1 && selectedGame
      ? games.filter(g => g.id !== selectedGame.id)
      : games;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    handleSelectGame(picked);
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
          const matchTags = (game.tags || []).some(t => t.toLowerCase().includes(q));
          return matchTitle || matchCategory || matchDesc || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        }
        if (sortBy === 'sessions') {
          const sa = playStats[a.id]?.sessions || 0;
          const sb = playStats[b.id]?.sessions || 0;
          if (sb !== sa) return sb - sa;
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        if (sortBy === 'category') return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
        return 0;
      });
  }, [games, selectedCategory, searchQuery, sortBy, favorites, playStats]);

  const featuredSpotlight = games.length > 0 ? games[spotlightIndex % games.length] : null;

  const recentGames = useMemo(() => {
    const map = {};
    games.forEach(g => { map[g.id] = g; });
    return recentIds.map(id => map[id]).filter(Boolean).slice(0, 4);
  }, [recentIds, games]);

  const bestScoreByGame = useMemo(() => {
    const best = {};
    leaderboardEntries.forEach(e => {
      if (best[e.gameId] === undefined || e.score > best[e.gameId]) {
        best[e.gameId] = e.score;
      }
    });
    return best;
  }, [leaderboardEntries]);

  const CATEGORIES = [
    'All',
    'Featured',
    'Favorites',
    'Action',
    'Puzzle',
    'Retro',
    'Arcade',
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
        isLeaderboardOpen={activeView === 'leaderboard' && !selectedGame}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveView('catalog');
          setSelectedGame(null);
        }}
        onOpenLeaderboard={() => {
          setSelectedGame(null);
          setActiveView('leaderboard');
        }}
        onTriggerPanic={() => setIsPanicOpen(true)}
        currentCloak={currentCloak}
        onSelectCloak={applyCloak}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {selectedGame ? (
          <TheaterPlayer
            game={selectedGame}
            isFavorite={favorites.includes(selectedGame.id)}
            sessionCount={playStats[selectedGame.id]?.sessions || 0}
            bestScore={bestScoreByGame[selectedGame.id] ?? null}
            leaderboardEntries={leaderboardEntries}
            defaultPlayerName={playerHandle}
            onToggleFavorite={handleToggleFavorite}
            onRemoveGame={handleRemoveGame}
            onRecordPlaySeconds={handleRecordPlaySeconds}
            onAutoSyncScore={handleAutoSyncScore}
            onOpenLeaderboard={(mode = 'global', gameId = null) => {
              setSelectedGame(null);
              setLeaderboardMode(mode);
              if (gameId) setLeaderboardGameId(gameId);
              setActiveView('leaderboard');
            }}
            onClose={() => {
              setSelectedGame(null);
              const url = new URL(window.location.href);
              url.searchParams.delete('game');
              window.history.replaceState({}, '', url.toString());
            }}
            onSelectGame={handleSelectGame}
            allGames={games}
          />
        ) : activeView === 'leaderboard' ? (
          <LeaderboardView
            games={games}
            playStats={playStats}
            leaderboardEntries={leaderboardEntries}
            defaultPlayerName={playerHandle}
            initialBoardType={leaderboardMode}
            initialGameId={leaderboardGameId}
            onUpdatePlayerName={handleUpdatePlayerName}
            onDeleteScore={handleDeleteScore}
            onResetStats={handleResetStats}
            onSelectGame={handleSelectGame}
          />
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Dynamic Featured Spotlight Carousel (Rotates Across All Games) */}
            {selectedCategory === 'All' && !searchQuery && featuredSpotlight && (
              <div
                onMouseEnter={() => setIsSpotlightPaused(true)}
                onMouseLeave={() => setIsSpotlightPaused(false)}
                className="relative rounded-2xl bg-gradient-to-br from-[#0e1230] via-[#080b1f] to-[#050714] border border-purple-500/35 p-6 sm:p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_32px_rgba(168,85,247,0.14)]"
              >
                <div className="absolute -top-20 right-10 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                          <Flame className="w-4 h-4 text-purple-400" />
                          <span>Featured Spotlight</span>
                          <span aria-hidden="true" className="text-purple-400/50">·</span>
                          <span className="text-slate-300">{featuredSpotlight.category}</span>
                          <span aria-hidden="true" className="text-purple-400/50">·</span>
                          <span className="text-slate-400 font-mono-code tabular-nums">
                            {(spotlightIndex % games.length) + 1}/{games.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSpotlightIndex(prev => (prev - 1 + games.length) % games.length)}
                            title="Previous featured game"
                            className="neon-btn-outline p-1.5 rounded-lg cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpotlightIndex(prev => (prev + 1) % games.length)}
                            title="Next featured game"
                            className="neon-btn-outline p-1.5 rounded-lg cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance drop-shadow-[0_0_16px_rgba(34,211,238,0.22)]">
                        {featuredSpotlight.title}
                      </h1>

                      <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                        {featuredSpotlight.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleSelectGame(featuredSpotlight)}
                          className="neon-btn-cyan flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                        >
                          <span>Play Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSpotlightIndex(prev => (prev + 1) % games.length)}
                          className="neon-btn-outline px-4 py-2.5 rounded-xl font-semibold text-xs cursor-pointer"
                        >
                          Next Spotlight
                        </button>

                        {(playStats[featuredSpotlight.id]?.sessions || 0) > 0 && (
                          <span className="text-xs text-purple-300 tabular-nums">
                            Played {playStats[featuredSpotlight.id].sessions} {playStats[featuredSpotlight.id].sessions === 1 ? 'time' : 'times'}
                          </span>
                        )}
                      </div>

                      {/* Spotlight Quick Switcher Dots */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {games.map((g, idx) => {
                          const active = idx === (spotlightIndex % games.length);
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setSpotlightIndex(idx)}
                              title={g.title}
                              aria-label={`Show ${g.title} in spotlight`}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                active
                                  ? 'w-7 bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                                  : 'w-2 bg-slate-700 hover:bg-purple-400/70'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleSelectGame(featuredSpotlight)}
                    className="lg:col-span-5 relative aspect-[16/9] lg:aspect-auto min-h-[200px] rounded-xl overflow-hidden border border-cyan-400/35 bg-[#050716] cursor-pointer group shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                  >
                    {!heroThumbError ? (
                      <img
                        src={featuredSpotlight.thumbnail || arcadeHeroThumbnail}
                        alt={`${featuredSpotlight.title} spotlight thumbnail`}
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
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 pointer-events-none">
                      <span className="font-display font-bold text-white drop-shadow">{featuredSpotlight.title}</span>
                      <span className="text-cyan-300 font-semibold">Launch →</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Playing Strip */}
            {selectedCategory === 'All' && !searchQuery && recentGames.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span className="font-display text-sm font-bold text-white">Continue Playing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('leaderboard')}
                    className="text-xs text-cyan-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Leaderboard</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recentGames.map(rg => (
                    <button
                      key={rg.id}
                      type="button"
                      onClick={() => handleSelectGame(rg)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#080b1f]/90 hover:bg-[#0e1333] border border-purple-500/25 hover:border-cyan-400/60 transition-all text-left cursor-pointer group"
                    >
                      <img
                        src={rg.thumbnail || `./thumbnails/${rg.id}.svg`}
                        alt={rg.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-10 rounded-lg object-cover border border-purple-500/30 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate transition-colors">
                          {rg.title}
                        </div>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {rg.category} · {playStats[rg.id]?.sessions || 1} {(playStats[rg.id]?.sessions || 1) === 1 ? 'play' : 'plays'}
                        </div>
                      </div>
                    </button>
                  ))}
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
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games, tags, or categories... (Press /)"
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

                {/* Sort selector + Random Game Launcher */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleLaunchRandom}
                    className="neon-btn-purple flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Random Game</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-[#080b1f] border border-purple-500/30 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="featured">Featured First</option>
                      <option value="sessions">Most Played (Yours)</option>
                      <option value="alphabetical">Title (A-Z)</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
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
                Press <kbd className="px-1.5 py-0.5 bg-[#0a0e26] border border-purple-500/40 rounded font-mono text-[10px] text-cyan-300">/</kbd> to search · <kbd className="px-1.5 py-0.5 bg-[#0a0e26] border border-purple-500/40 rounded font-mono text-[10px] text-cyan-300">Esc</kbd> for Panic Cloak
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
                    sessionCount={playStats[game.id]?.sessions || 0}
                    bestScore={bestScoreByGame[game.id] ?? null}
                    onToggleFavorite={handleToggleFavorite}
                    onRemoveGame={handleRemoveGame}
                    onSelectGame={handleSelectGame}
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
                    : "No games matched your active search query or filter. Try a different search term or reset your filters."}
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
            <span className="font-display font-bold tracking-wide">
              <span className="text-white">Nex</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">Arcade</span>
            </span>
            <span aria-hidden="true" className="text-purple-400/50">·</span>
            <span>Neon Arcade Portal</span>
            <span aria-hidden="true" className="text-purple-400/50">·</span>
            <span>Instant browser arcade games</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedGame(null);
                setActiveView('leaderboard');
              }}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Leaderboard
            </button>
            <button
              onClick={handleLaunchRandom}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Random Game
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

      {/* Persistent Dual Leaderboard Drawer (accessible on catalog & in-game) */}
      {!isPanicOpen && games.length > 0 && (
        <PersistentLeaderboardDrawer
          games={games}
          leaderboardEntries={leaderboardEntries}
          defaultPlayerName={playerHandle}
          activeGameId={selectedGame?.id || null}
          onUpdatePlayerName={handleUpdatePlayerName}
          onDeleteScore={handleDeleteScore}
          onSelectGame={handleSelectGame}
          onOpenFullLeaderboard={(mode = 'global', gameId = null) => {
            setSelectedGame(null);
            setLeaderboardMode(mode);
            if (gameId) setLeaderboardGameId(gameId);
            setActiveView('leaderboard');
          }}
        />
      )}

    </div>
  );
}
