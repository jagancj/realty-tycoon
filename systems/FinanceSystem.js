// File: systems/FinanceSystem.js
// Description: Enhanced game system to handle dynamic loan logic and bank progression

import { calculateEMI, generateAmortizationSchedule } from '../utils/loanCalculator';

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
      
      // Calculate interest portion of this payment
      const interestForMonth = finance.activeLoan.remainingAmount * 
        (finance.activeLoan.interestRate / 100 / 12);
      
      // Principal portion is EMI minus interest
      const principalForMonth = emiAmount - interestForMonth;
      
      // Update loan status
      finance.activeLoan.remainingAmount -= principalForMonth;
      finance.activeLoan.remainingMonths -= 1;
      finance.activeLoan.totalInterestPaid = (finance.activeLoan.totalInterestPaid || 0) + interestForMonth;
      
      // Improve bank relationship for on-time payment
      const bankId = finance.activeLoan.bankId;
      if (finance.bankRelationships && finance.bankRelationships[bankId]) {
        finance.bankRelationships[bankId].score = Math.min(100, finance.bankRelationships[bankId].score + 1);
        finance.bankRelationships[bankId].paymentsMade++;
      }
      
      // Update UI with payment success
      dispatch({
        type: 'emi-payment',
        success: true,
        amount: emiAmount,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        remainingLoan: finance.activeLoan.remainingAmount,
        remainingMonths: finance.activeLoan.remainingMonths
      });
      
      // Check if loan is fully paid
      if (finance.activeLoan.remainingMonths <= 0 || finance.activeLoan.remainingAmount <= 0) {
        // Record loan in history
        finance.loanHistory.push({
          bankId: finance.activeLoan.bankId,
          bankName: finance.activeLoan.bankName,
          originalAmount: finance.activeLoan.originalAmount,
          interestRate: finance.activeLoan.interestRate,
          term: finance.activeLoan.duration,
          totalInterestPaid: finance.activeLoan.totalInterestPaid,
          completionDate: Date.now(),
          completionType: 'regular'
        });
        
        // Significant relationship boost for completing a loan
        if (finance.bankRelationships && finance.bankRelationships[bankId]) {
          finance.bankRelationships[bankId].score = Math.min(100, finance.bankRelationships[bankId].score + 10);
          finance.bankRelationships[bankId].loansCompleted++;
        }
        
        // Improve credit score for completing a loan
        finance.creditScore = Math.min(850, finance.creditScore + 15);
        
        finance.activeLoan = null;
        dispatch({
          type: 'loan-completed',
          message: 'Loan fully paid!',
          relationship: finance.bankRelationships ? finance.bankRelationships[bankId] : null
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
      
      // Add penalty interest (additional 2% per month on missed payment)
      const penaltyAmount = emiAmount * 0.02;
      finance.activeLoan.remainingAmount += penaltyAmount;
      
      // Damage bank relationship for missed payment
      const bankId = finance.activeLoan.bankId;
      if (finance.bankRelationships && finance.bankRelationships[bankId]) {
        finance.bankRelationships[bankId].score = Math.max(0, finance.bankRelationships[bankId].score - 5);
        finance.bankRelationships[bankId].paymentsMissed++;
      }
      
      // If multiple penalties, could trigger consequences
      if (finance.activeLoan.penaltyCount >= 3) {
        // Game consequence for multiple missed payments
        dispatch({
          type: 'loan-penalty',
          message: 'Multiple EMIs missed! Credit rating decreased.',
          penalty: penaltyAmount
        });
        
        // Decrease player credit score
        finance.creditScore = Math.max(300, finance.creditScore - 30); // Decrease but not below 300
      }
    }
  } else {
    // Increment the EMI timer
    finance.emiDueTimer += time.delta;
  }
  
  // Check for bank unlocks based on level changes
  if (gameState.level > finance.lastCheckedLevel) {
    finance.lastCheckedLevel = gameState.level;
    
    // Check if new banks should be unlocked
    if (gameState.level === 3 && !finance.unlockedBanks.includes('community')) {
      finance.unlockedBanks.push('community');
      // Create initial relationship with the new bank
      finance.bankRelationships['community'] = {
        score: 50,
        paymentsMade: 0,
        paymentsMissed: 0,
        loansCompleted: 0,
        firstUnlocked: Date.now()
      };
      dispatch({
        type: 'bank-unlocked',
        bankId: 'community',
        message: 'New Bank Unlocked: Community Trust Bank!'
      });
    } else if (gameState.level === 5 && !finance.unlockedBanks.includes('metropolitan')) {
      finance.unlockedBanks.push('metropolitan');
      finance.bankRelationships['metropolitan'] = {
        score: 50,
        paymentsMade: 0,
        paymentsMissed: 0,
        loansCompleted: 0,
        firstUnlocked: Date.now()
      };
      dispatch({
        type: 'bank-unlocked',
        bankId: 'metropolitan',
        message: 'New Bank Unlocked: Metropolitan Financial!'
      });
    } else if (gameState.level === 8 && !finance.unlockedBanks.includes('dynasty')) {
      finance.unlockedBanks.push('dynasty');
      finance.bankRelationships['dynasty'] = {
        score: 50,
        paymentsMade: 0,
        paymentsMissed: 0,
        loansCompleted: 0,
        firstUnlocked: Date.now()
      };
      dispatch({
        type: 'bank-unlocked',
        bankId: 'dynasty',
        message: 'New Bank Unlocked: Global Dynasty Bank!'
      });
    }
  }
  
  // Check for property-based loan unlocks
  if (finance.lastPropertyCount !== gameState.properties) {
    finance.lastPropertyCount = gameState.properties;
    
    // If player acquired first property and development loan not yet unlocked
    if (gameState.properties > 0 && !finance.unlockedLoanTypes.includes('development')) {
      finance.unlockedLoanTypes.push('development');
      dispatch({
        type: 'loan-type-unlocked',
        loanType: 'development',
        message: 'New Loan Type Unlocked: Development Loan!'
      });
    }
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
    // Get available banks based on unlocked status
    const availableBanks = getAvailableBanks(finance.unlockedBanks, gameState.level, finance.bankRelationships);
    
    dispatch({
      type: 'open-finance',
      currentLoan: finance.activeLoan,
      banks: availableBanks,
      creditScore: finance.creditScore,
      unlockedLoanTypes: finance.unlockedLoanTypes,
      bankRelationships: finance.bankRelationships
    });
  }
  
  return entities;
};

