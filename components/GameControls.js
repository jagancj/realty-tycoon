import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GameControls = ({ onAction }) => {
  const actions = [
    {
      id: 'buy',
      icon: require('../assets/animations/buy.json'),
      label: 'BUY',
      color: '#00ff00'
    },
    {
      id: 'sell',
      icon: require('../assets/animations/sell.json'),
      label: 'SELL',
      color: '#ff0000'
    },
    {
      id: 'build',
      icon: require('../assets/animations/build.json'),
      label: 'BUILD',
      color: '#00ffff'
    },
    {
      id: 'loan',
      icon: require('../assets/animations/loan.json'),
      label: 'LOAN',
      color: '#ff00ff'
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.controlsContainer}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.controlButton, { backgroundColor: action.color }]}
              onPress={() => onAction(action.id)}
            >
              <LottieView
                source={action.icon}
                autoPlay
                loop
                style={styles.controlIcon}
              />
              <Text style={styles.controlLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  controlIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  controlLabel: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GameControls;
