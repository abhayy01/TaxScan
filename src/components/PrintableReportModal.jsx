import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Download } from 'lucide-react';
import { formatINR } from '../utils/taxCalculator';

export default function PrintableReportModal({ isOpen, onClose, assessment, taxpayerData }) {
  if (!isOpen || !assessment) return null;

  const handlePrint = () => {
    window.print();
  };

  const { chosenResult, totalPrepaidTaxes, netTaxDifference, taxStatus, netAmount, filingEligibility } = assessment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:w-full print:max-w-none">
        {/* Modal Top Bar (hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Tax Assessment & Eligibility Summary Report</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div className="p-8 sm:p-10 space-y-6 text-xs sm:text-sm font-sans" id="printable-report">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                INCOME TAX ASSESSMENT SUMMARY & VERIFICATION
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Tax Liability Assessment Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Generated from TIS / AIS & Return Filing Data • As per Income Tax Act, 1961
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800 border border-slate-300">
                AY: {assessment.assessmentYear}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                FY: {taxpayerData.financialYear || '2024-25'}
              </div>
            </div>
          </div>

          {/* Taxpayer Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Taxpayer Name</div>
              <div className="font-bold text-slate-900 mt-0.5 text-sm">{taxpayerData.name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Permanent Account Number</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5 tracking-wider">{taxpayerData.pan}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Entity Classification</div>
              <div className="font-medium text-slate-900 mt-0.5">{taxpayerData.entityType}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Filing Status</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {filingEligibility.isMandatory ? 'Mandatory Filing' : 'Optional Filing'}
              </div>
            </div>
          </div>

          {/* Assessment Verdict Callout Box */}
          <div
            className={`p-4 rounded-xl border-2 ${
              taxStatus === 'PAYABLE'
                ? 'bg-red-50 border-red-300 text-red-900'
                : taxStatus === 'REFUND'
                ? 'bg-blue-50 border-blue-300 text-blue-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Assessment Final Verdict
                </span>
                <h2 className="text-xl font-black mt-0.5">
                  {taxStatus === 'PAYABLE' && `TAX PAYABLE: ${formatINR(netAmount)}`}
                  {taxStatus === 'REFUND' && `TAX REFUND DUE: ${formatINR(netAmount)}`}
                  {taxStatus === 'NIL' && 'ZERO TAX LIABILITY (NIL)'}
                </h2>
              </div>
              <div className="text-right font-mono text-xs">
                <div>Total Tax Computed: <strong>{formatINR(chosenResult?.totalTaxLiability || 0)}</strong></div>
                <div>Taxes Pre-Paid (TDS): <strong>-{formatINR(totalPrepaidTaxes)}</strong></div>
              </div>
            </div>
          </div>

          {/* Computation Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Income & Tax Computation Details
            </h4>
            <table className="w-full text-left border-collapse border border-slate-200">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold">
                  <td className="p-2.5">Gross Total Income / Business Revenue</td>
                  <td className="p-2.5 text-right font-mono">
                    {formatINR(chosenResult?.grossTotalIncome || chosenResult?.turnover || 0)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 text-slate-600 pl-6">Less: Standard Deduction</td>
                  <td className="p-2.5 text-right font-mono text-slate-700">
                    -{formatINR(chosenResult?.standardDeduction || 0)}
                  </td>
                </tr>
                {chosenResult?.chapterVIADeductions && (
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 text-slate-600 pl-6">Less: Chapter VI-A Deductions (80C, 80D, etc.)</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">
                      -{formatINR(chosenResult?.chapterVIADeductions.total || 0)}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-slate-200 font-bold bg-slate-100">
                  <td className="p-2.5">Net Taxable Income</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    {formatINR(chosenResult?.netTaxableIncome || chosenResult?.taxableProfit || 0)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5">Normal Income Tax as per applicable slabs / rates</td>
                  <td className="p-2.5 text-right font-mono">
                    {formatINR(chosenResult?.normalTax || chosenResult?.baseTax || 0)}
                  </td>
                </tr>
                {chosenResult?.rebate87A > 0 && (
                  <tr className="border-b border-slate-200 text-emerald-700">
                    <td className="p-2.5 pl-6">Less: Full Tax Rebate u/s 87A (Zero Tax)</td>
                    <td className="p-2.5 text-right font-mono">-{formatINR(chosenResult.rebate87A)}</td>
                  </tr>
                )}
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 pl-6">Health & Education Cess @ 4%</td>
                  <td className="p-2.5 text-right font-mono">+{formatINR(chosenResult?.cess || 0)}</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-100 font-extrabold">
                  <td className="p-2.5 text-slate-900">Total Tax Liability Chargeable</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    {formatINR(chosenResult?.totalTaxLiability || 0)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 text-cyan-800">
                  <td className="p-2.5">Less: Total Pre-Paid Taxes (TDS, TCS, Advance Tax)</td>
                  <td className="p-2.5 text-right font-mono">-{formatINR(totalPrepaidTaxes)}</td>
                </tr>
                <tr className="font-black text-base bg-slate-900 text-white">
                  <td className="p-3">Net Balance {taxStatus === 'PAYABLE' ? 'Payable' : 'Refund Due'}</td>
                  <td className="p-3 text-right font-mono">
                    {formatINR(netAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Sign-off */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
            <div>
              Verified by TaxScan AI Scanner Engine • Certified for AY {assessment.assessmentYear}
            </div>
            <div className="text-right italic">
              Electronically generated statement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
