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
  User,
  Percent,
  Wallet,
  PieChart,
  Clock,
  Calendar,
  ShieldCheck,
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

  // Key Advanced Stats
  const effectiveTaxRate = chosenResult?.effectiveTaxRate !== undefined 
    ? Number(chosenResult.effectiveTaxRate)
    : (grossIncome > 0 ? Number(((totalLiability / grossIncome) * 100).toFixed(1)) : 0);
  
  const takeHomeIncome = chosenResult?.takeHomeIncome ?? Math.max(0, grossIncome - totalLiability);
  const takeHomePercentage = chosenResult?.takeHomePercentage !== undefined
    ? Number(chosenResult.takeHomePercentage)
    : (grossIncome > 0 ? Number((((grossIncome - totalLiability) / grossIncome) * 100).toFixed(1)) : 100);

  const marginalRate = chosenResult?.marginalRate ?? 0;
  const advanceTaxStatus = assessment?.advanceTaxStatus;

  // Income Sources Distribution Data
  const salaryVal = Math.max(0, Number(taxpayerData.salaryIncome) || 0);
  const houseVal = Math.max(0, Number(taxpayerData.housePropertyIncome) || 0);
  const bizVal = Math.max(0, Number(taxpayerData.businessIncome) || Number(taxpayerData.turnover) || 0);
  const cgVal = (Number(taxpayerData.stcg111A) || 0) + (Number(taxpayerData.ltcg112A) || 0) + (Number(taxpayerData.cryptoVDA) || 0);
  const otherVal = (Number(taxpayerData.savingsInterest) || 0) + (Number(taxpayerData.fdInterest) || 0) + (Number(taxpayerData.dividendIncome) || 0) + (Number(taxpayerData.otherMiscIncome) || Number(taxpayerData.otherSourcesIncome) || 0);
  const totalStreamIncome = salaryVal + houseVal + bizVal + cgVal + otherVal || grossIncome || 1;

  const incomeStreams = [
    { label: 'Salary', value: salaryVal, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'Business / Freelance', value: bizVal, color: 'bg-purple-500', textColor: 'text-purple-400' },
    { label: 'Rental Income', value: houseVal, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
    { label: 'Capital Gains & Crypto', value: cgVal, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { label: 'Interest & Dividends', value: otherVal, color: 'bg-blue-500', textColor: 'text-blue-400' },
  ].filter(s => s.value > 0);

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

      {/* Row 3: Advanced Efficiency KPIs & Retention Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Effective Tax Rate */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Effective Tax Rate"
              text="The actual average percentage of your gross income that goes towards taxes, taking into account tax-free slabs, deductions, and 87A rebate."
            >
              Effective Tax Rate
            </Tooltip>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-extrabold text-purple-300 font-mono">
              {effectiveTaxRate}%
            </span>
            <span className="text-[11px] text-slate-500">of total earnings</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, effectiveTaxRate)}%` }} 
            />
          </div>
        </div>

        {/* Metric 2: In-Pocket / Take-Home Income */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Post-Tax Net Retained Income"
              text="Total earnings that stay directly in your bank account after all income taxes and cess are accounted for."
            >
              Take-Home / In-Pocket
            </Tooltip>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
            {formatINR(takeHomeIncome)}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 truncate">
            {takeHomePercentage}% of earnings retained
          </div>
        </div>

        {/* Metric 3: Top Slab / Marginal Tax Rate */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Marginal Tax Bracket"
              text="The tax rate that applies to your next rupee of income. Knowing your highest slab helps evaluate bonuses, investments, or moonlighting income."
            >
              Highest Tax Bracket
            </Tooltip>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono">
            {marginalRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Marginal tax slab on additional income
          </div>
        </div>

        {/* Metric 4: Strategy Advantage / Advance Tax */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <Tooltip
              section="Tax Plan Optimization"
              text="The net monetary tax saving achieved by choosing the optimal tax regime or tax-saving provisions."
            >
              Tax Plan Advantage
            </Tooltip>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
            {!isCompany && savings > 0 ? formatINR(savings) : 'Optimal'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {!isCompany && savings > 0 ? `Saved via ${recommendedRegime === 'NEW' ? 'Simplified' : 'Deductions'} plan` : 'Zero excess tax liability'}
          </div>
        </div>
      </div>

      {/* Advance Tax Compliance Tracker (Section 208) */}
      {advanceTaxStatus && (advanceTaxStatus.isMandatory || advanceTaxStatus.isDeficit) && (
        <div className={`rounded-xl border p-4 sm:p-5 transition-all ${
          advanceTaxStatus.isDeficit 
            ? 'bg-amber-950/20 border-amber-500/30' 
            : 'bg-slate-900/40 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 shrink-0 ${advanceTaxStatus.isDeficit ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Quarterly Advance Tax Compliance</span>
                  <Tooltip
                    section="Section 208 / 234B / 234C"
                    text="If your estimated tax liability after deducting TDS exceeds ₹10,000, you are legally obligated to deposit advance tax in 4 quarterly installments (June 15, Sept 15, Dec 15, March 15). Failure triggers penal interest @ 1% per month u/s 234B & 234C."
                  >
                    <span className="text-[10px] font-semibold text-slate-400 hover:text-amber-300 underline cursor-pointer">
                      (Section 208 Rule)
                    </span>
                  </Tooltip>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {advanceTaxStatus.isDeficit
                    ? `Shortfall of ${formatINR(advanceTaxStatus.deficit)} detected. Pay before March 15 to avoid interest penalties.`
                    : 'Your advance tax installments are on track with statutory guidelines.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto text-right">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-500">Advance Tax Required</div>
                <div className="text-sm font-bold font-mono text-white">{formatINR(advanceTaxStatus.requiredTotal)}</div>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Deposited So Far</div>
                <div className="text-sm font-bold font-mono text-cyan-400">{formatINR(advanceTaxStatus.deposited)}</div>
              </div>
            </div>
          </div>

          {/* 4 Quarterly Milestones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Q1 (15 June)</span>
                <span className="text-emerald-400 font-bold">15%</span>
              </div>
              <div className="font-mono text-xs text-slate-200">
                {formatINR(Math.round(advanceTaxStatus.requiredTotal * 0.15))}
              </div>
            </div>

            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Q2 (15 Sept)</span>
                <span className="text-emerald-400 font-bold">45%</span>
              </div>
              <div className="font-mono text-xs text-slate-200">
                {formatINR(Math.round(advanceTaxStatus.requiredTotal * 0.45))}
              </div>
            </div>

            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Q3 (15 Dec)</span>
                <span className="text-emerald-400 font-bold">75%</span>
              </div>
              <div className="font-mono text-xs text-slate-200">
                {formatINR(Math.round(advanceTaxStatus.requiredTotal * 0.75))}
              </div>
            </div>

            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                <span>Q4 (15 March)</span>
                <span className="text-emerald-400 font-bold">100%</span>
              </div>
              <div className="font-mono text-xs text-slate-200">
                {formatINR(advanceTaxStatus.requiredTotal)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics: Income Distribution & Plan Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income Sources Distribution Bar */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Income Distribution Breakdown
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total {formatINR(totalStreamIncome)}
            </span>
          </div>

          {/* Proportional Segmented Bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
            {incomeStreams.map((stream, idx) => {
              const pct = ((stream.value / totalStreamIncome) * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className={`${stream.color} h-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${stream.label}: ${formatINR(stream.value)} (${pct}%)`}
                />
              );
            })}
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            {incomeStreams.map((stream, idx) => {
              const pct = ((stream.value / totalStreamIncome) * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
                  <span className={`w-2 h-2 rounded-full ${stream.color}`} />
                  <span className="text-slate-400">{stream.label}:</span>
                  <span className={`font-mono font-bold ${stream.textColor}`}>{formatINR(stream.value)}</span>
                  <span className="text-slate-500 text-[10px]">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tax Plans Comparison Visual Bar */}
        {!isCompany && assessment.newRegime && assessment.oldRegime && (
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Plan Tax Liability Comparison
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {recommendedRegime === 'NEW' ? 'Simplified Plan Wins' : 'Deductions Plan Wins'}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {/* Simplified Plan Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    Simplified Plan (New Regime)
                    {recommendedRegime === 'NEW' && <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">Recommended</span>}
                  </span>
                  <span className="font-mono font-bold text-white">{formatINR(assessment.newRegime.totalTaxLiability)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, Math.min(100, (assessment.newRegime.totalTaxLiability / Math.max(assessment.newRegime.totalTaxLiability, assessment.oldRegime.totalTaxLiability, 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Deductions Plan Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    Deductions Plan (Old Regime)
                    {recommendedRegime === 'OLD' && <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">Recommended</span>}
                  </span>
                  <span className="font-mono font-bold text-white">{formatINR(assessment.oldRegime.totalTaxLiability)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, Math.min(100, (assessment.oldRegime.totalTaxLiability / Math.max(assessment.newRegime.totalTaxLiability, assessment.oldRegime.totalTaxLiability, 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/60">
              <span>Net Tax Difference:</span>
              <span className="font-mono font-bold text-emerald-300">
                {formatINR(assessment.savings)} savings
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
