// File: components/BankCard.js
// A standalone version of the BankCard component for easier integration

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

// Loan Type Card Component
const LoanTypeCard = ({ loanType, bank, playerLevel, relationship, onSelect }) => {
  // Calculate adjusted interest rate
  const getAdjustedRate = () => {
    let rate = loanType.baseInterestRate;
    
    // Level discount
    rate -= (playerLevel * 0.2);
    
    // Relationship discount
    if (relationship && relationship.score) {
      rate -= (relationship.score * (loanType.relationshipDiscount || 0));
    }
    
    // Ensure minimum rate
    return Math.max(3, rate).toFixed(1);
  };
  
  return (
    <TouchableOpacity 
      style={styles.loanTypeCard}
      onPress={() => onSelect(bank.id, loanType.id)}
    >
      <View style={styles.loanTypeHeader}>
        <FontAwesome5 
          name={getLoanIcon(loanType.category)} 
          size={16} 
          color="#FFF" 
        />
        <Text style={styles.loanTypeName}>{loanType.name}</Text>
      </View>
      
      <Text style={styles.loanTypeDescription}>{loanType.description}</Text>
      
      <View style={styles.loanTypeDetails}>
        <View style={styles.loanDetailItem}>
          <Text style={styles.loanDetailLabel}>Interest:</Text>
          <Text style={styles.loanDetailValue}>{getAdjustedRate()}%</Text>
        </View>
        
        <View style={styles.loanDetailItem}>
          <Text style={styles.loanDetailLabel}>Term:</Text>
          <Text style={styles.loanDetailValue}>
            {loanType.minDuration}-{loanType.maxDuration} months
          </Text>
        </View>
        
        <View style={styles.loanDetailItem}>
          <Text style={styles.loanDetailLabel}>Max Amount:</Text>
          <Text style={styles.loanDetailValue}>
            ${formatCurrency(getMaxLoanAmount(loanType, playerLevel))}
          </Text>
        </View>
      </View>
      
      {loanType.requiresCollateral && (
        <View style={styles.collateralTag}>
          <FontAwesome5 name="file-contract" size={12} color="#FFF" />
          <Text style={styles.collateralText}>Requires Collateral</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Main BankCard Component
const BankCard = ({ bank, onSelect, playerLevel, relationships }) => {
  const [expanded, setExpanded] = useState(false);
  const relationship = relationships ? relationships[bank.id] || { score: 0 } : { score: 0 };
  
  // Calculate relationship level text and color
  const getRelationshipInfo = () => {
    let level, color;
    if (relationship.score >= 90) {
      level = 'Preferred Partner';
      color = '#27ae60';
    } else if (relationship.score >= 70) {
      level = 'Valued Client';
      color = '#2ecc71';
    } else if (relationship.score >= 50) {
      level = 'Established';
      color = '#f39c12';
    } else if (relationship.score >= 30) {
      level = 'Developing';
      color = '#e67e22';
    } else {
      level = 'New Client';
      color = '#e74c3c';
    }
    
    return { level, color };
  };
  
  const { level: relationshipLevel, color: relationshipColor } = getRelationshipInfo();
  
  return (
    <View style={[styles.bankCard, { backgroundColor: bank.color || '#2c3e50' }]}>
      <TouchableOpacity 
        style={styles.bankCardHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.bankInfo}>
          <FontAwesome5 name={bank.icon || 'university'} size={24} color="#FFF" />
          <View style={styles.bankNameContainer}>
            <Text style={styles.bankName}>{bank.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.bankRating}>{Array(bank.rating).fill('★').join('')}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.relationshipContainer}>
          <Text style={[styles.relationshipText, { color: relationshipColor }]}>
            {relationshipLevel}
          </Text>
          <View style={styles.relationshipBar}>
            <View 
              style={[
                styles.relationshipFill, 
                { width: `${relationship.score}%`, backgroundColor: relationshipColor }
              ]} 
            />
          </View>
        </View>
        
        <FontAwesome5 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#FFF" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.bankCardContent}>
          <Text style={styles.bankDescription}>{bank.description}</Text>
          
          {/* Relationship details if available */}
          {relationship.paymentsMade > 0 && (
            <View style={styles.relationshipDetails}>
              <Text style={styles.relationshipDetailText}>
                Payments Made: {relationship.paymentsMade}
              </Text>
              {relationship.paymentsMissed > 0 && (
                <Text style={styles.relationshipDetailText}>
                  Payments Missed: {relationship.paymentsMissed}
                </Text>
              )}
              {relationship.loansCompleted > 0 && (
                <Text style={styles.relationshipDetailText}>
                  Loans Completed: {relationship.loansCompleted}
                </Text>
              )}
            </View>
          )}
          
          <Text style={styles.loanOptionsTitle}>Available Loans</Text>
          
          <View style={styles.loanTypesList}>
            {bank.loanTypes && bank.loanTypes.length > 0 ? (
              bank.loanTypes.map((loanType, index) => (
                <LoanTypeCard
                  key={loanType.id || `loan-${index}`}
                  loanType={loanType}
                  bank={bank}
                  playerLevel={playerLevel}
                  relationship={relationship}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <Text style={styles.noLoansText}>
                No loan options available from this bank
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// Helper function to get loan icon based on category
const getLoanIcon = (category) => {
  switch (category) {
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

// Helper function to get max loan amount based on type and player level
const getMaxLoanAmount = (loanType, playerLevel) => {
  if (typeof loanType.maxAmount === 'function') {
    return loanType.maxAmount(playerLevel);
  }
  return loanType.maxAmount || (100000 * playerLevel);
};

// Helper for formatting currency
const formatCurrency = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Styles
const styles = StyleSheet.create({
  bankCard: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankNameContainer: {
    marginLeft: 10,
  },
  bankName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginTop: 2,
  },
  bankRating: {
    color: '#f0b042',
    fontSize: 14,
  },
  relationshipContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  relationshipText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  relationshipBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  relationshipFill: {
    height: '100%',
  },
  bankCardContent: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bankDescription: {
    color: '#DDD',
    fontSize: 14,
    marginBottom: 10,
  },
  relationshipDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  relationshipDetailText: {
    color: '#DDD',
    fontSize: 12,
    marginBottom: 3,
  },
  loanOptionsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  loanTypesList: {
    marginTop: 5,
  },
  loanTypeCard: {
    backgroundColor: '#3a4a5f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  loanTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanTypeName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loanTypeDescription: {
    color: '#BBB',
    fontSize: 14,
    marginBottom: 10,
  },
  loanTypeDetails: {
    marginBottom: 5,
  },
  loanDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  loanDetailLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  loanDetailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  collateralTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  collateralText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  noLoansText: {
    color: '#AAA',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
});

export default BankCard;