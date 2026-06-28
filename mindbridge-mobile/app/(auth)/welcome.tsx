import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';
import { Ghost, ShieldCheck } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';

const { width, height } = Dimensions.get('window');

// ─── Illustrations ────────────────────────────────────────────────────────────
function MindIllustration({ color, theme }: { color: string, theme: any }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.04, duration: 2800, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 2800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 2800, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.4, duration: 2800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [pulse, ringOpacity]);

  return (
    <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: color, opacity: ringOpacity, transform: [{ scale: pulse }] }]} />
      <Animated.View style={[{ position: 'absolute', width: 175, height: 175, borderRadius: 87.5, borderWidth: 1.5, borderColor: theme.colors.plum, opacity: 0.3, transform: [{ scale: pulse }] }]} />
      <View style={[{ width: 148, height: 148, borderRadius: 74, overflow: 'hidden', backgroundColor: theme.colors.surface, shadowColor: color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }]}>
        <Image source={require('../../assets/images/logo.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
    </View>
  );
}

function GuideIllustration({ color }: { color: string }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -10, duration: 2500, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, [float]);

  return (
    <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ translateY: float }] }}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Circle cx="80" cy="80" r="70" fill={color} fillOpacity="0.15" />
          <Path d="M56 40 Q56 34 62 34 L98 34 Q104 34 104 40 L104 120 Q104 126 98 126 L62 126 Q56 126 56 120Z" stroke={color} strokeWidth="3.5" fill="none" />
          <Line x1="66" y1="58" x2="94" y2="58" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          <Line x1="66" y1="74" x2="88" y2="74" stroke={color} strokeWidth="3.5" strokeOpacity="0.8" strokeLinecap="round" />
          <Line x1="66" y1="90" x2="94" y2="90" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          <Circle cx="80" cy="110" r="6" fill={color} />
        </Svg>
      </Animated.View>
    </View>
  );
}

function SafeIllustration({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(0.95)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: 3000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

  return (
    <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Circle cx="80" cy="80" r="70" fill={color} fillOpacity="0.15" />
          <Path d="M80 30 L115 45 L115 80 C115 105 98 125 80 135 C62 125 45 105 45 80 L45 45 Z" stroke={color} strokeWidth="3.5" fill="none" />
          <Path d="M70 85 L70 105 L90 105 L90 85 Z" stroke={color} strokeWidth="3" fill="none" />
          <Path d="M74 85 L74 78 Q74 70 80 70 Q86 70 86 78 L86 85" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  const theme = useTheme();
  const styles = createStyles(theme);

  // Background Orb Animations
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 12000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 12000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 15000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 15000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const SLIDES = [
    {
      key: 'mind',
      overline: 'MENTAL HEALTH · GHANA',
      headline: 'Your Mind,\nUnderstood.',
      body: 'Private, evidence-based support designed for every Ghanaian student.',
      accentColor: theme.colors.plum,
      IllustrationComponent: MindIllustration,
    },
    {
      key: 'guide',
      overline: 'AI-POWERED CARE',
      headline: 'Guidance\nOn Your Terms.',
      body: 'Access personalized check-ins, mood tracking, and coping tools at any time.',
      accentColor: theme.colors.accents.ocean,
      IllustrationComponent: GuideIllustration,
    },
    {
      key: 'safe',
      overline: 'FULLY CONFIDENTIAL',
      headline: 'A Safe Space,\nOnly Yours.',
      body: 'Your data stays private. Talk openly, without fear or judgment.',
      accentColor: theme.colors.sage,
      IllustrationComponent: SafeIllustration,
    },
  ];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(idx);
  };

  const goNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeSlide + 1) * width, animated: true });
    } else {
      router.push('/(auth)/register');
    }
  };

  const slide = SLIDES[activeSlide];

  return (
    <View style={styles.root}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Animated Gradient Background Elements */}
      <Animated.View style={[styles.bgOrb, {
        backgroundColor: theme.colors.accents.gentlePeach,
        top: height * -0.1,
        left: width * -0.2,
        width: width * 1.2,
        height: width * 1.2,
        transform: [
          { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
          { scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }
        ]
      }]} />
      
      <Animated.View style={[styles.bgOrb, {
        backgroundColor: theme.colors.accents.powderBlue,
        bottom: height * -0.1,
        right: width * -0.3,
        width: width * 1.4,
        height: width * 1.4,
        transform: [
          { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) },
          { scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }
        ]
      }]} />

      {/* Frosted Glass Overlay for extra depth - Optimized for Android */}
      <BlurView 
        intensity={Platform.OS === 'android' ? 50 : 80} 
        experimentalBlurMethod={Platform.OS === 'android' ? "dimezisBlurView" : undefined}
        tint={theme.isDark ? "dark" : "light"} 
        style={StyleSheet.absoluteFillObject} 
      />

      <View style={[styles.layout, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.slideArea}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((s) => {
              const Illustration = s.IllustrationComponent;
              return (
                <View key={s.key} style={styles.slide}>
                  <View style={styles.illustrationContainer}>
                    <Illustration color={s.accentColor} theme={theme} />
                  </View>
                  <View style={styles.copyBlock}>
                    <Typography variant="label" color={s.accentColor} style={{ marginBottom: 16 }}>{s.overline}</Typography>
                    <Typography variant="h1" color={theme.colors.plum} style={styles.headline}>{s.headline}</Typography>
                    <Typography variant="body" color={theme.colors.text.primary} style={styles.body}>{s.body}</Typography>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && [styles.dotActive, { backgroundColor: slide.accentColor }]]} />
            ))}
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Button
            variant={activeSlide < SLIDES.length - 1 ? 'secondary' : 'primary'}
            size="large"
            onPress={goNext}
            style={{ marginBottom: 12 }}
          >
            {activeSlide < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
          </Button>

          {/* Anonymous/Guest Option */}
          {activeSlide === SLIDES.length - 1 && (
            <Button
              variant="outline"
              size="large"
              onPress={() => router.push('/(auth)/login?anonymous=true')}
              style={{ marginBottom: 16 }}
              icon={<Ghost color={theme.colors.plum} size={20} />}
            >
              Explore Anonymously
            </Button>
          )}

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.65} style={styles.signInRow}>
            <Typography variant="body" color={theme.colors.text.primary}>
              I already have an account{'  '}
              <Typography variant="bodyBold" color={theme.colors.plum}>Sign In</Typography>
            </Typography>
          </TouchableOpacity>

          {/* Trust Badge */}
          <View style={styles.trustRow}>
            <ShieldCheck color={theme.colors.text.tertiary} size={14} />
            <Typography variant="captionMedium" color={theme.colors.text.tertiary} style={styles.trustText}>
              Secured with hospital-grade encryption & confidentiality
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  layout: { flex: 1, justifyContent: 'space-between' },
  bgOrb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: theme.isDark ? 0.3 : 0.45,
    filter: 'blur(40px)', // web only, fallback handled by BlurView overlay
  },
  slideArea: { flex: 1 },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  illustrationContainer: { marginBottom: 50, alignItems: 'center' },
  copyBlock: { alignItems: 'center', width: '100%' },
  headline: { textAlign: 'center', marginBottom: 16 },
  body: { textAlign: 'center', maxWidth: width * 0.8 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.text.disabled, opacity: 0.6 },
  dotActive: { width: 24, height: 8, borderRadius: 4, opacity: 1 },
  ctaSection: { paddingHorizontal: 28, paddingBottom: 8 },
  signInRow: { height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    opacity: 0.8
  },
  trustText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontFamily: 'Montserrat-Medium',
    letterSpacing: 0.2
  }
});
