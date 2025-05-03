// File: components/property/OwnedProperties.js
// Description: Component to display owned properties and lands
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Property status labels and colors
const STATUS_CONFIGS = {
  vacant: {
    label: 'VACANT LAND',
    color: '#74bf54',
    icon: 'leaf'
  },
  inConstruction: {
    label: 'IN CONSTRUCTION',
    color: '#f0a640',
    icon: 'hammer'
  },
  completed: {
    label: 'COMPLETED',
    color: '#62b0d6',
    icon: 'building'
  },
  forSale: {
    label: 'FOR SALE',
    color: '#4caf50',
    icon: 'tag'
  },
  rented: {
    label: 'RENTED',
    color: '#9c27b0',
    icon: 'key'
  }
};

// Property Card Component
const PropertyCard = ({ property, onSelectForConstruction, onSelectForSale }) => {
  const statusConfig = STATUS_CONFIGS[property.status] || STATUS_CONFIGS.vacant;
  
  // Determine the action buttons to show based on property status
  const renderActionButtons = () => {
    switch (property.status) {
      case 'vacant':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onSelectForConstruction(property.id)}
          >
            <FontAwesome5 name="hammer" size={14} color="#FFF" />
            <Text style={styles.actionButtonText}>Build</Text>
          </TouchableOpacity>
        );
      
      case 'completed':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onSelectForSale(property.id)}
          >
            <FontAwesome5 name="tag" size={14} color="#FFF" />
            <Text style={styles.actionButtonText}>Sell</Text>
          </TouchableOpacity>
        );
      
      case 'inConstruction':
        return (
          <View style={[styles.actionButton, styles.disabledButton]}>
            <FontAwesome5 name="clock" size={14} color="#AAA" />
            <Text style={[styles.actionButtonText, styles.disabledText]}>
              {property.completionDays} days left
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  // Calculate property value or income
  const renderValueInfo = () => {
    if (property.status === 'vacant') {
      return (
        <Text style={styles.propertyValue}>
          Value: ${property.currentValue.toLocaleString()}
        </Text>
      );
    } else if (property.status === 'rented') {
      return (
        <Text style={styles.propertyValue}>
          Income: ${property.monthlyIncome.toLocaleString()}/month
        </Text>
      );
    } else if (property.status === 'forSale') {
      return (
        <Text style={styles.propertyValue}>
          Listed: ${property.listingPrice.toLocaleString()}
        </Text>
      );
    } else if (property.status === 'completed') {
      return (
        <Text style={styles.propertyValue}>
          Value: ${property.currentValue.toLocaleString()}
        </Text>
      );
    }
    
    return (
      <Text style={styles.propertyValue}>
        Investment: ${property.totalInvestment.toLocaleString()}
      </Text>
    );
  };
  
  return (
    <View style={styles.propertyCard}>
      <View style={styles.propertyHeader}>
        <View style={[styles.statusTag, { backgroundColor: statusConfig.color }]}>
          <FontAwesome5 name={statusConfig.icon} size={14} color="#FFF" style={styles.statusIcon} />
          <Text style={styles.statusText}>{statusConfig.label}</Text>
        </View>
        {renderValueInfo()}
      </View>
      
      <Text style={styles.propertyName}>{property.name}</Text>
      <Text style={styles.propertyLocation}>{property.location}</Text>
      
      <View style={styles.propertyDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="ruler" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Size: {property.size.toLocaleString()} sq ft</Text>
        </View>
        
        <View style={styles.detailItem}>
          <FontAwesome5 name="building" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Type: {property.type}</Text>
        </View>
        
        {property.units && (
          <View style={styles.detailItem}>
            <FontAwesome5 name="home" size={14} color="#62b0d6" />
            <Text style={styles.detailText}>Units: {property.units}</Text>
          </View>
        )}
        
        {property.constructionProgress !== undefined && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Construction: {Math.round(property.constructionProgress)}%
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${property.constructionProgress}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.actionContainer}>
        {renderActionButtons()}
      </View>
    </View>
  );
};

export default function OwnedProperties({ properties, onSelectForConstruction, onSelectForSale }) {
  const [filter, setFilter] = useState('all');
  
  // Filter properties based on the selected filter
  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    return property.status === filter;
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
          style={[styles.filterButton, filter === 'vacant' && styles.activeFilter]}
          onPress={() => setFilter('vacant')}
        >
          <Text style={[styles.filterText, filter === 'vacant' && styles.activeFilterText]}>Vacant Land</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'inConstruction' && styles.activeFilter]}
          onPress={() => setFilter('inConstruction')}
        >
          <Text style={[styles.filterText, filter === 'inConstruction' && styles.activeFilterText]}>Construction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>Completed</Text>
        </TouchableOpacity>
      </View>
      
      {filteredProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="exclamation-circle" size={48} color="#555" />
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? "You don't own any properties yet." 
              : `You don't have any ${filter} properties.`}
          </Text>
          {filter === 'all' && (
            <Text style={styles.emptySubtext}>
              Check the "Available" tab to purchase land.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard 
              property={item} 
              onSelectForConstruction={onSelectForConstruction}
              onSelectForSale={onSelectForSale}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
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
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    color: '#DDD',
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3a4a5f',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f0a640',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
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
  disabledButton: {
    backgroundColor: '#3a4a5f',
  },
  disabledText: {
    color: '#AAA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
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
});