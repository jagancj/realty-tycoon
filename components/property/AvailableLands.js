// File: components/property/AvailableLands.js
// Description: Component to display and purchase available land parcels
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Land Card Component
const LandCard = ({ land, onBuyLand, canAfford }) => {
  return (
    <View style={styles.landCard}>
      <View style={styles.landHeader}>
        <View style={styles.landTypeTag}>
          <Text style={styles.landTypeText}>{land.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.landPrice}>${(land.price/1000).toFixed(0)}K</Text>
      </View>
      
      <Text style={styles.landSize}>{land.size.toLocaleString()} sq ft</Text>
      <Text style={styles.landLocation}>{land.location}</Text>
      
      <View style={styles.landDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="ruler" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Size: {land.size.toLocaleString()} sq ft</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="building" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Ideal for: {land.idealFor}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="dollar-sign" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Price per sq ft: ${land.pricePerSqFt}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="chart-line" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Growth potential: {land.growthPotential}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.buyButton, !canAfford && styles.disabledButton]}
        onPress={() => canAfford && onBuyLand(land.id)}
        disabled={!canAfford}
      >
        <Text style={styles.buyButtonText}>
          {canAfford ? 'BUY LAND' : 'INSUFFICIENT FUNDS'}
        </Text>
        <Text style={styles.buyButtonPrice}>${land.price.toLocaleString()}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function AvailableLands({ lands, balance, onBuyLand }) {
  const [filter, setFilter] = useState('all');
  
  // Filter lands based on the selected filter
  const filteredLands = lands.filter(land => {
    if (filter === 'all') return true;
    return land.type === filter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'residential' && styles.activeFilter]}
          onPress={() => setFilter('residential')}
        >
          <Text style={[styles.filterText, filter === 'residential' && styles.activeFilterText]}>Residential</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'commercial' && styles.activeFilter]}
          onPress={() => setFilter('commercial')}
        >
          <Text style={[styles.filterText, filter === 'commercial' && styles.activeFilterText]}>Commercial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'mixeduse' && styles.activeFilter]}
          onPress={() => setFilter('mixeduse')}
        >
          <Text style={[styles.filterText, filter === 'mixeduse' && styles.activeFilterText]}>Mixed Use</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredLands}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LandCard 
            land={item} 
            onBuyLand={onBuyLand}
            canAfford={balance >= item.price}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#2c3e50',
  },
  activeFilter: {
    backgroundColor: '#1c2e40',
    borderWidth: 1,
    borderColor: '#f0b042',
  },
  filterText: {
    color: '#FFF',
    fontSize: 12,
  },
  activeFilterText: {
    color: '#f0b042',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  landCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  landHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  landTypeTag: {
    backgroundColor: '#62b0d6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  landTypeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  landPrice: {
    color: '#4caf50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  landSize: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  landLocation: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 10,
  },
  landDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    color: '#DDD',
    fontSize: 14,
    marginLeft: 8,
  },
  buyButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyButtonPrice: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});