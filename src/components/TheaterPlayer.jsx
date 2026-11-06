import React, { useRef, useState, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Star, 
  ExternalLink, 
  ArrowLeft, 
  Share2, 
  Check, 
  Gamepad2
} from 'lucide-react';
import { extractIframeSrc } from '../utils/iframeHelper';

export const TheaterPlayer = ({
  game,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectGame,
  allGames
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const iframeSrc = extractIframeSrc(game.iframe);

  // Sync fullscreen state
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
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Games</span>
        </button>
        <div className="flex items-center gap-2">
          <span>{game.category}</span>
          <span aria-hidden="true">·</span>
          <span>{game.title}</span>
        </div>
      </div>

      {/* Main Theater Frame */}
      <div 
        ref={containerRef}
        className={`relative flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden transition-all ${
          isFullscreen ? 'w-full h-full p-0 rounded-none border-none' : ''
        }`}
      >
        {/* Game Arena Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {game.title}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">
              · {game.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Reload Frame */}
            <button
              onClick={handleReload}
              title="Restart game"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Favorite */}
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              title={isFavorite ? "Remove from favorites" : "Favorite this game"}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite 
                  ? 'text-amber-400 bg-amber-400/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Popout Window */}
            <button
              onClick={handlePopout}
              title="Open in new window"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Share Link */}
            <button
              onClick={handleShare}
              title="Copy direct share link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 rounded-md transition-colors ml-1"
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
        <div className={`relative w-full bg-slate-950 flex items-center justify-center ${
          isFullscreen ? 'flex-1 h-[calc(100vh-45px)]' : 'h-[540px] sm:h-[620px]'
        }`}>
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={iframeSrc}
            title={game.title}
            className="w-full h-full border-none select-none bg-slate-950"
            allow="fullscreen; autoplay; gamepad; keyboard-map; focus-without-user-activation *"
            allowFullScreen
          />
        </div>
      </div>

      {/* Game Details & Controls Cheat Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{game.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{game.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">★ {game.rating.toFixed(2)}</span>
                <span aria-hidden="true">·</span>
                <span>{game.playedCount.toLocaleString()} plays</span>
                {game.isCustom && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-medium">User Added</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Gameplay & Objectives
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {game.description}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Keyboard & Mouse Controls</span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {game.controls}
            </p>
          </div>

          {/* Stored Iframe Preview */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Iframe Definition: </span>
            <code className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[10px] break-all">
              {game.iframe}
            </code>
          </div>
        </div>

        {/* Right 1 Col: More games */}
        <div className="flex flex-col gap-3 bg-slate-900/70 border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            More to Play
          </div>
          <div className="flex flex-col gap-2.5">
            {relatedGames.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectGame(rel)}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-emerald-400 shrink-0">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {rel.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{rel.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">★ {rel.rating}</span>
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
