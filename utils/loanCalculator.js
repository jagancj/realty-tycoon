
// File: utils/loanCalculator.js
// Description: Utility functions for loan calculations
// Calculate EMI (Equated Monthly Installment)
// Formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
// P = Principal (loan amount)
// R = Monthly interest rate (annual rate / 12 / 100)
// N = Number of monthly payments (loan duration in months)
export const calculateEMI = (principal, annualInterestRate, durationInMonths) => {
    // Convert annual interest rate to monthly rate (decimal)
    const monthlyInterestRate = (annualInterestRate / 12) / 100;
    
    // Calculate EMI using the formula
    const emi = 
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, durationInMonths)) / 
      (Math.pow(1 + monthlyInterestRate, durationInMonths) - 1);
    
    return Math.round(emi);
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
    const monthlyInterestRate = (annualInterestRate / 12) / 100;
    const emi = calculateEMI(principal, annualInterestRate, durationInMonths);
    
    let balance = principal;
    const schedule = [];
    
    for (let month = 1; month <= durationInMonths; month++) {
      const interestForMonth = balance * monthlyInterestRate;
      const principalForMonth = emi - interestForMonth;
      
      balance -= principalForMonth;
      
      schedule.push({
        month,
        emi,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        remainingBalance: balance > 0 ? balance : 0
      });
    }
    
    return schedule;
  };
  