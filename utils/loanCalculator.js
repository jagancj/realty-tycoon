// File: utils/loanCalculator.js
// Description: Enhanced utility functions for loan calculations

// Calculate EMI (Equated Monthly Installment)
// Formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
// P = Principal (loan amount)
// R = Monthly interest rate (annual rate / 12 / 100)
// N = Number of monthly payments (loan duration in months)
export const calculateEMI = (principal, annualInterestRate, durationInMonths) => {
  try {
    // Input validation
    if (!principal || isNaN(principal) || principal <= 0) {
      throw new Error(`Invalid principal amount: ${principal}`);
    }
    
    if (!annualInterestRate || isNaN(annualInterestRate) || annualInterestRate <= 0) {
      throw new Error(`Invalid interest rate: ${annualInterestRate}`);
    }
    
    if (!durationInMonths || isNaN(durationInMonths) || durationInMonths <= 0) {
      throw new Error(`Invalid loan duration: ${durationInMonths}`);
    }
    
    // Convert annual interest rate to monthly rate (decimal)
    const monthlyInterestRate = (annualInterestRate / 12) / 100;
    
    // Calculate EMI using the formula
    const emi = 
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, durationInMonths)) / 
      (Math.pow(1 + monthlyInterestRate, durationInMonths) - 1);
    
    // Round to 2 decimal places and then to nearest whole number
    return Math.round(emi);
  } catch (error) {
    console.error('Error calculating EMI:', error);
    return 0; // Return 0 in case of error
  }
};

// Calculate total interest to be paid
export const calculateTotalInterest = (principal, emi, durationInMonths) => {
  return (emi * durationInMonths) - principal;
};

// Calculate total amount to be paid
export const calculateTotalAmount = (principal, emi, durationInMonths) => {
  return emi * durationInMonths;
};

// Generate amortization schedule
export const generateAmortizationSchedule = (principal, annualInterestRate, durationInMonths) => {
  try {
    const monthlyInterestRate = (annualInterestRate / 12) / 100;
    const emi = calculateEMI(principal, annualInterestRate, durationInMonths);
    
    if (emi <= 0) {
      throw new Error('Invalid EMI calculated');
    }
    
    let balance = principal;
    const schedule = [];
    
    for (let month = 1; month <= durationInMonths; month++) {
      // Calculate interest for this month
      const interestForMonth = balance * monthlyInterestRate;
      
      // Calculate principal portion for this month
      const principalForMonth = emi - interestForMonth;
      
      // Update remaining balance
      balance -= principalForMonth;
      
      // Ensure balance doesn't go below zero due to rounding
      const remainingBalance = Math.max(0, balance);
      
      // Add payment details to schedule
      schedule.push({
        month,
        emi: Math.round(emi),
        principalPaid: Math.round(principalForMonth),
        interestPaid: Math.round(interestForMonth),
        remainingBalance: Math.round(remainingBalance)
      });
    }
    
    return schedule;
  } catch (error) {
    console.error('Error generating amortization schedule:', error);
    return []; // Return empty array in case of error
  }
};

// Calculate pre-closure amount including penalty
export const calculatePreClosureAmount = (remainingPrincipal, penaltyPercentage = 2.5) => {
  return remainingPrincipal + (remainingPrincipal * (penaltyPercentage / 100));
};

// Calculate interest rates based on player level and credit score
export const calculateAdjustedInterestRate = (baseRate, playerLevel, creditScore = 750, relationshipScore = 50, relationshipDiscount = 0.01) => {
  // Level discount: 0.2% per level
  const levelDiscount = playerLevel * 0.2;
  
  // Credit score adjustment: 
  // 300-580: +2% (poor)
  // 580-670: +1% (fair)
  // 670-740: +0% (good)
  // 740-800: -0.5% (very good)
  // 800-850: -1% (excellent)
  let creditScoreAdjustment = 0;
  
  if (creditScore < 580) {
    creditScoreAdjustment = 2;
  } else if (creditScore < 670) {
    creditScoreAdjustment = 1;
  } else if (creditScore < 740) {
    creditScoreAdjustment = 0;
  } else if (creditScore < 800) {
    creditScoreAdjustment = -0.5;
  } else {
    creditScoreAdjustment = -1;
  }
  
  // Relationship discount (e.g., 0.01% per point of relationship score)
  const relationshipAdjustment = relationshipScore * relationshipDiscount;
  
  // Calculate the adjusted rate (minimum 3%)
  return Math.max(3, baseRate - levelDiscount - relationshipAdjustment + creditScoreAdjustment);
};

