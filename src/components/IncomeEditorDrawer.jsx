import React, { useState } from 'react';
import { 
  Sliders, 
  User, 
  Briefcase, 
  Home, 
  TrendingUp, 
  Receipt,
  Sparkles,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ENTITY_TYPES, CORPORATE_REGIMES, formatINR } from '../utils/taxCalculator';
import Tooltip from './Tooltip';

export default function IncomeEditorDrawer({ taxpayerData, onChange }) {
  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'capital_gains' | 'deductions' | 'prepaid' | 'profile'

  const handleFieldChange = (field, value) => {
    const val = value === '' ? '' : (isNaN(Number(value)) ? '' : Number(value));
    onChange({
      ...taxpayerData,
      [field]: val,
    });
  };

  const handleDeductionChange = (field, value) => {
    const val = value === '' ? '' : (isNaN(Number(value)) ? '' : Number(value));
    onChange({
      ...taxpayerData,
      deductions: {
        ...taxpayerData.deductions,
        [field]: val,
      },
    });
  };

  const handlePrepaidChange = (field, value) => {
    const val = value === '' ? '' : (isNaN(Number(value)) ? '' : Number(value));
    onChange({
      ...taxpayerData,
      prepaid: {
        ...taxpayerData.prepaid,
        [field]: val,
      },
    });
  };

  const handleTextChange = (field, value) => {
    onChange({
      ...taxpayerData,
      [field]: value,
    });
  };

  const handleBooleanChange = (field, value) => {
    onChange({
      ...taxpayerData,
      [field]: value,
    });
  };

  const isCompany = taxpayerData.entityType === ENTITY_TYPES.COMPANY_DOMESTIC || taxpayerData.entityType === ENTITY_TYPES.COMPANY_FOREIGN;
  const isFirm = taxpayerData.entityType === ENTITY_TYPES.LLP_FIRM;

  const resetCurrentTab = () => {
    if (activeTab === 'income') {
      onChange({
        ...taxpayerData,
        salaryIncome: 0,
        housePropertyIncome: 0,
        businessIncome: 0,
        turnover: 0,
        taxableProfit: 0,
        netProfit: 0,
        savingsInterest: 0,
        fdInterest: 0,
        dividendIncome: 0,
        otherMiscIncome: 0,
        otherSourcesIncome: 0,
      });
    } else if (activeTab === 'capital_gains') {
      onChange({
        ...taxpayerData,
        stcg111A: 0,
        ltcg112A: 0,
        cryptoVDA: 0,
      });
    } else if (activeTab === 'deductions') {
      onChange({
        ...taxpayerData,
        deductions: {
          sec80C: 0,
          sec80D: 0,
          sec80CCD1B: 0,
          sec80E: 0,
          sec80G: 0,
          sec80GG: 0,
          sec80TTA: 0,
          section24b: 0,
          employerNPS: 0,
          secOther: 0,
        },
      });
    } else if (activeTab === 'prepaid') {
      onChange({
        ...taxpayerData,
        prepaid: {
          tdsSalary: 0,
          tdsNonSalary: 0,
          tcs: 0,
          advanceTax: 0,
          selfAssessmentTax: 0,
        },
      });
    }
  };

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header with Responsive Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Interactive Financial Inspector & Full Overrides</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  All Fields Unlocked
                </span>
              </h3>
              <p className="text-xs text-slate-400">Review or adjust any scanned figure to see real-time recalculation</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/80 text-xs">
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'income' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Earnings & Operations
            </button>
            <button
              onClick={() => setActiveTab('capital_gains')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'capital_gains' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Capital Gains & Crypto
            </button>
            <button
              onClick={() => setActiveTab('deductions')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'deductions' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Deductions (80C, 80D, 80E)
            </button>
            <button
              onClick={() => setActiveTab('prepaid')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'prepaid' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Taxes Already Paid (TDS)
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Profile & Filing Rules
            </button>
          </div>
        </div>
      </div>

      {/* Quick Assign Bar for Detected Document Figures */}
      {taxpayerData.detectedCandidates && taxpayerData.detectedCandidates.length > 0 && (
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Document Figures Detected:
            </span>
            {taxpayerData.detectedCandidates.slice(0, 5).map((cand, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-md px-2 py-0.5 text-[11px]">
                <span className="font-mono text-emerald-400 font-bold">{formatINR(cand.amount)}</span>
                <button
                  onClick={() => handleFieldChange('salaryIncome', cand.amount)}
                  className="text-slate-400 hover:text-emerald-400 hover:underline text-[10px]"
                  title="Assign to Salary"
                >
                  → Salary
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => {
                    handleFieldChange('turnover', cand.amount);
                    handleFieldChange('businessIncome', Math.round(cand.amount * 0.5));
                  }}
                  className="text-slate-400 hover:text-purple-400 hover:underline text-[10px]"
                  title="Assign to Business Turnover"
                >
                  → Turnover
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => handlePrepaidChange('tdsSalary', cand.amount)}
                  className="text-slate-400 hover:text-cyan-400 hover:underline text-[10px]"
                  title="Assign to TDS"
                >
                  → TDS
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={resetCurrentTab}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset this tab's values to zero"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Tab</span>
          </button>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* TAB 1: EARNINGS & OPERATIONS */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Salary Income */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <Tooltip section="TIS Code S-001 / Section 17" text="Salary, bonus, commissions, and taxable allowances reported by your employer on Form 16. A flat standard deduction (₹75,000 for AY 2025-26) applies automatically.">
                      Salary from Employment (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Form 16</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.salaryIncome ?? ''}
                  onChange={(e) => handleFieldChange('salaryIncome', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Gross salary before standard deduction</span>
              </div>

              {/* Rental Income */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-cyan-400" />
                    <Tooltip section="TIS Code R-001 / Section 22" text="Annual gross rent collected from tenant properties. Standard 30% deduction u/s 24(a) and municipal taxes are accounted for.">
                      Rental Income (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Rent</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.housePropertyIncome ?? ''}
                  onChange={(e) => handleFieldChange('housePropertyIncome', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Annual rent collected from properties</span>
              </div>

              {/* Business Turnover */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <Tooltip section="Turnover / Gross Receipts" text="Total sales turnover or gross professional receipts from 194C contracts, 194J consulting, freelance, or commercial sales.">
                      Business Turnover / Receipts (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">194C / 194J</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.turnover ?? ''}
                  onChange={(e) => handleFieldChange('turnover', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Gross billing or sales revenue</span>
              </div>

              {/* Net Taxable Business Profit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-purple-400" />
                    <Tooltip section="PBT / Presumptive 44AD / 44ADA" text="Taxable profit after business expenses. For freelancers/consultants, 50% presumptive profit under Section 44ADA applies.">
                      Net Taxable Business Profit (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-purple-400 font-mono font-bold">Taxable Profit</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.businessIncome !== undefined && taxpayerData.businessIncome !== '' ? taxpayerData.businessIncome : (taxpayerData.taxableProfit ?? taxpayerData.netProfit ?? '')}
                  onChange={(e) => {
                    const v = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? '' : Number(e.target.value));
                    onChange({
                      ...taxpayerData,
                      businessIncome: v,
                      taxableProfit: v,
                      netProfit: v,
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-purple-300 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Actual PBT or 50% deemed under 44ADA</span>
              </div>

              {/* Bank Savings Interest */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="TIS Code I-001" text="Interest credited on all your savings bank accounts. Deductible up to ₹10,000 u/s 80TTA (₹50,000 for seniors u/s 80TTB) in the Old Plan.">
                      Bank Savings Interest (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">I-001</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.savingsInterest ?? ''}
                  onChange={(e) => handleFieldChange('savingsInterest', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Savings account interest credits</span>
              </div>

              {/* Fixed Deposit Interest */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="TIS Code I-002" text="Interest earned on bank fixed deposits (FD) or recurring deposits (RD). Fully taxable at your applicable bracket rate.">
                      Fixed Deposit (FD) Interest (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">I-002</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.fdInterest ?? ''}
                  onChange={(e) => handleFieldChange('fdInterest', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Term deposit interest</span>
              </div>

              {/* Stock Dividends */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="TIS Code D-001" text="Dividends received from company shares or equity mutual funds. Taxed under Income from Other Sources.">
                      Stock & Mutual Fund Dividends (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">D-001</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.dividendIncome ?? ''}
                  onChange={(e) => handleFieldChange('dividendIncome', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Direct equity and MF dividends</span>
              </div>

              {/* Other Miscellaneous Income */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="Section 56 (Other Sources)" text="Income from other sources including interest on income tax refunds, director fees, gifts, commission, or family pension.">
                      Other Miscellaneous Income (₹)
                    </Tooltip>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">Direct Input</span>
                </div>
                <input
                  type="number"
                  value={taxpayerData.otherMiscIncome !== undefined && taxpayerData.otherMiscIncome !== '' ? taxpayerData.otherMiscIncome : (taxpayerData.otherSourcesIncome ?? '')}
                  onChange={(e) => {
                    const v = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? '' : Number(e.target.value));
                    onChange({
                      ...taxpayerData,
                      otherMiscIncome: v,
                      otherSourcesIncome: v,
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">IT refund interest, gifts, fees</span>
              </div>

              {/* Corporate Regime Selector (When Company) */}
              {isCompany && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="Corporate Tax Slabs" text="Section 115BAA offers a 22% flat tax for domestic companies with complete exemption from Minimum Alternate Tax (MAT).">
                      Corporate Tax Plan
                    </Tooltip>
                  </label>
                  <select
                    value={taxpayerData.corporateRegime || CORPORATE_REGIMES.SECTION_115BAA}
                    onChange={(e) => handleTextChange('corporateRegime', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={CORPORATE_REGIMES.SECTION_115BAA}>Section 115BAA (22% Flat • MAT Exempt • Effective 25.168%)</option>
                    <option value={CORPORATE_REGIMES.REGULAR_UNDER_400CR}>Regular Domestic (Turnover ≤ ₹400 Cr • 25% + MAT)</option>
                    <option value={CORPORATE_REGIMES.REGULAR_ABOVE_400CR}>Regular Domestic (Turnover &gt; ₹400 Cr • 30% + MAT)</option>
                    <option value={CORPORATE_REGIMES.SECTION_115BAB}>New Manufacturing Unit (Section 115BAB • 15%)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CAPITAL GAINS & CRYPTO */}
        {activeTab === 'capital_gains' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Short-Term Capital Gains 111A */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 111A (STCG)" text="Profits from selling listed shares or equity mutual funds held for less than 12 months. Taxed at 20% in AY 2025-26 (or 15% in AY 2024-25).">
                    Short-Term Stock Profits (111A) (₹)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Rate: 20% / 15%</span>
              </div>
              <input
                type="number"
                value={taxpayerData.stcg111A ?? ''}
                onChange={(e) => handleFieldChange('stcg111A', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Shares held &lt; 1 year</span>
            </div>

            {/* Long-Term Capital Gains 112A */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 112A (LTCG)" text="Profits from selling listed shares or equity mutual funds held for more than 12 months. First ₹1.25 Lakhs (AY 2025-26) / ₹1.0 Lakh (AY 2024-25) is tax-free; excess is taxed at 12.5% / 10%.">
                    Long-Term Stock Profits (112A) (₹)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Exempt to ₹1.25L</span>
              </div>
              <input
                type="number"
                value={taxpayerData.ltcg112A ?? ''}
                onChange={(e) => handleFieldChange('ltcg112A', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Shares held &gt; 1 year</span>
            </div>

            {/* Crypto / Virtual Digital Assets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 115BBH (Crypto / VDA)" text="Net profit from Bitcoin, cryptocurrencies, and NFTs. Taxed at flat 30% with no expense deductions or loss set-offs permitted under Section 115BBH.">
                    Crypto & Virtual Coins Net Profit (₹)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-rose-400 font-mono font-bold">Flat 30%</span>
              </div>
              <input
                type="number"
                value={taxpayerData.cryptoVDA ?? ''}
                onChange={(e) => handleFieldChange('cryptoVDA', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Crypto exchange proceeds</span>
            </div>
          </div>
        )}

        {/* TAB 3: TAX DEDUCTIONS (ALL CATEGORIES FULLY UNLOCKED) */}
        {activeTab === 'deductions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 80C */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80C" text="Employee Provident Fund (EPF), PPF, ELSS tax-saving mutual funds, life insurance premiums (LIC), and children's school tuition fees. Maximum statutory cap ₹1,50,000.">
                    Section 80C (PPF, EPF, ELSS, LIC)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹1.5L</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80C ?? ''}
                onChange={(e) => handleDeductionChange('sec80C', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Deductions Plan (Old Regime)</span>
            </div>

            {/* 80D */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80D" text="Medical health insurance premiums paid for self, spouse, children (up to ₹25,000) plus additional deduction for parents (up to ₹25,000 or ₹50,000 for senior parents).">
                    Section 80D (Health Insurance)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹75k</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80D ?? ''}
                onChange={(e) => handleDeductionChange('sec80D', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Self, family & senior parents</span>
            </div>

            {/* 80CCD(1B) NPS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80CCD(1B)" text="Voluntary individual contribution to National Pension System (NPS) Tier-1 account. Provides an exclusive ₹50,000 deduction beyond 80C.">
                    Section 80CCD(1B) (NPS Tier-1)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹50k</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80CCD1B ?? ''}
                onChange={(e) => handleDeductionChange('sec80CCD1B', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Exclusive NPS Tier-1 deduction</span>
            </div>

            {/* Section 24b Home Loan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 24(b)" text="Annual interest paid on a housing loan for a self-occupied residential property. Maximum deduction ₹2,00,000.">
                    Section 24(b) (Home Loan Interest)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹2L</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.section24b ?? ''}
                onChange={(e) => handleDeductionChange('section24b', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Self-occupied housing loan interest</span>
            </div>

            {/* Section 80E Higher Education Loan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80E" text="Entire interest paid on an education loan taken for higher studies of self, spouse, or children. There is NO upper monetary cap for up to 8 years!">
                    Section 80E (Education Loan Interest)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">No Cap!</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80E ?? ''}
                onChange={(e) => handleDeductionChange('sec80E', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">100% of interest is deductible</span>
            </div>

            {/* Section 80G Charitable Donations */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80G" text="Donations to government relief funds (PMNRF, PM CARES - 100% deduction) or recognized NGOs/institutions (50% deduction with 10% adjusted income limit).">
                    Section 80G (Charitable Donations)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Eligible Relief</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80G ?? ''}
                onChange={(e) => handleDeductionChange('sec80G', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Donations with Form 10BE receipt</span>
            </div>

            {/* Section 80GG Rent Paid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80GG" text="Deduction for house rent paid by individuals who do not receive House Rent Allowance (HRA) from their employer. Maximum ₹60,000 per year (₹5,000/mo).">
                    Section 80GG (Rent Paid Without HRA)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹60k</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80GG ?? ''}
                onChange={(e) => handleDeductionChange('sec80GG', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">When no HRA is received</span>
            </div>

            {/* Employer NPS 80CCD(2) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80CCD(2)" text="Employer's contribution to your NPS account (up to 14% of Basic + DA). Permitted in BOTH Simplified and Deductions plans!">
                    Section 80CCD(2) (Employer NPS)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">Both Plans!</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.employerNPS ?? ''}
                onChange={(e) => handleDeductionChange('employerNPS', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Up to 14% of Basic salary</span>
            </div>

            {/* Other Chapter VI-A Deductions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Chapter VI-A Miscellaneous" text="Any other eligible deductions such as Section 80U (disability), Section 80DD (medical treatment of dependent), or 80GGA (scientific research).">
                    Other Deductions (80U, 80DD, etc.)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Other</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.secOther ?? ''}
                onChange={(e) => handleDeductionChange('secOther', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Any additional statutory deductions</span>
            </div>
          </div>
        )}

        {/* TAB 4: TAXES ALREADY PAID (TDS / TCS / ADVANCE TAX / SAT) */}
        {activeTab === 'prepaid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TDS on Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 192 TDS / Form 16" text="TDS automatically deducted by your employer each month and deposited with the government against your PAN.">
                  TDS on Salary (Form 16) (₹)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.tdsSalary ?? ''}
                onChange={(e) => handlePrepaidChange('tdsSalary', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Employer salary deductions</span>
            </div>

            {/* TDS on Non-Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 194 TDS / Form 26AS" text="TDS deducted by banks on your FD interest (194A), clients on invoice payments (194C/194J), or dividends (194K).">
                  TDS on Non-Salary (Form 26AS) (₹)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.tdsNonSalary ?? ''}
                onChange={(e) => handlePrepaidChange('tdsNonSalary', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">FD interest, contract & client TDS</span>
            </div>

            {/* Advance Tax Paid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Advance Tax (Challan 280)" text="Quarterly advance tax installments you deposited directly via Challan 280 (due by June 15, Sept 15, Dec 15, March 15).">
                  Advance Tax Paid (Challan 280) (₹)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.advanceTax ?? ''}
                onChange={(e) => handlePrepaidChange('advanceTax', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Quarterly challan payments</span>
            </div>

            {/* TCS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 206C TCS" text="Tax collected at source when purchasing motor vehicles, luxury goods, or sending money abroad through Liberalized Remittance Scheme (LRS).">
                  Tax Collected at Source (TCS) (₹)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.tcs ?? ''}
                onChange={(e) => handlePrepaidChange('tcs', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Foreign travel / motor vehicle TCS</span>
            </div>

            {/* Self-Assessment Tax Paid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 140A Self-Assessment Tax" text="Tax deposited via Challan 280 after the end of the financial year to clear balance tax liability before filing your return.">
                  Self-Assessment Tax Paid (SAT-01) (₹)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.selfAssessmentTax ?? ''}
                onChange={(e) => handlePrepaidChange('selfAssessmentTax', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Paid prior to filing ITR</span>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & STATUTORY FILING CRITERIA */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Taxpayer / Company Name</label>
                <input
                  type="text"
                  value={taxpayerData.name || ''}
                  onChange={(e) => handleTextChange('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Rahul Sharma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={taxpayerData.pan || ''}
                  onChange={(e) => handleTextChange('pan', e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tracking-wider text-emerald-400 uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="ABCDE1234F"
                />
                <span className="text-[11px] text-slate-500">4th letter: P=Person, C=Company, F=Firm</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Age Category</label>
                <select
                  value={taxpayerData.ageGroup || 'NORMAL'}
                  onChange={(e) => handleTextChange('ageGroup', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="NORMAL">Standard Citizen (&lt; 60 Years)</option>
                  <option value="SENIOR">Senior Citizen (60 - 79 Years)</option>
                  <option value="SUPER_SENIOR">Super Senior Citizen (80+ Years)</option>
                </select>
                <span className="text-[11px] text-slate-500">Affects Old Regime basic exemption limit</span>
              </div>
            </div>

            {/* Statutory Filing Mandate Overrides (Section 139 Seventh Proviso) */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Mandatory Return Filing Criteria Check (Section 139(1))
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                The Income Tax Act mandates return filing even if your income is below the tax threshold if any of these conditions are triggered:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <label className="text-slate-300 font-medium">Foreign Travel Spend (&gt; ₹2 Lakhs)</label>
                  <input
                    type="number"
                    value={taxpayerData.foreignTravelExpenditure ?? ''}
                    onChange={(e) => handleFieldChange('foreignTravelExpenditure', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono text-white"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500">Self or family foreign travel</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <label className="text-slate-300 font-medium">Electricity Bill (&gt; ₹1 Lakh)</label>
                  <input
                    type="number"
                    value={taxpayerData.electricityExpenditure ?? ''}
                    onChange={(e) => handleFieldChange('electricityExpenditure', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono text-white"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500">Total annual power bills</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <label className="text-slate-300 font-medium">Current A/C Deposits (&gt; ₹50 Lakhs)</label>
                  <input
                    type="number"
                    value={taxpayerData.bankDepositsCurrent ?? ''}
                    onChange={(e) => handleFieldChange('bankDepositsCurrent', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono text-white"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-500">Bank deposits</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <label className="text-slate-300 font-medium">Foreign Assets / Signing Authority</label>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={!!taxpayerData.hasForeignAssets}
                      onChange={(e) => handleBooleanChange('hasForeignAssets', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700"
                    />
                    <span className="text-slate-200">Holds foreign assets</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Schedule FA requirement</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
