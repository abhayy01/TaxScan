/**
 * Tax Calculator Engine for Indian Income Tax
 * Supports Individuals, HUF, Domestic Companies, Foreign Companies, and LLPs/Firms
 * Assessment Years: AY 2024-25 and AY 2025-26
 */

export const ENTITY_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  HUF: 'HUF',
  COMPANY_DOMESTIC: 'COMPANY_DOMESTIC',
  COMPANY_FOREIGN: 'COMPANY_FOREIGN',
  LLP_FIRM: 'LLP_FIRM',
};

export const CORPORATE_REGIMES = {
  SECTION_115BAA: 'SECTION_115BAA', // 22% flat + 10% surcharge + 4% cess = 25.168%
  SECTION_115BAB: 'SECTION_115BAB', // 15% flat for new manufacturing = 17.16%
  REGULAR_UNDER_400CR: 'REGULAR_UNDER_400CR', // 25% + surcharge + cess
  REGULAR_ABOVE_400CR: 'REGULAR_ABOVE_400CR', // 30% + surcharge + cess
};

/**
 * Format currency in Indian format (₹ Lakhs / Crores or comma separated)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Calculate Individual / HUF Tax under New Tax Regime (Section 115BAC)
 */
export function calculateIndividualNewRegime(data, ay = '2025-26') {
  const isAY2526 = ay === '2025-26';
  
  // Standard Deduction: ₹75,000 for AY 2025-26, ₹50,000 for AY 2024-25 (salary only)
  const stdDeductionCap = isAY2526 ? 75000 : 50000;
  const salaryIncome = Math.max(0, Number(data.salaryIncome) || 0);
  const standardDeduction = Math.min(salaryIncome, stdDeductionCap);
  
  const netSalary = Math.max(0, salaryIncome - standardDeduction);
  const houseProperty = Number(data.housePropertyIncome) || 0;
  const businessIncome = Math.max(0, Number(data.businessIncome) || 0);
  const otherSources = Math.max(0, Number(data.otherSourcesIncome) || 0);
  
  // Special rate incomes
  const stcg111A = Math.max(0, Number(data.stcg111A) || 0);
  const ltcg112A = Math.max(0, Number(data.ltcg112A) || 0);
  const cryptoVDA = Math.max(0, Number(data.cryptoVDA) || 0);
  
  // Normal taxable income (excluding special rate capital gains & crypto)
  const normalGrossIncome = Math.max(0, netSalary + houseProperty + businessIncome + otherSources);
  
  // Deductions allowed in New Regime are very limited (e.g., 80CCD(2) employer NPS)
  const employerNPS = Math.min(normalGrossIncome * 0.14, Math.max(0, Number(data.deductions?.employerNPS) || 0));
  const normalTaxableIncome = Math.max(0, normalGrossIncome - employerNPS);
  
  // Slabs Calculation
  let normalTax = 0;
  const slabBreakdown = [];

  if (isAY2526) {
    // Slabs AY 2025-26:
    // 0 - 3L: Nil
    // 3L - 7L: 5%
    // 7L - 10L: 10%
    // 10L - 12L: 15%
    // 12L - 15L: 20%
    // Above 15L: 30%
    const slabs = [
      { min: 0, max: 300000, rate: 0, label: 'Up to ₹3,00,000 (0%)' },
      { min: 300000, max: 700000, rate: 0.05, label: '₹3,00,001 to ₹7,00,000 (5%)' },
      { min: 700000, max: 1000000, rate: 0.10, label: '₹7,00,001 to ₹10,00,000 (10%)' },
      { min: 1000000, max: 1200000, rate: 0.15, label: '₹10,00,001 to ₹12,00,000 (15%)' },
      { min: 1200000, max: 1500000, rate: 0.20, label: '₹12,00,001 to ₹15,00,000 (20%)' },
      { min: 1500000, max: Infinity, rate: 0.30, label: 'Above ₹15,00,000 (30%)' },
    ];

    let remaining = normalTaxableIncome;
    for (const slab of slabs) {
      if (remaining > 0) {
        const slabSpan = slab.max === Infinity ? remaining : Math.min(remaining, slab.max - slab.min);
        const slabTax = slabSpan * slab.rate;
        slabBreakdown.push({
          label: slab.label,
          taxableInSlab: slabSpan,
          ratePercent: slab.rate * 100,
          tax: slabTax
        });
        normalTax += slabTax;
        remaining -= slabSpan;
      }
    }
  } else {
    // Slabs AY 2024-25:
    // 0 - 3L: Nil
    // 3L - 6L: 5%
    // 6L - 9L: 10%
    // 9L - 12L: 15%
    // 12L - 15L: 20%
    // Above 15L: 30%
    const slabs = [
      { min: 0, max: 300000, rate: 0, label: 'Up to ₹3,00,000 (0%)' },
      { min: 300000, max: 600000, rate: 0.05, label: '₹3,00,001 to ₹6,00,000 (5%)' },
      { min: 600000, max: 900000, rate: 0.10, label: '₹6,00,001 to ₹9,00,000 (10%)' },
      { min: 900000, max: 1200000, rate: 0.15, label: '₹9,00,001 to ₹12,00,000 (15%)' },
      { min: 1200000, max: 1500000, rate: 0.20, label: '₹12,00,001 to ₹15,00,000 (20%)' },
      { min: 1500000, max: Infinity, rate: 0.30, label: 'Above ₹15,00,000 (30%)' },
    ];

    let remaining = normalTaxableIncome;
    for (const slab of slabs) {
      if (remaining > 0) {
        const slabSpan = slab.max === Infinity ? remaining : Math.min(remaining, slab.max - slab.min);
        const slabTax = slabSpan * slab.rate;
        slabBreakdown.push({
          label: slab.label,
          taxableInSlab: slabSpan,
          ratePercent: slab.rate * 100,
          tax: slabTax
        });
        normalTax += slabTax;
        remaining -= slabSpan;
      }
    }
  }

  // Section 87A Rebate:
  // In New Regime, if Total Income (including special rates) <= ₹7,00,000, rebate is full normal tax up to ₹25,000.
  // Marginal relief: If income is slightly over ₹7,00,000, tax cannot exceed the amount by which income exceeds ₹7,00,000.
  let rebate87A = 0;
  const totalTaxableIncome = normalTaxableIncome + stcg111A + ltcg112A + cryptoVDA;
  
  if (totalTaxableIncome <= 700000) {
    rebate87A = normalTax;
  } else if (totalTaxableIncome > 700000 && normalTax > (totalTaxableIncome - 700000)) {
    // Marginal relief for New Regime
    const excessIncome = totalTaxableIncome - 700000;
    rebate87A = Math.max(0, normalTax - excessIncome);
  }

  const taxAfterRebate = Math.max(0, normalTax - rebate87A);

  // Special Rate Taxes:
  // STCG 111A: 20% in AY 2025-26 (post-July 2024), 15% in AY 2024-25
  const stcgRate = isAY2526 ? 0.20 : 0.15;
  const stcgTax = stcg111A * stcgRate;

  // LTCG 112A: Exemption ₹1,25,000 for AY 2025-26 (@12.5%), ₹1,00,000 for AY 2024-25 (@10%)
  const ltcgExemption = isAY2526 ? 125000 : 100000;
  const ltcgRate = isAY2526 ? 0.125 : 0.10;
  const taxableLtcg = Math.max(0, ltcg112A - ltcgExemption);
  const ltcgTax = taxableLtcg * ltcgRate;

  // Crypto / VDA (115BBH): 30% flat (no deductions/rebates)
  const cryptoTax = cryptoVDA * 0.30;

  const baseTax = taxAfterRebate + stcgTax + ltcgTax + cryptoTax;

  // Surcharge (Capped at 25% under New Regime):
  let surchargeRate = 0;
  if (totalTaxableIncome > 20000000) surchargeRate = 0.25;
  else if (totalTaxableIncome > 10000000) surchargeRate = 0.15;
  else if (totalTaxableIncome > 5000000) surchargeRate = 0.10;

  const surcharge = baseTax * surchargeRate;
  
  // Health & Education Cess: 4%
  const cess = (baseTax + surcharge) * 0.04;
  const totalTaxLiability = Math.round(baseTax + surcharge + cess);

  return {
    regime: 'NEW',
    assessmentYear: ay,
    grossTotalIncome: salaryIncome + houseProperty + businessIncome + otherSources + stcg111A + ltcg112A + cryptoVDA,
    standardDeduction,
    employerNPS,
    totalDeductions: standardDeduction + employerNPS,
    netTaxableIncome: totalTaxableIncome,
    normalTax,
    slabBreakdown,
    rebate87A,
    taxAfterRebate,
    specialTaxes: {
      stcgTax,
      stcgRate: stcgRate * 100,
      ltcgTax,
      ltcgRate: ltcgRate * 100,
      ltcgExemption,
      cryptoTax,
    },
    surcharge,
    surchargeRate: surchargeRate * 100,
    cess,
    totalTaxLiability,
  };
}

