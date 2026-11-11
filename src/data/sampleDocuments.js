import { ENTITY_TYPES, CORPORATE_REGIMES } from '../utils/taxCalculator';

export const SAMPLE_DOCUMENTS = [
  {
    id: 'sample-salaried-rebate',
    title: 'Salaried Professional (Zero Tax via 87A Rebate)',
    subtitle: 'Gross ₹6.95L • Eligible for Sec 87A Rebate • Gets TDS Refund',
    tag: 'Individual / Zero Tax',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    data: {
      pan: 'BPZPS1234A',
      name: 'Rahul Sharma',
      entityType: ENTITY_TYPES.INDIVIDUAL,
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      fileName: 'TIS_Rahul_Sharma_AY202526.pdf',
      salaryIncome: 680000,
      housePropertyIncome: 0,
      savingsInterest: 15000,
      fdInterest: 0,
      dividendIncome: 0,
      otherSourcesIncome: 15000,
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
        tdsSalary: 18500,
        tdsNonSalary: 0,
        tcs: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
      },
      confidenceScore: 99,
      matchedItems: [
        { code: 'S-001', category: 'Salary under Sec 17(1)', value: 680000 },
        { code: 'I-001', category: 'Savings Bank Interest', value: 15000 },
        { code: 'TDS-01', category: 'TDS deducted by Employer (Form 16)', value: 18500 },
      ]
    },
    rawText: `
INCOME TAX DEPARTMENT - GOVERNMENT OF INDIA
TAXPAYER INFORMATION SUMMARY (TIS)
Financial Year: 2024-25 | Assessment Year: 2025-26
Name of the Assessee: Rahul Sharma
PAN: BPZPS1234A | Status: Individual (Resident)

Part B - Information Category Details:
[S-001] Salary under section 17: ₹6,80,000 (TDS Deducted: ₹18,500)
[I-001] Interest from savings bank: ₹15,000
Total Gross Reported: ₹6,95,000
TDS Credited to PAN: ₹18,500
Status: Generated automatically from AIS
    `
  },
  {
    id: 'sample-tech-executive',
    title: 'Senior Tech Executive (High Earner Comparison)',
    subtitle: 'Gross ₹34.5L • Salary, Equity Capital Gains & Dividends • New vs Old Regime',
    tag: 'High Net Worth',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    data: {
      pan: 'AAAPI9876C',
      name: 'Ananya Iyer',
      entityType: ENTITY_TYPES.INDIVIDUAL,
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      fileName: 'TIS_Ananya_Iyer_AY202526.pdf',
      salaryIncome: 2850000,
      housePropertyIncome: 0,
      savingsInterest: 18000,
      fdInterest: 75000,
      dividendIncome: 65000,
      otherSourcesIncome: 158000,
      businessIncome: 0,
      turnover: 0,
      netProfit: 0,
      stcg111A: 180000,
      ltcg112A: 260000,
      cryptoVDA: 0,
      deductions: {
        sec80C: 150000,
        sec80D: 35000,
        sec80CCD1B: 50000,
        section24b: 180000,
        employerNPS: 120000,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 495000,
        tdsNonSalary: 14000,
        tcs: 12000,
        advanceTax: 80000,
        selfAssessmentTax: 0,
      },
      confidenceScore: 98,
      matchedItems: [
        { code: 'S-001', category: 'Salary income from Infosys Ltd', value: 2850000 },
        { code: 'I-002', category: 'Interest from HDFC Bank FD', value: 75000 },
        { code: 'D-001', category: 'Dividends from TCS & Reliance', value: 65000 },
        { code: 'S-004', category: 'Sale of Equity Shares (LTCG 112A)', value: 260000 },
        { code: 'S-004', category: 'Short-term equity gains (STCG 111A)', value: 180000 },
        { code: 'TDS-01', category: 'TDS on Salary & Non-Salary', value: 509000 },
        { code: 'ADV-01', category: 'Advance Tax Paid (Challan 280)', value: 80000 },
      ]
    },
    rawText: `
INCOME TAX DEPARTMENT - ANNUAL INFORMATION STATEMENT (AIS / TIS)
Assessment Year: 2025-26 | Financial Year: 2024-25
Taxpayer Name: Ananya Iyer
PAN: AAAPI9876C | Category: Individual

Summary Information:
[S-001] Salary under section 17: ₹28,50,000 | TDS: ₹4,95,000
[I-001] Interest from savings bank: ₹18,000
[I-002] Interest from term deposit: ₹75,000 | TDS: ₹7,500
[D-001] Dividend Income: ₹65,000 | TDS: ₹6,500
[S-004] STCG under section 111A: ₹1,80,000
[S-004] LTCG under section 112A: ₹2,60,000
Advance Tax Paid in Q2 & Q3: ₹80,000
TCS collected on foreign remittance: ₹12,000
    `
  },
  {
    id: 'sample-freelancer-consultant',
    title: 'Consultant / Freelancer (Presumptive 44ADA)',
    subtitle: 'Gross Receipts ₹36L • 194J TDS @ 10% • 50% Deemed Profit Scheme',
    tag: 'Professional / 44ADA',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    data: {
      pan: 'BPVPP4567D',
      name: 'Vikramaditya Patel',
      entityType: ENTITY_TYPES.INDIVIDUAL,
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      fileName: 'TIS_Vikram_Patel_Consulting.pdf',
      salaryIncome: 0,
      housePropertyIncome: 0,
      savingsInterest: 12000,
      fdInterest: 30000,
      dividendIncome: 0,
      otherSourcesIncome: 42000,
      businessIncome: 1800000, // 50% under 44ADA
      turnover: 3600000,
      netProfit: 1800000,
      stcg111A: 0,
      ltcg112A: 0,
      cryptoVDA: 0,
      deductions: {
        sec80C: 150000,
        sec80D: 25000,
        sec80CCD1B: 0,
        section24b: 0,
        employerNPS: 0,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 0,
        tdsNonSalary: 360000,
        tcs: 0,
        advanceTax: 60000,
        selfAssessmentTax: 0,
      },
      confidenceScore: 97,
      matchedItems: [
        { code: '194J', category: 'Professional Receipts (Tech Consultancy)', value: 3600000 },
        { code: '44ADA', category: 'Presumptive Net Profit (50%)', value: 1800000 },
        { code: 'TDS-194J', category: 'TDS deducted by Clients @ 10%', value: 360000 },
        { code: 'ADV-TAX', category: 'Advance Tax Paid by March 15', value: 60000 },
      ]
    },
    rawText: `
INCOME TAX DEPARTMENT - AIS SUMMARY
PAN: BPVPP4567D | Name: Vikramaditya Patel
Status: Individual Professional | AY: 2025-26

Category Details:
[B-001] Professional fees received under 194J: ₹36,00,000
Total TDS Deducted: ₹3,60,000
[I-001] Savings Interest: ₹12,000
[I-002] Deposit Interest: ₹30,000
Advance Tax Paid (Challan 280): ₹60,000
Taxpayer opted for Section 44ADA presumptive income (50% = ₹18,00,000).
    `
  },
  {
    id: 'sample-pvt-ltd-company',
    title: 'CloudApex Technologies Pvt Ltd (Domestic Company)',
    subtitle: 'Revenue ₹4.80 Cr • Net Profit ₹65L • Section 115BAA (22% Concessional Tax)',
    tag: 'Pvt Ltd Company',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    data: {
      pan: 'AABCC4321E',
      name: 'CloudApex Technologies Private Limited',
      entityType: ENTITY_TYPES.COMPANY_DOMESTIC,
      corporateRegime: CORPORATE_REGIMES.SECTION_115BAA,
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      fileName: 'Form26AS_CloudApex_Technologies_Pvt_Ltd.pdf',
      salaryIncome: 0,
      housePropertyIncome: 0,
      savingsInterest: 0,
      fdInterest: 140000,
      dividendIncome: 0,
      otherSourcesIncome: 140000,
      businessIncome: 6500000,
      turnover: 48000000,
      netProfit: 6500000,
      bookProfit: 6800000,
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
        tdsNonSalary: 480000,
        tcs: 0,
        advanceTax: 1050000,
        selfAssessmentTax: 0,
      },
      confidenceScore: 99,
      matchedItems: [
        { code: 'B-REV', category: 'Gross Business Turnover', value: 48000000 },
        { code: 'B-PROFIT', category: 'Net Taxable Profit (P&L)', value: 6500000 },
        { code: 'TDS-194C/J', category: 'TDS Credits in Form 26AS', value: 480000 },
        { code: 'ADV-TAX', category: 'Advance Tax 4 Installments Paid', value: 1050000 },
      ]
    },
    rawText: `
INCOME TAX DEPARTMENT - TAX CREDIT STATEMENT (FORM 26AS / TIS)
Assessment Year: 2025-26
Name of Assessee: CloudApex Technologies Private Limited
PAN: AABCC4321E | Entity: Domestic Company (Private Limited)

Financial Summary:
Gross Turnover from Software Exports & Domestic: ₹4,80,00,000
Net Taxable Profit as per computation: ₹65,00,000
Opted for Concessional Regime: Section 115BAA (22% Base + 10% Surcharge + 4% Cess = 25.168%)
TDS Deducted by Corporate Clients: ₹4,80,000
Advance Tax Paid via Challans: ₹10,50,000
Total Pre-paid Tax Credits: ₹15,30,000
    `
  },
  {
    id: 'sample-llp-firm',
    title: 'Apex Engineering Works LLP (Partnership / LLP)',
    subtitle: 'Turnover ₹2.20 Cr • Taxable Profit ₹28L • Flat 30% Tax Rate',
    tag: 'LLP / Firm',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    data: {
      pan: 'AAAFA5678K',
      name: 'Apex Engineering Works LLP',
      entityType: ENTITY_TYPES.LLP_FIRM,
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      fileName: 'TIS_Apex_Engineering_LLP.pdf',
      salaryIncome: 0,
      housePropertyIncome: 0,
      savingsInterest: 0,
      fdInterest: 50000,
      dividendIncome: 0,
      otherSourcesIncome: 50000,
      businessIncome: 2800000,
      turnover: 22000000,
      netProfit: 2800000,
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
        tdsNonSalary: 220000,
        tcs: 30000,
        advanceTax: 500000,
        selfAssessmentTax: 0,
      },
      confidenceScore: 98,
      matchedItems: [
        { code: 'B-TURNOVER', category: 'Manufacturing & Contract Turnover', value: 22000000 },
        { code: 'B-NET', category: 'Net Taxable Profit for LLP', value: 2800000 },
        { code: 'TDS-194C', category: 'TDS on Work Contracts', value: 220000 },
        { code: 'ADV-TAX', category: 'Advance Tax Paid (Challan 280)', value: 500000 },
      ]
    },
    rawText: `
INCOME TAX DEPARTMENT - TAXPAYER SUMMARY (TIS)
PAN: AAAFA5678K | Name: Apex Engineering Works LLP
Category: Limited Liability Partnership (LLP)
Assessment Year: 2025-26

Key Figures:
Manufacturing Turnover: ₹2,20,00,000
Taxable Profit after Partners Remuneration: ₹28,00,000
Applicable Tax Rate: 30% + 4% Health & Education Cess = 31.2%
TDS Deducted: ₹2,20,000 | TCS: ₹30,000
Advance Tax Paid: ₹5,00,000
    `
  },
  {
    id: 'sample-crypto-trader',
    title: 'Active Trader with Crypto & Equity (Special Rates)',
    subtitle: 'Salary ₹12L • ₹3.2L Crypto VDA (30%) • ₹2.1L STCG (20%)',
    tag: 'Trader / Crypto VDA',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    data: {
      pan: 'ABVPR9012M',
      name: 'Rohan Verma',
      entityType: ENTITY_TYPES.INDIVIDUAL,
      assessmentYear: '2025-26',
      financialYear: '2024-25',
      fileName: 'TIS_Rohan_Verma_Trader.pdf',
      salaryIncome: 1200000,
      housePropertyIncome: 0,
      savingsInterest: 14000,
      fdInterest: 26000,
      dividendIncome: 35000,
      otherSourcesIncome: 75000,
      businessIncome: 0,
      turnover: 0,
      netProfit: 0,
      stcg111A: 210000,
      ltcg112A: 180000,
      cryptoVDA: 320000,
      deductions: {
        sec80C: 150000,
        sec80D: 25000,
        sec80CCD1B: 0,
        section24b: 0,
        employerNPS: 0,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 85000,
        tdsNonSalary: 3200, // 1% 194S on crypto
        tcs: 0,
        advanceTax: 60000,
        selfAssessmentTax: 0,
      },
      confidenceScore: 96,
      matchedItems: [
        { code: 'S-001', category: 'Salary Income', value: 1200000 },
        { code: '115BBH', category: 'Virtual Digital Assets / Crypto Net Profit', value: 320000 },
        { code: 'STCG-111A', category: 'Short-term Capital Gains on Shares', value: 210000 },
        { code: 'LTCG-112A', category: 'Long-term Capital Gains on Shares', value: 180000 },
        { code: '194S', category: 'TDS on Crypto Transfers (1%)', value: 3200 },
        { code: 'ADV-TAX', category: 'Advance Tax Paid', value: 60000 },
      ]
    },
    rawText: `
INCOME TAX DEPARTMENT - AIS / TIS REPORT
PAN: ABVPR9012M | Name: Rohan Verma
Status: Individual | AY: 2025-26

Income Details:
[S-001] Salary: ₹12,00,000 | TDS: ₹85,000
[194S / 115BBH] Crypto Trading Net Proceeds: ₹3,20,000 | TDS: ₹3,200
[S-004] STCG (Sec 111A): ₹2,10,000
[S-004] LTCG (Sec 112A): ₹1,80,000
[I-001 & D-001] Other Sources: ₹75,000
Advance Tax Paid: ₹60,000
    `
  }
];
