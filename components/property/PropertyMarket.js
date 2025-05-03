// File: components/property/PropertyMarket.js
// Description: Component to manage property sales
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Property Listing Card Component
const PropertyListingCard = ({ property, onModifyListing, onRemoveListing }) => {
  // Calculate days on market
  const daysOnMarket = Math.floor((Date.now() - property.listedDate) / (1000 * 60 * 60 * 24));
  
  return (
    <View style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <View style={styles.listingTag}>
          <FontAwesome5 name="tag" size={14} color="#FFF" />
          <Text style={styles.listingTagText}>FOR SALE</Text>
        </View>
        <Text style={styles.listingPrice}>${property.listingPrice.toLocaleString()}</Text>
      </View>
      
      <Text style={styles.listingName}>{property.name}</Text>
      <Text style={styles.listingLocation}>{property.location}</Text>
      
      <View style={styles.listingDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="ruler" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Size: {property.size.toLocaleString()} sq ft</Text>
        </View>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="building" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Type: {property.type}</Text>
        </View>
        
        {property.units > 0 && (
          <View style={styles.detailItem}>
            <FontAwesome5 name="home" size={14} color="#62b0d6" />
            <Text style={styles.detailText}>Units: {property.units}</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="calendar-day" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Days on market: {daysOnMarket}</Text>
        </View>
        
        {property.offers.length > 0 && (
          <View style={styles.detailItem}>
            <FontAwesome5 name="comment-dollar" size={14} color="#4caf50" />
            <Text style={styles.detailText}>
              Offers: {property.offers.length} (Top: ${Math.max(...property.offers).toLocaleString()})
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.listingActions}>
        <TouchableOpacity 
          style={styles.modifyButton}
          onPress={() => onModifyListing(property.id)}
        >
          <FontAwesome5 name="edit" size={14} color="#FFF" />
          <Text style={styles.actionButtonText}>Modify</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => onRemoveListing(property.id)}
        >
          <FontAwesome5 name="trash-alt" size={14} color="#FFF" />
          <Text style={styles.actionButtonText}>Remove</Text>
        </TouchableOpacity>
        
        {property.offers.length > 0 && (
          <TouchableOpacity style={styles.viewOffersButton}>
            <FontAwesome5 name="eye" size={14} color="#FFF" />
            <Text style={styles.actionButtonText}>Offers</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Property Card Component for Completed Properties
const CompletedPropertyCard = ({ property, onSellProperty }) => {
  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyHeader}>
        <View style={styles.propertyTypeTag}>
          <FontAwesome5 name="building" size={14} color="#FFF" />
          <Text style={styles.propertyTypeText}>{property.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.propertyValue}>
          Value: ${property.currentValue.toLocaleString()}
        </Text>
      </View>
      
      <Text style={styles.propertyName}>{property.name}</Text>
      <Text style={styles.propertyLocation}>{property.location}</Text>
      
      <View style={styles.propertyDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="ruler" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Size: {property.size.toLocaleString()} sq ft</Text>
        </View>
        
        {property.units > 0 && (
          <View style={styles.detailItem}>
            <FontAwesome5 name="home" size={14} color="#62b0d6" />
            <Text style={styles.detailText}>Units: {property.units}</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="dollar-sign" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>
            Investment: ${property.totalInvestment.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="chart-line" size={14} color="#4caf50" />
          <Text style={styles.detailText}>
            Profit: ${(property.currentValue - property.totalInvestment).toLocaleString()}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.listPropertyButton}
        onPress={() => onSellProperty(property.id)}
      >
        <FontAwesome5 name="tag" size={14} color="#FFF" />
        <Text style={styles.actionButtonText}>List for Sale</Text>
      </TouchableOpacity>
    </View>
  );
};

// Unit Selling Component for bulk listings
const UnitSellingComponent = ({ property, onListUnitsBulk, onListUnitsIndividually }) => {
  const [bulkPrice, setBulkPrice] = useState(property.currentValue);
  const [individualPrice, setIndividualPrice] = useState(Math.round(property.currentValue / property.units));
  
  const estimatedBulkSaleTime = "2-4 weeks";
  const estimatedIndividualSaleTime = "10-20 weeks";
  
  return (
    <View style={styles.unitSellingContainer}>
      <Text style={styles.unitSellingTitle}>
        Selling Options for {property.name}
      </Text>
      
      <View style={styles.salesOptions}>
        <View style={styles.salesOption}>
          <Text style={styles.salesOptionTitle}>Bulk Sale</Text>
          <Text style={styles.salesOptionDesc}>
            Sell all {property.units} units together to one buyer
          </Text>
          
          <View style={styles.salesDetails}>
            <Text style={styles.salesDetailText}>Est. Time: {estimatedBulkSaleTime}</Text>
            <Text style={styles.salesDetailText}>
              Suggested: ${property.currentValue.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceInputLabel}>Your Price:</Text>
            <TextInput
              style={styles.priceInput}
              value={bulkPrice.toString()}
              onChangeText={(text) => setBulkPrice(parseInt(text.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.sellButton}
            onPress={() => onListUnitsBulk(property.id, bulkPrice)}
          >
            <Text style={styles.sellButtonText}>List as Bulk Sale</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.salesOption}>
          <Text style={styles.salesOptionTitle}>Individual Units</Text>
          <Text style={styles.salesOptionDesc}>
            Sell each unit separately
          </Text>
          
          <View style={styles.salesDetails}>
            <Text style={styles.salesDetailText}>Est. Time: {estimatedIndividualSaleTime}</Text>
            <Text style={styles.salesDetailText}>
              Suggested: ${Math.round(property.currentValue / property.units).toLocaleString()} per unit
            </Text>
          </View>
          
          <View style={styles.priceInputContainer}>
            <Text style={styles.priceInputLabel}>Price per unit:</Text>
            <TextInput
              style={styles.priceInput}
              value={individualPrice.toString()}
              onChangeText={(text) => setIndividualPrice(parseInt(text.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.sellButton}
            onPress={() => onListUnitsIndividually(property.id, individualPrice)}
          >
            <Text style={styles.sellButtonText}>List Individual Units</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main Property Market Component
export default function PropertyMarket({ 
  completedProperties, 
  propertiesForSale, 
  onSellProperty, 
  onModifyListing, 
  onRemoveListing,
  onListUnitsBulk,
  onListUnitsIndividually
}) {
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showSellOptions, setShowSellOptions] = useState(false);
  
  // Handle property sell button click
  const handleSellProperty = (propertyId) => {
    const property = completedProperties.find(p => p.id === propertyId);
    if (property) {
      // If it has units, show sell options modal
      if (property.units > 1) {
        setSelectedProperty(property);
        setShowSellOptions(true);
      } else {
        // If it's just a single property, use default price
        onSellProperty(propertyId, property.currentValue);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            My Listings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Ready to Sell
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'listings' && (
        <View style={styles.listingsContainer}>
          {propertiesForSale.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="exclamation-circle" size={48} color="#555" />
              <Text style={styles.emptyText}>
                You don't have any properties listed for sale.
              </Text>
              <Text style={styles.emptySubtext}>
                List your completed properties in the "Ready to Sell" tab.
              </Text>
            </View>
          ) : (
            <FlatList
              data={propertiesForSale}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PropertyListingCard 
                  property={item} 
                  onModifyListing={onModifyListing}
                  onRemoveListing={onRemoveListing}
                />
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
      
      {activeTab === 'completed' && (
        <View style={styles.completedContainer}>
          {completedProperties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="exclamation-circle" size={48} color="#555" />
              <Text style={styles.emptyText}>
                You don't have any completed properties ready to sell.
              </Text>
              <Text style={styles.emptySubtext}>
                Complete construction projects to list them for sale.
              </Text>
            </View>
          ) : (
            <FlatList
              data={completedProperties}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CompletedPropertyCard 
                  property={item} 
                  onSellProperty={handleSellProperty}
                />
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
      
      {/* Modal for showing unit selling options */}
      <Modal
        visible={showSellOptions}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selling Options</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowSellOptions(false);
                  setSelectedProperty(null);
                }}
              >
                <FontAwesome5 name="times" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {selectedProperty && (
              <UnitSellingComponent 
                property={selectedProperty}
                onListUnitsBulk={onListUnitsBulk}
                onListUnitsIndividually={onListUnitsIndividually}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#1c2e40',
    borderWidth: 1,
    borderColor: '#f0b042',
  },
  tabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#f0b042',
  },
  listingsContainer: {
    flex: 1,
  },
  completedContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  listingCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listingTagText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  listingPrice: {
    color: '#4caf50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listingName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listingLocation: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 10,
  },
  listingDetails: {
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
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#62b0d6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewOffersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0b042',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  propertyCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#62b0d6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  propertyTypeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  propertyValue: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  propertyName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  propertyLocation: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 10,
  },
  propertyDetails: {
    marginBottom: 15,
  },
  listPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  unitSellingContainer: {
    marginBottom: 20,
  },
  unitSellingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  salesOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salesOption: {
    width: '48%',
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
  },
  salesOptionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  salesOptionDesc: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 10,
  },
  salesDetails: {
    marginBottom: 15,
  },
  salesDetailText: {
    color: '#DDD',
    fontSize: 12,
    marginVertical: 2,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priceInputLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  priceInput: {
    backgroundColor: '#1c2e40',
    color: '#FFF',
    padding: 8,
    borderRadius: 4,
    width: '60%',
    textAlign: 'right',
  },
  sellButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  sellButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});