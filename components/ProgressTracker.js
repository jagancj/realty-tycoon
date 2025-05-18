import React from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProgressTracker = ({ currentStep, totalSteps, goal, progress }) => {
  const progressWidth = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: (SCREEN_WIDTH - 40) * (progress / 100),
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>LEVEL {currentStep}</Text>
        <Text style={styles.goalText}>Goal: {goal}</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        <View style={styles.progressOverlay}>
          <LottieView
            source={require('../assets/animations/progress_indicator.json')}
            autoPlay
            loop
            style={styles.progressIndicator}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statText}>
          {Math.round(progress)}% Complete
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalText: {
    color: '#00ff00',
    fontSize: 14,
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff00',
    borderRadius: 10,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIndicator: {
    width: 30,
    height: 30,
  },
  statsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default ProgressTracker;
