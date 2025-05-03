
// File: components/CityBackground.js
// Description: Component for the city skyline background
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function CityBackground() {
  return (
    <View style={styles.cityContainer}>
      <View style={styles.skyline}>
        {/* Buildings in background */}
        <View style={[styles.buildingTall, { height: 150, width: 40, left: 260, backgroundColor: '#55a4b6' }]} />
        <View style={[styles.buildingTall, { height: 170, width: 50, left: 310, backgroundColor: '#4894a6' }]} />
        <View style={[styles.buildingTall, { height: 190, width: 45, left: 200, backgroundColor: '#3d8495' }]} />
      </View>
      
      {/* Houses in foreground */}
      <View style={styles.housesRow}>
        <View style={[styles.house, { width: 70, height: 60, left: 40, backgroundColor: '#f0b042' }]} />
        <View style={[styles.house, { width: 50, height: 40, left: 140, backgroundColor: '#e8a935' }]} />
        <View style={[styles.house, { width: 60, height: 50, left: 220, backgroundColor: '#e2a02d' }]} />
      </View>
      
      {/* Ground */}
      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  cityContainer: {
    flex: 1,
    position: 'relative',
  },
  skyline: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  buildingTall: {
    position: 'absolute',
    bottom: 80,
    borderRadius: 4,
  },
  housesRow: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  house: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 5,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 40,
    backgroundColor: '#74bf54',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});