// Process a new loan
const takeLoan = (entities, loanDetails) => {
  const { gameState, finance, balance, propertyState } = entities;
  
  const { bankId, loanTypeId, amount, interestRate, duration, purpose, collateralId } = loanDetails;
  
  // Find the selected bank
  const availableBanks = getAvailableBanks(finance.unlockedBanks, gameState.level, finance.bankRelationships);
  const selectedBank = availableBanks.find(bank => bank.id === bankId);
  
  if (!selectedBank) return entities;
  
  // Get loan type
  const loanType = selectedBank.loanTypes.find(loan => loan.id === loanTypeId);
  
  if (!loanType) return entities;
  
  // If player already has an active loan, don't allow a new one
  if (finance.activeLoan) return entities;
  
  // For development loans, verify the property exists
  if (loanType.category === 'development' && collateralId) {
    const property = propertyState.ownedProperties.find(p => p.id === collateralId);
    if (!property) return entities;
  }
  
  // Calculate EMI
  const emiAmount = calculateEMI(amount, interestRate, duration);
  
  // Generate amortization schedule to show monthly payment breakdown
  const schedule = generateAmortizationSchedule(amount, interestRate, duration);
  
  // Calculate total interest over loan term
  const totalInterest = (emiAmount * duration) - amount;
  
  // Create the new loan
  finance.activeLoan = {
    bankId,
    bankName: selectedBank.name,
    loanTypeId,
    loanTypeName: loanType.name,
    originalAmount: amount,
    remainingAmount: amount,
    interestRate: Number(interestRate),
    duration: duration,
    remainingMonths: duration,
    emiAmount,
    totalInterest,
    totalInterestPaid: 0,
    schedule: schedule, // Store the payment schedule
    // Calculate pre-closure amount with 2.5% penalty
    preCloseAmount: amount + (amount * 0.025),
    startDate: Date.now(),
    penaltyCount: 0,
    purpose: purpose || 'general',
    collateralId
  };
  
  // Add loan amount to player's balance
  gameState.balance += amount;
  balance.value = gameState.balance;
  
  // Reset EMI timer
  finance.emiDueTimer = 0;
  
  // Improve bank relationship slightly for taking a loan
  if (finance.bankRelationships && finance.bankRelationships[bankId]) {
    finance.bankRelationships[bankId].score = Math.min(100, finance.bankRelationships[bankId].score + 2);
  }
  
  // This line ensures the Balance component is rerendered with new value
  const Balance = require('../components/Balance').default;
  balance.renderer = <Balance value={gameState.balance} />;
  
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
  
  // Calculate interest for this payment
  const interestForMonth = finance.activeLoan.remainingAmount * 
    (finance.activeLoan.interestRate / 100 / 12);
    
  // Update principal portion
  const principalPortion = finance.activeLoan.emiAmount - interestForMonth;
  
  // Update loan status
  finance.activeLoan.remainingAmount -= principalPortion;
  finance.activeLoan.remainingMonths -= 1;
  finance.activeLoan.totalInterestPaid = (finance.activeLoan.totalInterestPaid || 0) + interestForMonth;
  
  // Improve bank relationship for manual payment
  const bankId = finance.activeLoan.bankId;
  if (finance.bankRelationships && finance.bankRelationships[bankId]) {
    finance.bankRelationships[bankId].score = Math.min(100, finance.bankRelationships[bankId].score + 1);
    finance.bankRelationships[bankId].paymentsMade++;
  }
  
  // Check if loan is fully paid
  if (finance.activeLoan.remainingMonths <= 0 || finance.activeLoan.remainingAmount <= 0) {
    // Record loan in history
    finance.loanHistory.push({
      bankId: finance.activeLoan.bankId,
      bankName: finance.activeLoan.bankName,
      loanTypeName: finance.activeLoan.loanTypeName,
      originalAmount: finance.activeLoan.originalAmount,
      interestRate: finance.activeLoan.interestRate,
      term: finance.activeLoan.duration,
      totalInterestPaid: finance.activeLoan.totalInterestPaid,
      completionDate: Date.now(),
      completionType: 'regular'
    });
    
    // Significant relationship boost for completing a loan
    if (finance.bankRelationships && finance.bankRelationships[bankId]) {
      finance.bankRelationships[bankId].score = Math.min(100, finance.bankRelationships[bankId].score + 10);
      finance.bankRelationships[bankId].loansCompleted++;
    }
    
    // Improve credit score
    finance.creditScore = Math.min(850, finance.creditScore + 15);
    
    finance.activeLoan = null;
  }
  
  return entities;
};

