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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>games.json</span>
                <span className="text-xs text-slate-400 font-normal">({games.length} games stored with iframe)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'view' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                View JSON
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'import' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Import / Replace
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'view' ? (
          <div className="flex flex-col flex-1 min-h-0 p-4">
            <div className="flex items-center justify-between pb-3 text-xs text-slate-400">
              <span>Raw JSON representation with iframe markup for each game</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download games.json</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-auto">
              <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                {jsonString}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4 flex-1">
            <p className="text-xs text-slate-400">
              Paste custom JSON data containing your list of game objects. Each game must define <code className="text-sky-400">id</code>, <code className="text-sky-400">title</code>, and <code className="text-sky-400">iframe</code>.
            </p>

            {importStatus && (
              <div className={`p-3 rounded-lg text-xs ${
                importStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {importStatus.message}
              </div>
            )}

            <textarea
              rows={12}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[ { "id": "my-game", "title": "My Game", "category": "Arcade", "iframe": "<iframe src=...>" } ]'
              className="w-full flex-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
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
