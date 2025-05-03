// App.js
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, StatusBar, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Game systems
import { UpdateBalance, ProcessOffers, PropertyTimer } from './systems';
import { FinanceSystem, takeLoan, payEMI, preCloseLoan } from './systems/FinanceSystem';
import { calculateEMI } from './utils/loanCalculator';

// Components
import CityBackground from './components/CityBackground';
import Balance from './components/Balance';
import LevelIndicator from './components/LevelIndicator';
import PropertyTile from './components/PropertyTile';
import FeatureTile from './components/FeatureTile';
import BankScreen from './components/BankScreen';

export default function App() {
  const gameEngineRef = useRef(null);
  const [gameEngine, setGameEngine] = useState(null);
  const [running, setRunning] = useState(true);
  const [showFinance, setShowFinance] = useState(false);
  const [gameState, setGameState] = useState({
    balance: 0,
    level: 1,
    properties: 0,
    timer: 0
  });
  const [activeLoan, setActiveLoan] = useState(null);
  const [banks, setBanks] = useState([]);

  // List of available banks
  const availableBanks = [
    {
      id: 'bank1',
      name: 'City Bank',
      rating: 4,
      baseLoanAmount: 100000,
      loanOptions: [
        { name: 'Quick Loan', baseInterestRate: 8.5, duration: 12 },
        { name: 'Property Loan', baseInterestRate: 7.0, duration: 24 },
        { name: 'Business Loan', baseInterestRate: 6.0, duration: 36 }
      ]
    },
    {
      id: 'bank2',
      name: 'National Bank',
      rating: 5,
      baseLoanAmount: 150000,
      loanOptions: [
        { name: 'Starter Loan', baseInterestRate: 7.5, duration: 12 },
        { name: 'Growth Loan', baseInterestRate: 6.5, duration: 24 },
        { name: 'Enterprise Loan', baseInterestRate: 5.5, duration: 36 }
      ]
    },
    {
      id: 'bank3',
      name: 'Investment Bank',
      rating: 3,
      baseLoanAmount: 80000,
      loanOptions: [
        { name: 'Micro Loan', baseInterestRate: 9.0, duration: 6 },
        { name: 'Standard Loan', baseInterestRate: 8.0, duration: 12 },
        { name: 'Premium Loan', baseInterestRate: 7.0, duration: 18 }
      ]
    }
  ];

  // Handle game events
  const onEvent = (e) => {
    if (e.type === 'balance-update') {
      setGameState(prevState => ({
        ...prevState,
        balance: e.balance
      }));
      
      // Also update the entities directly
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.balance) {
        gameEngineRef.current.entities.balance.value = e.balance;
      }
    } else if (e.type === 'level-up') {
      setGameState(prevState => ({
        ...prevState,
        level: prevState.level + 1
      }));
    } else if (e.type === 'open-finance') {
      setShowFinance(true);
      setActiveLoan(e.currentLoan);
      setBanks(e.banks);
    } else if (e.type === 'emi-payment') {
      if (e.success) {
        // Update the loan info in state
        if (e.remainingMonths <= 0) {
          setActiveLoan(null);
        } else {
          setActiveLoan(prevLoan => ({
            ...prevLoan,
            remainingAmount: e.remainingLoan,
            remainingMonths: e.remainingMonths
          }));
        }
      }
    } else if (e.type === 'loan-completed') {
      setActiveLoan(null);
    }
  };

  // Handle loan selection
/**
 * Handle loan selection with comprehensive error checking
 * @param {string} bankId - ID of the selected bank
 * @param {number} loanOptionIndex - Index of the loan option within the bank
 * @param {number} amount - Loan amount
 * @param {string|number} interestRate - Interest rate as string or number
 * @returns {void}
 */
