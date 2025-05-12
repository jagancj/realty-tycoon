// File: components/MarketScreen.js
// Description: Market screen for property tycoon game
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

// Market tabs component
const MarketTabs = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <FontAwesome5 name="chart-line" size={18} color={activeTab === 'overview' ? "#fff" : "#a8d5c2"} />
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>OVERVIEW</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
        onPress={() => setActiveTab('listings')}
      >
        <FontAwesome5 name="home" size={18} color={activeTab === 'listings' ? "#fff" : "#a8d5c2"} />
        <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>LISTINGS</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'auctions' && styles.activeTab]}
        onPress={() => setActiveTab('auctions')}
      >
        <FontAwesome5 name="gavel" size={18} color={activeTab === 'auctions' ? "#fff" : "#a8d5c2"} />
        <Text style={[styles.tabText, activeTab === 'auctions' && styles.activeTabText]}>AUCTIONS</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'news' && styles.activeTab]}
        onPress={() => setActiveTab('news')}
      >
        <FontAwesome5 name="newspaper" size={18} color={activeTab === 'news' ? "#fff" : "#a8d5c2"} />
        <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>NEWS</Text>
      </TouchableOpacity>
    </View>
  );
};

// Market cycle indicator component
const MarketCycleIndicator = ({ currentCycle }) => {
  const cycles = [
    { name: 'Recession', color: '#e74c3c', icon: 'trending-down' },
    { name: 'Recovery', color: '#f39c12', icon: 'arrow-up-right' },
    { name: 'Expansion', color: '#2ecc71', icon: 'trending-up' },
    { name: 'Peak', color: '#3498db', icon: 'arrow-down-right' }
  ];
  
  const cycleIndex = cycles.findIndex(cycle => cycle.name === currentCycle);
  
  return (
    <View style={styles.cycleContainer}>
      <Text style={styles.cycleTitle}>Market Cycle</Text>
      <View style={styles.cycleStages}>
        {cycles.map((cycle, index) => (
          <View 
            key={cycle.name}
            style={[
              styles.cycleStage, 
              { backgroundColor: index === cycleIndex ? cycle.color : '#555' }
            ]}
          >
            <Ionicons 
              name={cycle.icon} 
              size={index === cycleIndex ? 24 : 16} 
              color="#fff" 
            />
            <Text style={[
              styles.cycleName,
              index === cycleIndex && styles.activeCycleName
            ]}>
              {cycle.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// News item component
const NewsItem = ({ news }) => {
  return (
    <View style={styles.newsItem}>
      <View style={[styles.newsCategory, { backgroundColor: news.categoryColor }]}>
        <FontAwesome5 name={news.icon} size={14} color="#fff" />
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{news.title}</Text>
        <Text style={styles.newsDesc}>{news.description}</Text>
        <Text style={styles.newsTime}>{news.time}</Text>
      </View>
      <View style={styles.newsImpact}>
        <Text style={[
          styles.impactText, 
          { color: news.impact > 0 ? '#2ecc71' : '#e74c3c' }
        ]}>
          {news.impact > 0 ? '+' : ''}{news.impact}%
        </Text>
        <Text style={styles.impactRegion}>{news.region}</Text>
      </View>
    </View>
  );
};

// Property listing component
const PropertyListing = ({ property, onPress }) => {
  return (
    <TouchableOpacity style={styles.listingCard} onPress={() => onPress(property)}>
      <View style={styles.listingImageContainer}>
        <View style={styles.listingImagePlaceholder}>
          <FontAwesome5 
            name={property.type === 'residential' ? 'home' : 'building'} 
            size={40} 
            color="#333" 
          />
        </View>
        <View style={styles.listingBadge}>
          <Text style={styles.listingBadgeText}>{property.status}</Text>
        </View>
      </View>
      
      <View style={styles.listingDetails}>
        <Text style={styles.listingTitle}>{property.name}</Text>
        <Text style={styles.listingLocation}>{property.location}</Text>
        
        <View style={styles.listingFeatures}>
          <View style={styles.listingFeature}>
            <FontAwesome5 name="ruler" size={12} color="#666" />
            <Text style={styles.featureText}>{property.size} m²</Text>
          </View>
          <View style={styles.listingFeature}>
            <FontAwesome5 name="tag" size={12} color="#666" />
            <Text style={styles.featureText}>{property.type}</Text>
          </View>
        </View>
        
        <View style={styles.listingFooter}>
          <Text style={styles.listingPrice}>${property.price.toLocaleString()}</Text>
          {property.trend && (
            <View style={[
              styles.trendBadge, 
              { backgroundColor: property.trend > 0 ? '#2ecc71' : '#e74c3c' }
            ]}>
              <FontAwesome5 
                name={property.trend > 0 ? 'arrow-up' : 'arrow-down'} 
                size={10} 
                color="#fff" 
              />
              <Text style={styles.trendText}>{Math.abs(property.trend)}%</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Auction item component
const AuctionItem = ({ auction, onBid }) => {
  return (
    <View style={styles.auctionCard}>
      <View style={styles.auctionHeader}>
        <View style={styles.auctionBadge}>
          <FontAwesome5 name="gavel" size={12} color="#fff" />
          <Text style={styles.auctionBadgeText}>
            {auction.timeLeft < 60 ? 'Ending Soon!' : `${Math.floor(auction.timeLeft / 60)}h ${auction.timeLeft % 60}m left`}
          </Text>
        </View>
        <Text style={styles.auctionType}>{auction.type}</Text>
      </View>
      
      <View style={styles.auctionImagePlaceholder}>
        <FontAwesome5 
          name={auction.propertyType === 'residential' ? 'home' : 'building'} 
          size={40} 
          color="#333" 
        />
      </View>
      
      <View style={styles.auctionDetails}>
        <Text style={styles.auctionTitle}>{auction.name}</Text>
        <Text style={styles.auctionLocation}>{auction.location}</Text>
        <View style={styles.auctionPriceSection}>
          <View>
            <Text style={styles.auctionLabel}>CURRENT BID</Text>
            <Text style={styles.auctionPrice}>${auction.currentBid.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.auctionLabel}>MARKET VALUE</Text>
            <Text style={styles.auctionValue}>${auction.marketValue.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.auctionActions}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => onBid(auction, 'view')}
          >
            <Text style={styles.viewButtonText}>VIEW</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bidButton}
            onPress={() => onBid(auction, 'bid')}
          >
            <Text style={styles.bidButtonText}>PLACE BID</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Market Overview component
const MarketOverview = ({ marketData }) => {
  // Sample data for the chart
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      data: marketData.priceIndex || [100, 105, 102, 110, 115, 120],
      color: () => '#2a936a',
      strokeWidth: 2
    }]
  };

  return (
    <ScrollView style={styles.overviewContainer}>
      <MarketCycleIndicator currentCycle={marketData.currentCycle || 'Expansion'} />
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Property Price Index</Text>
        <LineChart
          data={chartData}
          width={340}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(42, 147, 106, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#2a936a"
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
      
      <View style={styles.regionsContainer}>
        <Text style={styles.sectionTitle}>Property Hotspots</Text>
        <View style={styles.regionsGrid}>
          {marketData.regions.map(region => (
            <View key={region.name} style={styles.regionCard}>
              <View style={[
                styles.regionIndicator, 
                { backgroundColor: region.growth > 5 ? '#2ecc71' : region.growth > 0 ? '#f39c12' : '#e74c3c' }
              ]} />
              <Text style={styles.regionName}>{region.name}</Text>
              <Text style={[
                styles.regionGrowth,
                { color: region.growth > 0 ? '#2ecc71' : '#e74c3c' }
              ]}>
                {region.growth > 0 ? '+' : ''}{region.growth}%
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.opportunitiesContainer}>
        <Text style={styles.sectionTitle}>Market Opportunities</Text>
        {marketData.opportunities.map(opportunity => (
          <View key={opportunity.id} style={styles.opportunityCard}>
            <View style={styles.opportunityIcon}>
              <FontAwesome5 name={opportunity.icon} size={24} color="#fff" />
            </View>
            <View style={styles.opportunityDetails}>
              <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
              <Text style={styles.opportunityDesc}>{opportunity.description}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#666" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Main Market Screen component
export default function MarketScreen({ 
  marketData = {}, 
  properties = [],
  auctions = [], 
  news = [],
  onBuyProperty,
  onBidAuction,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle property purchase
  const handlePropertyPress = (property) => {
    // Show property details or purchase modal
    if (onBuyProperty) {
      onBuyProperty(property.id);
    }
  };
  
  // Handle auction bid
  const handleAuctionAction = (auction, action) => {
    if (onBidAuction) {
      onBidAuction(auction.id, action);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MarketOverview marketData={marketData} />;
      
      case 'listings':
        return (
          <View style={styles.listingsContainer}>
            <View style={styles.filterBar}>
              <Text style={styles.resultsText}>{properties.length} Properties</Text>
              <TouchableOpacity style={styles.filterButton}>
                <FontAwesome5 name="filter" size={14} color="#fff" />
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortButton}>
                <FontAwesome5 name="sort" size={14} color="#fff" />
                <Text style={styles.filterText}>Sort</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={properties}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <PropertyListing 
                  property={item} 
                  onPress={handlePropertyPress}
                />
              )}
              contentContainerStyle={styles.listingsList}
            />
          </View>
        );
      
      case 'auctions':
        return (
          <View style={styles.auctionsContainer}>
            <Text style={styles.auctionIntro}>
              Bid on properties to get the best deals! Auctions end at the time indicated.
            </Text>
            
            <FlatList
              data={auctions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <AuctionItem 
                  auction={item} 
                  onBid={handleAuctionAction}
                />
              )}
              contentContainerStyle={styles.auctionsList}
            />
          </View>
        );
      
      case 'news':
        return (
          <View style={styles.newsContainer}>
            <Text style={styles.newsIntro}>
              Market news affects property values. Use this information for smart investments!
            </Text>
            
            <FlatList
              data={news}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <NewsItem news={item} />
              )}
              contentContainerStyle={styles.newsList}
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <FontAwesome5 name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>MARKET</Text>
        
        <View style={styles.cycleIndicator}>
          <Text style={styles.cycleText}>
            {marketData.currentCycle || 'Expansion'}
          </Text>
        </View>
      </View>
      
      {/* Tabs */}
      <MarketTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6277d6', // Different color to distinguish from property
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cycleIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  cycleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#6277d6',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'white',
  },
  tabText: {
    color: '#a8d5c2',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Overview styles
  overviewContainer: {
    padding: 15,
  },
  cycleContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cycleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cycleStages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleStage: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    width: 75,
  },
  cycleName: {
    color: 'white',
    fontSize: 10,
    marginTop: 5,
  },
  activeCycleName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
    marginVertical: 8,
  },
  regionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  regionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  regionName: {
    flex: 1,
    fontSize: 14,
  },
  regionGrowth: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  opportunitiesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  opportunityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  opportunityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6277d6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  opportunityDetails: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  opportunityDesc: {
    fontSize: 12,
    color: '#666',
  },
  
  // Listings styles
  listingsContainer: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6277d6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6277d6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  filterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listingsList: {
    padding: 15,
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  listingImageContainer: {
    position: 'relative',
  },
  listingImagePlaceholder: {
    height: 150,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f39c12',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  listingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listingDetails: {
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listingLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  listingFeatures: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  listingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6277d6',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  trendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
  // Auctions styles
  auctionsContainer: {
    padding: 15,
  },
  auctionIntro: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  auctionsList: {
    paddingBottom: 15,
  },
  auctionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  auctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  auctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  auctionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  auctionType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  auctionImagePlaceholder: {
    height: 120,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auctionDetails: {
    padding: 15,
  },
  auctionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  auctionLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  auctionPriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  auctionLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  auctionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  auctionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  auctionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  bidButton: {
    flex: 2,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bidButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // News styles
  newsContainer: {
    padding: 15,
  },
  newsIntro: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  newsList: {
    paddingBottom: 15,
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsCategory: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  newsTime: {
    fontSize: 12,
    color: '#999',
  },
  newsImpact: {
    width: 80,
    alignItems: 'flex-end',
  },
  impactText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  impactRegion: {
    fontSize: 12,
    color: '#666',
  },
});