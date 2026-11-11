import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  Receipt, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  Info,
  Building,
  User
} from 'lucide-react';
import { formatINR } from '../utils/taxCalculator';
import Tooltip from './Tooltip';

export default function VerdictBanner({ assessment, taxpayerData }) {
  if (!assessment) return null;

  const {
    isCompany,
    taxStatus,
    netAmount,
    netTaxDifference,
    filingEligibility,
    recommendedRegime,
    savings,
    chosenResult,
    totalPrepaidTaxes,
  } = assessment;

  const grossIncome = chosenResult?.grossTotalIncome || chosenResult?.turnover || 0;
  const taxableIncome = chosenResult?.netTaxableIncome || chosenResult?.taxableProfit || 0;
  const totalLiability = chosenResult?.totalTaxLiability || 0;

  // Plain-English user friendly statuses
  let statusBg = 'from-emerald-900/40 via-emerald-950/30 to-slate-900 border-emerald-500/40';
  let statusIcon = <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />;
  let headline = 'Good News! You Owe ₹0 in Taxes';
  let headlineColor = 'text-emerald-400';
  let statusDescription = 'Your earnings are within the tax-free limit, or covered 100% by the government zero-tax discount (Section 87A rebate waiver).';

  if (taxStatus === 'PAYABLE') {
    statusBg = 'from-rose-950/40 via-rose-900/20 to-slate-900 border-rose-500/40';
    statusIcon = <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />;
    headline = `You Have ${formatINR(netAmount)} in Taxes to Pay`;
    headlineColor = 'text-rose-400';
    statusDescription = `Your total calculated tax is ${formatINR(totalLiability)}, and you have already had ${formatINR(totalPrepaidTaxes)} deducted/paid. You need to pay the remaining balance of ${formatINR(netAmount)} before filing.`;
  } else if (taxStatus === 'REFUND') {
    statusBg = 'from-cyan-950/40 via-cyan-900/20 to-slate-900 border-cyan-500/40';
    statusIcon = <TrendingDown className="w-8 h-8 text-cyan-400 shrink-0" />;
    headline = `You're Getting a Refund of ${formatINR(netAmount)}!`;
    headlineColor = 'text-cyan-400';
    statusDescription = `You have already paid ${formatINR(totalPrepaidTaxes)} in tax deductions, but your total tax liability is only ${formatINR(totalLiability)}. The government owes you a refund of ${formatINR(netAmount)}!`;
  }

  return (
    <div className="space-y-4">
      {/* Primary Verdict Hero Card */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br ${statusBg} shadow-xl backdrop-blur-sm`}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Plain English Verdict */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 border border-slate-700 text-slate-200">
                {isCompany ? <Building className="w-3.5 h-3.5 text-cyan-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                {taxpayerData.name || 'Taxpayer'} ({taxpayerData.pan})
              </span>

              {/* Legal Filing Requirement Badge with Tooltip */}
              <Tooltip
                section="Section 139(1) of Income Tax Act"
                text="The Income Tax Act mandates return filing if your total earnings exceed the basic exemption limit (₹3L) or if TDS deducted exceeds ₹25,000."
              >
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    filingEligibility.isMandatory
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {filingEligibility.isMandatory ? 'Tax Return Filing Required' : 'Filing is Optional'}
                </span>
              </Tooltip>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/60 text-slate-400 border border-slate-700/50">
                Tax Year {assessment.assessmentYear}
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Your Tax Assessment Result
              </div>
              <div className="flex items-center space-x-3">
                {statusIcon}
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${headlineColor}`}>
                  {headline}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {statusDescription}
              </p>
            </div>

            {/* Plain English Recommendation Tag */}
            {!isCompany && savings > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>{recommendedRegime === 'NEW' ? 'Simplified Plan (New Regime)' : 'Deductions Plan (Old Regime)'}</strong> saves you{' '}
                  <strong className="text-emerald-300 font-bold">{formatINR(savings)}</strong> in tax!
                </span>
              </div>
            )}
          </div>

          {/* Right: Balance Callout */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 shrink-0">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-left lg:text-right min-w-[210px]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Calculated Tax
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {formatINR(totalLiability)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Minus Taxes Already Paid:{' '}
                <span className="text-emerald-400 font-medium">-{formatINR(totalPrepaidTaxes)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between lg:justify-end gap-2">
                <span className="text-xs text-slate-400">
                  {taxStatus === 'PAYABLE' ? 'Balance to Pay:' : taxStatus === 'REFUND' ? 'Refund Due:' : 'Net Tax:'}
                </span>
                <span className={`text-base font-extrabold font-mono ${headlineColor}`}>
                  {formatINR(netAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain English Filing Reasons */}
        {filingEligibility.reasons.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" /> Why this filing status applies to you:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
              {filingEligibility.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4 User-Friendly KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Earnings */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Gross Total Income (GTI)"
              text="Your total income before any standard salary deductions or tax-saving investment exemptions are subtracted."
            >
              {isCompany ? 'Business Turnover' : 'Total Money Earned'}
            </Tooltip>
            <Receipt className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
            {formatINR(grossIncome)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {taxpayerData.matchedItems?.length || 0} income lines verified
          </div>
        </div>

        {/* Card 2: Taxable Earnings */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Net Taxable Income (NTI)"
              text="The final portion of your earnings that is actually subject to tax after subtracting standard deductions and tax-saving investments."
            >
              Taxable Earnings
            </Tooltip>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
            {formatINR(taxableIncome)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            After standard deductions & discounts
          </div>
        </div>

        {/* Card 3: Taxes Already Paid */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Pre-paid Taxes (TDS, TCS & Advance Tax)"
              text="Taxes already deducted from your paycheck (Form 16 TDS), bank interest, or client payments, plus advance taxes you deposited."
            >
              Taxes Already Paid
            </Tooltip>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">
            {formatINR(totalPrepaidTaxes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            TDS deducted + advance tax deposits
          </div>
        </div>

        {/* Card 4: Final Settlement */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Net Tax Payable or Refund"
              text="The final bottom line: if you paid less than you owe, you pay the balance. If you had more deducted than you owe, you get a direct bank refund!"
            >
              Final Result
            </Tooltip>
            {taxStatus === 'PAYABLE' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className={`text-lg sm:text-xl font-extrabold font-mono ${headlineColor}`}>
            {formatINR(netAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {taxStatus === 'PAYABLE'
              ? 'Pay balance online before filing'
              : taxStatus === 'REFUND'
              ? 'Direct refund to your bank account'
              : 'Zero tax owed'}
          </div>
        </div>
      </div>
    </div>
  );
}
