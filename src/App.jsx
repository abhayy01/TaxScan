import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import DocumentUploader from './components/DocumentUploader';
import VerdictBanner from './components/VerdictBanner';
import RegimeComparisonTable from './components/RegimeComparisonTable';
import IncomeEditorDrawer from './components/IncomeEditorDrawer';
import TaxOptimizationTips from './components/TaxOptimizationTips';
import PrintableReportModal from './components/PrintableReportModal';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { evaluateTaxAssessment, ENTITY_TYPES } from './utils/taxCalculator';
import { FileSpreadsheet, ShieldAlert, BookOpen, Layers, Sliders } from 'lucide-react';

export default function App() {
  const [assessmentYear, setAssessmentYear] = useState('2025-26');
  const [activeSampleId, setActiveSampleId] = useState('sample-salaried-rebate');
  const [taxpayerData, setTaxpayerData] = useState(() => SAMPLE_DOCUMENTS[0].data);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('comparison'); // 'comparison' | 'editor' | 'optimization'

  // Reactive Tax Assessment Engine
  const assessment = useMemo(() => {
    return evaluateTaxAssessment(taxpayerData, assessmentYear);
  }, [taxpayerData, assessmentYear]);

  const handleScanComplete = (extractedData) => {
    setTaxpayerData(extractedData);
  };

  const handleReset = () => {
    setActiveSampleId(null);
    setTaxpayerData({
      pan: 'ABCDE1234F',
      name: 'New Taxpayer',
      entityType: ENTITY_TYPES.INDIVIDUAL,
      assessmentYear,
      financialYear: '2024-25',
      salaryIncome: 0,
      housePropertyIncome: 0,
      savingsInterest: 0,
      fdInterest: 0,
      dividendIncome: 0,
      otherSourcesIncome: 0,
      businessIncome: 0,
      turnover: 0,
      netProfit: 0,
      stcg111A: 0,
      ltcg112A: 0,
      cryptoVDA: 0,
      deductions: {
        sec80C: 0,
        sec80D: 0,
        sec80CCD1B: 0,
        section24b: 0,
        employerNPS: 0,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 0,
        tdsNonSalary: 0,
        tcs: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
      },
      confidenceScore: 0,
      matchedItems: [],
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Bar */}
      <Navbar
        assessmentYear={assessmentYear}
        setAssessmentYear={setAssessmentYear}
        entityType={taxpayerData.entityType}
        setEntityType={(newType) => setTaxpayerData((prev) => ({ ...prev, entityType: newType }))}
        onReset={handleReset}
        onPrint={() => setIsReportOpen(true)}
        taxStatus={assessment.taxStatus}
        netAmount={assessment.netAmount}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              TaxScan AI — Plain-English Tax Summary
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload your Taxpayer Information Summary (TIS), AIS, or Form 16 to instantly find out if you owe taxes or get a refund. Hover over any item for legal section details.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Tax Calculator Active • AY {assessmentYear}
            </span>
          </div>
        </div>

        {/* Section 1: Document Scanner & Uploader */}
        <section>
          <DocumentUploader
            onScanComplete={handleScanComplete}
            currentData={taxpayerData}
            activeSampleId={activeSampleId}
            setActiveSampleId={setActiveSampleId}
          />
        </section>

        {/* Section 2: Big Verdict Banner (Answers: Is taxpayer eligible to pay taxes, and how much?) */}
        <section>
          <VerdictBanner
            assessment={assessment}
            taxpayerData={taxpayerData}
          />
        </section>

        {/* Section 3: Detailed Analysis Navigation Tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
              <button
                onClick={() => setActiveViewTab('comparison')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeViewTab === 'comparison'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{assessment.isCompany ? 'Company Tax Breakdown' : 'Compare Tax Plans (Which Saves More?)'}</span>
              </button>

              <button
                onClick={() => setActiveViewTab('editor')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeViewTab === 'editor'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Review & Adjust Figures</span>
              </button>

              <button
                onClick={() => setActiveViewTab('optimization')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeViewTab === 'optimization'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Money-Saving Tips</span>
              </button>
            </div>
          </div>

          {/* Tab Views */}
          {activeViewTab === 'comparison' && (
            <RegimeComparisonTable assessment={assessment} />
          )}

          {activeViewTab === 'editor' && (
            <IncomeEditorDrawer
              taxpayerData={taxpayerData}
              onChange={setTaxpayerData}
            />
          )}

          {activeViewTab === 'optimization' && (
            <TaxOptimizationTips
              assessment={assessment}
              taxpayerData={taxpayerData}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong>TaxScan AI</strong> • Designed for Indian Income Tax AY 2024-25 & AY 2025-26 (Individuals, HUFs, LLPs & Domestic Companies)
          </div>
          <div>
            Disclaimer: Estimates based on provisions of the Income Tax Act, 1961. Always consult a Chartered Accountant for final filings.
          </div>
        </div>
      </footer>

      {/* Printable Report Modal */}
      <PrintableReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        assessment={assessment}
        taxpayerData={taxpayerData}
      />
    </div>
  );
}
