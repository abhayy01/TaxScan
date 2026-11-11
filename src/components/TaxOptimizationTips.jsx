import React from 'react';
import { Lightbulb, Calendar, ShieldCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { formatINR } from '../utils/taxCalculator';

export default function TaxOptimizationTips({ assessment, taxpayerData }) {
  if (!assessment) return null;

  const { isCompany, recommendedRegime, newRegime, oldRegime } = assessment;

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Smart Tax Optimization & Compliance Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tip 1: Regime Selection Strategy */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Regime Strategy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {!isCompany ? (
              recommendedRegime === 'NEW' ? (
                <>
                  Under the <strong>New Tax Regime (Section 115BAC)</strong>, you benefit from lower tax slabs and a standard deduction of{' '}
                  <strong>{assessment.assessmentYear === '2025-26' ? '₹75,000' : '₹50,000'}</strong> without locking money in 80C instruments.
                </>
              ) : (
                <>
                  Because you claim substantial deductions (80C, 80D, 24b Home Loan), the <strong>Old Tax Regime</strong> saves you{' '}
                  <strong>{formatINR(assessment.savings)}</strong> over the new regime.
                </>
              )
            ) : (
              <>
                For domestic companies, <strong>Section 115BAA</strong> provides an all-inclusive effective rate of <strong>25.168%</strong> and completely exempts you from Minimum Alternate Tax (MAT u/s 115JB).
              </>
            )}
          </p>
        </div>

        {/* Tip 2: Section 87A & Deductions */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {isCompany ? 'Advance Tax Slabs' : '87A Rebate & Relief'}
            </span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {!isCompany ? (
              newRegime?.rebate87A > 0 ? (
                <>
                  🎉 <strong>100% Tax Rebate Applied:</strong> Taxable income is within ₹7,00,000, so entire tax liability is eliminated under Section 87A!
                </>
              ) : (
                <>
                  You can claim an additional <strong>₹50,000</strong> deduction under Section 80CCD(1B) by investing in the National Pension System (NPS), saving up to <strong>₹15,600</strong> in taxes under Old Regime.
                </>
              )
            ) : (
              <>
                Pay Advance Tax quarterly (15% by June 15, 45% by Sep 15, 75% by Dec 15, 100% by March 15) to avoid mandatory penal interest under <strong>Sections 234B & 234C</strong>.
              </>
            )}
          </p>
        </div>

        {/* Tip 3: Compliance & Deadlines */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Filing Deadlines</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Filing deadline for non-audit individuals is <strong>July 31</strong>. Filing after the due date attracts a mandatory late filing fee of up to{' '}
            <strong>₹5,000</strong> under <strong>Section 234F</strong> and interest @ 1% per month under Section 234A.
          </p>
        </div>
      </div>
    </div>
  );
}
