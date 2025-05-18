// App.js - Updated for improved finance system
// This is a partial update to focus on the finance-related parts of App.js

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, StatusBar, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Game systems
import { UpdateBalance, ProcessOffers, PropertyTimer, BalanceUpdateSystem } from './systems';
import { FinanceSystem, takeLoan, payEMI, preCloseLoan, initializeBanks } from './systems/FinanceSystem';
import { PropertySystem, PropertyEventHandler } from './systems/PropertySystem';
import { calculateEMI, calculateTotalInterest, generateAmortizationSchedule } from './utils/loanCalculator';
import { generateRandomLands } from './utils/propertyGenerator';

// Components
import CityBackground from './components/CityBackground';
import Balance from './components/Balance';
import LevelIndicator from './components/LevelIndicator';
import PropertyTile from './components/PropertyTile';
import FeatureTile from './components/FeatureTile';
import BankScreen from './components/BankScreen';
import PropertyScreen from './components/PropertyScreen';

export default function App() {
  const gameEngineRef = useRef(null);
  const [gameEngine, setGameEngine] = useState(null);
  const [running, setRunning] = useState(true);
  const [showFinance, setShowFinance] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [gameState, setGameState] = useState({
    balance: 0,
    level: 1,
    properties: 0,
    timer: 0
  });
  const [activeLoan, setActiveLoan] = useState(null);
  const [banks, setBanks] = useState([]);
  const [creditScore, setCreditScore] = useState(750); // Initialize credit score
  const [loanHistory, setLoanHistory] = useState([]); // Track loan payment history
  const [propertyState, setPropertyState] = useState({
    availableLands: [],
    ownedProperties: [],
    constructionProjects: [],
    propertiesForSale: [],
    salesHistory: []
  });

  // Get dynamic bank information based on player level
  useEffect(() => {
    const dynamicBanks = initializeBanks(gameState.level);
    setBanks(dynamicBanks);
  }, [gameState.level]);

  // Initial property data
  const initialAvailableLands = generateRandomLands(10, gameState.level);
  const initialConstructionTypes = {
    residential: [
      {
        id: 'r1',
        name: 'Small House',
        description: 'Single family home with 2 bedrooms',
        minLandSize: 2500,
        maxUnits: 1,
        costPerSqFt: 120,
        daysToComplete: 60,
        valueMultiplier: 1.5,
        icon: 'home'
      },
      {
        id: 'r2',
        name: 'Medium Apartments',
        description: '5-10 units apartment building',
        minLandSize: 8000,
        maxUnits: 10,
        costPerSqFt: 150,
        daysToComplete: 180,
        valueMultiplier: 1.8,
        icon: 'building'
      },
      // Additional types defined in ConstructionManager.js
    ],
    commercial: [
      {
        id: 'c1',
        name: 'Small Office',
        description: 'Single tenant office space',
        minLandSize: 3000,
        maxUnits: 1,
        costPerSqFt: 180,
        daysToComplete: 90,
        valueMultiplier: 1.6,
        icon: 'briefcase'
      },
      // Additional types defined in ConstructionManager.js
    ],
    mixeduse: [
      {
        id: 'm1',
        name: 'Mixed-Use Development',
        description: 'Retail on ground floor, apartments above',
        minLandSize: 12000,
        maxUnits: 25,
        costPerSqFt: 230,
        daysToComplete: 360,
        valueMultiplier: 2.3,
        icon: 'store-alt'
      },
      // Additional types defined in ConstructionManager.js
    ]
  };

  // Handle game events
  const onEvent = (e) => {
    if (e.type === 'balance-update') {
      console.log("Received balance update event:", e.balance);
      setGameState(prevState => ({
        ...prevState,
        balance: e.balance
      }));
      
      // Also update the entities directly
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.balance) {
        console.log("Updating balance entity directly in onEvent");
        gameEngineRef.current.entities.balance.value = e.balance;
        
        const Balance = require('./components/Balance').default;
        gameEngineRef.current.entities.balance.renderer = <Balance value={e.balance} />;
      }
    } else if (e.type === 'level-up') {
      setGameState(prevState => ({
        ...prevState,
        level: prevState.level + 1
      }));
      
      // Update available banks with the new level
      const dynamicBanks = initializeBanks(gameState.level + 1);
      setBanks(dynamicBanks);
    } else if (e.type === 'open-finance') {
      setShowFinance(true);
      setActiveLoan(e.currentLoan);
      setBanks(e.banks || initializeBanks(gameState.level));
      setCreditScore(e.creditScore || 750);
      
      // Get loan history
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.finance) {
        setLoanHistory(gameEngineRef.current.entities.finance.loanHistory || []);
      }
    } else if (e.type === 'open-properties') {
      setShowProperties(true);
    } else if (e.type === 'emi-payment') {
      if (e.success) {
        // Update the loan info in state
        if (e.remainingMonths <= 0) {
          setActiveLoan(null);
        } else {
          setActiveLoan(prevLoan => ({
            ...prevLoan,
            remainingAmount: e.remainingLoan,
            remainingMonths: e.remainingMonths,
            totalInterestPaid: (prevLoan.totalInterestPaid || 0) + e.interestPaid
          }));
        }
        
        // Show notification to player about the payment
        Alert.alert(
          "EMI Payment Successful",
          `Payment of $${e.amount.toLocaleString()} processed.\nPrincipal: $${Math.round(e.principalPaid).toLocaleString()}\nInterest: $${Math.round(e.interestPaid).toLocaleString()}`
        );
      } else {
        // Payment failed
        Alert.alert(
          "Payment Failed",
          `Insufficient funds to pay EMI of $${e.amount.toLocaleString()}.`
        );
      }
    } else if (e.type === 'loan-completed') {
      setActiveLoan(null);
      
      // Update loan history
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.finance) {
        setLoanHistory(gameEngineRef.current.entities.finance.loanHistory || []);
      }
      
      Alert.alert(
        "Loan Paid Off",
        "Congratulations! Your loan has been fully paid off."
      );
    } else if (e.type === 'loan-penalty') {
      Alert.alert(
        "Loan Penalty",
        `${e.message} A penalty of $${e.penalty.toLocaleString()} has been added to your loan.`
      );
    } else if (e.type === 'property-update') {
      // Update React state with property entity data
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.propertyState) {
        setPropertyState(gameEngineRef.current.entities.propertyState);
      }
    } else if (e.type === 'construction-completed') {
      // Update construction projects list
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.propertyState) {
        setPropertyState(gameEngineRef.current.entities.propertyState);
      }
    } else if (e.type === 'property-sold') {
      // Update property lists after a sale
      if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.propertyState) {
        setPropertyState(gameEngineRef.current.entities.propertyState);
      }
    }
  };

  // Handle loan selection with improved error handling and user feedback
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
      Alert.alert(
        "Loan Request Denied",
        "You already have an active loan. Please pay it off before taking a new one."
      );
      return;
    }

    // Find the bank and validate it exists
    const selectedBank = banks.find(bank => bank.id === bankId);
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

    // Calculate EMI and generate amortization schedule
    let emiAmount, schedule, totalInterest;
    try {
      emiAmount = calculateEMI(numericAmount, numericInterestRate, loanDuration);
      if (isNaN(emiAmount) || emiAmount <= 0) {
        throw new Error(`Invalid EMI calculated: ${emiAmount}`);
      }
      
      // Generate the full payment schedule
      schedule = generateAmortizationSchedule(numericAmount, numericInterestRate, loanDuration);
      
      // Calculate total interest
      totalInterest = calculateTotalInterest(numericAmount, emiAmount, loanDuration);
    } catch (error) {
      console.error('Error calculating loan details:', error);
      Alert.alert(
        "Loan Calculation Error",
        "There was a problem calculating your loan payments. Please try again."
      );
      return;
    }

    // Create the loan object with enhanced details
    const newLoan = {
      bankId,
      bankName: selectedBank.name,
      originalAmount: numericAmount,
      remainingAmount: numericAmount,
      interestRate: numericInterestRate,
      duration: loanDuration,
      remainingMonths: loanDuration,
      emiAmount,
      totalInterest,
      totalInterestPaid: 0,
      schedule,
      // Pre-closure amount includes 2.5% penalty
      preCloseAmount: numericAmount * 1.025,
      startDate: Date.now()
    };

    // Calculate new balance
    const newBalance = gameState.balance + numericAmount;

    // Update React state first - for UI updates
    setActiveLoan(newLoan);
    setGameState(prev => ({
      ...prev,
      balance: newBalance
    }));

    // Update game engine using the dispatch system instead of direct entity manipulation
    if (gameEngineRef.current) {
      gameEngineRef.current.dispatch({
        type: 'balance-update',
        balance: newBalance
      });

      // Also try to directly update the entity if possible
      if (gameEngineRef.current.entities && gameEngineRef.current.entities.balance) {
        const Balance = require('./components/Balance').default;
        gameEngineRef.current.entities.balance.value = newBalance;
        gameEngineRef.current.entities.balance.renderer = <Balance value={newBalance} />;
        
        console.log("Directly updated balance entity to:", newBalance);
      }
      
      gameEngineRef.current.dispatch({
        type: 'take-loan',
        bankId,
        loanOptionIndex,
        amount: numericAmount,
        interestRate: numericInterestRate,
        duration: loanDuration
      });
    } else {
      console.warn('Game engine reference not available, UI state updated but game engine not updated');
    }

    // Close the finance screen
    setShowFinance(false);
    
    // Log success message
    console.log(`Loan taken successfully: ${numericAmount} from ${selectedBank.name} at ${numericInterestRate}% for ${loanDuration} months.`);
    
    // Show a success message to the user with enhanced details
    setTimeout(() => {
      Alert.alert(
        "Loan Approved",
        `Your loan of $${numericAmount.toLocaleString()} has been approved!\n\nMonthly Payment: $${emiAmount.toLocaleString()}\nTotal Interest: $${Math.round(totalInterest).toLocaleString()}\nTotal Cost: $${Math.round(numericAmount + totalInterest).toLocaleString()}`
      );
    }, 500);
  };

  // Handle pay EMI with improved feedback
  const handlePayEMI = () => {
    if (gameEngine && activeLoan) {
      // Verify sufficient funds first
      if (gameState.balance < activeLoan.emiAmount) {
        Alert.alert(
          "Insufficient Funds",
          `You need $${activeLoan.emiAmount.toLocaleString()} to make your EMI payment, but you only have $${gameState.balance.toLocaleString()}.`
        );
        return;
      }
      
      gameEngine.dispatch({
        type: 'pay-emi'
      });
    }
  };
