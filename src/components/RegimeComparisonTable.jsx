import React from 'react';
import { Check, ArrowRight, Zap, ShieldAlert, Award, FileText } from 'lucide-react';
import { formatINR } from '../utils/taxCalculator';
import Tooltip from './Tooltip';

export default function RegimeComparisonTable({ assessment }) {
  if (!assessment || assessment.isCompany) {
    if (!assessment) return null;
    const corp = assessment.chosenResult;
    return (
      <div className="bg-slate-800/40 rounded-2xl border border-slate-800 overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Company Tax Calculation Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Computed under {corp?.regimeName || 'Corporate Tax Regulations'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Tax Rate: {corp?.baseRate}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-300">
                  <Tooltip section="Turnover" text="Total gross business revenue before operating expenses.">
                    Total Business Revenue
                  </Tooltip>
                </td>
                <td className="py-2.5 text-right font-mono text-white">{formatINR(corp?.turnover || 0)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-300">
                  <Tooltip section="PBT / Taxable Profit" text="Net earnings after deducting allowable business expenses, depreciation, and salaries.">
                    Net Taxable Profit
                  </Tooltip>
                </td>
                <td className="py-2.5 text-right font-mono text-white font-bold">{formatINR(corp?.taxableProfit || 0)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-300">
                  <Tooltip section="Base Corporate Tax" text="Base corporate income tax before surcharge and health/education cess.">
                    Base Corporate Tax ({corp?.baseRate}%)
                  </Tooltip>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-200">{formatINR(corp?.baseTax || 0)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-300">
                  <Tooltip section="Surcharge" text="Additional tax percentage applied to high corporate profit brackets.">
                    Surcharge ({corp?.surchargeRate}%)
                  </Tooltip>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-200">{formatINR(corp?.surcharge || 0)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-300">
                  <Tooltip section="Cess" text="4% government health and education levy on tax plus surcharge.">
                    Government Health & Education Fee (4%)
                  </Tooltip>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-200">{formatINR(corp?.cess || 0)}</td>
              </tr>
              <tr className="bg-slate-800/60 font-bold">
                <td className="py-3 text-slate-200">Total Calculated Tax</td>
                <td className="py-3 text-right font-mono text-base text-cyan-400">{formatINR(corp?.totalTaxLiability || 0)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-400">Minus: Taxes Already Deducted & Advance Payments</td>
                <td className="py-2.5 text-right font-mono text-emerald-400">-{formatINR(assessment.totalPrepaidTaxes || 0)}</td>
              </tr>
              <tr className="bg-slate-900 font-extrabold text-sm border-t-2 border-slate-700">
                <td className="py-3 text-white">Final Balance {assessment.taxStatus === 'PAYABLE' ? 'to Pay' : 'Refundable'}</td>
                <td className={`py-3 text-right font-mono ${assessment.taxStatus === 'PAYABLE' ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {formatINR(assessment.netAmount || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const { newRegime, oldRegime, recommendedRegime, savings, totalPrepaidTaxes } = assessment;

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-800 overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Tax Plans Comparison: Which Saves You More?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare the Simplified Plan vs the Deductions Plan to see where your tax is lower
          </p>
        </div>

        {/* Optimal Regime Recommendation pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 self-start sm:self-auto">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>{recommendedRegime === 'NEW' ? 'Simplified Plan is Best' : 'Deductions Plan is Best'}</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="py-3 text-left font-semibold">Breakdown Item</th>
              <th className={`py-3 text-right font-semibold w-1/3 px-3 rounded-t-lg ${recommendedRegime === 'NEW' ? 'bg-emerald-500/10 text-emerald-300' : ''}`}>
                Simplified Plan (New) {recommendedRegime === 'NEW' && '⭐'}
                <div className="text-[10px] font-normal text-slate-500">Lower slabs • Zero paperwork</div>
              </th>
              <th className={`py-3 text-right font-semibold w-1/3 px-3 rounded-t-lg ${recommendedRegime === 'OLD' ? 'bg-emerald-500/10 text-emerald-300' : ''}`}>
                Deductions Plan (Old) {recommendedRegime === 'OLD' && '⭐'}
                <div className="text-[10px] font-normal text-slate-500">Higher slabs • Deductions allowed</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {/* Total Money Earned */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-300">
                <Tooltip section="Gross Total Income (GTI)" text="Your overall income across salary, interest, dividends, and freelance earnings before any deductions.">
                  Total Money Earned
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-200 px-3">{formatINR(newRegime.grossTotalIncome)}</td>
              <td className="py-2.5 text-right font-mono text-slate-200 px-3">{formatINR(oldRegime.grossTotalIncome)}</td>
            </tr>

            {/* Standard Salary Deduction */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-400 pl-4">
                <Tooltip section="Section 16(ia) Standard Deduction" text="A flat automatic deduction given to all salaried individuals without requiring receipts. ₹75,000 under new rules or ₹50,000 under old rules.">
                  Flat Salary Deduction
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-300 px-3">-{formatINR(newRegime.standardDeduction)}</td>
              <td className="py-2.5 text-right font-mono text-slate-300 px-3">-{formatINR(oldRegime.standardDeduction)}</td>
            </tr>

            {/* Tax-Saving Investments */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-400 pl-4">
                <Tooltip section="Chapter VI-A (Sections 80C, 80D, NPS)" text="Deductions for Provident Fund, ELSS, life insurance (80C up to ₹1.5L), health insurance (80D up to ₹75k), and pension. Not available in the Simplified Plan.">
                  Tax-Saving Investments & Insurance
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-500 px-3">
                {newRegime.employerNPS > 0 ? `-${formatINR(newRegime.employerNPS)} (Employer NPS)` : 'Not Allowed'}
              </td>
              <td className="py-2.5 text-right font-mono text-emerald-400 px-3">
                -{formatINR(oldRegime.chapterVIADeductions.total)}
              </td>
            </tr>

            {/* Home Loan Interest */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-400 pl-4">
                <Tooltip section="Section 24(b) Housing Loan" text="Up to ₹2,00,000 tax deduction on interest paid for a home loan on a self-occupied property.">
                  Home Loan Interest Deduction
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-500 px-3">Not Allowed</td>
              <td className="py-2.5 text-right font-mono text-emerald-400 px-3">
                {oldRegime.homeLoanInterest > 0 ? `-${formatINR(oldRegime.homeLoanInterest)}` : '₹0'}
              </td>
            </tr>

            {/* Amount Subject to Tax */}
            <tr className="bg-slate-800/40 font-semibold">
              <td className="py-2.5 text-slate-200">
                <Tooltip section="Net Taxable Income (NTI)" text="The remaining income that is actually used to calculate your bracket tax.">
                  Amount Subject to Tax
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-100 px-3">{formatINR(newRegime.netTaxableIncome)}</td>
              <td className="py-2.5 text-right font-mono text-slate-100 px-3">{formatINR(oldRegime.netTaxableIncome)}</td>
            </tr>

            {/* Tax from Brackets */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-300">
                <Tooltip section="Income Tax Slabs" text="Tax calculated step-by-step across the government income brackets (0%, 5%, 10%, 15%, 20%, 30%).">
                  Base Tax from Brackets
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-300 px-3">{formatINR(newRegime.normalTax)}</td>
              <td className="py-2.5 text-right font-mono text-slate-300 px-3">{formatINR(oldRegime.normalTax)}</td>
            </tr>

            {/* Government Zero-Tax Waiver */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-400 pl-4">
                <Tooltip section="Section 87A Rebate" text="A 100% tax waiver from the government for individuals earning up to ₹7,00,000 in the Simplified Plan, wiping out the tax bill completely.">
                  Government Zero-Tax Discount (Rebate)
                  {newRegime.rebate87A > 0 && <span className="ml-1 text-[10px] text-emerald-400 font-bold">(Applied!)</span>}
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-emerald-400 px-3">
                {newRegime.rebate87A > 0 ? `-${formatINR(newRegime.rebate87A)}` : '₹0'}
              </td>
              <td className="py-2.5 text-right font-mono text-emerald-400 px-3">
                {oldRegime.rebate87A > 0 ? `-${formatINR(oldRegime.rebate87A)}` : '₹0'}
              </td>
            </tr>

            {/* Special Stock / Crypto Taxes */}
            {(newRegime.specialTaxes.stcgTax > 0 || newRegime.specialTaxes.ltcgTax > 0 || newRegime.specialTaxes.cryptoTax > 0) && (
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 font-medium text-slate-400 pl-4">
                  <Tooltip section="Sections 111A, 112A, 115BBH" text="Special statutory rates on short-term stocks (20%/15%), long-term stocks (12.5%/10%), and crypto gains (30%).">
                    Special Taxes (Stocks & Crypto)
                  </Tooltip>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-300 px-3">
                  +{formatINR(newRegime.specialTaxes.stcgTax + newRegime.specialTaxes.ltcgTax + newRegime.specialTaxes.cryptoTax)}
                </td>
                <td className="py-2.5 text-right font-mono text-slate-300 px-3">
                  +{formatINR(oldRegime.specialTaxes.stcgTax + oldRegime.specialTaxes.ltcgTax + oldRegime.specialTaxes.cryptoTax)}
                </td>
              </tr>
            )}

            {/* Health & Education Fee */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-400 pl-4">
                <Tooltip section="Health & Education Cess (4%)" text="A mandatory 4% fee added to calculated tax to fund national education and public health programs.">
                  Government Health & Education Fee (4%)
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-slate-400 px-3">+{formatINR(newRegime.cess)}</td>
              <td className="py-2.5 text-right font-mono text-slate-400 px-3">+{formatINR(oldRegime.cess)}</td>
            </tr>

            {/* Total Calculated Tax */}
            <tr className="bg-slate-800/70 font-bold border-t border-slate-700">
              <td className="py-3 text-slate-200">Total Calculated Tax</td>
              <td className={`py-3 text-right font-mono text-sm px-3 ${recommendedRegime === 'NEW' ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}`}>
                {formatINR(newRegime.totalTaxLiability)}
              </td>
              <td className={`py-3 text-right font-mono text-sm px-3 ${recommendedRegime === 'OLD' ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}`}>
                {formatINR(oldRegime.totalTaxLiability)}
              </td>
            </tr>

            {/* Pre-Paid Taxes */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 font-medium text-slate-400">
                <Tooltip section="TDS & Advance Tax" text="Taxes already deducted by your employer, bank, or clients throughout the year.">
                  Minus: Taxes Already Deducted / Paid
                </Tooltip>
              </td>
              <td className="py-2.5 text-right font-mono text-cyan-400 px-3">-{formatINR(totalPrepaidTaxes)}</td>
              <td className="py-2.5 text-right font-mono text-cyan-400 px-3">-{formatINR(totalPrepaidTaxes)}</td>
            </tr>

            {/* Final Balance */}
            <tr className="bg-slate-900/90 font-extrabold border-t-2 border-slate-700 text-sm">
              <td className="py-3 text-white">Final Balance (To Pay or Refund)</td>
              <td className={`py-3 text-right font-mono px-3 ${newRegime.totalTaxLiability - totalPrepaidTaxes > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {formatINR(newRegime.totalTaxLiability - totalPrepaidTaxes)}
              </td>
              <td className={`py-3 text-right font-mono px-3 ${oldRegime.totalTaxLiability - totalPrepaidTaxes > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {formatINR(oldRegime.totalTaxLiability - totalPrepaidTaxes)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Slab breakdown cards */}
      <div className="pt-2 border-t border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          How Your Tax is Sliced Across Brackets ({assessment.assessmentYear})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {newRegime.slabBreakdown.map((slab, i) => (
            <div key={i} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
              <div className="text-slate-400 truncate font-medium">{slab.label.split('(')[0]}</div>
              <div className="text-slate-500">{slab.ratePercent}% Rate</div>
              <div className="font-mono font-bold text-slate-200 mt-1">{formatINR(slab.tax)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
