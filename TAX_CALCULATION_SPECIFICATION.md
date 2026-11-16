# TaxScan AI — Tax Computation & Compliance Engine Specification

## 1. Executive Summary & Statutory Authority

The TaxScan AI engine computes income tax liabilities and assesses filing mandates based on the **Income Tax Act, 1961 (India)** as amended by subsequent Finance Acts, including the **Finance Act, 2023** and **Finance (No. 2) Act, 2024**.

### Governing Legislative Framework
* **Primary Statute**: The Income Tax Act, 1961.
* **Secondary Regulatory Body**: Central Board of Direct Taxes (CBDT), Department of Revenue, Ministry of Finance.
* **Applicable Assessment Years**:
  * **AY 2025-26** (Financial Year 2024-25) — Incorporates Budget 2024 revised slabs and ₹75,000 standard deduction.
  * **AY 2024-25** (Financial Year 2023-24) — Incorporates ₹50,000 standard deduction and previous bracket limits.

---

## 2. Section-by-Section Computation Formulas

### 2.1 Standard Deduction — Section 16(ia)
Applicable to all salaried employees against Gross Salary:
$$\text{Net Salary} = \max\Big(0, \text{Gross Salary} - \min\big(\text{Gross Salary}, \text{Cap}\big)\Big)$$

$$\text{Cap} = \begin{cases} 
₹75,000 & \text{for AY 2025-26 (Budget 2024 revised)} \\ 
₹50,000 & \text{for AY 2024-25 & Old Tax Regime} 
\end{cases}$$

---

### 2.2 Simplified Tax Plan (New Regime) — Section 115BAC(1A)
The default tax regime under current law. Computed progressively across marginal income brackets:

#### Rate Brackets for AY 2025-26:
| Taxable Income Bracket ($I$) | Marginal Rate ($r$) | Slab Tax Formula |
| :--- | :--- | :--- |
| Up to ₹3,00,000 | 0% | ₹0 |
| ₹3,00,001 to ₹7,00,000 | 5% | $(I - ₹3,00,000) \times 0.05$ |
| ₹7,00,001 to ₹10,00,000 | 10% | $₹20,000 + (I - ₹7,00,000) \times 0.10$ |
| ₹10,00,001 to ₹12,00,000 | 15% | $₹50,000 + (I - ₹10,00,000) \times 0.15$ |
| ₹12,00,001 to ₹15,00,000 | 20% | $₹80,000 + (I - ₹12,00,000) \times 0.20$ |
| Above ₹15,00,000 | 30% | $₹1,40,000 + (I - ₹15,00,000) \times 0.30$ |

---

### 2.3 Government Zero-Tax Rebate & Marginal Relief — Section 87A

#### 1. Standard Rebate:
If total taxable earnings $I \le ₹7,00,000$ under the Simplified Plan:
$$\text{Rebate}_{87A} = \text{Normal Tax} \quad \implies \quad \text{Tax Payable} = ₹0$$

#### 2. Statutory Marginal Relief:
When income slightly exceeds ₹7,00,000, tax cannot exceed the amount by which income exceeds ₹7,00,000:
$$\text{If } I > ₹7,00,000 \quad \text{and} \quad \text{Normal Tax} > (I - ₹7,00,000):$$
$$\text{Marginal Relief} = \text{Normal Tax} - (I - ₹7,00,000)$$
$$\text{Tax After Rebate} = I - ₹7,00,000$$

---

### 2.4 Deductions Plan (Old Regime) — Chapter VI-A & Section 24(b)

Progressive slab calculations:
* ₹0 to ₹2,50,000: **0%** *(₹3L for Seniors 60–79; ₹5L for Super Seniors 80+)*
* ₹2,50,001 to ₹5,00,000: **5%**
* ₹5,00,001 to ₹10,00,000: **20%**
* Above ₹10,00,000: **30%**
* **Section 87A Rebate**: Full tax waiver up to ₹12,500 if $I \le ₹5,00,000$.

#### Allowable Deductions:
$$\text{Total Deductions} = \text{StdDed} + \text{Sec24b} + \sum \text{Chapter VI-A}$$
* **Section 80C**: $\min(₹1,50,000, \text{EPF} + \text{PPF} + \text{ELSS} + \text{LIC})$
* **Section 80D**: Health insurance (up to ₹25,000 self/family + up to ₹50,000 senior parents = max ₹75,000)
* **Section 80CCD(1B)**: Additional NPS contribution up to ₹50,000
* **Section 80CCD(2)**: Employer NPS contribution (up to 14% of Basic + DA) — *permitted in both regimes*
* **Section 24(b)**: Home loan interest on self-occupied house up to ₹2,00,000
* **Section 80TTA / 80TTB**: Savings bank interest deduction up to ₹10,000 (₹50,000 for seniors)

---

### 2.5 Special Statutory Rate Incomes

1. **Short-Term Capital Gains on Listed Equity (Section 111A)**:
   $$\text{Tax}_{111A} = \text{STCG} \times r_{111A} \quad \text{where } r_{111A} = \begin{cases} 20\% & \text{AY 2025-26} \\ 15\% & \text{AY 2024-25} \end{cases}$$
