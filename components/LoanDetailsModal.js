// File: components/LoanDetailsModal.js
// Description: Component to display detailed loan information and amortization schedule

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList,
  ScrollView,
  Dimensions
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LoanDetailsModal({ visible, loan, onClose }) {
  const [activeTab, setActiveTab] = useState('summary');
  
  if (!loan) return null;
  
  // Calculate the current payment number
  const currentPayment = loan.duration - loan.remainingMonths;
  
  // Calculate total amount to be paid (principal + interest)
  const totalAmount = loan.originalAmount + loan.totalInterest;
  
  // Calculate amount already paid
  const amountPaid = loan.originalAmount - loan.remainingAmount + loan.totalInterestPaid;
  
  // Calculate percentage of loan paid
  const percentagePaid = Math.round((amountPaid / totalAmount) * 100);
  
  // Render functions for different tabs
  const renderSummaryTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.loanInfoCard}>
        <View style={styles.loanInfoHeader}>
          <FontAwesome5 name="university" size={20} color="#FFF" />
          <Text style={styles.bankName}>{loan.bankName}</Text>
        </View>
        
        <Text style={styles.loanTypeName}>{loan.loanTypeName}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${percentagePaid}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{percentagePaid}% Paid</Text>
        </View>
        
        <View style={styles.loanInfoContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Amount:</Text>
            <Text style={styles.infoValue}>${loan.originalAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Remaining Principal:</Text>
            <Text style={styles.infoValue}>${Math.round(loan.remainingAmount).toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Rate:</Text>
            <Text style={styles.infoValue}>{loan.interestRate}%</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Term:</Text>
            <Text style={styles.infoValue}>{loan.duration} months</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Payment:</Text>
            <Text style={styles.infoValue}>${Math.round(loan.emiAmount).toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Remaining Payments:</Text>
            <Text style={styles.infoValue}>{loan.remainingMonths}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Interest:</Text>
            <Text style={styles.infoValue}>${Math.round(loan.totalInterest).toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Paid So Far:</Text>
            <Text style={styles.infoValue}>${Math.round(loan.totalInterestPaid).toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loan Start Date:</Text>
            <Text style={styles.infoValue}>{new Date(loan.startDate).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Early Payoff Amount:</Text>
            <Text style={styles.infoValue}>${Math.round(loan.preCloseAmount).toLocaleString()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentSummaryCard}>
        <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
        
        <View style={styles.paymentBreakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Original Loan Amount:</Text>
            <Text style={styles.breakdownValue}>${loan.originalAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Interest:</Text>
            <Text style={styles.breakdownValue}>${Math.round(loan.totalInterest).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Payments:</Text>
            <Text style={styles.breakdownValue}>${Math.round(totalAmount).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownSeparator} />
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Principal Paid So Far:</Text>
            <Text style={styles.breakdownValue}>${Math.round(loan.originalAmount - loan.remainingAmount).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Interest Paid So Far:</Text>
            <Text style={styles.breakdownValue}>${Math.round(loan.totalInterestPaid).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Paid So Far:</Text>
            <Text style={styles.breakdownValue}>${Math.round(amountPaid).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownSeparator} />
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Remaining Principal:</Text>
            <Text style={styles.breakdownValue}>${Math.round(loan.remainingAmount).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Remaining Interest:</Text>
            <Text style={styles.breakdownValue}>${Math.round(loan.totalInterest - loan.totalInterestPaid).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, styles.totalRow]}>Total Remaining:</Text>
            <Text style={[styles.breakdownValue, styles.totalValue]}>${Math.round(totalAmount - amountPaid).toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
  
  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.scheduleTitle}>Amortization Schedule</Text>
      <Text style={styles.scheduleSubtitle}>
        Monthly payment breakdown over the loan term
      </Text>
      
      <View style={styles.scheduleHeader}>
        <Text style={[styles.scheduleHeaderText, { flex: 0.2 }]}>Month</Text>
        <Text style={[styles.scheduleHeaderText, { flex: 0.25 }]}>Payment</Text>
        <Text style={[styles.scheduleHeaderText, { flex: 0.25 }]}>Principal</Text>
        <Text style={[styles.scheduleHeaderText, { flex: 0.25 }]}>Interest</Text>
        <Text style={[styles.scheduleHeaderText, { flex: 0.35 }]}>Balance</Text>
      </View>
      
      <FlatList
        data={loan.schedule}
        keyExtractor={(item) => item.month.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.scheduleRow, 
            item.month === currentPayment && styles.currentPaymentRow,
            item.month < currentPayment && styles.pastPaymentRow
          ]}>
            <Text style={[styles.scheduleCell, { flex: 0.2 }]}>{item.month}</Text>
            <Text style={[styles.scheduleCell, { flex: 0.25 }]}>${item.emi.toLocaleString()}</Text>
            <Text style={[styles.scheduleCell, { flex: 0.25 }]}>${item.principalPaid.toLocaleString()}</Text>
            <Text style={[styles.scheduleCell, { flex: 0.25 }]}>${item.interestPaid.toLocaleString()}</Text>
            <Text style={[styles.scheduleCell, { flex: 0.35 }]}>${item.remainingBalance.toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Loan Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
              onPress={() => setActiveTab('summary')}
            >
              <FontAwesome5 
                name="file-invoice-dollar" 
                size={16} 
                color={activeTab === 'summary' ? "#f0b042" : "#AAA"} 
              />
              <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
                Summary
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
              onPress={() => setActiveTab('schedule')}
            >
              <FontAwesome5 
                name="calendar-alt" 
                size={16} 
                color={activeTab === 'schedule' ? "#f0b042" : "#AAA"} 
              />
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'summary' ? renderSummaryTab() : renderScheduleTab()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '90%',
    backgroundColor: '#1c2e40',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#3a4a5f',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1c2e40',
    borderBottomWidth: 1,
    borderBottomColor: '#3a4a5f',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#f0b042',
  },
  tabText: {
    color: '#AAA',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#f0b042',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  
  // Loan Summary
  loanInfoCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  loanInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bankName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loanTypeName: {
    color: '#3498db',
    fontSize: 16,
    marginBottom: 15,
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3a4a5f',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  progressText: {
    color: '#BBB',
    fontSize: 12,
    textAlign: 'right',
  },
  loanInfoContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Payment Summary
  paymentSummaryCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  paymentSummaryTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paymentBreakdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  breakdownLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  breakdownValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  breakdownSeparator: {
    height: 1,
    backgroundColor: '#3a4a5f',
    marginVertical: 10,
  },
  totalRow: {
    color: '#f0b042',
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#f0b042',
    fontSize: 16,
  },
  
  // Schedule
  scheduleTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scheduleSubtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 15,
  },
  scheduleHeader: {
    flexDirection: 'row',
    backgroundColor: '#3a4a5f',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  scheduleHeaderText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scheduleRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a4a5f',
    backgroundColor: '#2c3e50',
  },
  currentPaymentRow: {
    backgroundColor: '#34495e',
    borderLeftWidth: 3,
    borderLeftColor: '#f0b042',
  },
  pastPaymentRow: {
    opacity: 0.7,
  },
  scheduleCell: {
    color: '#DDD',
    fontSize: 13,
  },
});