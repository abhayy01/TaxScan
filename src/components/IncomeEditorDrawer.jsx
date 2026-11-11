import React, { useState } from 'react';
import { 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Briefcase, 
  Home, 
  TrendingUp, 
  ShieldAlert, 
  Receipt,
  FileCheck,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ENTITY_TYPES, CORPORATE_REGIMES, formatINR } from '../utils/taxCalculator';
import Tooltip from './Tooltip';

export default function IncomeEditorDrawer({ taxpayerData, onChange }) {
  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'deductions' | 'prepaid' | 'profile'

  const handleFieldChange = (field, value) => {
    onChange({
      ...taxpayerData,
      [field]: value,
    });
  };

  const handleDeductionChange = (field, value) => {
    onChange({
      ...taxpayerData,
      deductions: {
        ...taxpayerData.deductions,
        [field]: Number(value) || 0,
      },
    });
  };

  const handlePrepaidChange = (field, value) => {
    onChange({
      ...taxpayerData,
      prepaid: {
        ...taxpayerData.prepaid,
        [field]: Number(value) || 0,
      },
    });
  };

  const isCompany = taxpayerData.entityType === ENTITY_TYPES.COMPANY_DOMESTIC || taxpayerData.entityType === ENTITY_TYPES.COMPANY_FOREIGN;
  const isFirm = taxpayerData.entityType === ENTITY_TYPES.LLP_FIRM;

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Review & Edit Your Income Figures</h3>
              <p className="text-xs text-slate-400">All numbers extracted from your document can be reviewed or fine-tuned here</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700/80 text-xs">
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'income' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Earnings & Income
            </button>
            {!isCompany && !isFirm && (
              <button
                onClick={() => setActiveTab('deductions')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'deductions' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Tax Deductions
              </button>
            )}
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
              Taxpayer Details
            </button>
          </div>
        </div>
      </div>

      {/* Quick Assign Bar for Detected Document Figures */}
      {taxpayerData.detectedCandidates && taxpayerData.detectedCandidates.length > 0 && (
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Detected in Document:
          </span>
          {taxpayerData.detectedCandidates.slice(0, 4).map((cand, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-md px-2 py-0.5 text-[11px]">
              <span className="font-mono text-emerald-400 font-bold">{formatINR(cand.amount)}</span>
              <button
                onClick={() => handleFieldChange('salaryIncome', cand.amount)}
                className="text-slate-400 hover:text-white hover:underline text-[10px]"
                title="Set as Salary Income"
              >
                → Salary
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => handleFieldChange('turnover', cand.amount)}
                className="text-slate-400 hover:text-white hover:underline text-[10px]"
                title="Set as Business Turnover"
              >
                → Turnover
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => handlePrepaidChange('tdsSalary', cand.amount)}
                className="text-slate-400 hover:text-white hover:underline text-[10px]"
                title="Set as TDS Deducted"
              >
                → TDS
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* TAB 1: INCOME HEADS */}
        {activeTab === 'income' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* If Company or Firm */}
            {(isCompany || isFirm) ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="Turnover / Gross Sales" text="Total sales turnover or gross revenue from contracts and services rendered before expenses.">
                      Total Business Revenue (₹)
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={taxpayerData.turnover || ''}
                    onChange={(e) => handleFieldChange('turnover', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-slate-500">Gross revenue from operations</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    <Tooltip section="PBT / Net Taxable Profit" text="Net earnings after deducting salaries, office rent, vendor bills, and depreciation.">
                      Net Taxable Profit (₹)
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={taxpayerData.taxableProfit || taxpayerData.netProfit || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      handleFieldChange('taxableProfit', val);
                      handleFieldChange('netProfit', val);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-slate-500">Amount chargeable to corporate tax</span>
                </div>

                {isCompany && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="Corporate Tax Slabs" text="Section 115BAA offers a 22% flat tax for domestic companies with complete exemption from Minimum Alternate Tax (MAT).">
                        Tax Plan for Company
                      </Tooltip>
                    </label>
                    <select
                      value={taxpayerData.corporateRegime || CORPORATE_REGIMES.SECTION_115BAA}
                      onChange={(e) => handleFieldChange('corporateRegime', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value={CORPORATE_REGIMES.SECTION_115BAA}>Concessional Plan (22% Flat • MAT Exempt)</option>
                      <option value={CORPORATE_REGIMES.REGULAR_UNDER_400CR}>Standard Plan (Turnover ≤ ₹400 Cr • 25%)</option>
                      <option value={CORPORATE_REGIMES.REGULAR_ABOVE_400CR}>Standard Plan (Turnover &gt; ₹400 Cr • 30%)</option>
                      <option value={CORPORATE_REGIMES.SECTION_115BAB}>New Manufacturing Unit (15% Flat)</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              /* Individuals / HUF */
              <>
                {/* Salary Income */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      <Tooltip section="TIS Code S-001 / Section 17" text="Salary, bonus, and allowances reported by your employer on Form 16. A flat standard deduction (₹75k / ₹50k) is deducted automatically.">
                        Salary from Job (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Form 16</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.salaryIncome || ''}
                    onChange={(e) => handleFieldChange('salaryIncome', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-slate-500">Gross salary before standard deduction</span>
                </div>

                {/* House Property */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-cyan-400" />
                      <Tooltip section="TIS Code R-001" text="Rent received from tenants for houses or commercial spaces.">
                        Rental Income (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Rent</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.housePropertyIncome || ''}
                    onChange={(e) => handleFieldChange('housePropertyIncome', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-slate-500">Annual rent collected</span>
                </div>

                {/* Business / Profession */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <Tooltip section="Section 44AD / 44ADA" text="Earnings from freelance contracts, consulting, agency, or retail business. For professionals, 50% is treated as presumptive taxable profit.">
                        Freelance & Business Earnings (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">194J / 194C</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.businessIncome || ''}
                    onChange={(e) => handleFieldChange('businessIncome', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-slate-500">Profit or 50% presumptive under 44ADA</span>
                </div>

                {/* Savings Bank Interest */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="TIS Code I-001" text="Interest credited on your savings bank accounts. Up to ₹10,000 is tax-free under 80TTA in the Old Plan.">
                        Bank Savings Interest (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Bank</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.savingsInterest || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      handleFieldChange('savingsInterest', val);
                      handleFieldChange('otherSourcesIncome', val + (taxpayerData.fdInterest || 0) + (taxpayerData.dividendIncome || 0));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Fixed Deposit Interest */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="TIS Code I-002" text="Interest earned on bank fixed deposits (FD) or recurring deposits (RD). Taxed at your normal slab rate.">
                        Fixed Deposit (FD) Interest (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">FD / RD</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.fdInterest || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      handleFieldChange('fdInterest', val);
                      handleFieldChange('otherSourcesIncome', (taxpayerData.savingsInterest || 0) + val + (taxpayerData.dividendIncome || 0));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Dividend Income */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="TIS Code D-001" text="Dividends received from company shares or equity mutual funds.">
                        Stock Dividends (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Dividends</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.dividendIncome || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      handleFieldChange('dividendIncome', val);
                      handleFieldChange('otherSourcesIncome', (taxpayerData.savingsInterest || 0) + (taxpayerData.fdInterest || 0) + val);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Short-Term Stock Profits */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="Section 111A (STCG)" text="Profits from selling listed shares or mutual funds held for less than 12 months. Taxed at 20% (or 15% for AY 2024-25).">
                        Short-Term Stock Profits (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">20% / 15%</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.stcg111A || ''}
                    onChange={(e) => handleFieldChange('stcg111A', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Long-Term Stock Profits */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="Section 112A (LTCG)" text="Profits from selling shares held for more than 12 months. First ₹1.25 Lakhs of profit is completely tax-free; excess is taxed at 12.5%.">
                        Long-Term Stock Profits (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">Exempt to ₹1.25L</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.ltcg112A || ''}
                    onChange={(e) => handleFieldChange('ltcg112A', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Crypto / Virtual Currency */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      <Tooltip section="Section 115BBH" text="Net profit from Bitcoin, crypto exchanges, and NFTs. Taxed at flat 30% with no expense deductions allowed.">
                        Crypto & Virtual Coins Profit (₹)
                      </Tooltip>
                    </label>
                    <span className="text-[10px] text-rose-400 font-mono">Flat 30%</span>
                  </div>
                  <input
                    type="number"
                    value={taxpayerData.cryptoVDA || ''}
                    onChange={(e) => handleFieldChange('cryptoVDA', Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: TAX-SAVING DEDUCTIONS */}
        {activeTab === 'deductions' && !isCompany && !isFirm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 80C */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80C" text="EPF, Public Provident Fund (PPF), ELSS mutual funds, life insurance premiums, and children's tuition fees. Maximum deduction ₹1,50,000.">
                    Investments (PPF, EPF, ELSS, LIC)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹1.5L</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80C || ''}
                onChange={(e) => handleDeductionChange('sec80C', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Applies to the Deductions Plan (Old)</span>
            </div>

            {/* 80D */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80D" text="Health insurance premiums paid for yourself, spouse, children (up to ₹25,000), plus parents (additional ₹25k to ₹50k for seniors).">
                    Medical Health Insurance Premium
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹75k</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80D || ''}
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
                  <Tooltip section="Section 80CCD(1B)" text="Voluntary contribution to National Pension System (NPS) Tier-1. Extra ₹50,000 deduction beyond 80C.">
                    National Pension System (NPS)
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹50k</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.sec80CCD1B || ''}
                onChange={(e) => handleDeductionChange('sec80CCD1B', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Extra ₹50k deduction for NPS</span>
            </div>

            {/* Section 24b Home Loan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 24(b)" text="Interest paid on a home loan for a self-occupied residential property. Maximum deduction ₹2,00,000.">
                    Home Loan Interest Paid
                  </Tooltip>
                </label>
                <span className="text-[10px] text-slate-500">Max ₹2L</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.section24b || ''}
                onChange={(e) => handleDeductionChange('section24b', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Annual housing loan interest</span>
            </div>

            {/* Employer NPS 80CCD(2) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  <Tooltip section="Section 80CCD(2)" text="Employer's contribution to your NPS account (up to 14% of Basic + DA). Allowed in BOTH Simplified and Deductions plans!">
                    Employer NPS Contribution
                  </Tooltip>
                </label>
                <span className="text-[10px] text-emerald-400">Allowed in Both Plans</span>
              </div>
              <input
                type="number"
                value={taxpayerData.deductions?.employerNPS || ''}
                onChange={(e) => handleDeductionChange('employerNPS', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Up to 14% of Basic salary</span>
            </div>
          </div>
        )}

        {/* TAB 3: TAXES ALREADY PAID (TDS / ADVANCE TAX) */}
        {activeTab === 'prepaid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 192 TDS / Form 16" text="Tax automatically deducted by your employer each month from your salary paychecks.">
                  Tax Deducted by Employer (Form 16)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.tdsSalary || ''}
                onChange={(e) => handlePrepaidChange('tdsSalary', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Salary TDS credits</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 194 TDS / Form 26AS" text="Tax deducted by banks on your FD interest, clients on professional invoices, or e-commerce portals.">
                  Tax Deducted by Banks & Clients (26AS)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.tdsNonSalary || ''}
                onChange={(e) => handlePrepaidChange('tdsNonSalary', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Non-salary TDS credits</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Advance Tax (Challan 280)" text="Quarterly advance tax installments you deposited directly with the government during the financial year.">
                  Advance Tax Deposited
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.advanceTax || ''}
                onChange={(e) => handlePrepaidChange('advanceTax', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Quarterly challan payments</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                <Tooltip section="Section 206C TCS" text="Tax collected at source when purchasing motor vehicles, luxury goods, or sending money abroad (LRS).">
                  Tax Collected at Source (TCS)
                </Tooltip>
              </label>
              <input
                type="number"
                value={taxpayerData.prepaid?.tcs || ''}
                onChange={(e) => handlePrepaidChange('tcs', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="0"
              />
              <span className="text-[11px] text-slate-500">Foreign travel / vehicle TCS</span>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE / METADATA */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Taxpayer / Company Name</label>
              <input
                type="text"
                value={taxpayerData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
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
                onChange={(e) => handleFieldChange('pan', e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tracking-wider text-emerald-400 uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="ABCDE1234F"
              />
              <span className="text-[11px] text-slate-500">4th letter: P=Person, C=Company, F=Firm</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Age Category</label>
              <select
                value={taxpayerData.ageGroup || 'NORMAL'}
                onChange={(e) => handleFieldChange('ageGroup', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="NORMAL">Standard Citizen (&lt; 60 Years)</option>
                <option value="SENIOR">Senior Citizen (60 - 79 Years)</option>
                <option value="SUPER_SENIOR">Super Senior Citizen (80+ Years)</option>
              </select>
              <span className="text-[11px] text-slate-500">Affects tax-free limits in the Deductions Plan</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
