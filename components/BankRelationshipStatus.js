// File: components/BankRelationshipStatus.js
// Description: Component to show relationship status with a bank

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BankRelationshipStatus({ bank, relationship, onPress }) {
  if (!bank || !relationship) return null;
  
  // Calculate relationship level and color
  let relationshipLevel, relationshipColor;
  if (relationship.score >= 90) {
    relationshipLevel = 'Preferred Partner';
    relationshipColor = '#27ae60';
  } else if (relationship.score >= 70) {
    relationshipLevel = 'Valued Client';
    relationshipColor = '#2ecc71';
  } else if (relationship.score >= 50) {
    relationshipLevel = 'Established';
    relationshipColor = '#f39c12';
  } else if (relationship.score >= 30) {
    relationshipLevel = 'Developing';
    relationshipColor = '#e67e22';
  } else {
    relationshipLevel = 'New Client';
    relationshipColor = '#e74c3c';
  }
  
  // Calculate relationship benefits
  const calculateInterestDiscount = () => {
    // Find max relationship discount offered by this bank
    if (!bank.loanTypes || bank.loanTypes.length === 0) return 0;
    
    const maxDiscount = Math.max(
      ...bank.loanTypes.map(loan => loan.relationshipDiscount || 0)
    );
    
    return (relationship.score * maxDiscount).toFixed(2);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: relationshipColor }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.bankInfo}>
          <FontAwesome5 name={bank.icon || 'university'} size={18} color={relationshipColor} />
          <Text style={styles.bankName}>{bank.name}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: relationshipColor }]}>
          <Text style={styles.levelText}>{relationshipLevel}</Text>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Relationship Score</Text>
        <View style={styles.scoreBar}>
          <View style={[
            styles.scoreFill, 
            { width: `${relationship.score}%`, backgroundColor: relationshipColor }
          ]} />
        </View>
        <Text style={styles.scoreValue}>{relationship.score}/100</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <FontAwesome5 name="check-circle" size={14} color={relationshipColor} />
          <Text style={styles.detailText}>
            {calculateInterestDiscount()}% interest rate discount
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <FontAwesome5 name="check-circle" size={14} color={relationshipColor} />
          <Text style={styles.detailText}>
            {relationship.loansCompleted} loan{relationship.loansCompleted !== 1 ? 's' : ''} completed
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <FontAwesome5 name="check-circle" size={14} color={relationshipColor} />
          <Text style={styles.detailText}>
            {relationship.paymentsMade} on-time payment{relationship.paymentsMade !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {relationship.paymentsMissed > 0 && (
          <View style={styles.detailRow}>
            <FontAwesome5 name="times-circle" size={14} color="#e74c3c" />
            <Text style={styles.detailText}>
              {relationship.paymentsMissed} missed payment{relationship.paymentsMissed !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Client since {new Date(relationship.firstUnlocked).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 15,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreContainer: {
    marginBottom: 15,
  },
  scoreLabel: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 5,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#3a4a5f',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  scoreFill: {
    height: '100%',
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'right',
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailText: {
    color: '#DDD',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'flex-end',
  },
  footerText: {
    color: '#AAA',
    fontSize: 12,
    fontStyle: 'italic',
  },
});