/**
 * Calculate Individual / HUF Tax under Old Tax Regime
 */
export function calculateIndividualOldRegime(data, ageGroup = 'NORMAL') {
  const salaryIncome = Math.max(0, Number(data.salaryIncome) || 0);
  const standardDeduction = Math.min(salaryIncome, 50000); // Standard deduction ₹50,000
  
  // Deductions under Section 24b (Home Loan Interest up to ₹2,00,000 for self-occupied)
  const homeLoanInterest = Math.min(200000, Math.max(0, Number(data.deductions?.section24b) || 0));
  const rawHouseProp = Number(data.housePropertyIncome) || 0;
  const houseProperty = rawHouseProp - homeLoanInterest;

  const businessIncome = Math.max(0, Number(data.businessIncome) || 0);
  const otherSources = Math.max(0, Number(data.otherSourcesIncome) || 0);
  
  // Chapter VI-A Deductions:
  // 80C: Max 1,50,000
  const sec80C = Math.min(150000, Math.max(0, Number(data.deductions?.sec80C) || 0));
  // 80D: Medical Insurance (Max 25k for self/family, + 25k/50k for parents)
  const sec80D = Math.min(75000, Math.max(0, Number(data.deductions?.sec80D) || 0));
  // 80CCD(1B): Additional NPS up to 50,000
  const sec80CCD1B = Math.min(50000, Math.max(0, Number(data.deductions?.sec80CCD1B) || 0));
  // 80TTA: Savings Bank Interest up to 10,000 (80TTB 50,000 for seniors)
  const sec80TTA = ageGroup === 'SENIOR' || ageGroup === 'SUPER_SENIOR'
    ? Math.min(50000, Math.max(0, Number(data.deductions?.sec80TTB || data.savingsInterest) || 0))
    : Math.min(10000, Math.max(0, Number(data.deductions?.sec80TTA || data.savingsInterest) || 0));
  // Other deductions (80E education loan, 80G donations, etc.)
  const secOther = Math.max(0, Number(data.deductions?.secOther) || 0);

  const totalChapterVIA = sec80C + sec80D + sec80CCD1B + sec80TTA + secOther;

  // Special Rate Incomes
  const stcg111A = Math.max(0, Number(data.stcg111A) || 0);
  const ltcg112A = Math.max(0, Number(data.ltcg112A) || 0);
  const cryptoVDA = Math.max(0, Number(data.cryptoVDA) || 0);

  const grossTotalIncome = salaryIncome + rawHouseProp + businessIncome + otherSources + stcg111A + ltcg112A + cryptoVDA;
  const normalGrossIncome = Math.max(0, (salaryIncome - standardDeduction) + houseProperty + businessIncome + otherSources);
  const normalTaxableIncome = Math.max(0, normalGrossIncome - totalChapterVIA);

  // Exemption limit based on age:
  // Normal (<60): 2,50,000
  // Senior (60-79): 3,00,000
  // Super Senior (80+): 5,00,000
  let basicExemption = 250000;
  if (ageGroup === 'SENIOR') basicExemption = 300000;
  if (ageGroup === 'SUPER_SENIOR') basicExemption = 500000;

  // Slabs Calculation
  let normalTax = 0;
  const slabBreakdown = [];

  if (ageGroup === 'SUPER_SENIOR') {
    if (normalTaxableIncome > 500000) {
      const slab1 = Math.min(normalTaxableIncome - 500000, 500000);
      normalTax += slab1 * 0.20;
      slabBreakdown.push({ label: '₹5,00,001 to ₹10,00,000 (20%)', taxableInSlab: slab1, ratePercent: 20, tax: slab1 * 0.20 });
    }
    if (normalTaxableIncome > 1000000) {
      const slab2 = normalTaxableIncome - 1000000;
      normalTax += slab2 * 0.30;
      slabBreakdown.push({ label: 'Above ₹10,00,000 (30%)', taxableInSlab: slab2, ratePercent: 30, tax: slab2 * 0.30 });
    }
  } else if (ageGroup === 'SENIOR') {
    if (normalTaxableIncome > 300000) {
      const slab1 = Math.min(normalTaxableIncome - 300000, 200000);
      normalTax += slab1 * 0.05;
      slabBreakdown.push({ label: '₹3,00,001 to ₹5,00,000 (5%)', taxableInSlab: slab1, ratePercent: 5, tax: slab1 * 0.05 });
    }
    if (normalTaxableIncome > 500000) {
      const slab2 = Math.min(normalTaxableIncome - 500000, 500000);
      normalTax += slab2 * 0.20;
      slabBreakdown.push({ label: '₹5,00,001 to ₹10,00,000 (20%)', taxableInSlab: slab2, ratePercent: 20, tax: slab2 * 0.20 });
    }
    if (normalTaxableIncome > 1000000) {
      const slab3 = normalTaxableIncome - 1000000;
      normalTax += slab3 * 0.30;
      slabBreakdown.push({ label: 'Above ₹10,00,000 (30%)', taxableInSlab: slab3, ratePercent: 30, tax: slab3 * 0.30 });
    }
  } else {
    // Normal < 60
    if (normalTaxableIncome > 250000) {
      const slab1 = Math.min(normalTaxableIncome - 250000, 250000);
      normalTax += slab1 * 0.05;
      slabBreakdown.push({ label: '₹2,50,001 to ₹5,00,000 (5%)', taxableInSlab: slab1, ratePercent: 5, tax: slab1 * 0.05 });
    }
    if (normalTaxableIncome > 500000) {
      const slab2 = Math.min(normalTaxableIncome - 500000, 500000);
      normalTax += slab2 * 0.20;
      slabBreakdown.push({ label: '₹5,00,001 to ₹10,00,000 (20%)', taxableInSlab: slab2, ratePercent: 20, tax: slab2 * 0.20 });
    }
    if (normalTaxableIncome > 1000000) {
      const slab3 = normalTaxableIncome - 1000000;
      normalTax += slab3 * 0.30;
      slabBreakdown.push({ label: 'Above ₹10,00,000 (30%)', taxableInSlab: slab3, ratePercent: 30, tax: slab3 * 0.30 });
    }
  }

  // Section 87A Rebate in Old Regime: Max ₹12,500 if total taxable income <= ₹5,00,000
  const totalTaxableIncome = normalTaxableIncome + stcg111A + ltcg112A + cryptoVDA;
  let rebate87A = 0;
  if (totalTaxableIncome <= 500000) {
    rebate87A = Math.min(normalTax, 12500);
  }

  const taxAfterRebate = Math.max(0, normalTax - rebate87A);

  // Special taxes
  const stcgTax = stcg111A * 0.15;
  const ltcgExemption = 100000;
  const taxableLtcg = Math.max(0, ltcg112A - ltcgExemption);
  const ltcgTax = taxableLtcg * 0.10;
  const cryptoTax = cryptoVDA * 0.30;

  const baseTax = taxAfterRebate + stcgTax + ltcgTax + cryptoTax;

  // Surcharge Old Regime:
  let surchargeRate = 0;
  if (totalTaxableIncome > 50000000) surchargeRate = 0.37;
  else if (totalTaxableIncome > 20000000) surchargeRate = 0.25;
  else if (totalTaxableIncome > 10000000) surchargeRate = 0.15;
  else if (totalTaxableIncome > 5000000) surchargeRate = 0.10;

  const surcharge = baseTax * surchargeRate;
  const cess = (baseTax + surcharge) * 0.04;
  const totalTaxLiability = Math.round(baseTax + surcharge + cess);

  return {
    regime: 'OLD',
    basicExemption,
    grossTotalIncome,
    standardDeduction,
    homeLoanInterest,
    chapterVIADeductions: {
      sec80C,
      sec80D,
      sec80CCD1B,
      sec80TTA,
      secOther,
      total: totalChapterVIA,
    },
    totalDeductions: standardDeduction + homeLoanInterest + totalChapterVIA,
    netTaxableIncome: totalTaxableIncome,
    normalTax,
    slabBreakdown,
    rebate87A,
    taxAfterRebate,
    specialTaxes: {
      stcgTax,
      stcgRate: 15,
      ltcgTax,
      ltcgRate: 10,
      ltcgExemption,
      cryptoTax,
    },
    surcharge,
    surchargeRate: surchargeRate * 100,
    cess,
    totalTaxLiability,
  };
}