// Handle pre-close with improved details and confirmation
const handlePreClose = () => {
  if (gameEngine && activeLoan) {
    // Calculate pre-closure amount with 2.5% penalty
    const preClosureAmount = activeLoan.remainingAmount * 1.025;
    const penaltyAmount = activeLoan.remainingAmount * 0.025;
    
    // Verify sufficient funds
    if (gameState.balance < preClosureAmount) {
      Alert.alert(
        "Insufficient Funds",
        `You need ${Math.round(preClosureAmount).toLocaleString()} to pre-close your loan (includes ${Math.round(penaltyAmount).toLocaleString()} penalty), but you only have ${gameState.balance.toLocaleString()}.`
      );
      return;
    }
    
    // Ask for confirmation
    Alert.alert(
      "Confirm Pre-Closure",
      `Are you sure you want to pay off your loan early?\n\nRemaining Principal: ${Math.round(activeLoan.remainingAmount).toLocaleString()}\nPre-Closure Penalty (2.5%): ${Math.round(penaltyAmount).toLocaleString()}\nTotal Payment: ${Math.round(preClosureAmount).toLocaleString()}`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Pay Now",
          onPress: () => {
            gameEngine.dispatch({
              type: 'pre-close-loan'
            });
            setActiveLoan(null);
            
            // Update loan history after pre-closure
            if (gameEngineRef.current && gameEngineRef.current.entities && gameEngineRef.current.entities.finance) {
              setLoanHistory(gameEngineRef.current.entities.finance.loanHistory || []);
            }
          }
        }
      ]
    );
  }
};

  // Property handlers
  const handleBuyLand = (landId) => {
    if (gameEngine) {
      gameEngine.dispatch({
        type: 'buy-land',
        landId: landId
      });
    }
  };

  const handleStartConstruction = (propertyId, constructionTypeId, cost, units, daysToComplete) => {
    if (gameEngine) {
      gameEngine.dispatch({
        type: 'start-construction',
        propertyId: propertyId,
        constructionTypeId: constructionTypeId,
        cost: cost,
        units: units,
        daysToComplete: daysToComplete
      });
    }
  };

  const handleSellProperty = (propertyId, listingPrice) => {
    if (gameEngine) {
      gameEngine.dispatch({
        type: 'list-property',
        propertyId: propertyId,
        listingPrice: listingPrice
      });
    }
  };

  const handleModifyListing = (propertyId) => {
    // Open a modal to modify listing price
    // For simplicity, we'll just use a prompt here
    const property = propertyState.propertiesForSale.find(p => p.id === propertyId);
    if (property) {
      const newPrice = prompt('Enter new listing price:', property.listingPrice);
      if (newPrice && !isNaN(Number(newPrice)) && Number(newPrice) > 0) {
        // Remove old listing and create a new one
        if (gameEngine) {
          gameEngine.dispatch({
            type: 'remove-listing',
            propertyId: propertyId
          });
          
          gameEngine.dispatch({
            type: 'list-property',
            propertyId: propertyId,
            listingPrice: Number(newPrice)
          });
        }
      }
    }
  };

  const handleRemoveListing = (propertyId) => {
    if (gameEngine) {
      gameEngine.dispatch({
        type: 'remove-listing',
        propertyId: propertyId
      });
    }
  };

  const handleListUnitsBulk = (propertyId, listingPrice) => {
    if (gameEngine) {
      gameEngine.dispatch({
        type: 'list-units-bulk',
        propertyId: propertyId,
        listingPrice: listingPrice
      });
    }
  };

  const handleListUnitsIndividually = (propertyId, pricePerUnit) => {
    if (gameEngine) {
      gameEngine.dispatch({
        type: 'list-units-individually',
        propertyId: propertyId,
        pricePerUnit: pricePerUnit
      });
    }
  };

  // Create initial entities for the game with improved finance system
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
    
    // Finance system data with more details
    finance: {
      banks: initializeBanks(gameState.level),
      activeLoan: null,
      emiDueTimer: 0,
      emiInterval: 30000, // 30 seconds between EMI payments (for testing)
      loanHistory: [],
      creditScore: 750
    },
    
    // Property system data
    propertyState: {
      availableLands: initialAvailableLands,
      ownedProperties: [],
      constructionProjects: [],
      propertiesForSale: [],
      salesHistory: [],
      constructionTypes: initialConstructionTypes,
      timer: 0,
      landRefreshTimer: 0,
      landRefreshInterval: 300, // Refresh available lands every 5 minutes (300 seconds)
    },
    
    // Finance button (attached to bottom nav)
    financeButton: {
      position: [280, 820],  // Position x, y
      size: [60, 60],        // Width, height
      renderer: <View />     // Invisible renderer (using bottom nav)
    },
    
    // Properties button (attached to bottom nav)
    propertiesButton: {
      position: [100, 820],  // Position x, y
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
        systems={[
          BalanceUpdateSystem, // Add this as the first system
          UpdateBalance, 
          ProcessOffers, 
          PropertyTimer, 
          FinanceSystem, 
          PropertySystem, 
          PropertyEventHandler,
          dispatchHandler
        ]}
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
          banks={banks}
          activeLoan={activeLoan}
          playerLevel={gameState.level}
          creditScore={creditScore}
          loanHistory={loanHistory}
          onSelectLoan={handleSelectLoan}
          onPayEMI={handlePayEMI}
          onPreClose={handlePreClose}
          onClose={() => setShowFinance(false)}
        />
      )}

      {/* Property Screen Overlay */}
      {showProperties && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f5f5f5',
          zIndex: 100,
        }}>
          <PropertyScreen
            gameState={gameState}
            availableLands={propertyState.availableLands}
            ownedProperties={propertyState.ownedProperties}
            onBuyLand={handleBuyLand}
            onClose={() => setShowProperties(false)}
          />
        </View>
      )}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'properties' && styles.activeNavItem]}
          onPress={() => {
            setShowProperties(true);
            setActiveNavItem('properties');
          }}
        >
          <Ionicons 
            name="home-outline" 
            size={24} 
            color={activeNavItem === 'properties' ? "#f0b042" : "#8c8c8c"} 
          />
          <Text style={[
            styles.navText, 
            activeNavItem === 'properties' && styles.activeNavText
          ]}>Properties</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'market' && styles.activeNavItem]}
          onPress={() => setActiveNavItem('market')}
        >
          <FontAwesome5 
            name="chart-bar" 
            size={24} 
            color={activeNavItem === 'market' ? "#f0b042" : "#8c8c8c"} 
          />
          <Text style={[
            styles.navText, 
            activeNavItem === 'market' && styles.activeNavText
          ]}>Market</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, styles.homeButton, activeNavItem === 'home' && styles.activeHomeButton]}
          onPress={() => {
            setActiveNavItem('home');
            // Close any open screens
            setShowProperties(false);
            setShowFinance(false);
          }}
        >
          <View style={[
            styles.homeButtonInner, 
            activeNavItem === 'home' && styles.activeHomeButtonInner
          ]}>
            <Ionicons name="home" size={24} color="white" />
          </View>
          <Text style={[styles.navText, {color: 'white'}]}>HOME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'finance' && styles.activeNavItem]}
          onPress={() => {
            setShowFinance(true);
            setActiveNavItem('finance');
          }}
        >
          <FontAwesome5 
            name="university" 
            size={24} 
            color={activeNavItem === 'finance' ? "#f0b042" : "#8c8c8c"} 
          />
          <Text style={[
            styles.navText, 
            activeNavItem === 'finance' && styles.activeNavText
          ]}>Finance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'profile' && styles.activeNavItem]}
          onPress={() => setActiveNavItem('profile')}
        >
          <FontAwesome5 
            name="user" 
            size={24} 
            color={activeNavItem === 'profile' ? "#f0b042" : "#8c8c8c"} 
          />
          <Text style={[
            styles.navText, 
            activeNavItem === 'profile' && styles.activeNavText
          ]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Keep the original styles
const styles = StyleSheet.create({
  // Original styles omitted for brevity
  // This would keep all the existing styles from the original file
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
  activeNavItem: {
    // Optional: add styling for active nav items
  },
  activeNavText: {
    color: '#f0b042',
    fontWeight: 'bold',
  },
  activeHomeButton: {
    // Optional: add styling for active home button
  },
  activeHomeButtonInner: {
    backgroundColor: '#f5c676', // Lighter color to show it's active
  }
});