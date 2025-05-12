// File: components/PropertyScreen.js
// A streamlined version that only handles the property section content
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Simple tabs for property navigation
const PropertyTabs = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.propertyTabs}>
      <TouchableOpacity 
        style={[styles.propertyTab, activeTab === 'buy' && styles.activePropertyTab]}
        onPress={() => setActiveTab('buy')}
      >
        <FontAwesome5 name="map" size={22} color="#fff" />
        <Text style={styles.propertyTabText}>BUY LAND</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.propertyTab, activeTab === 'owned' && styles.activePropertyTab]}
        onPress={() => setActiveTab('owned')}
      >
        <FontAwesome5 name="home" size={22} color="#fff" />
        <Text style={styles.propertyTabText}>MY LANDS</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.propertyTab, activeTab === 'develop' && styles.activePropertyTab]}
        onPress={() => setActiveTab('develop')}
      >
        <FontAwesome5 name="hammer" size={22} color="#fff" />
        <Text style={styles.propertyTabText}>DEVELOP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function PropertyScreen({ 
  gameState, 
  availableLands = [], 
  ownedProperties = [], 
  onBuyLand,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('buy');
  
  // Handler for buying land
  const handleBuyLand = (landId) => {
    if (onBuyLand) {
      onBuyLand(landId);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'buy':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>AVAILABLE LANDS</Text>
            <Text style={styles.landTypeTitle}>SUBURBAN</Text>
            <Text style={styles.landSizeText}>3,000 m²</Text>
            
            {/* Display available lands */}
            <ScrollView style={styles.landList}>
              {availableLands.map(land => (
                <View key={land.id} style={styles.landItem}>
                  <View style={styles.landImagePlaceholder}>
                    <FontAwesome5 
                      name={land.type === 'residential' ? 'home' : 'building'} 
                      size={40} 
                      color="#333" 
                    />
                  </View>
                  <View style={styles.landDetails}>
                    <Text style={styles.landType}>{land.type.toUpperCase()}</Text>
                    <Text style={styles.landSize}>{land.size.toLocaleString()} m²</Text>
                    <TouchableOpacity 
                      style={styles.purchaseButton}
                      onPress={() => handleBuyLand(land.id)}
                    >
                      <Text style={styles.purchaseText}>PURCHASE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );
      
      case 'owned':
        return (
          <View style={styles.content}>
            {ownedProperties.length > 0 ? (
              <ScrollView>
                {ownedProperties.map(property => (
                  <View key={property.id} style={styles.propertyItem}>
                    <View style={styles.propertyHeader}>
                      <Text style={styles.propertyTitle}>
                        {property.location || 'Property'}
                      </Text>
                      <Text style={styles.propertySize}>
                        {property.size.toLocaleString()} m²
                      </Text>
                    </View>
                    <View style={styles.propertyImagePlaceholder}>
                      <FontAwesome5 
                        name={property.status === 'vacant' ? 'leaf' : 'building'} 
                        size={40} 
                        color="#333" 
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  You don't own any properties yet.
                </Text>
                <Text style={styles.emptySubtext}>
                  Visit the BUY LAND tab to purchase your first property.
                </Text>
              </View>
            )}
          </View>
        );
      
      case 'develop':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>DEVELOPMENT</Text>
            <Text style={styles.landTypeTitle}>SUBURBAN</Text>
            <Text style={styles.landSizeText}>3,000 m²</Text>
            
            <View style={styles.buildOptions}>
              <TouchableOpacity style={styles.buildOption}>
                <View style={styles.buildImagePlaceholder}>
                  <FontAwesome5 name="home" size={40} color="#333" />
                </View>
                <Text style={styles.buildText}>HOUSE</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buildOption}>
                <View style={styles.buildImagePlaceholder}>
                  <FontAwesome5 name="building" size={40} color="#333" />
                </View>
                <Text style={styles.buildText}>OFFICE</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.buildButton}>
              <Text style={styles.buildButtonText}>BUILD</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Green header bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <FontAwesome5 name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {activeTab === 'buy' ? 'BUY LAND' : 
           activeTab === 'owned' ? 'MY LANDS' : 'DEVELOP'}
        </Text>
        
        <View style={styles.costContainer}>
          <Text style={styles.costText}>$0</Text>
        </View>
      </View>
      
      {/* Property tabs */}
      <PropertyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content area */}
      <View style={styles.mainContent}>
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
    backgroundColor: '#2a936a',
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
  costContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  costText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  propertyTabs: {
    flexDirection: 'row',
    backgroundColor: '#2a936a',
    paddingBottom: 10,
  },
  propertyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 5,
    borderBottomColor: 'transparent',
  },
  activePropertyTab: {
    borderBottomColor: 'white',
  },
  propertyTabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  landTypeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2a936a',
    marginTop: 5,
  },
  landSizeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  landList: {
    marginBottom: 20,
  },
  landItem: {
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
  landImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  landDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  landType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  landSize: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a936a',
  },
  purchaseButton: {
    backgroundColor: '#f0b042',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  purchaseText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  propertyItem: {
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
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a936a',
  },
  propertySize: {
    fontSize: 16,
    color: '#333',
  },
  propertyImagePlaceholder: {
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buildOption: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buildImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buildText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buildButton: {
    backgroundColor: '#f0b042',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buildButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});