// Pre-close a loan with a penalty fee
const preCloseLoan = (entities) => {
  const { gameState, finance, balance } = entities;
  
  // If no active loan or not enough balance, return
  if (!finance.activeLoan || gameState.balance < finance.activeLoan.preCloseAmount) {
    return entities;
  }
  
  // Calculate pre-closure penalty (2.5% of remaining principal)
  const penalty = finance.activeLoan.remainingAmount * 0.025;
  const totalAmount = finance.activeLoan.remainingAmount + penalty;
  
  // Deduct pre-closure amount from balance
  gameState.balance -= totalAmount;
  balance.value = gameState.balance;
  
  // Record loan in history with early payoff
  finance.loanHistory.push({
    bankId: finance.activeLoan.bankId,
    bankName: finance.activeLoan.bankName,
    loanTypeName: finance.activeLoan.loanTypeName,
    originalAmount: finance.activeLoan.originalAmount,
    interestRate: finance.activeLoan.interestRate,
    term: finance.activeLoan.duration,
    actualTerm: finance.activeLoan.duration - finance.activeLoan.remainingMonths,
    totalInterestPaid: finance.activeLoan.totalInterestPaid,
    preClosurePenalty: penalty,
    completionDate: Date.now(),
    completionType: 'early'
  });
  
  // Small relationship boost for early payment (less than completing the full term)
  const bankId = finance.activeLoan.bankId;
  if (finance.bankRelationships && finance.bankRelationships[bankId]) {
    finance.bankRelationships[bankId].score = Math.min(100, finance.bankRelationships[bankId].score + 5);
    finance.bankRelationships[bankId].loansCompleted++;
  }
  
  // Close the loan
  finance.activeLoan = null;
  
  // Improve credit score slightly when loans are paid off early
  finance.creditScore = Math.min(850, finance.creditScore + 8);
  
  return entities;
};

