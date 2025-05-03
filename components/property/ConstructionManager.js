// File: components/property/ConstructionManager.js
// Description: Component to manage construction projects
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Construction types with their details
const CONSTRUCTION_TYPES = {
  residential: [
    {
      id: 'r1',
      name: 'Small House',
      description: 'Single family home with 2 bedrooms',
      minLandSize: 2500,
      maxUnits: 1,
      costPerSqFt: 120,
      daysToComplete: 60,
      valueMultiplier: 1.5,
      icon: 'home'
    },
    {
      id: 'r2',
      name: 'Medium Apartments',
      description: '5-10 units apartment building',
      minLandSize: 8000,
      maxUnits: 10,
      costPerSqFt: 150,
      daysToComplete: 180,
      valueMultiplier: 1.8,
      icon: 'building'
    },
    {
      id: 'r3',
      name: 'Premium Apartments',
      description: 'Luxury units with premium finishes',
      minLandSize: 12000,
      maxUnits: 20,
      costPerSqFt: 250,
      daysToComplete: 300,
      valueMultiplier: 2.5,
      icon: 'star'
    },
    {
      id: 'r4',
      name: 'High Rise Apartments',
      description: 'Multi-story building with 50+ units',
      minLandSize: 20000,
      maxUnits: 100,
      costPerSqFt: 200,
      daysToComplete: 500,
      valueMultiplier: 2.2,
      icon: 'city'
    }
  ],
  commercial: [
    {
      id: 'c1',
      name: 'Small Office',
      description: 'Single tenant office space',
      minLandSize: 3000,
      maxUnits: 1,
      costPerSqFt: 180,
      daysToComplete: 90,
      valueMultiplier: 1.6,
      icon: 'briefcase'
    },
    {
      id: 'c2',
      name: 'Shopping Complex',
      description: 'Retail stores with parking',
      minLandSize: 15000,
      maxUnits: 15,
      costPerSqFt: 200,
      daysToComplete: 240,
      valueMultiplier: 1.9,
      icon: 'shopping-bag'
    },
    {
      id: 'c3',
      name: 'Office Building',
      description: 'Multi-tenant office building',
      minLandSize: 10000,
      maxUnits: 10,
      costPerSqFt: 220,
      daysToComplete: 270,
      valueMultiplier: 2.0,
      icon: 'building'
    }
  ],
  mixeduse: [
    {
      id: 'm1',
      name: 'Mixed-Use Development',
      description: 'Retail on ground floor, apartments above',
      minLandSize: 12000,
      maxUnits: 25,
      costPerSqFt: 230,
      daysToComplete: 360,
      valueMultiplier: 2.3,
      icon: 'store-alt'
    },
    {
      id: 'm2',
      name: 'Urban Village',
      description: 'Comprehensive mixed development',
      minLandSize: 50000,
      maxUnits: 200,
      costPerSqFt: 250,
      daysToComplete: 720,
      valueMultiplier: 2.8,
      icon: 'city'
    }
  ]
};

