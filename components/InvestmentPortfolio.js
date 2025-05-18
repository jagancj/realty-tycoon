import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const InvestmentPortfolio = ({ investments, onInvest }) => {
  const [selectedType, setSelectedType] = useState('development');

  const renderInvestmentType = (type) => {
    const investment = INVESTMENT_TYPES[type];
    return (
      <TouchableOpacity
        key={type}
        style={[styles.investmentCard, 
          selectedType === type && styles.activeCard]}
        onPress={() => setSelectedType(type)}
      >
        <LottieView
          source={require('../assets/animations/investment_type.json')}
          autoPlay
          loop
          style={styles.investmentIcon}
        />
        <Text style={styles.investmentTitle}>{investment.name}</Text>
        <View style={styles.investmentDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Risk</Text>
            <Text style={[styles.detailValue, styles.riskColor]}>
              {investment.risk}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Reward</Text>
            <Text style={[styles.detailValue, styles.rewardColor]}>
              {investment.reward}x
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {investment.duration} months
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.investButton}
          onPress={() => onInvest(type)}
        >
          <Text style={styles.investButtonText}>
            INVEST ${investment.minInvestment.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Investment Portfolio</Text>
          <Text style={styles.subtitle}>Choose your investment strategy</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {Object.values(INVESTMENT_TYPES).map((type) => 
              renderInvestmentType(type.name)
            )}
          </ScrollView>

          <View style={styles.activeInvestments}>
            <Text style={styles.activeTitle}>Active Investments</Text>
            {investments.map((investment) => (
              <View key={investment.id} style={styles.activeInvestment}>
                <LottieView
                  source={require('../assets/animations/investment_progress.json')}
                  autoPlay
                  loop
                  style={styles.progressIcon}
                />
                <Text style={styles.investmentName}>
                  {investment.type}
                </Text>
                <Text style={styles.investmentProgress}>
                  {investment.progress}% Complete
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#a8d5c2',
    fontSize: 16,
    marginBottom: 20,
  },
  scrollContainer: {
    marginBottom: 20,
    paddingBottom: 20,
  },
  investmentCard: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginRight: 20,
    elevation: 5,
  },
  activeCard: {
    backgroundColor: '#00ff00',
  },
  investmentIcon: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 15,
  },
  investmentTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: '#fff',
    fontSize: 12,
  },
  detailValue: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskColor: {
    color: '#e74c3c',
  },
  rewardColor: {
    color: '#2ecc71',
  },
  investButton: {
    backgroundColor: '#00ff00',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  investButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeInvestments: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  activeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  activeInvestment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  progressIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  investmentName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  investmentProgress: {
    color: '#a8d5c2',
    fontSize: 12,
  },
});

export default InvestmentPortfolio;