/**
 * Calculate Corporate Tax for Domestic & Foreign Companies
 */
export function calculateCompanyTax(data) {
  const entityType = data.entityType || ENTITY_TYPES.COMPANY_DOMESTIC;
  const regime = data.corporateRegime || CORPORATE_REGIMES.SECTION_115BAA;
  const turnover = Number(data.turnover) || 0;
  const taxableProfit = Math.max(0, Number(data.taxableProfit || data.netProfit) || 0);
  const bookProfit = Number(data.bookProfit) || taxableProfit;

  let baseRate = 0.22;
  let surchargeRate = 0.10; // 115BAA is mandatory 10% surcharge
  let isMATApplicable = false;
  let regimeName = 'Section 115BAA (New Corporate Tax Regime)';

  if (entityType === ENTITY_TYPES.COMPANY_FOREIGN) {
    baseRate = 0.40; // 40% for foreign companies
    regimeName = 'Foreign Company Tax (Flat 40%)';
    if (taxableProfit > 100000000) surchargeRate = 0.05;
    else if (taxableProfit > 10000000) surchargeRate = 0.02;
    else surchargeRate = 0.00;
  } else if (entityType === ENTITY_TYPES.COMPANY_DOMESTIC) {
    if (regime === CORPORATE_REGIMES.SECTION_115BAA) {
      baseRate = 0.22;
      surchargeRate = 0.10; // Flat 10% irrespective of income level
      isMATApplicable = false;
      regimeName = 'Section 115BAA (22% Concessional Regime)';
    } else if (regime === CORPORATE_REGIMES.SECTION_115BAB) {
      baseRate = 0.15;
      surchargeRate = 0.10;
      isMATApplicable = false;
      regimeName = 'Section 115BAB (15% New Manufacturing Unit)';
    } else if (regime === CORPORATE_REGIMES.REGULAR_UNDER_400CR || turnover <= 400000000) {
      baseRate = 0.25;
      isMATApplicable = true;
      regimeName = 'Regular Domestic Co (Turnover ≤ ₹400 Cr: 25%)';
      if (taxableProfit > 100000000) surchargeRate = 0.12;
      else if (taxableProfit > 10000000) surchargeRate = 0.07;
      else surchargeRate = 0.00;
    } else {
      baseRate = 0.30;
      isMATApplicable = true;
      regimeName = 'Regular Domestic Co (Turnover > ₹400 Cr: 30%)';
      if (taxableProfit > 100000000) surchargeRate = 0.12;
      else if (taxableProfit > 10000000) surchargeRate = 0.07;
      else surchargeRate = 0.00;
    }
  }

  const baseTax = taxableProfit * baseRate;
  const surcharge = baseTax * surchargeRate;
  const cess = (baseTax + surcharge) * 0.04;
  let totalTaxLiability = Math.round(baseTax + surcharge + cess);

  // MAT calculation if applicable (15% of book profit + surcharge + cess)
  let matLiability = 0;
  if (isMATApplicable && bookProfit > 0) {
    const matBase = bookProfit * 0.15;
    const matSurcharge = matBase * surchargeRate;
    const matCess = (matBase + matSurcharge) * 0.04;
    matLiability = Math.round(matBase + matSurcharge + matCess);
    if (matLiability > totalTaxLiability) {
      totalTaxLiability = matLiability;
    }
  }

  return {
    entityType,
    regimeName,
    turnover,
    taxableProfit,
    bookProfit,
    baseRate: baseRate * 100,
    baseTax,
    surchargeRate: surchargeRate * 100,
    surcharge,
    cess,
    isMATApplicable,
    matLiability,
    isHigherUnderMAT: isMATApplicable && matLiability > (baseTax + surcharge + cess),
    totalTaxLiability,
  };
}

