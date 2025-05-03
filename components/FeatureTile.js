
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function FeatureTile(props) {
  const { title, value, backgroundColor, icon, position } = props;
  
  const renderIcon = () => {
    if (icon === 'trending-up') {
      return (
        <View style={styles.trendGraph}>
          <Ionicons name="trending-up" size={40} color="#4caf50" />
        </View>
      );
    } else if (icon === 'construct') {
      return (
        <View style={styles.constructionContainer}>
          <FontAwesome5 name="hammer" size={30} color="#fff" />
        </View>
      );
    } else if (icon === 'handshake') {
      return (
        <View style={styles.dealContainer}>
          <FontAwesome5 name="handshake" size={30} color="#fff" />
          <Text style={styles.tileValue}>{value}</Text>
        </View>
      );
    }
    return null;
  };
  
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
        {renderIcon()}
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
  trendGraph: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  constructionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
