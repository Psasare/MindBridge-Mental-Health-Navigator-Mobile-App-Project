import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useTheme } from '../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Compass as CompassIcon, CheckCircle2, Wind, Eye, Ear, Footprints } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  useAnimatedProps,
  withTiming, 
  withSpring,
  Easing,
  FadeIn
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

type Phase = 'TURN' | 'HOLD' | 'NOTICE' | 'COMPLETE';

export default function CompassScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [heading, setHeading] = useState(0);
  const [phase, setPhase] = useState<Phase>('TURN');
  const [targetIndex, setTargetIndex] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  const targets = [
    { label: 'North', angle: 0, prompt: 'Take one deep, slow breath in... and out.', icon: Wind },
    { label: 'East', angle: 90, prompt: 'Notice one thing you can see right now.', icon: Eye },
    { label: 'South', angle: 180, prompt: 'Notice one sound you can hear right now.', icon: Ear },
    { label: 'West', angle: 270, prompt: 'Notice how your feet feel resting on the floor.', icon: Footprints }
  ];

  // Reanimated values
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  // Timers and refs
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHapticTime = useRef<number>(0);
  const currentDiff = useRef<number>(180);

  useEffect(() => {
    let subscription: any;
    
    const subscribe = async () => {
      const available = await Magnetometer.isAvailableAsync();
      setIsAvailable(available);
      
      if (available) {
        Magnetometer.setUpdateInterval(50);
        subscription = Magnetometer.addListener((data) => {
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          angle = angle - 90; 
          if (angle < 0) angle += 360;
          
          const roundedAngle = Math.round(angle);
          setHeading(roundedAngle);
        
        // Find shortest path for rotation animation
        let diff = roundedAngle - rotation.value;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        rotation.value = withTiming(rotation.value + diff, { duration: 150 });
      });
      }
    };

    subscribe();
    return () => {
      if (subscription) subscription.remove();
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  // Proximity & Phase Logic
  useEffect(() => {
    if (phase === 'COMPLETE' || phase === 'NOTICE') return;

    const target = targets[targetIndex];
    let diff = Math.abs(heading - target.angle);
    if (diff > 180) diff = 360 - diff;
    currentDiff.current = diff;

    const inRange = diff < 15;

    // Haptics logic
    if (phase === 'TURN') {
      const now = Date.now();
      // Only trigger haptics if we are getting closer, within 60 degrees
      if (diff < 60 && !inRange) {
        const interval = Math.max(100, diff * 8); // Closer = faster haptics (min 100ms)
        if (now - lastHapticTime.current > interval) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticTime.current = now;
        }
      }

      if (inRange) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setPhase('HOLD');
        scale.value = withSpring(1.1);
        progress.value = withTiming(1, { duration: 3000, easing: Easing.linear });

        holdTimer.current = setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPhase('NOTICE');
          scale.value = withSpring(1);
          
          noticeTimer.current = setTimeout(() => {
            progress.value = withTiming(0, { duration: 500 });
            if (targetIndex === targets.length - 1) {
              setPhase('COMPLETE');
            } else {
              setTargetIndex(prev => prev + 1);
              setPhase('TURN');
            }
          }, 6000); // 6 seconds for mindfulness prompt
        }, 3000);
      }
    } else if (phase === 'HOLD') {
      if (!inRange) {
        // User drifted away
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (holdTimer.current) clearTimeout(holdTimer.current);
        setPhase('TURN');
        scale.value = withSpring(1);
        progress.value = withTiming(0, { duration: 300 });
      }
    }
  }, [heading, phase, targetIndex]);

  const animatedCompassStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${-rotation.value}deg` },
        { scale: scale.value }
      ]
    };
  });

  const animatedProgressProps = useAnimatedProps(() => {
    const strokeDashoffset = 2 * Math.PI * 90 * (1 - progress.value);
    return { strokeDashoffset };
  });

  const isComplete = phase === 'COMPLETE';
  const target = targets[targetIndex] || targets[0];
  const PromptIcon = target.icon;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/(tabs)/explore'); } }} style={[styles.closeBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
          <X color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Physical Grounding</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {isComplete ? (
          <Animated.View style={styles.centerBox} entering={FadeIn}>
            <CheckCircle2 color={theme.colors.accents.eucalyptus} size={80} style={{ marginBottom: 24 }} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>You are Grounded</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              By engaging your body in physical space and your senses in the present moment, you've helped regulate your nervous system.
            </Text>
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: theme.colors.plum }]}
              onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/(tabs)/explore'); } }}
            >
              <Text style={styles.btnText}>Return to Tools</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : !isAvailable ? (
          <View style={styles.centerBox}>
            <View style={[styles.compassWrapper, { backgroundColor: theme.colors.semantic.danger + '15', marginBottom: 20 }]}>
              <X color={theme.colors.semantic.danger} size={60} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Sensor Unavailable</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Your device does not have a compass sensor, or permission was denied.
            </Text>
          </View>
        ) : (
          <View style={styles.centerBox}>
            <View style={styles.compassContainer}>
              <Svg width="220" height="220" style={styles.svgRing}>
                <Circle
                  cx="110" cy="110" r="90"
                  stroke={theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth="8"
                  fill="none"
                />
                <AnimatedCircle
                  cx="110" cy="110" r="90"
                  stroke={theme.colors.plum}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  animatedProps={animatedProgressProps}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                />
              </Svg>
              
              <Animated.View style={[animatedCompassStyle, styles.compassWrapper]}>
                <CompassIcon color={theme.colors.plum} size={80} strokeWidth={1.5} />
              </Animated.View>
            </View>

            <View style={styles.textContainer}>
              {phase === 'NOTICE' ? (
                <View style={styles.noticeBox}>
                  <PromptIcon color={theme.colors.plum} size={32} style={{ marginBottom: 16 }} />
                  <Text style={[styles.noticeText, { color: theme.colors.text.primary }]}>
                    {target.prompt}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                    {phase === 'HOLD' ? 'Hold steady...' : 'Slowly turn your body to face:'}
                  </Text>
                  <Text style={[styles.title, { color: phase === 'HOLD' ? theme.colors.accents.ocean : theme.colors.plum, fontSize: 36 }]}>
                    {target.label}
                  </Text>
                  {phase === 'TURN' && (
                    <Text style={[styles.subtitle, { color: theme.colors.text.tertiary, fontSize: 14, marginTop: 20 }]}>
                      Current Heading: {heading}°
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </View>
      
      {!isComplete && (
        <View style={styles.footerIndicator}>
          {targets.map((t, i) => (
            <View 
              key={t.label} 
              style={[
                styles.dot, 
                { backgroundColor: i < targetIndex ? theme.colors.plum : (i === targetIndex ? theme.colors.plum + '80' : theme.isDark ? '#333' : '#E5E5E5') }
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerBox: { alignItems: 'center', width: '100%' },
  compassContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  svgRing: {
    position: 'absolute',
  },
  compassWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(150,150,150,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  textContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  noticeBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(150,150,150,0.05)',
    padding: 24,
    borderRadius: 24,
    width: '100%',
  },
  noticeText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  btn: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, marginTop: 30 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  footerIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});