/**
 * Calculate Partnership Firm / LLP Tax
 */
export function calculateLLPFirmTax(data) {
  const taxableProfit = Math.max(0, Number(data.taxableProfit || data.netProfit) || 0);
  const baseRate = 0.30; // Flat 30%
  const baseTax = taxableProfit * baseRate;

  // Surcharge: 12% if taxable income exceeds ₹1 Crore
  let surchargeRate = 0;
  if (taxableProfit > 10000000) {
    surchargeRate = 0.12;
  }
  const surcharge = baseTax * surchargeRate;
  const cess = (baseTax + surcharge) * 0.04;
  const totalTaxLiability = Math.round(baseTax + surcharge + cess);

  return {
    entityType: ENTITY_TYPES.LLP_FIRM,
    regimeName: 'Partnership Firm / LLP (Flat 30%)',
    taxableProfit,
    baseRate: 30,
    baseTax,
    surchargeRate: surchargeRate * 100,
    surcharge,
    cess,
    totalTaxLiability,
  };
}

/**
 * Master Tax Assessment & Eligibility Evaluator
 * Takes all input fields (from scanner or user) and checks:
 * 1. Eligibility to file return (mandatory vs optional)
 * 2. Eligibility to pay tax (liability > 0 vs rebate 87A vs Nil)
 * 3. Net Tax Payable or Refund Due (considering TDS, TCS, Advance Tax)
 * 4. Comparison between Old & New Regime (for Individuals)
 */