// Component to display construction projects in progress
const ConstructionProjectCard = ({ project }) => {
  return (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{project.name}</Text>
        <Text style={styles.projectDays}>{project.daysRemaining} days left</Text>
      </View>
      
      <Text style={styles.projectLocation}>{project.location}</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Progress: {Math.round(project.progress)}%
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${project.progress}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.projectDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="calendar-alt" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Started: {project.startDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="calendar-check" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Completion: {project.completionDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="dollar-sign" size={14} color="#62b0d6" />
          <Text style={styles.detailText}>Budget: ${project.budget.toLocaleString()}</Text>
        </View>
      </View>
      
      {project.boostAvailable && (
        <TouchableOpacity style={styles.boostButton}>
          <FontAwesome5 name="rocket" size={14} color="#FFF" />
          <Text style={styles.boostButtonText}>Speed Up ($50,000)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Construction Type Card Component in the modal
const ConstructionTypeCard = ({ type, land, onSelect, canAfford }) => {
  // Calculate total construction cost
  const totalCost = land.size * type.costPerSqFt;
  const affordable = canAfford(totalCost);
  const compatible = land.size >= type.minLandSize;
  
  // Calculate potential units based on land size
  const potentialUnits = Math.min(
    Math.floor(land.size / (type.minLandSize / type.maxUnits)),
    type.maxUnits
  );
  
  // Calculate estimated property value after construction
  const estimatedValue = totalCost * type.valueMultiplier;
  
  return (
    <TouchableOpacity 
      style={[
        styles.constructionTypeCard,
        (!affordable || !compatible) && styles.disabledCard
      ]}
      onPress={() => (affordable && compatible) && onSelect(type, totalCost, potentialUnits)}
      disabled={!affordable || !compatible}
    >
      <View style={styles.typeHeader}>
        <FontAwesome5 name={type.icon} size={20} color="#f0b042" />
        <Text style={styles.typeName}>{type.name}</Text>
      </View>
      
      <Text style={styles.typeDescription}>{type.description}</Text>
      
      <View style={styles.typeDetails}>
        <View style={styles.typeDetailItem}>
          <Text style={styles.typeDetailLabel}>Cost:</Text>
          <Text style={styles.typeDetailValue}>${totalCost.toLocaleString()}</Text>
        </View>
        
        <View style={styles.typeDetailItem}>
          <Text style={styles.typeDetailLabel}>Time:</Text>
          <Text style={styles.typeDetailValue}>{type.daysToComplete} days</Text>
        </View>
        
        <View style={styles.typeDetailItem}>
          <Text style={styles.typeDetailLabel}>Units:</Text>
          <Text style={styles.typeDetailValue}>{potentialUnits}</Text>
        </View>
        
        <View style={styles.typeDetailItem}>
          <Text style={styles.typeDetailLabel}>Est. Value:</Text>
          <Text style={[styles.typeDetailValue, styles.valueText]}>
            ${estimatedValue.toLocaleString()}
          </Text>
        </View>
      </View>
      
      {!compatible && (
        <View style={styles.warningTag}>
          <FontAwesome5 name="exclamation-triangle" size={12} color="#FFF" />
          <Text style={styles.warningText}>Land too small</Text>
        </View>
      )}
      
      {compatible && !affordable && (
        <View style={styles.warningTag}>
          <FontAwesome5 name="exclamation-triangle" size={12} color="#FFF" />
          <Text style={styles.warningText}>Insufficient funds</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Main Construction Manager Component
export default function ConstructionManager({ properties, constructionProjects, balance, onStartConstruction }) {
  const [selectedLand, setSelectedLand] = useState(null);
  const [showConstructionModal, setShowConstructionModal] = useState(false);
  const [constructionCategory, setConstructionCategory] = useState('residential');
  
  // Filter for vacant lands that can be built on
  const vacantLands = properties.filter(property => property.status === 'vacant');
  
  // Check if user can afford the cost
  const canAfford = (cost) => balance >= cost;
  
  // Handle selection for construction
  const handleSelectForConstruction = (propertyId) => {
    const land = properties.find(p => p.id === propertyId);
    if (land) {
      setSelectedLand(land);
      setShowConstructionModal(true);
    }
  };
  
  // Handle construction type selection
  const handleSelectConstructionType = (type, cost, units) => {
    if (selectedLand) {
      onStartConstruction(selectedLand.id, type.id, cost, units, type.daysToComplete);
      setShowConstructionModal(false);
      setSelectedLand(null);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Current Construction Projects */}
      {constructionProjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE PROJECTS</Text>
          <FlatList
            data={constructionProjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConstructionProjectCard project={item} />
            )}
            contentContainerStyle={styles.projectsList}
          />
        </View>
      )}
      
      {/* Vacant Lands */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AVAILABLE FOR CONSTRUCTION</Text>
        {vacantLands.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="exclamation-circle" size={48} color="#555" />
            <Text style={styles.emptyText}>
              You don't have any vacant lands to build on.
            </Text>
            <Text style={styles.emptySubtext}>
              Purchase land in the "Available" tab first.
            </Text>
          </View>
        ) : (
          <FlatList
            data={vacantLands}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.landCard}>
                <View style={styles.landInfo}>
                  <Text style={styles.landName}>{item.name}</Text>
                  <Text style={styles.landSize}>{item.size.toLocaleString()} sq ft</Text>
                  <Text style={styles.landLocation}>{item.location}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.buildButton}
                  onPress={() => handleSelectForConstruction(item.id)}
                >
                  <FontAwesome5 name="hammer" size={14} color="#FFF" />
                  <Text style={styles.buildButtonText}>Build</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.landsList}
          />
        )}
      </View>
      
      {/* Construction Type Selection Modal */}
      <Modal
        visible={showConstructionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Construction Options</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowConstructionModal(false);
                  setSelectedLand(null);
                }}
              >
                <FontAwesome5 name="times" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {selectedLand && (
              <Text style={styles.selectedLandInfo}>
                {selectedLand.name} - {selectedLand.size.toLocaleString()} sq ft
              </Text>
            )}
            
            <View style={styles.categoryTabs}>
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  constructionCategory === 'residential' && styles.activeCategory
                ]}
                onPress={() => setConstructionCategory('residential')}
              >
                <Text style={[
                  styles.categoryText,
                  constructionCategory === 'residential' && styles.activeCategoryText
                ]}>
                  Residential
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  constructionCategory === 'commercial' && styles.activeCategory
                ]}
                onPress={() => setConstructionCategory('commercial')}
              >
                <Text style={[
                  styles.categoryText,
                  constructionCategory === 'commercial' && styles.activeCategoryText
                ]}>
                  Commercial
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  constructionCategory === 'mixeduse' && styles.activeCategory
                ]}
                onPress={() => setConstructionCategory('mixeduse')}
              >
                <Text style={[
                  styles.categoryText,
                  constructionCategory === 'mixeduse' && styles.activeCategoryText
                ]}>
                  Mixed Use
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.constructionTypesList}>
              {selectedLand && CONSTRUCTION_TYPES[constructionCategory].map(type => (
                <ConstructionTypeCard 
                  key={type.id}
                  type={type}
                  land={selectedLand}
                  onSelect={handleSelectConstructionType}
                  canAfford={canAfford}
                />
              ))}
            </ScrollView>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  projectsList: {
    paddingBottom: 10,
  },
  projectCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  projectName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectDays: {
    color: '#f0a640',
    fontWeight: 'bold',
  },
  projectLocation: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 10,
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
  projectDetails: {
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
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  boostButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  landsList: {
    paddingBottom: 10,
  },
  landCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landInfo: {
    flex: 1,
  },
  landName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  landSize: {
    color: '#4caf50',
    fontSize: 14,
  },
  landLocation: {
    color: '#AAA',
    fontSize: 12,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buildButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  emptyContainer: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  selectedLandInfo: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeCategory: {
    backgroundColor: '#1c2e40',
    borderWidth: 1,
    borderColor: '#f0b042',
  },
  categoryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  activeCategoryText: {
    color: '#f0b042',
  },
  constructionTypesList: {
    flex: 1,
  },
  constructionTypeCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  disabledCard: {
    opacity: 0.6,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  typeDescription: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 15,
  },
  typeDetails: {
    marginBottom: 10,
  },
  typeDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  typeDetailLabel: {
    color: '#DDD',
    fontSize: 14,
  },
  typeDetailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  valueText: {
    color: '#4caf50',
  },
  warningTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  warningText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});