
// File: components/Balance.js
// Description: Component to display player's balance
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Balance(props) {
  const [balance, setBalance] = useState(props.value || 0);
  
  // Update local state when props change
  useEffect(() => {
    setBalance(props.value || 0);
  }, [props.value]);
  
  // Format the balance value with commas
  const formattedBalance = balance.toLocaleString();
  
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
  },
  balanceText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});