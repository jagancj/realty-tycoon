import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MarketAnalysis = ({ marketData }) => {
  const [selectedSector, setSelectedSector] = useState('residential');
  const [selectedTimeframe, setSelectedTimeframe] = useState('mediumTerm');

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2a2a2a',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#00ff00"
    }
  };

  const renderSectorAnalysis = () => {
    const sector = MARKET_SECTORS[selectedSector];
    return (
      <View style={styles.sectorAnalysis}>
        <View style={styles.sectorHeader}>
          <LottieView
            source={require('../assets/animations/sector_analysis.json')}
            autoPlay
            loop
            style={styles.sectorIcon}
          />
          <Text style={styles.sectorTitle}>{sector.name}</Text>
        </View>
        
        <LineChart
          data={marketData.priceHistory[selectedSector]}
          width={SCREEN_WIDTH - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withHorizontalLabels={false}
        />

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>ROI</Text>
            <Text style={styles.metricValue}>{marketData.roi[selectedSector]}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Volatility</Text>
            <Text style={styles.metricValue}>{sector.volatility * 100}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Growth</Text>
            <Text style={styles.metricValue}>{marketData.growth[selectedSector]}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMarketTrends = () => {
    return (
      <View style={styles.trendsContainer}>
        <Text style={styles.trendsTitle}>Market Trends</Text>
        
        {Object.values(MARKET_TRENDS).map((trend) => (
          <TouchableOpacity
            key={trend.name}
            style={[styles.trendButton, 
              selectedTimeframe === trend.name && styles.activeTrend]}
            onPress={() => setSelectedTimeframe(trend.name)}
          >
            <Text style={styles.trendText}>{trend.name}</Text>
          </TouchableOpacity>
        ))}

        <LineChart
          data={marketData.trends[selectedTimeframe]}
          width={SCREEN_WIDTH - 40}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withHorizontalLabels={false}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.sectorSelector}>
            {Object.values(MARKET_SECTORS).map((sector) => (
              <TouchableOpacity
                key={sector.name}
                style={[styles.sectorButton, 
                  selectedSector === sector.name && styles.activeSector]}
                onPress={() => setSelectedSector(sector.name)}
              >
                <LottieView
                  source={require('../assets/animations/sector_icon.json')}
                  autoPlay
                  loop
                  style={styles.sectorIcon}
                />
                <Text style={styles.sectorText}>{sector.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderSectorAnalysis()}
          {renderMarketTrends()}
        </View>
      </LinearGradient>
    </ScrollView>
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
  sectorSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sectorButton: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  activeSector: {
    backgroundColor: '#00ff00',
  },
  sectorIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  sectorText: {
    color: '#fff',
    fontSize: 14,
  },
  sectorAnalysis: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  sectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chart: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#fff',
    fontSize: 12,
  },
  metricValue: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  trendsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  trendButton: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  activeTrend: {
    backgroundColor: '#00ff00',
  },
  trendText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MarketAnalysis;
