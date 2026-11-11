import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ text, section, children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      <span className="border-b border-dashed border-slate-500 hover:border-emerald-400 transition-colors">
        {children}
      </span>
      <HelpCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />

      {isVisible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-slate-900/95 text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-700/80 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {section && (
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
              {section}
            </span>
          )}
          <span className="block text-slate-300 leading-relaxed font-normal">
            {text}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}
