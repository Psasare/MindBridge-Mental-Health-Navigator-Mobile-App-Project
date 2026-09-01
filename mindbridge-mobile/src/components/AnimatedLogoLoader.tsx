import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  runOnJS,
  cancelAnimation,
  Easing 
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { DURATIONS, easeInOut } from '../constants/animations';

const { width } = Dimensions.get('window');

interface Props {
  isReady?: boolean;
  onComplete?: () => void;
}

export const AnimatedLogoLoader = ({ isReady = false, onComplete }: Props) => {
  const theme = useTheme();
  
  // Animation values
  const imageScale = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    if (!isReady) {
      // Infinite gentle pulsing while loading
      imageScale.value = withRepeat(
        withTiming(1.1, { 
          duration: DURATIONS.movement * 2, 
          easing: easeInOut 
        }),
        -1, // infinite loop
        true // reverse
      );
    } else {
      // Transition out
      cancelAnimation(imageScale);
      
      // 1. Tiny anticipation shrink
      // 2. Massive expansion (zoom through)
      containerScale.value = withSequence(
        withTiming(0.9, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(30, { duration: 600, easing: Easing.in(Easing.exp) }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );

      // Fade out as it zooms through
      containerOpacity.value = withSequence(
        withTiming(1, { duration: 300 }), // hold opacity during anticipation
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
      );
    }
  }, [isReady]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[
      styles.container, 
      { backgroundColor: theme.colors.background },
      containerAnimatedStyle
    ]}>
      <View style={[
        styles.circle, 
        { 
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.plum,
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
        }
      ]}>
        <Animated.Image 
          source={require('../../assets/images/logo.png')} 
          style={[styles.logo, imageAnimatedStyle]} 
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