// Get list of available banks based on player's level and unlocked banks
const getAvailableBanks = (unlockedBanks, playerLevel, bankRelationships) => {
  // Bank definitions based on player progression
  const allBanks = [
    // Level 1: Starter Bank
    {
      id: 'venture',
      name: 'Venture Capital Bank',
      description: 'Your first step into real estate starts here!',
      unlockLevel: 1,
      rating: 3,
      icon: 'rocket',
      color: '#4CAF50',
      minRelationship: 0,
      loanTypes: [
        {
          id: 'seed',
          name: 'Seed Funding Loan',
          category: 'starter',
          description: 'Get started with your real estate empire',
          minLevel: 1,
          maxAmount: 300000,
          baseInterestRate: 15,
          minDuration: 12,
          maxDuration: 24,
          requiresCollateral: false,
          relationshipDiscount: 0.01, // 0.01% discount per relationship point
        }
      ]
    },
    
    // Level 3: Community Bank
    {
      id: 'community',
      name: 'Community Trust Bank',
      description: 'Growing with local businesses since 1978',
      unlockLevel: 3,
      rating: 4,
      icon: 'landmark',
      color: '#2196F3',
      minRelationship: 0,
      loanTypes: [
        {
          id: 'business',
          name: 'Business Expansion Loan',
          category: 'business',
          description: 'Expand your real estate business operations',
          minLevel: 3,
          maxAmount: 500000,
          baseInterestRate: 12,
          minDuration: 24,
          maxDuration: 36,
          requiresCollateral: false,
          relationshipDiscount: 0.02,
        },
        {
          id: 'property',
          name: 'Property Acquisition Loan',
          category: 'acquisition',
          description: 'Specifically for purchasing new properties',
          minLevel: 3,
          maxAmount: 800000,
          baseInterestRate: 10,
          minDuration: 36,
          maxDuration: 60,
          requiresCollateral: false,
          relationshipDiscount: 0.02,
        }
      ]
    },
    
    // Level 5: Metropolitan Bank
    {
      id: 'metropolitan',
      name: 'Metropolitan Financial',
      description: 'Building skylines, one investment at a time',
      unlockLevel: 5,
      rating: 4,
      icon: 'city',
      color: '#9C27B0',
      minRelationship: 40, // Requires decent relationship to access
      loanTypes: [
        {
          id: 'commercial',
          name: 'Commercial Development Loan',
          category: 'development',
          description: 'Finance commercial property development',
          minLevel: 5,
          maxAmount: 2000000,
          baseInterestRate: 8,
          minDuration: 36,
          maxDuration: 120,
          requiresCollateral: true,
          relationshipDiscount: 0.03,
        },
        {
          id: 'portfolio',
          name: 'Portfolio Expansion Loan',
          category: 'business',
          description: 'Expand your property portfolio significantly',
          minLevel: 5,
          maxAmount: 5000000,
          baseInterestRate: 11,
          minDuration: 60,
          maxDuration: 180,
          requiresCollateral: true,
          relationshipDiscount: 0.03,
        }
      ]
    },
    
    // Level 8: Global Dynasty Bank
    {
      id: 'dynasty',
      name: 'Global Dynasty Bank',
      description: 'The world\'s finest real estate deserves the world\'s finest financing',
      unlockLevel: 8,
      rating: 5,
      icon: 'globe',
      color: '#FF9800',
      minRelationship: 60, // Requires good relationship to access
      loanTypes: [
        {
          id: 'empire',
          name: 'Empire Builder Package',
          category: 'premium',
          description: 'Exclusive financing for major real estate moguls',
          minLevel: 8,
          maxAmount: 20000000,
          baseInterestRate: 6,
          minDuration: 120,
          maxDuration: 240,
          requiresCollateral: true,
          relationshipDiscount: 0.05,
        },
        {
          id: 'luxury',
          name: 'Luxury Development Fund',
          category: 'development',
          description: 'For high-end, prestigious developments only',
          minLevel: 8,
          maxAmount: 50000000,
          baseInterestRate: 9,
          minDuration: 60,
          maxDuration: 120,
          requiresCollateral: true,
          relationshipDiscount: 0.04,
        }
      ]
    }
  ];
  
  // For unlocked development loan
  if (unlockedBanks.includes('venture') && unlockedLoanTypes.includes('development')) {
    // Find venture bank and add development loan
    const ventureBank = allBanks.find(bank => bank.id === 'venture');
    if (ventureBank && !ventureBank.loanTypes.some(loan => loan.id === 'development')) {
      ventureBank.loanTypes.push({
        id: 'development',
        name: 'Property Development Loan',
        category: 'development',
        description: 'Finance construction on your existing property',
        minLevel: 1,
        // Dynamic max amount based on property value will be calculated at loan application time
        baseMaxAmount: 500000,
        baseInterestRate: 12,
        minDuration: 12,
        maxDuration: 36,
        requiresCollateral: true,
        relationshipDiscount: 0.02,
      });
    }
  }
  
  // Filter banks based on player level and unlocked status
  const availableBanks = allBanks.filter(bank => {
    // Bank must be unlocked
    if (!unlockedBanks.includes(bank.id)) return false;
    
    // Player level must be sufficient
    if (playerLevel < bank.unlockLevel) return false;
    
    // Check relationship requirements
    if (bankRelationships && bankRelationships[bank.id]) {
      if (bankRelationships[bank.id].score < bank.minRelationship) {
        return false;
      }
    }
    
    return true;
  });
  
  // Further filter loan types within each bank based on player level
  const filteredBanks = availableBanks.map(bank => {
    const filteredLoanTypes = bank.loanTypes.filter(loan => 
      playerLevel >= loan.minLevel
    );
    
    return {
      ...bank,
      loanTypes: filteredLoanTypes
    };
  });
  
  return filteredBanks;
};

