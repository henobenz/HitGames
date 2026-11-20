import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Star, 
  ExternalLink, 
  ArrowLeft, 
  Share2, 
  Check, 
  Gamepad2,
  Trash2,
  Trophy,
  Clock
} from 'lucide-react';
import { extractIframeSrc } from '../utils/iframeHelper';
import {
  readLiveGameScoreFromIframe,
  readGameLocalHighScore,
  computePerGameLeaderboard,
  getPlayerBestForGame
} from '../utils/leaderboardStore';

function formatClock(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const TheaterPlayer = ({
  game,
  isFavorite,
  sessionCount = 0,
  bestScore = null,
  leaderboardEntries = [],
  defaultPlayerName = '',
  onToggleFavorite,
  onRemoveGame,
  onRecordPlaySeconds,
  onAutoSyncScore,
  onOpenLeaderboard,
  onClose,
  onSelectGame,
  allGames
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveScore, setLiveScore] = useState(0);

  const activePlayerBest = useMemo(
    () => getPlayerBestForGame(leaderboardEntries, game.id, defaultPlayerName || 'Player 1'),
    [leaderboardEntries, game.id, defaultPlayerName]
  );

  const perGameStandings = useMemo(
    () => computePerGameLeaderboard(leaderboardEntries, game.id),
    [leaderboardEntries, game.id]
  );

  const lastSyncedRef = useRef(activePlayerBest);
  const initialLocalBestRef = useRef(0);

  const iframeSrc = extractIframeSrc(game.iframe);
  const isExternal = /^https?:\/\//i.test(iframeSrc);

  useEffect(() => {
    lastSyncedRef.current = activePlayerBest;
  }, [game.id, activePlayerBest, defaultPlayerName]);

  useEffect(() => {
    initialLocalBestRef.current = readGameLocalHighScore(game.id);
    setIsFrameLoading(true);
    setElapsedSeconds(0);
    setLiveScore(0);
    const fallbackTimer = setTimeout(() => setIsFrameLoading(false), 2600);
    return () => clearTimeout(fallbackTimer);
  }, [game.id, iframeKey]);

  useEffect(() => {
    const syncScoreNow = () => {
      if (isExternal) return;
      const { currentScore, domBestScore, localStorageBest } = readLiveGameScoreFromIframe(
        iframeRef.current,
        game.id
      );

      if (currentScore > 0) {
        setLiveScore(currentScore);
      }

      // Attribute score fairly to active player:
      // 1) Active run DOM #score (#score / #p1Score)
      // 2) localStorage/DOM high score ONLY if it increased during this session OR no entries exist for this game yet
      let earnedScore = currentScore;
      const sessionLocalIncreased = localStorageBest > initialLocalBestRef.current;
      const gameHasZeroEntries = perGameStandings.length === 0;

      if (sessionLocalIncreased && localStorageBest > earnedScore) {
        earnedScore = localStorageBest;
        initialLocalBestRef.current = localStorageBest;
      } else if (gameHasZeroEntries) {
        earnedScore = Math.max(earnedScore, domBestScore, localStorageBest);
      }

      if (earnedScore > (lastSyncedRef.current || 0) && onAutoSyncScore) {
        lastSyncedRef.current = earnedScore;
        onAutoSyncScore({ gameId: game.id, score: earnedScore });
      }
    };

    const interval = setInterval(() => {
      if (!document.hidden) {
        setElapsedSeconds(prev => prev + 1);
        if (onRecordPlaySeconds) {
          onRecordPlaySeconds(game.id, 1);
        }
        syncScoreNow();
      }
    }, 1000);

    return () => {
      syncScoreNow();
      clearInterval(interval);
    };
  }, [game.id, isExternal, perGameStandings.length, onRecordPlaySeconds, onAutoSyncScore]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const handlePopout = () => {
    window.open(iframeSrc, '_blank', 'noopener,noreferrer,width=960,height=640');
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?game=${game.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const relatedGames = allGames
    .filter(g => g.id !== game.id && (g.category === game.category || g.featured))
    .slice(0, 4);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Quick Back */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-cyan-300 hover:text-white transition-colors group cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Games</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-purple-300">{game.category}</span>
          <span aria-hidden="true" className="text-purple-500/60">·</span>
          <span className="text-slate-200">{game.title}</span>
        </div>
      </div>

      {/* Main Theater Frame */}
      <div 
        ref={containerRef}
        className={`relative flex flex-col bg-[#04050f] rounded-2xl border border-purple-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_28px_rgba(34,211,238,0.14)] overflow-hidden transition-all ${
          isFullscreen ? 'w-full h-full p-0 rounded-none border-none' : ''
        }`}
      >
        {/* Game Arena Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#090c22] border-b border-purple-500/25 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display text-sm font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {game.title}
            </span>
            <span className="hidden sm:inline text-xs text-cyan-300/80 whitespace-nowrap">
              · {game.category}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-400 font-mono-code tabular-nums whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              {formatClock(elapsedSeconds)}
            </span>
            {liveScore > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-300 font-mono-code tabular-nums whitespace-nowrap">
                · Score: {liveScore.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReload}
              title="Restart game"
              className="neon-btn-outline p-1.5 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              title={isFavorite ? "Remove from favorites" : "Favorite this game"}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isFavorite 
                  ? 'text-amber-300 bg-purple-500/20 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.4)]' 
                  : 'neon-btn-outline'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {game.isCustom && onRemoveGame && (
              <button
                onClick={(e) => onRemoveGame(game.id, e)}
                title="Remove custom game"
                className="neon-btn-danger p-1.5 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {!isExternal && (
              <button
                onClick={handlePopout}
                title="Open in new window"
                className="neon-btn-outline p-1.5 rounded-lg hidden sm:block cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleShare}
              title="Copy direct share link"
              className="neon-btn-outline p-1.5 rounded-lg cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="neon-btn-purple flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ml-1 cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Embedded Game Iframe Container */}
        <div className={`relative w-full bg-[#04050f] flex items-center justify-center overflow-hidden ${
          isFullscreen ? 'flex-1 h-[calc(100vh-45px)]' : 'h-[min(78vh,560px)] sm:h-[620px]'
        }`}>
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={iframeSrc}
            title={game.title}
            scrolling="no"
            referrerPolicy="no-referrer"
            sandbox={isExternal ? 'allow-scripts allow-same-origin allow-pointer-lock allow-forms' : undefined}
            onLoad={() => setIsFrameLoading(false)}
            className={`w-full h-full border-none select-none bg-[#04050f] transition-opacity duration-300 ${
              isFrameLoading ? 'opacity-0' : 'opacity-100'
            }`}
            allow="fullscreen; autoplay; gamepad; keyboard-map; focus-without-user-activation *"
            allowFullScreen
          />

          {isFrameLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#04050f] gap-4 p-6">
              <div className="w-40 aspect-[16/10] rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.28)]">
                <img
                  src={game.thumbnail || `./thumbnails/${game.id}.svg`}
                  alt={`${game.title} loading preview`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="font-display text-base font-bold text-white tracking-wide">
                  {game.title}
                </div>
                <div className="w-44 h-1.5 rounded-full bg-[#0c1029] overflow-hidden border border-purple-500/30">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Details, Controls, Separate Game Leaderboard & More Games */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-1">{game.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
                <span className="text-cyan-300 font-medium">{game.category}</span>
                <span aria-hidden="true" className="text-purple-400/50">·</span>
                <span>{sessionCount} {sessionCount === 1 ? 'session played' : 'sessions played'}</span>
                {bestScore !== null && (
                  <>
                    <span aria-hidden="true" className="text-purple-400/50">·</span>
                    <span className="text-amber-300 font-medium">Top Record: {Number(bestScore).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="neon-btn-outline px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-300" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-purple-300 tracking-wide mb-1.5">
              Gameplay &amp; Objectives
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {game.description}
            </p>
          </div>

          <div className="bg-[#04050f]/90 border border-cyan-500/25 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 tracking-wide mb-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Controls (Keyboard, Mouse &amp; Touch)</span>
            </div>
            <p className="text-xs text-slate-200 font-mono-code leading-relaxed">
              {game.controls}
            </p>
          </div>

          {/* Dedicated Per-Game Leaderboard Card */}
          <div className="bg-[#04050f]/90 border border-purple-500/25 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-display text-sm font-bold text-white">
                  {game.title} Leaderboard
                </span>
              </div>
              {onOpenLeaderboard && (
                <button
                  type="button"
                  onClick={() => onOpenLeaderboard('per-game', game.id)}
                  className="text-xs font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  All Leaderboards →
                </button>
              )}
            </div>

            {perGameStandings.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {perGameStandings.slice(0, 5).map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#080b1f] border border-purple-500/15 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-mono-code w-6 tabular-nums ${
                        idx === 0 ? 'text-amber-300 font-bold' : idx === 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white truncate">{entry.player}</span>
                    </div>
                    <span className="font-mono-code font-bold text-amber-300 tabular-nums">
                      {Number(entry.score).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {isExternal
                  ? 'External sandboxed game — session play time is tracked automatically.'
                  : 'No scores recorded for this game yet. Play and earn points to claim #1!'}
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: More games */}
        <div className="flex flex-col gap-3 bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-5 shadow-lg">
          <div className="font-display text-xs font-bold text-cyan-300 tracking-wide mb-1">
            More to Play
          </div>
          <div className="flex flex-col gap-2.5">
            {relatedGames.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectGame(rel)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#050716]/90 hover:bg-[#0d1130] border border-purple-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_14px_rgba(34,211,238,0.2)] cursor-pointer transition-all group"
              >
                <div className="w-16 h-10 rounded-lg bg-[#0b0f29] border border-purple-500/30 overflow-hidden flex items-center justify-center text-purple-300 group-hover:border-cyan-400/50 shrink-0 transition-colors">
                  <img
                    src={rel.thumbnail || `./thumbnails/${rel.id}.svg`}
                    alt={`${rel.title} thumbnail`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 truncate transition-colors">
                    {rel.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{rel.category}</span>
                    <span aria-hidden="true" className="text-purple-400/50">·</span>
                    <span className="text-purple-300">Play →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