2. **Long-Term Capital Gains on Listed Equity (Section 112A)**:
   $$\text{Tax}_{112A} = \max\big(0, \text{LTCG} - \text{Exemption}\big) \times r_{112A}$$
   $$\text{Exemption} = \begin{cases} ₹1,25,000 & \text{AY 2025-26} \\ ₹1,00,000 & \text{AY 2024-25} \end{cases}, \quad r_{112A} = \begin{cases} 12.5\% & \text{AY 2025-26} \\ 10\% & \text{AY 2024-25} \end{cases}$$
3. **Virtual Digital Assets / Cryptocurrency (Section 115BBH)**:
   $$\text{Tax}_{115BBH} = \text{Net Crypto Gains} \times 30\% \quad \text{(No deduction or set-off allowed)}$$

---

### 2.6 Corporate Tax Regimes & Minimum Alternate Tax (MAT)

#### Concessional Corporate Regime (Section 115BAA):
$$\text{Base Tax} = \text{Taxable Profit} \times 22\%$$
$$\text{Surcharge} = \text{Base Tax} \times 10\% \quad \text{(Mandatory 10\% regardless of profit level)}$$
$$\text{Cess} = (\text{Base Tax} + \text{Surcharge}) \times 4\%$$
$$\text{Effective Corporate Tax Rate} = 22\% \times 1.10 \times 1.04 = \mathbf{25.168\%}$$
*Permanent exemption from Minimum Alternate Tax (MAT) under Section 115JB.*

#### Regular Corporate Tax with MAT:
* Base rate: 25% (turnover $\le ₹400$ Cr) or 30% (turnover $> ₹400$ Cr).
* **Section 115JB (MAT)**: Minimum Alternate Tax at 15% of Book Profit + Surcharge + Cess.

---

### 2.7 Pre-Paid Taxes & Net Balance Equation

$$\text{Net Tax Balance} = \text{Gross Liability} - \big(\text{TDS}_{\text{Salary}} + \text{TDS}_{\text{Other}} + \text{TCS} + \text{Advance Tax} + \text{SAT}\big)$$

---

## 3. Optimization Tips: Algorithmic Basis & Decision Rules

1. **Break-Even Deduction Point (Regime Arbitrage)**:
   * Compares net liabilities of both regimes. Under AY 2025-26, the mathematical break-even deduction point for someone earning ₹15 Lakhs is approximately **₹3,75,000 to ₹4,25,000**.
   * If total deductions $< ₹3.75$L, the engine recommends the Simplified Plan.

2. **NPS Section 80CCD(1B) Headroom**:
   * Evaluates: $\text{Headroom} = ₹50,000 - \text{Claimed 80CCD(1B)}$.
   * Calculates immediate tax savings at marginal tax bracket:
     $$\text{Potential Savings} = \text{Headroom} \times (\text{Marginal Rate} \times 1.04)$$

3. **Advance Tax Penalty Avoidance (Sections 208, 234B & 234C)**:
   * Under Section 208, advance tax is mandatory if net tax payable after TDS exceeds **₹10,000**.
   * Alerts users to pay across 4 milestones (15% June, 45% Sept, 75% Dec, 100% March) to avoid 1% monthly interest.

4. **Late Filing Penalty Prevention (Section 234F)**:
   * Alerts taxpayers to file before the July 31 due date to avoid the mandatory ₹5,000 fine.

---

## 4. Document Ingestion & Coordinate-Aware Parsing

1. Sorts text tokens descending by vertical coordinate $Y$ (top of page to bottom).
2. Sorts tokens on the same horizontal line ($\Delta Y \le 4$ pt) ascending by coordinate $X$ (left to right).
3. Reconstructs each table row into an atomic text line.
4. Extracts and prioritizes the department's verified **Processed Value**.

---

## 5. Summary of Supported Entity Types

| Entity Type | Applicable Statutory Regime | Default Base Tax Rate | Surcharge Provisions |
| :--- | :--- | :--- | :--- |
| **Individual (< 60 yrs)** | Sec 115BAC / Old Slabs | 0% to 30% progressive | 10% (>50L), 15% (>1Cr), 25% (>2Cr), 37% (>5Cr Old) |
| **Senior Citizen (60–79)** | Sec 115BAC / Old Slabs | Basic exemption ₹3L in Old | Same as Individual |
| **Super Senior (80+)** | Sec 115BAC / Old Slabs | Basic exemption ₹5L in Old | Same as Individual |
| **HUF** | Sec 115BAC / Old Slabs | Same as Individual | Same as Individual |
| **Domestic Company** | Sec 115BAA (Concessional) | Flat 22% (Effective 25.168%) | Mandatory flat 10% |
| **Domestic Company** | Regular Corporate | 25% ($\le 400$Cr) / 30% ($> 400$Cr) | 7% (>1Cr to 10Cr), 12% (>10Cr) |
| **Foreign Company** | Corporate Flat | 40% | 2% (>1Cr to 10Cr), 5% (>10Cr) |
| **Partnership / LLP** | Section Finance Act | Flat 30% | 12% if profit > ₹1 Crore |
