import React from 'react';
import { Play, Star } from 'lucide-react';
import { GameIcon } from './GameIcon';

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelectGame
}) => {
  const formattedPlays = game.playedCount >= 1000 
    ? `${(game.playedCount / 1000).toFixed(1)}k`
    : game.playedCount.toString();

  return (
    <div
      onClick={() => onSelectGame(game)}
      className="group relative flex flex-col bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 cursor-pointer overflow-hidden"
    >
      {/* Visual Thumbnail / Vector Preview */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <GameIcon 
          id={game.id} 
          category={game.category} 
          title={game.title} 
          accentColor={game.accentColor} 
        />

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(game.id, e)}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-md transition-colors backdrop-blur-md ${
            isFavorite
              ? 'bg-amber-400/20 text-amber-300'
              : 'bg-slate-950/60 text-slate-400 hover:text-white'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Anti-Slop Zero-Pill Metadata */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
          <span>{game.category}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-400/90 font-medium">★ {game.rating.toFixed(1)}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{formattedPlays} plays</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
          {game.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-3">
          {game.description}
        </p>

        {/* Controls footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[200px]">{game.controls.split('·')[0]}</span>
          <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Play →
          </span>
        </div>
      </div>
    </div>
  );
};
