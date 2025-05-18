import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FILTER_OPTIONS = [
  { id: 'type', label: 'Type', options: ['Residential', 'Commercial', 'Industrial'] },
  { id: 'price', label: 'Price', options: ['Low to High', 'High to Low'] },
  { id: 'size', label: 'Size', options: ['Small to Large', 'Large to Small'] },
  { id: 'location', label: 'Location', options: ['Downtown', 'Suburbs', 'Rural'] },
];

const PropertyFilter = ({ onFilter }) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const slideAnim = new Animated.Value(-SCREEN_WIDTH);

  const toggleFilter = () => {
    if (filterVisible) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFilterVisible(false));
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFilterVisible(true));
    }
  };

  const handleFilterChange = (filterId, option) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: option
    }));
    onFilter(prev => ({
      ...prev,
      [filterId]: option
    }));
  };

  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={toggleFilter}
      >
        <LottieView
          source={require('../assets/animations/filter.json')}
          autoPlay
          loop
          style={styles.filterIcon}
        />
        <Text style={styles.filterText}>FILTER</Text>
      </TouchableOpacity>

      <Animated.View
        style={[styles.filterPanel, { transform: [{ translateX: slideAnim }] }]}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.gradient}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>FILTER PROPERTIES</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleFilter}
            >
              <LottieView
                source={require('../assets/animations/close.json')}
                autoPlay
                loop
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {FILTER_OPTIONS.map((filter) => (
            <View key={filter.id} style={styles.filterOption}>
              <Text style={styles.filterLabel}>{filter.label}</Text>
              <View style={styles.optionContainer}>
                {filter.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, 
                      activeFilters[filter.id] === option && styles.activeOption]}
                    onPress={() => handleFilterChange(filter.id, option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </LinearGradient>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  filterIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: '100%',
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  filterOption: {
    marginBottom: 20,
  },
  filterLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeOption: {
    backgroundColor: '#00ff00',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default PropertyFilter;
