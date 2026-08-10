import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from '../theme/colors';

const { width } = Dimensions.get('window');

// Reusable shimmer block
const ShimmerBlock = ({ width, height, borderRadius = RFValue(16), style, delay = 0 }: any) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseColor = theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <Animated.View style={[
      animatedStyle, 
      { width, height, borderRadius, backgroundColor: baseColor, overflow: 'hidden' },
      style
    ]}>
      {/* Optional: Add a sweeping gradient inside for a true Awwwards shimmer feel */}
      <LinearGradient
        colors={['transparent', theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
};

export const DashboardSkeleton = () => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Area */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, gap: 8 }}>
          <ShimmerBlock width="60%" height={RFValue(32)} delay={0} />
          <ShimmerBlock width="80%" height={RFValue(18)} delay={100} />
        </View>
        <ShimmerBlock width={RFValue(50)} height={RFValue(50)} borderRadius={RFValue(25)} delay={200} />
      </View>

      {/* Streak Journey Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <View style={styles.cardHeader}>
          <View style={{ gap: 6 }}>
            <ShimmerBlock width={120} height={RFValue(20)} delay={300} />
            <ShimmerBlock width={180} height={RFValue(14)} delay={400} />
          </View>
          <ShimmerBlock width={RFValue(40)} height={RFValue(40)} borderRadius={RFValue(20)} delay={500} />
        </View>
        
        {/* Streak Nodes Mock */}
        <View style={styles.streakNodes}>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <ShimmerBlock key={i} width={RFValue(48)} height={RFValue(64)} borderRadius={RFValue(12)} delay={600 + (i * 100)} />
          ))}
        </View>
      </View>

      {/* Daily Goals Section */}
      <View style={{ marginTop: RFValue(24), gap: RFValue(12) }}>
        <View style={{ gap: 6, marginBottom: 8 }}>
          <ShimmerBlock width={140} height={RFValue(22)} delay={700} />
          <ShimmerBlock width={200} height={RFValue(14)} delay={800} />
        </View>

        {[1, 2, 3].map((_, i) => (
          <View key={i} style={[styles.goalItem, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <ShimmerBlock width={RFValue(48)} height={RFValue(48)} borderRadius={RFValue(14)} delay={900 + (i * 100)} />
            <View style={{ flex: 1, gap: 8, paddingHorizontal: 12 }}>
              <ShimmerBlock width="70%" height={RFValue(16)} delay={950 + (i * 100)} />
              <ShimmerBlock width="40%" height={RFValue(12)} delay={1000 + (i * 100)} />
            </View>
            <ShimmerBlock width={RFValue(24)} height={RFValue(24)} borderRadius={RFValue(12)} delay={1050 + (i * 100)} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(32),
  },
  card: {
    borderRadius: RFValue(24),
    padding: RFValue(20),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RFValue(24),
  },
  streakNodes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: RFValue(12),
    borderRadius: RFValue(20),
    borderWidth: 1,
  }
});
