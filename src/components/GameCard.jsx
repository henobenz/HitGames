import React, { useState } from 'react';
import { Play, Star } from 'lucide-react';
import { GameIcon } from './GameIcon';

function resolveThumbnailSrc(game) {
  const raw = game.thumbnail || `./thumbnails/${game.id}.svg`;
  if (raw.startsWith('/thumbnails/')) {
    return `.${raw}`;
  }
  return raw;
}

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelectGame
}) => {
  const [imgError, setImgError] = useState(false);

  const formattedPlays = game.playedCount >= 1000
    ? `${(game.playedCount / 1000).toFixed(1)}k`
    : game.playedCount.toString();

  const thumbSrc = resolveThumbnailSrc(game);

  return (
    <div
      onClick={() => onSelectGame(game)}
      className="arcade-card group flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Animated Diagonal Light Sheen on Hover */}
      <div className="arcade-card-sheen z-20" />

      {/* Visual Thumbnail Preview */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050716] rounded-t-2xl border-b border-purple-500/20">
        {!imgError ? (
          <img
            src={thumbSrc}
            alt={`${game.title} game thumbnail`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <GameIcon
            id={game.id}
            category={game.category}
            title={game.title}
            accentColor={game.accentColor}
          />
        )}

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-[#040510]/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-[#04050f] flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.75),0_0_36px_rgba(168,85,247,0.55)] transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current ml-0.5 text-white drop-shadow" />
          </div>
        </div>

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(game.id, e)}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg border transition-all backdrop-blur-md cursor-pointer ${
            isFavorite
              ? 'bg-purple-500/25 border-purple-400/60 text-amber-300 shadow-[0_0_12px_rgba(168,85,247,0.45)]'
              : 'bg-[#050716]/75 border-cyan-500/25 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/70'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-300' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Clean Unboxed Metadata */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 tabular-nums">
          <span className="text-cyan-300/90 font-medium">{game.category}</span>
          <span aria-hidden="true" className="text-purple-400/60">·</span>
          <span className="text-amber-300 font-medium">★ {game.rating.toFixed(1)}</span>
          <span aria-hidden="true" className="text-purple-400/60">·</span>
          <span>{formattedPlays} plays</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {game.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-3">
          {game.description}
        </p>

        {/* Controls footer */}
        <div className="pt-2.5 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[195px]">{game.controls.split('·')[0]}</span>
          <span className="text-purple-300 group-hover:text-cyan-300 font-bold group-hover:translate-x-1 transition-all flex items-center gap-1">
            Play →
          </span>
        </div>
      </div>
    </div>
  );
};
