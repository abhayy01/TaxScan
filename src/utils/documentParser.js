import * as pdfjsLib from 'pdfjs-dist';
import { ENTITY_TYPES, CORPORATE_REGIMES } from './taxCalculator';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from uploaded PDF file using pdfjs-dist.
 * Reconstructs visual table layout by sorting items by coordinates (Y top-to-bottom, X left-to-right).
 */
export async function extractTextFromPDF(file, password = '') {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    password: password || undefined,
  });

  try {
    const pdf = await loadingTask.promise;
    let fullText = '';
    const allLines = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      
      const items = content.items.slice();
      if (items.length === 0) continue;

      // In PDF coordinates, Y goes from bottom (0) to top (height)
      // Sort items descending by Y (top of page first), then ascending by X (left to right)
      items.sort((a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        if (Math.abs(yA - yB) > 4) {
          return yB - yA; // top to bottom
        }
        return a.transform[4] - b.transform[4]; // left to right
      });

      // Group items on roughly the same line (within 4 points)
      let currentLineY = null;
      let currentLineTokens = [];

      for (const item of items) {
        const str = item.str.trim();
        if (!str) continue;
        const y = item.transform[5];

        if (currentLineY === null || Math.abs(currentLineY - y) > 4) {
          if (currentLineTokens.length > 0) {
            const lineStr = currentLineTokens.join(' ');
            allLines.push(lineStr);
            fullText += lineStr + '\n';
          }
          currentLineY = y;
          currentLineTokens = [str];
        } else {
          currentLineTokens.push(str);
        }
      }

      if (currentLineTokens.length > 0) {
        const lineStr = currentLineTokens.join(' ');
        allLines.push(lineStr);
        fullText += lineStr + '\n';
      }
    }

    return { success: true, text: fullText, lines: allLines };
  } catch (err) {
    if (
      err.name === 'PasswordException' ||
      err.message?.toLowerCase().includes('password') ||
      err.code === 1 ||
      err.code === 2
    ) {
      return {
        success: false,
        requiresPassword: true,
        isIncorrect: err.code === 2 || err.message?.toLowerCase().includes('incorrect'),
        message: err.code === 2 ? 'Incorrect password provided.' : 'This PDF is password protected.',
      };
    }
    throw err;
  }
}

/**
 * Detect entity type from 4th character of PAN:
 * P = Individual, C = Company, F = Firm/LLP, H = HUF, T = Trust
 */
export function detectEntityTypeFromPAN(pan) {
  if (!pan || pan.length < 4) return ENTITY_TYPES.INDIVIDUAL;
  const fourthChar = pan.charAt(3).toUpperCase();
  switch (fourthChar) {
    case 'C':
      return ENTITY_TYPES.COMPANY_DOMESTIC;
    case 'F':
      return ENTITY_TYPES.LLP_FIRM;
    case 'H':
      return ENTITY_TYPES.HUF;
    default:
      return ENTITY_TYPES.INDIVIDUAL;
  }
}

/**
 * Helper to extract monetary amounts from a text snippet.
 * Handles Indian numbering formats: 12,50,000.00, 1250000, 1,25,000, etc.
 * Filters out years, dates, pincodes, phone numbers, and statutory section numbers.
 */
function extractAmountsFromSnippet(snippet) {
  if (!snippet) return [];
  // Match currency or number sequences
  const matches = snippet.match(/₹?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]{3,12}(?:\.[0-9]{1,2})?)/g);
  if (!matches) return [];

  const amounts = [];
  for (const m of matches) {
    const clean = m.replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) continue;

    // Filter out typical tax year numbers (e.g. 2020 through 2030) when standalone
    if (num >= 2020 && num <= 2030 && !m.includes(',') && !m.includes('.')) continue;
    // Filter out standard dates / calendar years
    if (num === 1961 || num === 2000 || num === 2024 || num === 2025) continue;
    // Filter out common section numbers
    if ([10, 16, 17, 24, 44, 50, 54, 56, 80, 87, 111, 112, 115, 139, 140, 192, 194, 206, 208, 234].includes(num)) continue;
    // Filter out 6-digit Indian PIN codes if without comma/dot
    if (num >= 110000 && num <= 999999 && !m.includes(',') && !m.includes('.')) continue;
    // Filter out 10-digit mobile phone numbers if without comma/dot
    if (num >= 6000000000 && num <= 9999999999 && !m.includes(',') && !m.includes('.')) continue;
    // Filter out trivial counts or small amounts (< 50)
    if (num < 50) continue;

    amounts.push(num);
  }
  return amounts;
}

