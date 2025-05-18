// File: utils/loanCalculator.js
// Description: Utility functions for loan calculations

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
export const calculateAdjustedInterestRate = (baseRate, playerLevel, creditScore = 750) => {
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
  
  // Calculate the adjusted rate (minimum 3%)
  return Math.max(3, baseRate - levelDiscount + creditScoreAdjustment);
};