// Estimate loan approval chance based on credit score and relationship
export const estimateLoanApprovalChance = (creditScore, relationshipScore, loanAmount, playerNetWorth) => {
  // Base approval chance
  let approvalChance = 0.5; // 50% base chance
  
  // Credit score factor (0.0 to 0.3)
  const creditFactor = Math.min(0.3, Math.max(0, (creditScore - 300) / 550 * 0.3));
  approvalChance += creditFactor;
  
  // Relationship factor (0.0 to 0.2)
  const relationshipFactor = Math.min(0.2, relationshipScore / 100 * 0.2);
  approvalChance += relationshipFactor;
  
  // Loan amount to net worth ratio factor (-0.3 to 0.0)
  const loanToWorthRatio = loanAmount / Math.max(1, playerNetWorth);
  const worthFactor = Math.max(-0.3, -loanToWorthRatio * 0.3);
  approvalChance += worthFactor;
  
  // Ensure result is between 0.0 and 1.0
  return Math.min(1.0, Math.max(0.0, approvalChance));
};

// Calculate the debt-to-income ratio (monthly EMI / monthly income)
export const calculateDebtToIncomeRatio = (emiAmount, monthlyIncome) => {
  if (!monthlyIncome || monthlyIncome <= 0) return Infinity;
  return emiAmount / monthlyIncome;
};

// Check if a loan is affordable based on DTI ratio
export const isLoanAffordable = (emiAmount, monthlyIncome, maxDTIRatio = 0.4) => {
  const dtiRatio = calculateDebtToIncomeRatio(emiAmount, monthlyIncome);
  return dtiRatio <= maxDTIRatio;
};

// Calculate the maximum affordable loan amount based on income
export const calculateMaxAffordableLoan = (monthlyIncome, interestRate, durationInMonths, maxDTIRatio = 0.4) => {
  // Maximum monthly payment based on DTI ratio
  const maxMonthlyPayment = monthlyIncome * maxDTIRatio;
  
  // Convert annual interest rate to monthly rate (decimal)
  const monthlyInterestRate = (interestRate / 12) / 100;
  
  // Calculate maximum loan amount using rearranged EMI formula
  // P = EMI / [(R(1+R)^N) / ((1+R)^N-1)]
  const numerator = maxMonthlyPayment;
  const denominator = (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, durationInMonths)) / 
                      (Math.pow(1 + monthlyInterestRate, durationInMonths) - 1);
  
  return Math.floor(numerator / denominator);
};

// Calculate the time (in months) it takes to break even on a loan investment
export const calculateBreakEvenPeriod = (loanAmount, monthlyIncome, interestRate) => {
  // Simple calculation: Loan amount / (Monthly income - Monthly interest)
  const monthlyInterest = loanAmount * (interestRate / 100 / 12);
  const monthlyNetIncome = monthlyIncome - monthlyInterest;
  
  if (monthlyNetIncome <= 0) return Infinity; // Never breaks even
  
  return Math.ceil(loanAmount / monthlyNetIncome);
};

// Calculate loan-to-value ratio for collateralized loans
export const calculateLoanToValueRatio = (loanAmount, collateralValue) => {
  if (!collateralValue || collateralValue <= 0) return Infinity;
  return loanAmount / collateralValue;
};

// Determine maximum loan amount based on collateral (typically 70-80% of value)
export const calculateMaxCollateralLoan = (collateralValue, maxLTV = 0.75) => {
  return Math.floor(collateralValue * maxLTV);
};

// Calculate impact of a loan on credit score
export const estimateCreditScoreImpact = (
  currentScore, 
  loanAmount, 
  netWorth, 
  existingLoans = 0,
  missedPayments = 0
) => {
  // New loan initially has a small negative impact (-5 to -15 points)
  let impact = -5;
  
  // Large loans relative to net worth have bigger negative impact
  const loanToWorthRatio = loanAmount / Math.max(1, netWorth);
  if (loanToWorthRatio > 0.8) impact -= 10;
  else if (loanToWorthRatio > 0.5) impact -= 5;
  
  // Multiple existing loans have negative impact
  impact -= Math.min(10, existingLoans * 3);
  
  // Missed payments have significant negative impact
  impact -= Math.min(50, missedPayments * 15);
  
  // Higher starting credit scores see less negative impact
  if (currentScore > 750) impact = Math.floor(impact * 0.7);
  
  // Ensure we don't drop below minimum score
  const projectedScore = Math.max(300, currentScore + impact);
  
  return {
    impact,
    projectedScore
  };
};