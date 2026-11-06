import React, { useState } from 'react';
import { X, Plus, AlertCircle, Eye } from 'lucide-react';
import { extractIframeSrc, buildIframeSnippet } from '../utils/iframeHelper';

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [iframeInput, setIframeInput] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTestPreview = () => {
    setError('');
    const src = extractIframeSrc(iframeInput);
    if (!src) {
      setError('Please provide a valid iframe snippet or URL.');
      return;
    }
    setPreviewSrc(src);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Game title is required.');
      return;
    }

    const src = extractIframeSrc(iframeInput);
    if (!src) {
      setError('Please provide a valid iframe snippet or URL.');
      return;
    }

    // Construct valid iframe HTML snippet
    const formattedIframe = iframeInput.trim().startsWith('<iframe')
      ? iframeInput.trim()
      : buildIframeSnippet(src, title.trim());

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `game-${Date.now()}`;

    const newGame = {
      id,
      title: title.trim(),
      category,
      description: description.trim() || 'Custom user added web game embed.',
      controls: controls.trim() || 'Click or use standard keyboard controls',
      iframe: formattedIframe,
      rating: 5.0,
      playedCount: 1,
      tags: [category, 'Custom', 'Web'],
      accentColor: '#10b981',
      isCustom: true
    };

    onAddGame(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Add Custom Game</h2>
            <p className="text-xs text-slate-400">Embed any HTML5 game by storing its iframe snippet</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Game Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Super Drift, Hexagon, etc."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Arcade">Arcade</option>
                <option value="Retro">Retro</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Action">Action</option>
                <option value="Casual">Casual</option>
                <option value="Strategy">Strategy</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Controls Hint
              </label>
              <input
                type="text"
                value={controls}
                onChange={(e) => setControls(e.target.value)}
                placeholder="e.g. Arrow keys to steer, Space to boost"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Iframe Code Snippet or Embed URL *
              </label>
              <button
                type="button"
                onClick={handleTestPreview}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test Embed</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={iframeInput}
              onChange={(e) => setIframeInput(e.target.value)}
              placeholder='<iframe src="https://example.com/game.html" allowfullscreen></iframe>'
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Paste the exact &lt;iframe&gt; HTML code or URL. It will be stored in your JSON game database.
            </p>
          </div>

          {previewSrc && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Live Preview Test:</div>
              <div className="w-full h-44 rounded overflow-hidden border border-slate-800 bg-black">
                <iframe
                  src={previewSrc}
                  title="Game Preview"
                  className="w-full h-full border-none"
                  allow="fullscreen; autoplay"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of gameplay..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Game to JSON</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
