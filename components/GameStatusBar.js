import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GameStatusBar = ({ balance, properties, level, onSettingsPress }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <LottieView
              source={require('../assets/animations/money.json')}
              autoPlay
              loop
              style={styles.icon}
            />
            <Text style={styles.statusText}>
              {balance.toLocaleString()}$
            </Text>
          </View>

          <View style={styles.statusItem}>
            <LottieView
              source={require('../assets/animations/house.json')}
              autoPlay
              loop
              style={styles.icon}
            />
            <Text style={styles.statusText}>
              {properties} Properties
            </Text>
          </View>

          <View style={styles.statusItem}>
            <LottieView
              source={require('../assets/animations/star.json')}
              autoPlay
              loop
              style={styles.icon}
            />
            <Text style={styles.statusText}>
              Level {level}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
          >
            <LottieView
              source={require('../assets/animations/settings.json')}
              autoPlay
              loop
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 10,
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default GameStatusBar;
