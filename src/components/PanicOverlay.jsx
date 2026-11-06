import React, { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

export const PanicOverlay = ({ isOpen, onExit }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && (e.key === 'Escape' || e.key === '`' || e.key === '~')) {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] text-slate-800 flex flex-col font-sans select-text overflow-y-auto">
      {/* Top Google Docs Fake Navbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            📄
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800 text-sm">AP Calculus BC — Semester Exam Review</span>
              <span className="text-xs text-slate-400">Saved to Drive</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Insert</span>
              <span>Format</span>
              <span>Tools</span>
              <span>Extensions</span>
              <span>Help</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Return to Games (Esc)
          </button>
          <button
            onClick={() => window.location.href = 'https://classroom.google.com'}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1 rounded bg-blue-50 border border-blue-200 flex items-center gap-1"
          >
            <span>Real Classroom</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Fake Document Page Area */}
      <div className="flex-1 py-8 px-4 flex justify-center bg-[#f0f2f5]">
        <div className="w-full max-w-3xl bg-white min-h-[900px] shadow-sm border border-slate-200 p-12 text-slate-800 text-sm leading-relaxed">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">
            Section 4.3: Analytical Applications of the Definite Integral
          </h1>
          
          <h2 className="text-base font-semibold text-slate-800 mt-4 mb-2">
            1. The Fundamental Theorem of Calculus (Part I & II)
          </h2>
          <p className="mb-4 text-justify text-slate-700">
            Let <em>f</em> be a continuous real-valued function defined on a closed interval [<em>a</em>, <em>b</em>]. If <em>F</em> is a function such that <em>F&apos;(x) = f(x)</em> for all <em>x</em> in [<em>a</em>, <em>b</em>], then the definite integral of <em>f</em> over [<em>a</em>, <em>b</em>] is given by:
          </p>
          <div className="bg-slate-50 border-l-2 border-blue-500 p-3 my-3 font-mono text-center text-slate-800 text-sm">
            ∫[a to b] f(x) dx = F(b) - F(a)
          </div>
          <p className="mb-4 text-justify text-slate-700">
            This relationship establishes that differentiation and definite integration are essentially inverse processes. When evaluating continuous rates of change across a specified temporal boundary, the cumulative quantity accumulated corresponds strictly to the net antiderivative differential.
          </p>

          <h2 className="text-base font-semibold text-slate-800 mt-6 mb-2">
            2. Integration by Parts Formula & Tabular Reduction
          </h2>
          <p className="mb-4 text-justify text-slate-700">
            Derived directly from the product rule of differential calculus, integration by parts provides an algorithmic method to decompose products of polynomial, trigonometric, and exponential integrand components:
          </p>
          <div className="bg-slate-50 border-l-2 border-blue-500 p-3 my-3 font-mono text-center text-slate-800 text-sm">
            ∫ u dv = u·v - ∫ v du
          </div>
          <p className="mb-4 text-justify text-slate-700">
            Selection criteria for the differential variable <em>u</em> follows the standard mnemonic priority LIATE (Logarithmic, Inverse trigonometric, Algebraic, Trigonometric, Exponential).
          </p>

          <h2 className="text-base font-semibold text-slate-800 mt-6 mb-2">
            3. Practice Problem Set (Assigned Problems 12–24)
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-slate-700">
            <li>Evaluate ∫ x² · e^(3x) dx using iterative tabular integration.</li>
            <li>Determine the bounded volume of revolution about the y-axis for y = √x, from x = 0 to x = 4.</li>
            <li>Verify convergence or divergence of the improper integral ∫[1 to ∞] (1 / x^(1.5)) dx.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