const handleSelectLoan = (bankId, loanOptionIndex, amount, interestRate) => {
  // Input validation
  if (!bankId || typeof bankId !== 'string') {
    console.error('Invalid bank ID provided:', bankId);
    return;
  }

  if (loanOptionIndex === undefined || loanOptionIndex < 0) {
    console.error('Invalid loan option index:', loanOptionIndex);
    return;
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    console.error('Invalid loan amount:', amount);
    return;
  }

  if (!interestRate || isNaN(Number(interestRate)) || Number(interestRate) < 0) {
    console.error('Invalid interest rate:', interestRate);
    return;
  }

  // Check if user already has an active loan
  if (activeLoan) {
    console.warn('User already has an active loan. Cannot take another loan.');
    alert('You already have an active loan. Please pay it off before taking a new one.');
    return;
  }

  // Find the bank and validate it exists
  const selectedBank = availableBanks.find(bank => bank.id === bankId);
  if (!selectedBank) {
    console.error(`Bank with ID ${bankId} not found`);
    return;
  }

  // Find the loan option and validate it exists
  if (!selectedBank.loanOptions || !Array.isArray(selectedBank.loanOptions)) {
    console.error(`Bank ${bankId} does not have valid loan options`);
    return;
  }

  const loanOption = selectedBank.loanOptions[loanOptionIndex];
  if (!loanOption) {
    console.error(`Loan option index ${loanOptionIndex} not found for bank ${bankId}`);
    return;
  }

  // Validate loan option has required properties
  if (!loanOption.duration || loanOption.duration <= 0) {
    console.error('Invalid loan duration:', loanOption.duration);
    return;
  }

  // Convert values to appropriate types
  const numericAmount = Number(amount);
  const numericInterestRate = Number(interestRate);
  const loanDuration = Number(loanOption.duration);

  // Try to calculate EMI, with error handling
  let emiAmount;
  try {
    emiAmount = calculateEMI(numericAmount, numericInterestRate, loanDuration);
    if (isNaN(emiAmount) || emiAmount <= 0) {
      throw new Error(`Invalid EMI calculated: ${emiAmount}`);
    }
  } catch (error) {
    console.error('Error calculating EMI:', error);
    alert('There was a problem calculating your loan payments. Please try again.');
    return;
  }

  // Create the loan object
  const newLoan = {
    bankId,
    bankName: selectedBank.name,
    originalAmount: numericAmount,
    remainingAmount: numericAmount,
    interestRate: numericInterestRate,
    duration: loanDuration,
    remainingMonths: loanDuration,
    emiAmount,
    preCloseAmount: numericAmount, // Could implement a pre-closure penalty
    startDate: Date.now()
  };

  // Calculate new balance
  const newBalance = gameState.balance + numericAmount;

  // Update React state first - for UI updates
  try {
    setActiveLoan(newLoan);
    setGameState(prev => ({
      ...prev,
      balance: newBalance
    }));
  } catch (stateError) {
    console.error('Error updating React state:', stateError);
    alert('An error occurred. Please try again.');
    return;
  }

  // Update game engine entities - with extensive error handling
  try {
    // Check if game engine reference exists
    if (!gameEngineRef || !gameEngineRef.current) {
      throw new Error('Game engine reference is not available');
    }

    // Check if entities object exists
    const entities = gameEngineRef.current.entities;
    if (!entities) {
      throw new Error('Game engine entities not found');
    }

    // Update finance entity
    if (!entities.finance) {
      console.warn('Finance entity not found, creating it');
      entities.finance = {
        banks: availableBanks,
        activeLoan: newLoan,
        emiDueTimer: 0,
        emiInterval: 30000,
        loanHistory: []
      };
    } else {
      entities.finance.activeLoan = newLoan;
      
      // Reset EMI timer if it exists
      if ('emiDueTimer' in entities.finance) {
        entities.finance.emiDueTimer = 0;
      }
      
      // Add to loan history if array exists
      if (Array.isArray(entities.finance.loanHistory)) {
        entities.finance.loanHistory.push({
          bankId,
          amount: numericAmount,
          interestRate: numericInterestRate,
          dateTaken: new Date().toISOString()
        });
      }
    }

    // Update gameState entity
    if (!entities.gameState) {
      console.warn('GameState entity not found, updates may not be properly reflected');
    } else {
      entities.gameState.balance = newBalance;
    }

    // Update balance entity
    if (!entities.balance) {
      console.warn('Balance entity not found, display may not update correctly');
    } else {
      entities.balance.value = newBalance;
      
      // If balance has a renderer with props
      if (entities.balance.renderer && entities.balance.renderer.props) {
        entities.balance.renderer = <Balance value={newBalance} />;
      }
    }

    // Try to force a refresh of entities if method exists
    if (typeof gameEngineRef.current.setEntities === 'function') {
      gameEngineRef.current.setEntities({...entities});
    }

  } catch (engineError) {
    console.error('Error updating game engine:', engineError);
    // Continue with UI updates since React state was already updated
    console.warn('Continuing with UI updates only. Game engine updates failed.');
  }

  // Close the finance screen regardless of engine updates
  // since React state has been updated
  setShowFinance(false);
  
  // Log success message
  console.log(`Loan taken successfully: ${numericAmount} from ${selectedBank.name} at ${numericInterestRate}% for ${loanDuration} months.`);
  
  // Optionally show a success message to the user
  setTimeout(() => {
    alert(`Loan of $${numericAmount.toLocaleString()} approved!`);
  }, 500);
};
  
  

  // Handle pay EMI
  const handlePayEMI = () => {
    if (gameEngine && activeLoan) {
      gameEngine.dispatch({
        type: 'pay-emi'
      });
    }
  };

  // Handle pre-close
  const handlePreClose = () => {
    if (gameEngine && activeLoan) {
      gameEngine.dispatch({
        type: 'pre-close-loan'
      });
      setActiveLoan(null);
    }
  };
  useEffect(() => {
    if (gameEngineRef.current && gameEngineRef.current.entities) {
      const entities = gameEngineRef.current.entities;
      
      // Sync the balance display with the current gameState
      if (entities.balance && gameState.balance !== entities.balance.value) {
        entities.balance.value = gameState.balance;
      }
    }
  }, [gameState.balance]);

  // Effect to take initial loan when game starts
  useEffect(() => {
    if (gameEngine && gameState.balance === 0 && !activeLoan) {
      // Automatically take a 100K starter loan
      const starterBank = availableBanks[0];
      const starterLoanOption = starterBank.loanOptions[0];
      
      gameEngine.dispatch({
        type: 'take-loan',
        bankId: starterBank.id,
        loanOptionIndex: 0,
        amount: 100000,
        interestRate: starterLoanOption.baseInterestRate,
        duration: starterLoanOption.duration
      });
    }
  }, [gameEngine]);

  // Create initial entities for the game
  const entities = {
    // Background
    background: {
      renderer: <CityBackground />
    },
    
    // UI Components
    balance: {
      value: gameState.balance,
      renderer: <Balance value={gameState.balance} />
    },
    
    level: {
      value: gameState.level,
      renderer: <LevelIndicator />
    },
    
    // Properties and game state data
    gameState: {
      balance: gameState.balance,
      level: gameState.level,
      properties: gameState.properties,
      lastOfferTime: 0,
      offerTimer: 15, // seconds between offers
      propertyTimer: 0,
      autoIncrement: false // Disable auto increment
    },
    
    // Finance system data
    finance: {
      banks: availableBanks,
      activeLoan: null,
      emiDueTimer: 0,
      emiInterval: 30000, // 30 seconds between EMI payments (for testing)
      loanHistory: []
    },
    
    // Finance button (attached to bottom nav)
    financeButton: {
      position: [280, 820],  // Position x, y
      size: [60, 60],        // Width, height
      renderer: <View />     // Invisible renderer (using bottom nav)
    },
    
    // Active Offer - Top Left Tile
    offer: {
      active: true,
      value: 360000,
      property: {
        type: 'house',
        income: 1200,
        maintenance: 200
      },
      renderer: <PropertyTile 
        title="OFFERS" 
        value="360K" 
        icon="home"
        backgroundColor="#62b0d6"
        position="topLeft"
      />
    },
    
    // Market Trends - Top Right Tile
    market: {
      trend: 'up',
      volatility: 0.2,
      renderer: <FeatureTile 
        title="MARKET TRENDS" 
        icon="trending-up" 
        backgroundColor="#6277d6"
        position="topRight"
      />
    },
    
    // Construction - Bottom Left Tile
    construction: {
      active: false,
      progress: 0,
      renderer: <FeatureTile 
        title="CONSTRUCTION" 
        icon="construct" 
        backgroundColor="#62d68f"
        position="bottomLeft"
      />
    },
    
    // Deals - Bottom Right Tile
    deals: {
      available: 2,
      bestValue: 80000,
      renderer: <FeatureTile 
        title="NEW DEALS" 
        value="$80K" 
        icon="handshake" 
        backgroundColor="#f0a640"
        position="bottomRight"
      />
    }
  };

  // Handler system for custom dispatched events
  const dispatchHandler = (entities, { events, dispatch }) => {
    if (!events) return entities;
    
    events.forEach(event => {
      if (event.type === 'take-loan') {
        takeLoan(entities, event);
      } else if (event.type === 'pay-emi') {
        payEMI(entities);
      } else if (event.type === 'pre-close-loan') {
        preCloseLoan(entities);
      }
    });
    
    return entities;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      <GameEngine
  ref={gameEngineRef}
  style={styles.gameContainer}
  systems={[UpdateBalance, ProcessOffers, PropertyTimer, FinanceSystem, dispatchHandler]}
  entities={entities}
  running={running}
  onEvent={(e) => {
    setGameEngine(gameEngineRef.current);
    onEvent(e);
  }}
/>
      
      {/* Finance Screen Overlay */}
      {showFinance && (
        <BankScreen
          banks={availableBanks}
          activeLoan={activeLoan}
          playerLevel={gameState.level}
          onSelectLoan={handleSelectLoan}
          onPayEMI={handlePayEMI}
          onPreClose={handlePreClose}
          onClose={() => setShowFinance(false)}
        />
      )}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#8c8c8c" />
          <Text style={styles.navText}>Properties</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome5 name="chart-bar" size={24} color="#8c8c8c" />
          <Text style={styles.navText}>Market</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.homeButton]}>
          <View style={styles.homeButtonInner}>
            <Ionicons name="home" size={24} color="white" />
          </View>
          <Text style={[styles.navText, {color: 'white'}]}>HOME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowFinance(true)}
        >
          <FontAwesome5 name="university" size={24} color="#8c8c8c" />
          <Text style={styles.navText}>Finance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome5 name="user" size={24} color="#8c8c8c" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#334',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#84c4d6',
  },
  bottomNav: {
    height: 80,
    backgroundColor: '#2a2a35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: '#8c8c8c',
    fontSize: 12,
    marginTop: 5,
  },
  homeButton: {
    position: 'relative',
    top: -15,
  },
  homeButtonInner: {
    width: 50,
    height: 50,
    backgroundColor: '#f0b042',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});