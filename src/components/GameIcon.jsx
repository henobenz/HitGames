import React from 'react';

export const GameIcon = ({
  id,
  title,
  accentColor = '#38bdf8',
  className = 'w-full h-full'
}) => {
  // Bespoke vector game illustrations tailored to each game ID
  const renderVisual = () => {
    switch (id) {
      case 'snake':
        return (
          <g>
            <rect x="20" y="55" width="16" height="16" rx="3" fill="#10b981" />
            <rect x="38" y="55" width="16" height="16" rx="3" fill="#059669" />
            <rect x="56" y="55" width="16" height="16" rx="3" fill="#047857" />
            <rect x="56" y="37" width="16" height="16" rx="3" fill="#047857" />
            <rect x="74" y="37" width="16" height="16" rx="3" fill="#065f46" />
            <circle cx="82" cy="75" r="7" fill="#ef4444" />
            <circle cx="25" cy="60" r="2" fill="#064e3b" />
            <circle cx="31" cy="60" r="2" fill="#064e3b" />
          </g>
        );
      case 'tetris':
        return (
          <g>
            {/* T-Piece */}
            <rect x="38" y="24" width="14" height="14" rx="2" fill="#a855f7" />
            <rect x="24" y="38" width="14" height="14" rx="2" fill="#a855f7" />
            <rect x="38" y="38" width="14" height="14" rx="2" fill="#a855f7" />
            <rect x="52" y="38" width="14" height="14" rx="2" fill="#a855f7" />
            {/* I-Piece */}
            <rect x="70" y="24" width="14" height="14" rx="2" fill="#06b6d4" />
            <rect x="70" y="38" width="14" height="14" rx="2" fill="#06b6d4" />
            <rect x="70" y="52" width="14" height="14" rx="2" fill="#06b6d4" />
            <rect x="70" y="66" width="14" height="14" rx="2" fill="#06b6d4" />
            {/* O-Piece */}
            <rect x="24" y="62" width="14" height="14" rx="2" fill="#eab308" />
            <rect x="38" y="62" width="14" height="14" rx="2" fill="#eab308" />
            <rect x="24" y="76" width="14" height="14" rx="2" fill="#eab308" />
            <rect x="38" y="76" width="14" height="14" rx="2" fill="#eab308" />
          </g>
        );
      case 'pong':
        return (
          <g>
            <rect x="18" y="30" width="8" height="42" rx="4" fill="#38bdf8" />
            <rect x="94" y="44" width="8" height="42" rx="4" fill="#10b981" />
            <line x1="60" y1="15" x2="60" y2="95" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="50" cy="48" r="5" fill="#f8fafc" />
          </g>
        );
      case 'breakout':
        return (
          <g>
            <rect x="18" y="22" width="20" height="9" rx="2" fill="#ef4444" />
            <rect x="42" y="22" width="20" height="9" rx="2" fill="#ef4444" />
            <rect x="66" y="22" width="20" height="9" rx="2" fill="#ef4444" />
            <rect x="90" y="22" width="18" height="9" rx="2" fill="#ef4444" />
            <rect x="18" y="35" width="20" height="9" rx="2" fill="#f59e0b" />
            <rect x="42" y="35" width="20" height="9" rx="2" fill="#f59e0b" />
            <rect x="66" y="35" width="20" height="9" rx="2" fill="#f59e0b" />
            <rect x="90" y="35" width="18" height="9" rx="2" fill="#f59e0b" />
            <rect x="18" y="48" width="20" height="9" rx="2" fill="#10b981" />
            <rect x="42" y="48" width="20" height="9" rx="2" fill="#10b981" />
            <rect x="66" y="48" width="20" height="9" rx="2" fill="#10b981" />
            <rect x="90" y="48" width="18" height="9" rx="2" fill="#10b981" />
            <circle cx="56" cy="68" r="4.5" fill="#f8fafc" />
            <rect x="40" y="85" width="40" height="7" rx="3.5" fill="#f59e0b" />
          </g>
        );
      case 'flappy':
        return (
          <g>
            {/* Top pipe */}
            <rect x="68" y="10" width="22" height="34" rx="2" fill="#059669" />
            <rect x="65" y="38" width="28" height="8" rx="2" fill="#10b981" />
            {/* Bottom pipe */}
            <rect x="68" y="74" width="22" height="36" rx="2" fill="#059669" />
            <rect x="65" y="72" width="28" height="8" rx="2" fill="#10b981" />
            {/* Bird */}
            <circle cx="36" cy="56" r="11" fill="#f59e0b" />
            <ellipse cx="32" cy="58" rx="6" ry="4" fill="#fbbf24" />
            <circle cx="41" cy="53" r="3.5" fill="#ffffff" />
            <circle cx="42" cy="53" r="1.5" fill="#000000" />
            <polygon points="46,54 53,57 46,60" fill="#ef4444" />
          </g>
        );
      case '2048':
        return (
          <g>
            <rect x="22" y="22" width="36" height="36" rx="6" fill="#334155" />
            <text x="40" y="46" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2</text>
            <rect x="62" y="22" width="36" height="36" rx="6" fill="#f97316" />
            <text x="80" y="46" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">8</text>
            <rect x="22" y="62" width="36" height="36" rx="6" fill="#dc2626" />
            <text x="40" y="86" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">64</text>
            <rect x="62" y="62" width="36" height="36" rx="6" fill="#eab308" />
            <text x="80" y="86" fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2048</text>
          </g>
        );
      case 'dino':
        return (
          <g>
            <line x1="15" y1="80" x2="105" y2="80" stroke="#475569" strokeWidth="2" />
            {/* Dino Body */}
            <rect x="30" y="48" width="18" height="24" rx="2" fill="#10b981" />
            <rect x="36" y="42" width="16" height="12" rx="2" fill="#10b981" />
            <circle cx="46" cy="46" r="1.5" fill="#0f172a" />
            <rect x="32" y="72" width="3" height="8" fill="#10b981" />
            <rect x="42" y="72" width="3" height="8" fill="#10b981" />
            {/* Cactus */}
            <rect x="76" y="55" width="8" height="25" rx="2" fill="#22c55e" />
            <rect x="72" y="62" width="4" height="10" rx="1" fill="#22c55e" />
            <rect x="84" y="65" width="4" height="10" rx="1" fill="#22c55e" />
          </g>
        );
      case 'space-invaders':
        return (
          <g>
            {/* Alien 1 */}
            <rect x="26" y="28" width="18" height="13" rx="2" fill="#f43f5e" />
            <rect x="23" y="32" width="3" height="6" fill="#f43f5e" />
            <rect x="44" y="32" width="3" height="6" fill="#f43f5e" />
            {/* Alien 2 */}
            <rect x="72" y="28" width="18" height="13" rx="2" fill="#38bdf8" />
            <rect x="69" y="32" width="3" height="6" fill="#38bdf8" />
            <rect x="90" y="32" width="3" height="6" fill="#38bdf8" />
            {/* Alien 3 */}
            <rect x="49" y="46" width="18" height="13" rx="2" fill="#10b981" />
            {/* Player Cannon */}
            <rect x="46" y="78" width="24" height="10" rx="2" fill="#10b981" />
            <rect x="56" y="73" width="4" height="6" fill="#10b981" />
            {/* Laser */}
            <line x1="58" y1="64" x2="58" y2="70" stroke="#38bdf8" strokeWidth="2" />
          </g>
        );
      case 'asteroids':
        return (
          <g>
            {/* Ship */}
            <polygon points="58,35 68,58 58,52 48,58" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Asteroid large */}
            <polygon points="26,26 40,20 46,36 38,50 22,44 18,34" fill="none" stroke="#94a3b8" strokeWidth="2" />
            {/* Asteroid small */}
            <polygon points="80,60 92,54 98,66 88,76 76,70" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
            {/* Laser shots */}
            <circle cx="58" cy="24" r="2" fill="#f43f5e" />
          </g>
        );
      case 'minesweeper':
        return (
          <g>
            <rect x="20" y="20" width="76" height="76" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="26" y="26" width="20" height="20" rx="3" fill="#0f172a" />
            <text x="36" y="41" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">1</text>
            <rect x="50" y="26" width="20" height="20" rx="3" fill="#0f172a" />
            <text x="60" y="41" fill="#ef4444" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">🚩</text>
            <rect x="74" y="26" width="20" height="20" rx="3" fill="#0f172a" />
            <text x="84" y="41" fill="#22c55e" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2</text>
            <rect x="26" y="50" width="20" height="20" rx="3" fill="#0f172a" />
            <text x="36" y="65" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">💣</text>
            <rect x="50" y="50" width="20" height="20" rx="3" fill="#0f172a" />
            <rect x="74" y="50" width="20" height="20" rx="3" fill="#0f172a" />
            <text x="84" y="65" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">1</text>
          </g>
        );
      case 'stack':
        return (
          <g>
            <rect x="24" y="78" width="72" height="12" rx="3" fill="#3b82f6" />
            <rect x="28" y="64" width="64" height="12" rx="3" fill="#06b6d4" />
            <rect x="34" y="50" width="52" height="12" rx="3" fill="#10b981" />
            <rect x="42" y="36" width="36" height="12" rx="3" fill="#f59e0b" />
            <rect x="42" y="22" width="36" height="12" rx="3" fill="#ef4444" opacity="0.9" />
          </g>
        );
      case 'pacman':
        return (
          <g>
            {/* Pacman */}
            <path d="M42 58 A 20 20 0 1 0 42 42 L 32 50 Z" fill="#facc15" />
            {/* Dots */}
            <circle cx="56" cy="50" r="3" fill="#fde68a" />
            <circle cx="70" cy="50" r="3" fill="#fde68a" />
            <circle cx="84" cy="50" r="5" fill="#f59e0b" />
            {/* Ghost */}
            <path d="M92 42 A 8 8 0 0 0 76 42 L 76 56 L 80 52 L 84 56 L 88 52 L 92 56 Z" fill="#06b6d4" />
          </g>
        );
      case 'wordle':
        return (
          <g>
            <rect x="20" y="36" width="14" height="14" rx="2" fill="#059669" />
            <rect x="37" y="36" width="14" height="14" rx="2" fill="#d97706" />
            <rect x="54" y="36" width="14" height="14" rx="2" fill="#374151" />
            <rect x="71" y="36" width="14" height="14" rx="2" fill="#059669" />
            <rect x="88" y="36" width="14" height="14" rx="2" fill="#059669" />
            <rect x="20" y="54" width="14" height="14" rx="2" fill="#059669" />
            <rect x="37" y="54" width="14" height="14" rx="2" fill="#059669" />
            <rect x="54" y="54" width="14" height="14" rx="2" fill="#059669" />
            <rect x="71" y="54" width="14" height="14" rx="2" fill="#059669" />
            <rect x="88" y="54" width="14" height="14" rx="2" fill="#059669" />
          </g>
        );
      case 'connect4':
        return (
          <g>
            <rect x="18" y="24" width="84" height="66" rx="8" fill="#1e3a8a" />
            <circle cx="34" cy="40" r="7" fill="#ef4444" />
            <circle cx="52" cy="40" r="7" fill="#eab308" />
            <circle cx="70" cy="40" r="7" fill="#090d16" />
            <circle cx="86" cy="40" r="7" fill="#090d16" />
            <circle cx="34" cy="58" r="7" fill="#ef4444" />
            <circle cx="52" cy="58" r="7" fill="#ef4444" />
            <circle cx="70" cy="58" r="7" fill="#eab308" />
            <circle cx="86" cy="58" r="7" fill="#090d16" />
            <circle cx="34" cy="74" r="7" fill="#ef4444" />
            <circle cx="52" cy="74" r="7" fill="#eab308" />
            <circle cx="70" cy="74" r="7" fill="#ef4444" />
            <circle cx="86" cy="74" r="7" fill="#eab308" />
          </g>
        );
      default:
        return (
          <g>
            <rect x="30" y="32" width="60" height="52" rx="10" fill="#1e293b" stroke={accentColor} strokeWidth="2" />
            <circle cx="48" cy="56" r="6" fill="#38bdf8" />
            <circle cx="72" cy="56" r="6" fill="#f43f5e" />
            <rect x="57" y="46" width="6" height="20" rx="3" fill="#10b981" />
            <rect x="50" y="53" width="20" height="6" rx="3" fill="#10b981" />
          </g>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center bg-slate-950/80 rounded-t-xl overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 120 110"
        className="w-full h-full max-h-36 transition-transform duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="120" height="110" fill={`url(#glow-${id})`} />
        {renderVisual()}
      </svg>
    </div>
  );
};
