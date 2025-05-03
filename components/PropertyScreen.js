// File: components/PropertyScreen.js
// Description: Main screen for the Property module
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AvailableLands from './property/AvailableLands';
import OwnedProperties from './property/OwnedProperties';
import ConstructionManager from './property/ConstructionManager';
import PropertyMarket from './property/PropertyMarket';

// Tabs for the property screen
const TABS = {
  AVAILABLE: 'available',
  OWNED: 'owned',
  CONSTRUCTION: 'construction',
  MARKET: 'market'
};

export default function PropertyScreen({ 
  gameState, 
  availableLands, 
  ownedProperties, 
  constructionProjects,
  propertiesForSale,
  onBuyLand, 
  onStartConstruction, 
  onSellProperty,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState(TABS.AVAILABLE);

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.AVAILABLE:
        return (
          <AvailableLands 
            lands={availableLands} 
            balance={gameState.balance}
            onBuyLand={onBuyLand}
          />
        );
      case TABS.OWNED:
        return (
          <OwnedProperties 
            properties={ownedProperties} 
            onSelectForConstruction={(propertyId) => {
              setActiveTab(TABS.CONSTRUCTION);
              // Optionally pre-select the property in construction tab
            }}
          />
        );
      case TABS.CONSTRUCTION:
        return (
          <ConstructionManager 
            properties={ownedProperties}
            constructionProjects={constructionProjects}
            balance={gameState.balance}
            onStartConstruction={onStartConstruction}
          />
        );
      case TABS.MARKET:
        return (
          <PropertyMarket 
            propertiesForSale={propertiesForSale}
            onSellProperty={onSellProperty}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROPERTIES</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesome5 name="times" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === TABS.AVAILABLE && styles.activeTab]} 
          onPress={() => setActiveTab(TABS.AVAILABLE)}
        >
          <FontAwesome5 name="search" size={16} color={activeTab === TABS.AVAILABLE ? "#f0b042" : "#FFF"} />
          <Text style={[styles.tabText, activeTab === TABS.AVAILABLE && styles.activeTabText]}>Available</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === TABS.OWNED && styles.activeTab]} 
          onPress={() => setActiveTab(TABS.OWNED)}
        >
          <FontAwesome5 name="home" size={16} color={activeTab === TABS.OWNED ? "#f0b042" : "#FFF"} />
          <Text style={[styles.tabText, activeTab === TABS.OWNED && styles.activeTabText]}>My Properties</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === TABS.CONSTRUCTION && styles.activeTab]} 
          onPress={() => setActiveTab(TABS.CONSTRUCTION)}
        >
          <FontAwesome5 name="hammer" size={16} color={activeTab === TABS.CONSTRUCTION ? "#f0b042" : "#FFF"} />
          <Text style={[styles.tabText, activeTab === TABS.CONSTRUCTION && styles.activeTabText]}>Construction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === TABS.MARKET && styles.activeTab]} 
          onPress={() => setActiveTab(TABS.MARKET)}
        >
          <FontAwesome5 name="tag" size={16} color={activeTab === TABS.MARKET ? "#f0b042" : "#FFF"} />
          <Text style={[styles.tabText, activeTab === TABS.MARKET && styles.activeTabText]}>Market</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
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
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#2c3e50',
  },
  activeTab: {
    backgroundColor: '#1c2e40',
    borderWidth: 1,
    borderColor: '#f0b042',
  },
  tabText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: '#f0b042',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});