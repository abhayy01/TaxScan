# TaxScan AI - TIS & Return Filing Tax Liability Scanner

An intelligent web application that scans **Taxpayer Information Summary (TIS)**, **Annual Information Statements (AIS)**, **Form 16 / 26AS**, and **Income Tax Return (ITR)** filings to determine:
1. **Whether the individual or company is eligible / mandated to pay taxes**
2. **If yes, exactly how much tax is payable or refundable**
3. **Comprehensive New vs Old Tax Regime comparison** with slab-by-slab breakdown
4. **Interactive field inspection & live overrides** for salary, business profit, capital gains, and TDS credits

---

## 🚀 Key Features

- **Document Scanner & Parser**:
  - Drag-and-drop support for **PDF, JSON, CSV, TXT, and XML** tax documents.
  - Client-side PDF OCR & regex scanner that extracts PAN, entity type, income heads (S-001, I-001, R-001, D-001, S-004), and TDS credits.
  - Direct import for ITD JSON exports (`ais_data.json`).
  - Preloaded with **6 Real-World Taxpayer Scenarios** (Salaried Zero-Tax, High-Earner Tech Exec, 44ADA Freelancer, Pvt Ltd Company under Sec 115BAA, LLP Firm, and Crypto Trader).

- **Tax Eligibility & Liability Engine**:
  - **Individuals / HUF (AY 2024-25 & AY 2025-26)**:
    - New Regime (Section 115BAC) with updated Budget 2024/2025 slabs & ₹75,000 standard deduction.
    - Full **Section 87A Zero-Tax Rebate** (rebate up to ₹25,000 for income up to ₹7,00,000 + marginal relief).
    - Old Regime with Chapter VI-A deductions (80C, 80D, 80CCD(1B), 80TTA, and Section 24b Home Loan Interest).
    - Special rates for STCG u/s 111A (20% / 15%), LTCG u/s 112A (12.5% / 10%), and Crypto / VDA u/s 115BBH (30% flat).
  - **Domestic Companies**:
    - **Section 115BAA**: 22% flat + 10% surcharge + 4% cess = Effective 25.168% (MAT exempt).
    - Regular corporate tax (25% for turnover ≤ ₹400 Cr, 30% for turnover > ₹400 Cr) + MAT u/s 115JB comparison.
  - **Partnership Firms & LLPs**:
    - Flat 30% tax + 12% surcharge (if profit > ₹1 Cr) + 4% cess.

- **Pre-Paid Tax Reconciliation**:
  - Offsets total tax against **TDS on Salary**, **TDS on Non-Salary**, **TCS**, and **Advance Tax**.
  - Clearly reports **Tax Payable** vs **Refund Due** vs **Zero Tax Liability**.

- **Statutory Filing Basis (Section 139)**:
  - Validates mandatory filing conditions: Gross Total Income > Exemption limit, TDS ≥ ₹25,000, Foreign Assets, Electricity > ₹1L, Foreign Travel > ₹2L, or Corporate status.

- **Official Printable Summary**:
  - Clean, print-ready Assessment Verification Sheet with watermark, tax slab calculations, and net balance statement.

---

## 🛠️ How to Run

```bash
cd C:\Users\Abhay.Shivhare\.gemini\antigravity\scratch\tax-scanner-app
npm run dev
```

Open your browser at `http://localhost:5173`.
