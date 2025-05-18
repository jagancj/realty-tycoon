import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TutorialOverlay = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const steps = [
    {
      title: 'Welcome to Realty Tycoon!',
      description: 'Buy, develop, and sell properties to become the ultimate real estate mogul.',
      icon: require('../assets/animations/welcome.json')
    },
    {
      title: 'Navigation',
      description: 'Use the bottom navigation to access different game features.',
      icon: require('../assets/animations/navigation.json')
    },
    {
      title: 'Property Management',
      description: 'Buy land, construct buildings, and manage your properties.',
      icon: require('../assets/animations/property.json')
    },
    {
      title: 'Market',
      description: 'Buy and sell properties to maximize your profits.',
      icon: require('../assets/animations/market.json')
    },
    {
      title: 'Bank',
      description: 'Take loans and manage your finances.',
      icon: require('../assets/animations/bank.json')
    }
  ];

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
    >
      <View style={styles.content}>
        <LottieView
          source={steps[currentStep].icon}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.title}>{steps[currentStep].title}</Text>
        <Text style={styles.description}>{steps[currentStep].description}</Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'START GAME' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TutorialOverlay;
