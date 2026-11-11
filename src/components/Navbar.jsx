import React from 'react';
import { ShieldCheck, FileSpreadsheet, Sparkles, Printer, RefreshCw } from 'lucide-react';
import { ENTITY_TYPES } from '../utils/taxCalculator';

export default function Navbar({
  assessmentYear,
  setAssessmentYear,
  entityType,
  setEntityType,
  onReset,
  onPrint,
  taxStatus,
  netAmount
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  TaxScan<span className="text-emerald-400">AI</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Easy Tax Summary
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Check whether you owe tax or get a refund — in plain English
              </p>
            </div>
          </div>

          {/* Quick Selectors & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Assessment Year Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs font-medium">
              <span className="text-slate-400 px-2 hidden md:inline" title="Assessment Year: The year in which returns are filed for preceding earnings">Tax Year:</span>
              <button
                onClick={() => setAssessmentYear('2025-26')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  assessmentYear === '2025-26'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2025-26
              </button>
              <button
                onClick={() => setAssessmentYear('2024-25')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  assessmentYear === '2024-25'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2024-25
              </button>
            </div>

            {/* Entity Switcher */}
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 hidden sm:block"
            >
              <option value={ENTITY_TYPES.INDIVIDUAL}>👤 Individual / Salaried</option>
              <option value={ENTITY_TYPES.HUF}>👨‍👩‍👧 HUF (Hindu Undivided Family)</option>
              <option value={ENTITY_TYPES.COMPANY_DOMESTIC}>🏢 Domestic Company (Pvt Ltd)</option>
              <option value={ENTITY_TYPES.COMPANY_FOREIGN}>🌐 Foreign Company</option>
              <option value={ENTITY_TYPES.LLP_FIRM}>🤝 Partnership Firm / LLP</option>
            </select>

            {/* Print / Report button */}
            <button
              onClick={onPrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Print Tax Summary Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Report</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
