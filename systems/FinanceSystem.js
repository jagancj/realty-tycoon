
// File: systems/FinanceSystem.js
// Description: Game system to handle loan logic, EMI processing and finance features
import { calculateEMI } from '../utils/loanCalculator';

// System to manage bank loans and EMI payments
const FinanceSystem = (entities, { touches, time, dispatch }) => {
  const { gameState, finance } = entities;
  
  if (!gameState || !finance) return entities;
  
  // Handle automatic EMI deduction if there's an active loan
  if (finance.activeLoan && finance.emiDueTimer >= finance.emiInterval) {
    // Reset the EMI timer
    finance.emiDueTimer = 0;
    
    // Calculate and deduct EMI
    const emiAmount = finance.activeLoan.emiAmount;
    
    if (gameState.balance >= emiAmount) {
      // Deduct EMI from balance
      gameState.balance -= emiAmount;
      entities.balance.value = gameState.balance;
      
      // Update loan status
      finance.activeLoan.remainingAmount -= (emiAmount - (emiAmount * finance.activeLoan.interestRate / 100 / 12));
      finance.activeLoan.remainingMonths -= 1;
      
      // Update UI with payment success
      dispatch({
        type: 'emi-payment',
        success: true,
        amount: emiAmount,
        remainingLoan: finance.activeLoan.remainingAmount,
        remainingMonths: finance.activeLoan.remainingMonths
      });
      
      // Check if loan is fully paid
      if (finance.activeLoan.remainingMonths <= 0 || finance.activeLoan.remainingAmount <= 0) {
        finance.activeLoan = null;
        dispatch({
          type: 'loan-completed',
          message: 'Loan fully paid!'
        });
      }
    } else {
      // Not enough balance to pay EMI
      dispatch({
        type: 'emi-payment',
        success: false,
        amount: emiAmount,
        balance: gameState.balance
      });
      
      // Apply penalty (could add late fee or increase debt)
      finance.activeLoan.penaltyCount = (finance.activeLoan.penaltyCount || 0) + 1;
      
      // If multiple penalties, could trigger consequences
      if (finance.activeLoan.penaltyCount >= 3) {
        // Game consequence for multiple missed payments
        dispatch({
          type: 'loan-penalty',
          message: 'Multiple EMIs missed! Rating decreased.'
        });
      }
    }
  } else {
    // Increment the EMI timer
    finance.emiDueTimer += time.delta;
  }
  
  // Check for touch events on finance buttons
  const touchedFinance = touches.find(t => 
    t.type === 'press' && 
    t.event.pageX > entities.financeButton.position[0] && 
    t.event.pageX < entities.financeButton.position[0] + entities.financeButton.size[0] && 
    t.event.pageY > entities.financeButton.position[1] && 
    t.event.pageY < entities.financeButton.position[1] + entities.financeButton.size[1]
  );
  
  if (touchedFinance) {
    dispatch({
      type: 'open-finance',
      currentLoan: finance.activeLoan,
      banks: finance.banks
    });
  }
  
  return entities;
};

// Process a new loan
const takeLoan = (entities, loanDetails) => {
  const { gameState, finance, balance } = entities;
  
  const { bankId, loanOptionIndex, amount, interestRate, duration } = loanDetails;
  
  // Find the selected bank
  const selectedBank = finance.banks.find(bank => bank.id === bankId);
  
  if (!selectedBank) return entities;
  
  // Get loan option 
  const loanOption = selectedBank.loanOptions[loanOptionIndex];
  
  // If player already has an active loan, don't allow a new one
  if (finance.activeLoan) return entities;
  
  // Calculate EMI
  const emiAmount = calculateEMI(amount, interestRate, duration);
  
  // Create the new loan
  finance.activeLoan = {
    bankId,
    bankName: selectedBank.name,
    originalAmount: amount,
    remainingAmount: amount,
    interestRate: Number(interestRate),
    duration: loanOption.duration,
    remainingMonths: loanOption.duration,
    emiAmount,
    preCloseAmount: amount, // Could implement a pre-closure penalty
    startDate: Date.now()
  };
  
  // Add loan amount to player's balance
  gameState.balance += amount;
  balance.value = gameState.balance;
  
  // Reset EMI timer
  finance.emiDueTimer = 0;
  
  return entities;
};

// Pay a single EMI manually
const payEMI = (entities) => {
  const { gameState, finance, balance } = entities;
  
  // If no active loan or not enough balance, return
  if (!finance.activeLoan || gameState.balance < finance.activeLoan.emiAmount) {
    return entities;
  }
  
  // Deduct EMI from balance
  gameState.balance -= finance.activeLoan.emiAmount;
  balance.value = gameState.balance;
  
  // Update loan status
  const principalPart = finance.activeLoan.emiAmount - 
    (finance.activeLoan.remainingAmount * finance.activeLoan.interestRate / 100 / 12);
    
  finance.activeLoan.remainingAmount -= principalPart;
  finance.activeLoan.remainingMonths -= 1;
  
  // Check if loan is fully paid
  if (finance.activeLoan.remainingMonths <= 0 || finance.activeLoan.remainingAmount <= 0) {
    finance.activeLoan = null;
  }
  
  return entities;
};

// Pre-close a loan
const preCloseLoan = (entities) => {
  const { gameState, finance, balance } = entities;
  
  // If no active loan or not enough balance, return
  if (!finance.activeLoan || gameState.balance < finance.activeLoan.preCloseAmount) {
    return entities;
  }
  
  // Deduct pre-closure amount from balance
  gameState.balance -= finance.activeLoan.preCloseAmount;
  balance.value = gameState.balance;
  
  // Close the loan
  finance.activeLoan = null;
  
  return entities;
};

export { FinanceSystem, takeLoan, payEMI, preCloseLoan };