/**
 * Intelligent regex and structural scanner for TIS / AIS / ITR text
 */
export function parseTaxDocumentText(text, fileName = '', lines = []) {
  const rawText = text;
  const lowerText = text.toLowerCase();
  const textLines = lines.length > 0 ? lines : text.split('\n');

  // 1. Extract PAN (5 letters, 4 numbers, 1 letter)
  const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/i);
  const pan = panMatch ? panMatch[0].toUpperCase() : 'ABCDE1234F';
  const entityType = detectEntityTypeFromPAN(pan);

  // 2. Extract Name
  let name = 'Assessee / Taxpayer';
  const namePatterns = [
    /(?:Name of the Assessee|Taxpayer Name|Name of the Taxpayer|Name)\s*[:\-]?\s*([A-Za-z\s.\-]{3,40})/i,
    /([A-Z\s]{4,30})\s+(?:PAN|Permanent Account Number)/i,
    /(?:Shri|Smt|Mr\.|Ms\.|M\/s)\s+([A-Za-z\s.\-]{3,40})/i,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && !match[1].toLowerCase().includes('permanent') && !match[1].toLowerCase().includes('taxpayer')) {
      name = match[1].trim();
      break;
    }
  }

  // 3. Extract Assessment Year & Financial Year
  let assessmentYear = '2025-26';
  let financialYear = '2024-25';
  const ayMatch = text.match(/(?:AY|Assessment Year)\s*[:\-]?\s*(202[3-6]-[2-7]{2})/i);
  if (ayMatch) {
    assessmentYear = ayMatch[1];
    const startYear = parseInt(assessmentYear.split('-')[0]) - 1;
    const endYear = (startYear + 1).toString().slice(2);
    financialYear = `${startYear}-${endYear}`;
  }

  const extracted = {
    pan,
    name,
    entityType,
    assessmentYear,
    financialYear,
    fileName,
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
    confidenceScore: 90,
    matchedItems: [],
    detectedCandidates: [], // All detected monetary amounts from the file
  };

  const allDetectedAmounts = [];

  /**
   * Scan textLines looking for lines matching any keyword.
   * If a line matches, examine that line and the following 2 lines.
   */
  const scanCategoryFromLines = (keywords, excludeKeywords = []) => {
    let foundAmounts = [];

    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const lowerLine = line.toLowerCase();

      // Check if line matches any keyword
      const matchesKeyword = keywords.some(kw => lowerLine.includes(kw.toLowerCase()));
      if (!matchesKeyword) continue;

      // Check exclusions
      const hasExcluded = excludeKeywords.some(ex => lowerLine.includes(ex.toLowerCase()));
      if (hasExcluded) continue;

      // Window: Current line + next 2 lines
      const windowSnippet = [
        line,
        textLines[i + 1] || '',
        textLines[i + 2] || '',
      ].join(' ');

      const amounts = extractAmountsFromSnippet(windowSnippet);
      if (amounts.length > 0) {
        // In TIS table: [Reported Value, Processed Value]
        // The processed value is the last amount in the row
        const chosenAmount = amounts[amounts.length - 1];
        foundAmounts.push({
          amount: chosenAmount,
          allRowAmounts: amounts,
          line: line.trim(),
        });
      }
    }

    return foundAmounts;
  };

  // 1. SALARY (S-001 / Section 17 / Form 16)
  const salaryMatches = scanCategoryFromLines(
    ['S-001', 'S_001', 'S001', 'Salary under section 17', 'Gross Salary', 'Income from Salary', 'Salary / Pension', 'Salary'],
    ['total salary income', 'deduction under 16', 'deduction under section 16']
  );
  if (salaryMatches.length > 0) {
    const maxSalary = Math.max(...salaryMatches.map(m => m.amount));
    if (maxSalary > 5000) {
      extracted.salaryIncome = maxSalary;
      extracted.matchedItems.push({ code: 'S-001', category: 'Salary Earnings (Form 16 / TIS)', value: maxSalary });
    }
  }

  // 2. SAVINGS BANK INTEREST (I-001)
  const savingsMatches = scanCategoryFromLines(
    ['I-001', 'I_001', 'I001', 'Interest from savings bank', 'Savings bank interest', 'Savings Bank Interest', 'Savings Interest']
  );
  if (savingsMatches.length > 0) {
    const sumSavings = savingsMatches.reduce((acc, m) => acc + m.amount, 0);
    const bestSavings = savingsMatches.length === 1 ? savingsMatches[0].amount : sumSavings;
    extracted.savingsInterest = bestSavings;
    extracted.matchedItems.push({ code: 'I-001', category: 'Savings Bank Interest', value: bestSavings });
  }

  // 3. FIXED DEPOSIT / TERM DEPOSIT INTEREST (I-002)
  const fdMatches = scanCategoryFromLines(
    ['I-002', 'I_002', 'I002', 'Interest from deposit', 'Fixed deposit interest', 'Term deposit interest', 'Time deposit', 'FD Interest']
  );
  if (fdMatches.length > 0) {
    const bestFD = fdMatches.length === 1 ? fdMatches[0].amount : fdMatches.reduce((acc, m) => acc + m.amount, 0);
    extracted.fdInterest = bestFD;
    extracted.matchedItems.push({ code: 'I-002', category: 'Fixed Deposit (FD) Interest', value: bestFD });
  }

  // 4. DIVIDEND (D-001)
  const divMatches = scanCategoryFromLines(
    ['D-001', 'D_001', 'D001', 'Dividend', 'Dividends', 'Dividend Income']
  );
  if (divMatches.length > 0) {
    const bestDiv = divMatches.length === 1 ? divMatches[0].amount : divMatches.reduce((acc, m) => acc + m.amount, 0);
    extracted.dividendIncome = bestDiv;
    extracted.matchedItems.push({ code: 'D-001', category: 'Stock & Mutual Fund Dividends', value: bestDiv });
  }

  extracted.otherSourcesIncome = extracted.savingsInterest + extracted.fdInterest + extracted.dividendIncome;

  // 5. RENT / HOUSE PROPERTY (R-001)
  const rentMatches = scanCategoryFromLines(
    ['R-001', 'R_001', 'R001', 'Rent received', 'Income from House Property', '194-IB', '194I']
  );
  if (rentMatches.length > 0) {
    const bestRent = Math.max(...rentMatches.map(m => m.amount));
    extracted.housePropertyIncome = bestRent;
    extracted.matchedItems.push({ code: 'R-001', category: 'Rental Earnings', value: bestRent });
  }

  // 6. CAPITAL GAINS (S-004 / 111A / 112A)
  const stcgMatches = scanCategoryFromLines(['111A', 'STCG', 'Short term capital gains', 'Equity STCG']);
  const ltcgMatches = scanCategoryFromLines(['112A', 'LTCG', 'Long term capital gains', 'S-004', 'Sale of securities', 'Mutual fund sale']);
  if (stcgMatches.length > 0) {
    const bestSTCG = Math.max(...stcgMatches.map(m => m.amount));
    if (bestSTCG > 1000) {
      extracted.stcg111A = bestSTCG;
      extracted.matchedItems.push({ code: 'STCG-111A', category: 'Short-Term Stock Market Profits', value: bestSTCG });
    }
  }
  if (ltcgMatches.length > 0) {
    const bestLTCG = Math.max(...ltcgMatches.map(m => m.amount));
    if (bestLTCG > 1000) {
      extracted.ltcg112A = bestLTCG;
      extracted.matchedItems.push({ code: 'LTCG-112A', category: 'Long-Term Stock Market Profits', value: bestLTCG });
    }
  }

  // 7. BUSINESS / PROFESSION (194C / 194J / 44AD / 44ADA)
  const businessMatches = scanCategoryFromLines(
    ['194J', '194C', 'Professional fees', 'Contract receipts', 'Turnover', 'Gross receipts', 'Gross Turnover', 'Business receipts']
  );
  if (businessMatches.length > 0) {
    const maxBiz = Math.max(...businessMatches.map(m => m.amount));
    if (maxBiz > 10000) {
      extracted.turnover = maxBiz;
      if (entityType === ENTITY_TYPES.INDIVIDUAL) {
        extracted.businessIncome = Math.round(maxBiz * 0.50);
      } else {
        extracted.netProfit = Math.round(maxBiz * 0.15);
        extracted.businessIncome = extracted.netProfit;
      }
      extracted.matchedItems.push({ code: 'BIZ-REV', category: 'Business / Professional Earnings', value: maxBiz });
    }
  }

  // 8. TAXES PRE-PAID (TDS, TCS, Advance Tax, Self-Assessment Tax)
  const tdsSalaryMatches = scanCategoryFromLines(['TDS on Salary', '192 TDS', 'Tax deducted on salary', 'Total TDS on Salary', 'TDS-01', 'Sec 192', 'Section 192']);
  const tdsOtherMatches = scanCategoryFromLines(['TDS on other', '194 TDS', 'Tax Deducted at Source', 'Total TDS', 'TDS Credit', 'TDS-02', '194A', '194C', '194J', '194H', '194I', '194Q']);
  const advanceTaxMatches = scanCategoryFromLines(['Advance Tax', 'Advance Tax Paid', 'Challan 280', 'BSR Code', 'AT-01', 'Minor Head 100']);
  const selfAssessmentMatches = scanCategoryFromLines(['Self Assessment Tax', 'Self-Assessment Tax', 'SAT-01', 'Minor Head 300', '140A']);
  const tcsMatches = scanCategoryFromLines(['TCS', 'Tax Collected at Source', '206C', 'TCS-01']);

  if (tdsSalaryMatches.length > 0) {
    extracted.prepaid.tdsSalary = Math.max(...tdsSalaryMatches.map(m => m.amount));
    extracted.matchedItems.push({ code: 'TDS-SAL', category: 'Tax Deducted by Employer (TDS u/s 192)', value: extracted.prepaid.tdsSalary });
  }
  if (tdsOtherMatches.length > 0) {
    const val = Math.max(...tdsOtherMatches.map(m => m.amount));
    if (extracted.salaryIncome > 0 && extracted.prepaid.tdsSalary === 0) {
      extracted.prepaid.tdsSalary = val;
      extracted.matchedItems.push({ code: 'TDS-SAL', category: 'Tax Deducted (TDS)', value: val });
    } else {
      extracted.prepaid.tdsNonSalary = val;
      extracted.matchedItems.push({ code: 'TDS-OTH', category: 'TDS from Banks / Clients (Form 26AS)', value: val });
    }
  }
  if (advanceTaxMatches.length > 0) {
    extracted.prepaid.advanceTax = advanceTaxMatches.reduce((acc, m) => acc + m.amount, 0);
    extracted.matchedItems.push({ code: 'ADV-TAX', category: 'Advance Tax Deposited (Challan 280)', value: extracted.prepaid.advanceTax });
  }
  if (selfAssessmentMatches.length > 0) {
    extracted.prepaid.selfAssessmentTax = selfAssessmentMatches.reduce((acc, m) => acc + m.amount, 0);
    extracted.matchedItems.push({ code: 'SAT-01', category: 'Self-Assessment Tax Paid (Section 140A)', value: extracted.prepaid.selfAssessmentTax });
  }
  if (tcsMatches.length > 0) {
    extracted.prepaid.tcs = Math.max(...tcsMatches.map(m => m.amount));
    extracted.matchedItems.push({ code: 'TCS-01', category: 'Tax Collected at Source (Section 206C)', value: extracted.prepaid.tcs });
  }

  // 9. DEDUCTIONS (Chapter VI-A & Section 24b)
  const sec80CMatches = scanCategoryFromLines(['80C', 'Section 80C', 'Deduction under 80C', 'PPF', 'EPF', 'ELSS', '80CCC']);
  const sec80DMatches = scanCategoryFromLines(['80D', 'Section 80D', 'Health Insurance', 'Medical Insurance']);
  const sec80CCD1BMatches = scanCategoryFromLines(['80CCD(1B)', '80CCD1B', 'NPS Tier 1', 'National Pension System']);
  const sec80CCD2Matches = scanCategoryFromLines(['80CCD(2)', '80CCD2', 'Employer NPS']);
  const sec24bMatches = scanCategoryFromLines(['24(b)', '24b', 'Housing loan interest', 'Home loan interest', 'Interest on borrowed capital']);
  const sec80EMatches = scanCategoryFromLines(['80E', 'Section 80E', 'Education loan interest', 'Higher education loan']);
  const sec80GMatches = scanCategoryFromLines(['80G', 'Section 80G', 'Donation', 'Donations', 'PM CARES', 'PMNRF']);
  const sec80GGMatches = scanCategoryFromLines(['80GG', 'Section 80GG', 'Rent paid u/s 80GG']);

  if (sec80CMatches.length > 0) {
    extracted.deductions.sec80C = Math.min(150000, Math.max(...sec80CMatches.map(m => m.amount)));
    extracted.matchedItems.push({ code: 'SEC-80C', category: 'Section 80C (PPF/EPF/ELSS)', value: extracted.deductions.sec80C });
  }
  if (sec80DMatches.length > 0) {
    extracted.deductions.sec80D = Math.min(75000, Math.max(...sec80DMatches.map(m => m.amount)));
    extracted.matchedItems.push({ code: 'SEC-80D', category: 'Section 80D (Health Insurance)', value: extracted.deductions.sec80D });
  }
  if (sec80CCD1BMatches.length > 0) {
    extracted.deductions.sec80CCD1B = Math.min(50000, Math.max(...sec80CCD1BMatches.map(m => m.amount)));
    extracted.matchedItems.push({ code: 'SEC-80CCD1B', category: 'Section 80CCD(1B) (NPS)', value: extracted.deductions.sec80CCD1B });
  }
  if (sec80CCD2Matches.length > 0) {
    extracted.deductions.employerNPS = Math.max(...sec80CCD2Matches.map(m => m.amount));
    extracted.matchedItems.push({ code: 'SEC-80CCD2', category: 'Section 80CCD(2) (Employer NPS)', value: extracted.deductions.employerNPS });
  }
  if (sec24bMatches.length > 0) {
    extracted.deductions.section24b = Math.min(200000, Math.max(...sec24bMatches.map(m => m.amount)));
    extracted.matchedItems.push({ code: 'SEC-24B', category: 'Section 24(b) (Home Loan Interest)', value: extracted.deductions.section24b });
  }
  if (sec80EMatches.length > 0) {
    extracted.deductions.sec80E = Math.max(...sec80EMatches.map(m => m.amount));
    extracted.matchedItems.push({ code: 'SEC-80E', category: 'Section 80E (Education Loan Interest)', value: extracted.deductions.sec80E });
  }
  if (sec80GMatches.length > 0) {
    extracted.deductions.sec80G = Math.max(...sec80GMatches.map(m => m.amount));
    extracted.matchedItems.push({ code: 'SEC-80G', category: 'Section 80G (Charitable Donations)', value: extracted.deductions.sec80G });
  }
  if (sec80GGMatches.length > 0) {
    extracted.deductions.sec80GG = Math.min(60000, Math.max(...sec80GGMatches.map(m => m.amount)));
    extracted.matchedItems.push({ code: 'SEC-80GG', category: 'Section 80GG (Rent Paid)', value: extracted.deductions.sec80GG });
  }

  // 10. CRYPTO / VIRTUAL DIGITAL ASSETS (115BBH)
  const cryptoMatches = scanCategoryFromLines(['115BBH', 'Crypto', 'Virtual digital asset', 'VDA', 'WazirX', 'CoinDCX', 'Bitcoin']);
  if (cryptoMatches.length > 0) {
    extracted.cryptoVDA = Math.max(...cryptoMatches.map(m => m.amount));
    extracted.matchedItems.push({ code: 'CRYPTO-115BBH', category: 'Crypto / Virtual Assets (Section 115BBH)', value: extracted.cryptoVDA });
  }

  // =========================================================================
  // SMART FALLBACK RECOVERY:
  // If no primary income was mapped, scan all lines for substantial figures (> ₹10,000)
  // =========================================================================
  const totalMappedIncome = extracted.salaryIncome + extracted.businessIncome + extracted.turnover + extracted.otherSourcesIncome;
  
  if (totalMappedIncome === 0) {
    const candidateFigures = [];

    for (const line of textLines) {
      const lower = line.toLowerCase();
      // Look for lines that look like income or total rows
      const hasIncomeHint = /total|gross|income|earnings|receipt|taxable|amount|turnover|net|summary/i.test(lower);
      const amounts = extractAmountsFromSnippet(line);

      for (const amt of amounts) {
        if (amt >= 10000) {
          candidateFigures.push({
            amount: amt,
            line: line.trim(),
            hasIncomeHint,
          });
        }
      }
    }

    candidateFigures.sort((a, b) => b.amount - a.amount);

    if (candidateFigures.length > 0) {
      const topCandidate = candidateFigures[0];
      if (entityType === ENTITY_TYPES.COMPANY_DOMESTIC || entityType === ENTITY_TYPES.LLP_FIRM) {
        extracted.turnover = topCandidate.amount;
        extracted.taxableProfit = Math.round(topCandidate.amount * 0.15);
        extracted.netProfit = extracted.taxableProfit;
      } else {
        extracted.salaryIncome = topCandidate.amount;
      }
      extracted.matchedItems.push({
        code: 'SCAN-AUTO',
        category: 'Detected Total Earnings (Auto-Mapped from Summary Row)',
        value: topCandidate.amount,
      });
      extracted.confidenceScore = 75;
    }
  }

  // Collect candidate list for UI Inspector
  const candidateSet = new Set();
  for (const line of textLines) {
    const amounts = extractAmountsFromSnippet(line);
    for (const a of amounts) {
      if (a >= 500 && !candidateSet.has(a)) {
        candidateSet.add(a);
        allDetectedAmounts.push({
          amount: a,
          line: line.trim().slice(0, 80),
        });
      }
    }
  }
  extracted.detectedCandidates = allDetectedAmounts.slice(0, 8);

  return extracted;
}

