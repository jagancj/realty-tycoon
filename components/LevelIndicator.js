
// File: components/LevelIndicator.js
// Description: Component to display player's level
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LevelIndicator(props) {
  return (
    <View style={styles.levelContainer}>
      <Text style={styles.levelText}>LVL</Text>
      <Text style={styles.levelNumber}>{props.value || 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  levelContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#f0a640',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#d49538',
  },
  levelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelNumber: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
});