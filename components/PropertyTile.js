
// File: components/PropertyTile.js
// Description: Component for property tiles in the game
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function PropertyTile(props) {
  const { title, value, backgroundColor, icon, position } = props;
  
  return (
    <TouchableOpacity 
      style={[
        styles.tile, 
        { backgroundColor: backgroundColor || '#62b0d6' },
        position === 'topLeft' && styles.topLeft,
        position === 'topRight' && styles.topRight,
        position === 'bottomLeft' && styles.bottomLeft,
        position === 'bottomRight' && styles.bottomRight,
      ]}
    >
      <View style={styles.tileContent}>
        <Text style={styles.tileTitle}>{title}</Text>
        <View style={styles.tileIconContainer}>
          <View style={styles.miniHouse}>
            {icon === 'home' && (
              <FontAwesome5 name="home" size={24} color="#333" />
            )}
          </View>
          <Text style={styles.tileValue}>{value}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: '45%',
    height: 100,
    borderRadius: 15,
    padding: 15,
  },
  topLeft: {
    top: 240,
    left: 10,
  },
  topRight: {
    top: 240,
    right: 10,
  },
  bottomLeft: {
    bottom: 90,
    left: 10,
  },
  bottomRight: {
    bottom: 90,
    right: 10,
  },
  tileContent: {
    flex: 1,
  },
  tileTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tileIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  miniHouse: {
    width: 40,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
