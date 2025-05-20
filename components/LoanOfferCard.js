// File: components/LoanOfferCard.js
// Description: Displays loan offers and options with interactive details

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Easing
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Helper to format currency
const formatCurrency = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function LoanOfferCard({ 
  bank, 
  loanType, 
  playerLevel,
  creditScore = 750,
  relationship,
  onApply
}) {
  // State
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState(() => {
    // Start at middle of min and max
    const min = loanType.minAmount || 10000;
    const max = getMaxLoanAmount(loanType, playerLevel);
    return min + ((max - min) / 2);
  });
  const [duration, setDuration] = useState(() => {
    // Start at middle of min and max
    return loanType.minDuration + ((loanType.maxDuration - loanType.minDuration) / 2);
  });
  
  // Animation
  const [rotateAnim] = useState(new Animated.Value(0));
  const [heightAnim] = useState(new Animated.Value(0));
  
  // Calculate interest rate with all adjustments
  const getAdjustedInterestRate = () => {
    let rate = loanType.baseInterestRate;
    
    // Level discount
    rate -= (playerLevel * 0.2);
    
    // Credit score adjustment
    if (creditScore < 580) {
      rate += 2;
    } else if (creditScore < 670) {
      rate += 1;
    } else if (creditScore < 740) {
      rate += 0;
    } else if (creditScore < 800) {
      rate -= 0.5;
    } else {
      rate -= 1;
    }
    
    // Relationship discount
    if (relationship && relationship.score) {
      rate -= (relationship.score * (loanType.relationshipDiscount || 0));
    }
    
    // Ensure minimum rate
    return Math.max(3, rate);
  };
  
  // Calculate monthly payment (EMI)
  const calculateMonthlyPayment = () => {
    const interestRate = getAdjustedInterestRate();
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = Math.round(duration);
    
    // EMI = [P × R × (1 + R)^N]/[(1 + R)^N − 1]
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
                
    return Math.round(emi);
  };
  
  // Calculate total interest
  const calculateTotalInterest = () => {
    const monthlyPayment = calculateMonthlyPayment();
    const totalPayments = monthlyPayment * Math.round(duration);
    return totalPayments - amount;
  };
  
  // Toggle expanded state with animation
  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    
    // Run animations
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start();
    
    setExpanded(!expanded);
  };
  
  // Calculate rotation angle for animation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  // Calculate component height for animation
  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350],
  });
  
  // Helper to get loan icon
  const getLoanIcon = () => {
    switch(loanType.category) {
      case 'starter':
        return 'rocket';
      case 'business':
        return 'briefcase';
      case 'acquisition':
        return 'home';
      case 'development':
        return 'hammer';
      case 'premium':
        return 'crown';
      default:
        return 'money-bill-wave';
    }
  };
  
  // Helper to get maximum loan amount
  const getMaxLoanAmount = (loan, level) => {
    if (typeof loan.maxAmount === 'function') {
      return loan.maxAmount(level);
    }
    return loan.maxAmount;
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpanded}
      >
        <View style={styles.loanInfo}>
          <View style={[styles.iconContainer, { backgroundColor: bank.color || '#2c3e50' }]}>
            <FontAwesome5 name={getLoanIcon()} size={16} color="#FFF" />
          </View>
          <View style={styles.loanDetails}>
            <Text style={styles.loanName}>{loanType.name}</Text>
            <Text style={styles.interestRate}>{getAdjustedInterestRate().toFixed(1)}% Interest</Text>
          </View>
        </View>
        
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <FontAwesome5 name="chevron-down" size={16} color="#AAA" />
        </Animated.View>
      </TouchableOpacity>
      
      {/* Expandable content */}
      <Animated.View style={[styles.expandableContent, { maxHeight }]}>
        <View style={styles.content}>
          {/* Description */}
          <Text style={styles.description}>{loanType.description}</Text>
          
          {/* Amount slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Loan Amount</Text>
              <Text style={styles.sliderValue}>${formatCurrency(Math.round(amount))}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={loanType.minAmount || 10000}
              maximumValue={getMaxLoanAmount(loanType, playerLevel)}
              value={amount}
              onValueChange={value => setAmount(Math.round(value))}
              minimumTrackTintColor={bank.color || '#2ecc71'}
              maximumTrackTintColor="#3a4a5f"
              thumbTintColor={bank.color || '#27ae60'}
            />
            <View style={styles.sliderFooter}>
              <Text style={styles.sliderMin}>${formatCurrency(loanType.minAmount || 10000)}</Text>
              <Text style={styles.sliderMax}>${formatCurrency(getMaxLoanAmount(loanType, playerLevel))}</Text>
            </View>
          </View>
          
          {/* Duration slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Loan Duration</Text>
              <Text style={styles.sliderValue}>{Math.round(duration)} months</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={loanType.minDuration}
              maximumValue={loanType.maxDuration}
              value={duration}
              onValueChange={value => setDuration(Math.round(value))}
              minimumTrackTintColor={bank.color || '#2ecc71'}
              maximumTrackTintColor="#3a4a5f"
              thumbTintColor={bank.color || '#27ae60'}
              step={1}
            />
            <View style={styles.sliderFooter}>
              <Text style={styles.sliderMin}>{loanType.minDuration} months</Text>
              <Text style={styles.sliderMax}>{loanType.maxDuration} months</Text>
            </View>
          </View>
          
          {/* Loan summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monthly Payment:</Text>
              <Text style={styles.summaryValue}>${formatCurrency(calculateMonthlyPayment())}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Interest:</Text>
              <Text style={styles.summaryValue}>${formatCurrency(Math.round(calculateTotalInterest()))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Repayment:</Text>
              <Text style={styles.summaryValue}>${formatCurrency(Math.round(amount + calculateTotalInterest()))}</Text>
            </View>
          </View>
          
          {/* Apply button */}
          <TouchableOpacity 
            style={[styles.applyButton, { backgroundColor: bank.color || '#2ecc71' }]}
            onPress={() => onApply(
              bank.id,
              loanType.id,
              Math.round(amount),
              getAdjustedInterestRate(),
              Math.round(duration)
            )}
          >
            <Text style={styles.applyButtonText}>APPLY NOW</Text>
          </TouchableOpacity>
          
          {/* Requirements */}
          {loanType.requiresCollateral && (
            <View style={styles.requirement}>
              <FontAwesome5 name="exclamation-circle" size={14} color="#f39c12" />
              <Text style={styles.requirementText}>Requires property collateral</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  loanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  loanDetails: {
    flex: 1,
  },
  loanName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  interestRate: {
    color: '#2ecc71',
    fontSize: 14,
  },
  expandableContent: {
    overflow: 'hidden',
  },
  content: {
    padding: 15,
    paddingTop: 0,
  },
  description: {
    color: '#BBB',
    fontSize: 14,
    marginBottom: 15,
  },
  sliderContainer: {
    marginBottom: 15,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sliderLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  sliderValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderMin: {
    color: '#AAA',
    fontSize: 12,
  },
  sliderMax: {
    color: '#AAA',
    fontSize: 12,
  },
  summary: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  summaryLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  applyButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    color: '#f39c12',
    fontSize: 14,
    marginLeft: 8,
    fontStyle: 'italic',
  },
});