export function evaluateTaxAssessment(data, assessmentYear = '2025-26') {
  const entityType = data.entityType || ENTITY_TYPES.INDIVIDUAL;
  
  // Pre-paid taxes
  const tdsSalary = Math.max(0, Number(data.prepaid?.tdsSalary) || 0);
  const tdsNonSalary = Math.max(0, Number(data.prepaid?.tdsNonSalary) || 0);
  const tcs = Math.max(0, Number(data.prepaid?.tcs) || 0);
  const advanceTax = Math.max(0, Number(data.prepaid?.advanceTax) || 0);
  const selfAssessmentTax = Math.max(0, Number(data.prepaid?.selfAssessmentTax) || 0);
  const totalPrepaidTaxes = tdsSalary + tdsNonSalary + tcs + advanceTax + selfAssessmentTax;

  let filingEligibility = {
    isMandatory: false,
    reasons: [],
  };

  let assessmentResult = {};

  if (entityType === ENTITY_TYPES.INDIVIDUAL || entityType === ENTITY_TYPES.HUF) {
    const newRegime = calculateIndividualNewRegime(data, assessmentYear);
    const oldRegime = calculateIndividualOldRegime(data, data.ageGroup || 'NORMAL');

    // Determine best regime
    const savings = Math.abs(oldRegime.totalTaxLiability - newRegime.totalTaxLiability);
    const recommendedRegime = newRegime.totalTaxLiability <= oldRegime.totalTaxLiability ? 'NEW' : 'OLD';
    const chosenResult = recommendedRegime === 'NEW' ? newRegime : oldRegime;

    // Check mandatory filing criteria under Income Tax Act (Seventh Proviso to Sec 139(1))
    const grossTotal = newRegime.grossTotalIncome;
    const basicExemption = recommendedRegime === 'NEW' ? 300000 : oldRegime.basicExemption;
    
    if (grossTotal > basicExemption) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push(`Gross Total Income (${formatINR(grossTotal)}) exceeds basic exemption limit of ${formatINR(basicExemption)}`);
    }
    if (totalPrepaidTaxes >= 25000) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push(`Total TDS/TCS deducted (${formatINR(totalPrepaidTaxes)}) is ≥ ₹25,000`);
    }
    if (Number(data.foreignTravelExpenditure) > 200000) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push('Expenditure on foreign travel exceeded ₹2,00,000');
    }
    if (Number(data.electricityExpenditure) > 100000) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push('Electricity consumption bill exceeded ₹1,00,000');
    }
    if (Number(data.bankDepositsCurrent) > 5000000) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push('Aggregate deposits in current accounts exceeded ₹50 Lakhs');
    }
    if (Number(data.businessTurnover) > 6000000) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push('Business turnover exceeded ₹60 Lakhs');
    }
    if (Number(data.professionalReceipts) > 1000000) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push('Gross professional receipts exceeded ₹10 Lakhs');
    }
    if (data.hasForeignAssets) {
      filingEligibility.isMandatory = true;
      filingEligibility.reasons.push('Holds foreign assets or signing authority abroad');
    }

    if (!filingEligibility.isMandatory) {
      filingEligibility.reasons.push(`Gross income is within exemption limit (${formatINR(basicExemption)}) and no special criteria triggered`);
    }

    const netTaxDifference = chosenResult.totalTaxLiability - totalPrepaidTaxes;
    const isEligibleToPay = chosenResult.totalTaxLiability > 0;
    
    let taxStatus = 'NIL';
    if (netTaxDifference > 0) {
      taxStatus = 'PAYABLE';
    } else if (netTaxDifference < 0) {
      taxStatus = 'REFUND';
    } else {
      taxStatus = 'NIL';
    }

    assessmentResult = {
      entityType,
      isCompany: false,
      assessmentYear,
      newRegime,
      oldRegime,
      recommendedRegime,
      savings,
      chosenResult,
      totalPrepaidTaxes,
      prepaidBreakdown: {
        tdsSalary,
        tdsNonSalary,
        tcs,
        advanceTax,
        selfAssessmentTax,
      },
      netTaxDifference,
      isEligibleToPay,
      taxStatus, // 'PAYABLE' | 'REFUND' | 'NIL'
      netAmount: Math.abs(netTaxDifference),
      filingEligibility,
    };
  } else if (entityType === ENTITY_TYPES.COMPANY_DOMESTIC || entityType === ENTITY_TYPES.COMPANY_FOREIGN) {
    const compResult = calculateCompanyTax(data);
    
    // Companies MUST file returns irrespective of profit or loss (Sec 139(1))
    filingEligibility.isMandatory = true;
    filingEligibility.reasons.push('Corporate Entities are legally required to file Income Tax Returns irrespective of profit, loss, or turnover');

    const netTaxDifference = compResult.totalTaxLiability - totalPrepaidTaxes;
    const isEligibleToPay = compResult.totalTaxLiability > 0;

    let taxStatus = 'NIL';
    if (netTaxDifference > 0) taxStatus = 'PAYABLE';
    else if (netTaxDifference < 0) taxStatus = 'REFUND';

    assessmentResult = {
      entityType,
      isCompany: true,
      assessmentYear,
      corporateResult: compResult,
      chosenResult: compResult,
      totalPrepaidTaxes,
      prepaidBreakdown: {
        tdsSalary: 0,
        tdsNonSalary,
        tcs,
        advanceTax,
        selfAssessmentTax,
      },
      netTaxDifference,
      isEligibleToPay,
      taxStatus,
      netAmount: Math.abs(netTaxDifference),
      filingEligibility,
    };
  } else {
    // LLP or Partnership Firm
    const llpResult = calculateLLPFirmTax(data);
    
    // Partnership Firms & LLPs MUST file returns mandatory
    filingEligibility.isMandatory = true;
    filingEligibility.reasons.push('Partnership Firms & LLPs are legally mandated to file returns every financial year under Section 139(1)');

    const netTaxDifference = llpResult.totalTaxLiability - totalPrepaidTaxes;
    const isEligibleToPay = llpResult.totalTaxLiability > 0;

    let taxStatus = 'NIL';
    if (netTaxDifference > 0) taxStatus = 'PAYABLE';
    else if (netTaxDifference < 0) taxStatus = 'REFUND';

    assessmentResult = {
      entityType,
      isCompany: true,
      isFirm: true,
      assessmentYear,
      llpResult,
      chosenResult: llpResult,
      totalPrepaidTaxes,
      prepaidBreakdown: {
        tdsSalary: 0,
        tdsNonSalary,
        tcs,
        advanceTax,
        selfAssessmentTax,
      },
      netTaxDifference,
      isEligibleToPay,
      taxStatus,
      netAmount: Math.abs(netTaxDifference),
      filingEligibility,
    };
  }

  return assessmentResult;
}