/**
 * Parses JSON format exported directly from Income Tax Portal (AIS / TIS JSON)
 */
export function parseTISJSON(jsonData, fileName = 'ais_data.json') {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    const generalInfo = data.taxpayerInfo || data.generalInfo || data.assessee || data;
    const pan = generalInfo.pan || generalInfo.PAN || 'AABCA1234F';
    const name = generalInfo.taxpayerName || generalInfo.name || generalInfo.Name || 'Verified Taxpayer';
    const ay = generalInfo.assessmentYear || generalInfo.ay || '2025-26';
    const entityType = detectEntityTypeFromPAN(pan);

    const extracted = {
      pan,
      name,
      entityType,
      assessmentYear: ay,
      financialYear: '2024-25',
      fileName,
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
        sec80C: data.deductions?.sec80C || 0,
        sec80D: data.deductions?.sec80D || 0,
        sec80CCD1B: data.deductions?.sec80CCD1B || 0,
        section24b: data.deductions?.section24b || 0,
        employerNPS: data.deductions?.employerNPS || 0,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 0,
        tdsNonSalary: 0,
        tcs: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
      },
      confidenceScore: 98,
      matchedItems: [],
      detectedCandidates: [],
    };

    // Recursive search in JSON tree for AIS categories
    const categories = data.tisCategories || data.informationDetails || data.partB || data.categories || [];
    if (Array.isArray(categories)) {
      for (const item of categories) {
        const code = (item.infoCode || item.code || item.infoDesc || '').toUpperCase();
        // Support all common ITD JSON keys
        const amount = Number(item.processedVal || item.processedAmount || item.reportedVal || item.taxableAmount || item.amount || item.totalValue) || 0;
        const tds = Number(item.taxDeducted || item.tdsAmount || item.tds) || 0;

        if (code.includes('S-001') || code.includes('SALARY')) {
          extracted.salaryIncome += amount;
          extracted.prepaid.tdsSalary += tds;
          extracted.matchedItems.push({ code: 'S-001', category: 'Salary Earnings', value: amount });
        } else if (code.includes('I-001') || code.includes('SAVINGS')) {
          extracted.savingsInterest += amount;
          extracted.matchedItems.push({ code: 'I-001', category: 'Savings Bank Interest', value: amount });
        } else if (code.includes('I-002') || code.includes('DEPOSIT') || code.includes('FD')) {
          extracted.fdInterest += amount;
          extracted.prepaid.tdsNonSalary += tds;
          extracted.matchedItems.push({ code: 'I-002', category: 'FD / Term Deposit Interest', value: amount });
        } else if (code.includes('D-001') || code.includes('DIVIDEND')) {
          extracted.dividendIncome += amount;
          extracted.prepaid.tdsNonSalary += tds;
          extracted.matchedItems.push({ code: 'D-001', category: 'Dividends', value: amount });
        } else if (code.includes('R-001') || code.includes('RENT')) {
          extracted.housePropertyIncome += amount;
          extracted.prepaid.tdsNonSalary += tds;
          extracted.matchedItems.push({ code: 'R-001', category: 'Rental Earnings', value: amount });
        } else if (code.includes('STCG') || code.includes('111A')) {
          extracted.stcg111A += amount;
          extracted.matchedItems.push({ code: 'STCG-111A', category: 'Stock Profits (Short-Term)', value: amount });
        } else if (code.includes('LTCG') || code.includes('112A') || code.includes('S-004')) {
          extracted.ltcg112A += amount;
          extracted.matchedItems.push({ code: 'LTCG-112A', category: 'Stock Profits (Long-Term)', value: amount });
        } else if (code.includes('BUSINESS') || code.includes('TURNOVER') || code.includes('194C') || code.includes('194J')) {
          extracted.turnover += amount;
          extracted.prepaid.tdsNonSalary += tds;
          extracted.matchedItems.push({ code: 'TURNOVER', category: 'Business / Professional Turnover', value: amount });
        }
      }
    } else {
      extracted.salaryIncome = Number(data.salaryIncome || data.salary || data.grossSalary) || 0;
      extracted.savingsInterest = Number(data.savingsInterest || data.savingsBankInterest) || 0;
      extracted.fdInterest = Number(data.fdInterest || data.depositInterest) || 0;
      extracted.dividendIncome = Number(data.dividendIncome || data.dividends) || 0;
      extracted.turnover = Number(data.turnover || data.grossTurnover) || 0;
      extracted.netProfit = Number(data.netProfit || data.taxableProfit) || 0;
      extracted.stcg111A = Number(data.stcg111A || data.stcg) || 0;
      extracted.ltcg112A = Number(data.ltcg112A || data.ltcg) || 0;
      extracted.cryptoVDA = Number(data.cryptoVDA || data.crypto) || 0;
      extracted.prepaid.tdsSalary = Number(data.tdsSalary || data.prepaid?.tdsSalary) || 0;
      extracted.prepaid.tdsNonSalary = Number(data.tdsNonSalary || data.prepaid?.tdsNonSalary) || 0;
      extracted.prepaid.advanceTax = Number(data.advanceTax || data.prepaid?.advanceTax) || 0;
    }

    extracted.otherSourcesIncome = extracted.savingsInterest + extracted.fdInterest + extracted.dividendIncome;

    return extracted;
  } catch (err) {
    console.error('Error parsing JSON TIS:', err);
    return null;
  }
}
