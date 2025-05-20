// First, let's create a minimal working BankScreen.js file to replace the current one
// This simplified version focuses on displaying the banks correctly

// File: components/BankScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Simple Credit Score component
const CreditScoreIndicator = ({ score = 650 }) => {
  // Get color based on score
  let color;
  if (score >= 800) color = '#27ae60';
  else if (score >= 740) color = '#2ecc71';
  else if (score >= 670) color = '#f39c12';
  else if (score >= 580) color = '#e67e22';
  else color = '#e74c3c';
  
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, ((score - 300) / 550) * 100));
  
  return (
    <View style={styles.creditScoreContainer}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreTitle}>Credit Score</Text>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
      </View>
      
      <View style={styles.scoreBarContainer}>
        <View style={styles.scoreBar}>
          <View style={[styles.scoreBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

// Simple Bank Card component
const BankDisplay = ({ bank, playerLevel, onSelectLoan }) => {
  if (!bank || !bank.loanTypes) return null;
  
  return (
    <View style={[styles.bankCard, { backgroundColor: bank.color || '#2c3e50' }]}>
      <View style={styles.bankHeader}>
        <FontAwesome5 name={bank.icon || 'university'} size={24} color="#FFF" />
        <Text style={styles.bankName}>{bank.name}</Text>
        <Text style={styles.bankRating}>{'★'.repeat(bank.rating || 3)}</Text>
      </View>
      
      <Text style={styles.bankDesc}>{bank.description || 'A financial institution'}</Text>
      
      <Text style={styles.loanTitle}>Available Loans:</Text>
      
      {bank.loanTypes.map((loan, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.loanItem}
          onPress={() => onSelectLoan(bank.id, loan.id, loan.maxAmount, loan.baseInterestRate, loan.minDuration)}
        >
          <Text style={styles.loanName}>{loan.name}</Text>
          <Text style={styles.loanDetails}>
            Up to ${formatNumber(loan.maxAmount)} at {loan.baseInterestRate}% interest
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Active Loan component
const ActiveLoanDisplay = ({ loan, onPayEMI, onPreClose }) => {
  if (!loan) return null;
  
  return (
    <View style={styles.activeLoanContainer}>
      <View style={styles.loanHeader}>
        <Text style={styles.loanTitle}>Active Loan from {loan.bankName}</Text>
      </View>
      
      <View style={styles.loanDetails}>
        <View style={styles.loanDetail}>
          <Text style={styles.detailLabel}>Remaining Amount:</Text>
          <Text style={styles.detailValue}>${formatNumber(Math.round(loan.remainingAmount))}</Text>
        </View>
        
        <View style={styles.loanDetail}>
          <Text style={styles.detailLabel}>Monthly Payment:</Text>
          <Text style={styles.detailValue}>${formatNumber(Math.round(loan.emiAmount))}</Text>
        </View>
        
        <View style={styles.loanDetail}>
          <Text style={styles.detailLabel}>Remaining Months:</Text>
          <Text style={styles.detailValue}>{loan.remainingMonths}</Text>
        </View>
      </View>
      
      <View style={styles.loanActions}>
        <TouchableOpacity style={styles.payButton} onPress={onPayEMI}>
          <Text style={styles.buttonText}>Pay Monthly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeButton} onPress={onPreClose}>
          <Text style={styles.buttonText}>Pay Off Early</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Main component
export default function BankScreen({ 
  banks = [], 
  activeLoan = null, 
  playerLevel = 1, 
  creditScore = 650,
  loanHistory = [],
  onSelectLoan,
  onPayEMI,
  onPreClose,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('banks');
  
  // Ensure banks is an array
  const banksList = Array.isArray(banks) ? banks : [];
  console.log("BankScreen rendering with banks:", banksList);
  
  // Default bank if none provided and player level >= 1
  const defaultBank = {
    id: 'venture',
    name: 'Venture Capital Bank',
    description: 'Your first step into real estate!',
    rating: 3,
    icon: 'university',
    color: '#4CAF50',
    loanTypes: [{
      id: 'seed',
      name: 'Starter Loan',
      description: 'Get started with real estate',
      maxAmount: 300000 * playerLevel,
      baseInterestRate: 15,
      minDuration: 12,
      maxDuration: 24
    }]
  };
  
  // Use default bank if no banks provided
  const displayBanks = banksList.length > 0 ? banksList : (playerLevel >= 1 ? [defaultBank] : []);
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'banks':
        return (
          <ScrollView style={styles.tabContent}>
            <CreditScoreIndicator score={creditScore} />
            
            {displayBanks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No banks available yet</Text>
                <Text style={styles.emptySubtext}>Level up to unlock banks</Text>
              </View>
            ) : (
              displayBanks.map((bank, index) => (
                <BankDisplay 
                  key={index}
                  bank={bank}
                  playerLevel={playerLevel}
                  onSelectLoan={onSelectLoan}
                />
              ))
            )}
          </ScrollView>
        );
      
      case 'activeLoan':
        return (
          <ScrollView style={styles.tabContent}>
            {activeLoan ? (
              <ActiveLoanDisplay 
                loan={activeLoan}
                onPayEMI={onPayEMI}
                onPreClose={onPreClose}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No active loans</Text>
                <Text style={styles.emptySubtext}>Apply for a loan from a bank</Text>
              </View>
            )}
          </ScrollView>
        );
      
      case 'history':
        return (
          <ScrollView style={styles.tabContent}>
            {loanHistory.length > 0 ? (
              loanHistory.map((loan, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyTitle}>{loan.bankName} Loan</Text>
                  <Text style={styles.historyDetails}>
                    ${formatNumber(loan.originalAmount)} 
                    at {loan.interestRate}% 
                    for {loan.term} months
                  </Text>
                  <Text style={styles.historyDate}>
                    Completed: {new Date(loan.completionDate).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No loan history</Text>
                <Text style={styles.emptySubtext}>Your completed loans will appear here</Text>
              </View>
            )}
          </ScrollView>
        );
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FINANCE</Text>
        <TouchableOpacity onPress={onClose}>
          <FontAwesome5 name="times" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'banks' && styles.activeTab]}
          onPress={() => setActiveTab('banks')}
        >
          <FontAwesome5 
            name="university" 
            size={20} 
            color={activeTab === 'banks' ? "#f0b042" : "#AAA"} 
          />
          <Text style={[styles.tabText, activeTab === 'banks' && styles.activeTabText]}>
            Banks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activeLoan' && styles.activeTab]}
          onPress={() => setActiveTab('activeLoan')}
        >
          <FontAwesome5 
            name="file-invoice-dollar" 
            size={20} 
            color={activeTab === 'activeLoan' ? "#f0b042" : "#AAA"} 
          />
          <Text style={[styles.tabText, activeTab === 'activeLoan' && styles.activeTabText]}>
            Active Loan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <FontAwesome5 
            name="history" 
            size={20} 
            color={activeTab === 'history' ? "#f0b042" : "#AAA"} 
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {renderContent()}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1c2e40',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1c2e40',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#f0b042',
  },
  tabText: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 5,
  },
  activeTabText: {
    color: '#f0b042',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  
  // Credit Score
  creditScoreContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreBarContainer: {
    marginTop: 5,
  },
  scoreBar: {
    height: 10,
    backgroundColor: '#3a4a5f',
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
  },
  
  // Bank Card
  bankCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
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
    flex: 1,
  },
  bankRating: {
    color: '#f0b042',
    fontSize: 14,
  },
  bankDesc: {
    color: '#DDD',
    fontSize: 14,
    marginBottom: 15,
  },
  loanTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loanItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  loanName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loanDetails: {
    color: '#BBB',
    fontSize: 14,
  },
  
  // Active Loan
  activeLoanContainer: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  loanHeader: {
    marginBottom: 15,
  },
  loanTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loanDetails: {
    marginBottom: 15,
  },
  loanDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  detailLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loanActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Loan History
  historyItem: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  historyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyDetails: {
    color: '#DDD',
    fontSize: 14,
    marginBottom: 5,
  },
  historyDate: {
    color: '#AAA',
    fontSize: 12,
  },
  
  // Empty State
  emptyState: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
  },
});