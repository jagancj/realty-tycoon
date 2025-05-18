import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NAV_ITEMS = [
  { id: 'home', icon: 'home', label: 'HOME' },
  { id: 'property', icon: 'building', label: 'PROPERTY' },
  { id: 'market', icon: 'shopping-cart', label: 'MARKET' },
  { id: 'bank', icon: 'bank', label: 'BANK' }
];

const GameNavigation = ({ activeTab, onTabChange }) => {
  const [animationProgress, setAnimationProgress] = useState(new Animated.Value(0));

  const handleTabPress = (tabId) => {
    Animated.spring(animationProgress, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 100
    }).start(() => {
      onTabChange(tabId);
      animationProgress.setValue(0);
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
        style={styles.gradient}
      >
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.tab, activeTab === item.id && styles.activeTab]}
            onPress={() => handleTabPress(item.id)}
          >
            <LottieView
              source={require('../assets/animations/tab_icon.json')}
              autoPlay
              loop
              style={styles.tabIcon}
            />
            <Text style={[styles.tabLabel, activeTab === item.id && styles.activeTabLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 10
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 10,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#00ff00',
    fontWeight: '700',
  },
});

export default GameNavigation;
