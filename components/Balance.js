import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Balance(props) {
  // For debugging purposes
  console.log("Balance component rendering with value:", props.value);
  
  const value = props.value || 0;
  const formattedBalance = value.toLocaleString();
  
  return (
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceText}>$ {formattedBalance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#42b45d',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#3a9e51',
    zIndex: 1000, // Add high zIndex to ensure it's visible
  },
  balanceText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
