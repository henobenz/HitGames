import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, FileJson } from 'lucide-react';

export const JsonViewerModal = ({
  isOpen,
  onClose,
  games,
  onImportJson
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(games, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportStatus(null);
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of game objects.');
      }
      for (const item of parsed) {
        if (!item.id || !item.title || !item.iframe) {
          throw new Error('Each game object must have at least "id", "title", and "iframe".');
        }
      }
      onImportJson(parsed);
      setImportStatus({ type: 'success', message: `Successfully imported ${parsed.length} games!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message || 'Invalid JSON format.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02030a]/85 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-3xl bg-[#080b1f] border border-purple-500/40 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_32px_rgba(34,211,238,0.18)] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-[#050716]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                <span>games.json</span>
                <span className="text-xs text-slate-400 font-normal font-sans">({games.length} games stored with iframe)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#04050f] p-0.5 rounded-xl border border-purple-500/30 text-xs">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'view' ? 'bg-purple-600/35 text-cyan-300 font-semibold border border-cyan-400/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                View JSON
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'import' ? 'bg-purple-600/35 text-cyan-300 font-semibold border border-cyan-400/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Import / Replace
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-purple-500/15 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'view' ? (
          <div className="flex flex-col flex-1 min-h-0 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs text-slate-400">
              <span>Raw JSON representation with iframe markup for each game</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="neon-btn-outline flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="neon-btn-purple flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download games.json</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-[#04050f] border border-purple-500/25 rounded-xl p-4 overflow-auto">
              <pre className="text-xs font-mono-code text-cyan-300 leading-relaxed">
                {jsonString}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4 flex-1">
            <p className="text-xs text-slate-400">
              Paste custom JSON data containing your list of game objects. Each game must define <code className="text-cyan-300">id</code>, <code className="text-cyan-300">title</code>, and <code className="text-cyan-300">iframe</code>.
            </p>

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs ${
                importStatus.type === 'success' 
                  ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-300' 
                  : 'bg-rose-500/10 border border-rose-500/40 text-rose-300'
              }`}>
                {importStatus.message}
              </div>
            )}

            <textarea
              rows={12}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[ { "id": "my-game", "title": "My Game", "category": "Arcade", "iframe": "<iframe src=...>" } ]'
              className="w-full flex-1 p-3 bg-[#04050f] border border-purple-500/30 rounded-xl text-xs font-mono-code text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-500/20">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="neon-btn-outline px-4 py-2 text-xs font-medium rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="neon-btn-cyan px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import and Save</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
