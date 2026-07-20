import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { Sun, Moon } from 'lucide-react-native';

const TRACK_WIDTH = 64;
const TRACK_HEIGHT = 34;
const KNOB_SIZE = 28;
const TRAVEL = TRACK_WIDTH - KNOB_SIZE - 6; // 6px total padding (3px each side)

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  const progress = useSharedValue(isDark ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    });
  }, [isDark]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#FEF3C7', '#1E1B4B'] // warm amber bg → deep indigo bg
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#F59E0B', '#6366F1'] // amber border → indigo border
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(progress.value * TRAVEL, { damping: 18, stiffness: 180, mass: 0.8 }) },
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#FFFFFF', '#E0E7FF'] // white → pale indigo
    ),
    shadowOpacity: interpolate(progress.value, [0, 1], [0.15, 0.25]),
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1 - progress.value, { duration: 200 }),
    transform: [
      { scale: withTiming(interpolate(progress.value, [0, 1], [1, 0.5]), { duration: 200 }) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, -90])}deg` },
    ],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value, { duration: 200 }),
    transform: [
      { scale: withTiming(interpolate(progress.value, [0, 1], [0.5, 1]), { duration: 200 }) },
      { rotate: `${interpolate(progress.value, [0, 1], [90, 0])}deg` },
    ],
  }));

  return (
    <AnimatedPressable onPress={onToggle} style={[styles.track, trackStyle]}>
      {/* Background icons (inside track) */}
      <Animated.View style={[styles.trackIcon, styles.trackIconLeft, sunStyle]}>
        <Sun size={14} color="#F59E0B" />
      </Animated.View>
      <Animated.View style={[styles.trackIcon, styles.trackIconRight, moonStyle]}>
        <Moon size={14} color="#818CF8" />
      </Animated.View>

      {/* Sliding knob */}
      <Animated.View style={[styles.knob, knobStyle]}>
        <Animated.View style={[styles.knobIconWrap, sunStyle, { position: 'absolute' }]}>
          <Sun size={16} color="#F59E0B" />
        </Animated.View>
        <Animated.View style={[styles.knobIconWrap, moonStyle, { position: 'absolute' }]}>
          <Moon size={16} color="#6366F1" />
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
    position: 'relative',
  },
  trackIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIconLeft: {
    left: 7,
  },
  trackIconRight: {
    right: 7,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  knobIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
