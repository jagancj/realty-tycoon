// File: components/BankScreen.js
// Description: UI component for the banking interface
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Component to display each bank's loan offers
const BankOption = ({ bank, onSelectLoan, playerLevel }) => {
  // Calculate max loan amount based on player level
  const maxLoanAmount = bank.baseLoanAmount * playerLevel;
  
  return (
    <View style={styles.bankContainer}>
      <View style={styles.bankHeader}>
        <FontAwesome5 name="university" size={24} color="#FFF" />
        <Text style={styles.bankName}>{bank.name}</Text>
        <Text style={styles.bankRating}>{Array(bank.rating).fill('★').join('')}</Text>
      </View>
      
      <View style={styles.loanOptions}>
        {bank.loanOptions.map((loan, index) => {
          // Calculate interest rate based on player level (lower level = higher interest)
          const adjustedInterestRate = loan.baseInterestRate - (playerLevel * 0.2);
          const interestRate = Math.max(adjustedInterestRate, 2.0).toFixed(1);
          
          return (
            <TouchableOpacity 
              key={index} 
              style={styles.loanOption}
              onPress={() =>{
                console.log("Selecting loan:", {
                  bankId: bank.id,
                  loanIndex: index,
                  amount: maxLoanAmount,
                  interestRate
                });
                onSelectLoan(bank.id, index, maxLoanAmount, interestRate);
              }}
            >
              <Text style={styles.loanTitle}>{loan.name}</Text>
              <Text style={styles.loanAmount}>Up to ${(maxLoanAmount/1000).toFixed(0)}K</Text>
              <Text style={styles.loanInterest}>{interestRate}% Interest</Text>
              <Text style={styles.loanDuration}>{loan.duration} months</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Component to display active loans
const ActiveLoan = ({ loan, onPayEMI, onPreClose }) => {
  return (
    <View style={styles.activeLoanContainer}>
      <View style={styles.activeLoanHeader}>
        <Text style={styles.activeLoanTitle}>Active Loan from {loan.bankName}</Text>
        <Text style={styles.activeLoanAmount}>${loan.remainingAmount.toLocaleString()}</Text>
      </View>
      
      <View style={styles.activeLoanDetails}>
        <Text style={styles.activeLoanDetail}>EMI: ${loan.emiAmount.toLocaleString()}/month</Text>
        <Text style={styles.activeLoanDetail}>Remaining: {loan.remainingMonths} months</Text>
        <Text style={styles.activeLoanDetail}>Interest: {loan.interestRate}%</Text>
      </View>
      
      <View style={styles.activeLoanActions}>
        <TouchableOpacity 
          style={[styles.loanActionButton, styles.payEmiButton]}
          onPress={onPayEMI}
        >
          <Text style={styles.buttonText}>Pay EMI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.loanActionButton, styles.preCloseButton]}
          onPress={onPreClose}
        >
          <Text style={styles.buttonText}>Pre-close (${loan.preCloseAmount.toLocaleString()})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Bank Screen component
export default function BankScreen({ banks, activeLoan, playerLevel, onSelectLoan, onPayEMI, onPreClose, onClose }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FINANCE</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesome5 name="times" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {activeLoan && (
        <ActiveLoan 
          loan={activeLoan} 
          onPayEMI={onPayEMI} 
          onPreClose={onPreClose} 
        />
      )}
      
      <ScrollView style={styles.banksScrollView}>
        {banks.map(bank => (
          <BankOption 
            key={bank.id} 
            bank={bank} 
            playerLevel={playerLevel}
            onSelectLoan={onSelectLoan} 
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 15,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  banksScrollView: {
    flex: 1,
  },
  bankContainer: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bankRating: {
    color: '#FFD700',
    marginLeft: 'auto',
  },
  loanOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loanOption: {
    backgroundColor: '#3a4a5f',
    borderRadius: 8,
    padding: 12,
    marginVertical: 5,
    width: '48%',
  },
  loanTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loanAmount: {
    color: '#4caf50',
    fontSize: 14,
    marginTop: 5,
  },
  loanInterest: {
    color: '#f0a640',
    fontSize: 14,
  },
  loanDuration: {
    color: '#BBB',
    fontSize: 12,
    marginTop: 5,
  },
  activeLoanContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  activeLoanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeLoanTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeLoanAmount: {
    color: '#4caf50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeLoanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  activeLoanDetail: {
    color: '#DDD',
    fontSize: 12,
  },
  activeLoanActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loanActionButton: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: '48%',
  },
  payEmiButton: {
    backgroundColor: '#4caf50',
  },
  preCloseButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