// Initialize finance state
const initializeFinanceState = (playerLevel = 1) => {
  return {
    // Start with only the venture bank unlocked
    unlockedBanks: ['venture'],
    
    // Begin with only starter loans available
    unlockedLoanTypes: ['seed'],
    
    // No active loan initially
    activeLoan: null,
    
    // EMI timer
    emiDueTimer: 0,
    emiInterval: 30000, // 30 seconds between EMI payments (for testing)
    
    // Loan history
    loanHistory: [],
    
    // Credit score (300-850, starts at average)
    creditScore: 650,
    
    // Bank relationships - tracks history with each bank
    bankRelationships: {
      venture: {
        score: 50, // 0-100 relationship score
        paymentsMade: 0,
        paymentsMissed: 0,
        loansCompleted: 0,
        firstUnlocked: Date.now()
      }
    },
    
    // For tracking level changes
    lastCheckedLevel: playerLevel,
    
    // For tracking property changes
    lastPropertyCount: 0,
    
    // Market conditions affecting finance
    marketCondition: 'normal', // normal, boom, recession
    marketMultiplier: 1.0 // Affects interest rates and loan availability
  };
};

export { 
  FinanceSystem, 
  takeLoan, 
  payEMI, 
  preCloseLoan, 
  getAvailableBanks, 
  initializeFinanceState
};