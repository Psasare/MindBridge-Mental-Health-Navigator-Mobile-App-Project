import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ghost, ShieldCheck, Brain, Compass, Lock } from 'lucide-react-native';

import { useTheme } from '../../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // The custom Dribbble Palette for the Welcome Screen
  const C = {
    bg: theme.isDark ? '#121212' : '#FDFBF7',
    textPrimary: theme.isDark ? '#FDFBF7' : '#1F2937',
    textSecondary: theme.isDark ? '#A8B8C8' : '#6B7A8A',
    brandGreen: theme.isDark ? '#5A8A70' : '#6A9C47',
    highlightText: '#FFFFFF',
    dotInactive: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  };

  const SLIDES = [
    {
      key: 'mind',
      overline: 'MENTAL HEALTH · GHANA',
      headlinePre: 'Your ',
      headlineHighlight: 'Mind',
      headlinePostLine1: ',',
      headlinePostLine2: 'Understood.',
      body: 'Private, evidence-based support designed for every Ghanaian student.',
      accentColor: C.brandGreen,
      Icon: Brain,
      isLogo: true,
    },
    {
      key: 'guide',
      overline: 'AI-POWERED CARE',
      headlinePre: '',
      headlineHighlight: 'Guidance',
      headlinePostLine1: '',
      headlinePostLine2: 'On Your Terms.',
      body: 'Access personalized check-ins, mood tracking, and coping tools at any time.',
      accentColor: C.brandGreen,
      Icon: Compass,
      isLogo: false,
    },
    {
      key: 'safe',
      overline: 'FULLY CONFIDENTIAL',
      headlinePre: 'A ',
      headlineHighlight: 'Safe Space',
      headlinePostLine1: ',',
      headlinePostLine2: 'Only Yours.',
      body: 'Your data stays private. Talk openly, without fear or judgment.',
      accentColor: C.brandGreen,
      Icon: Lock,
      isLogo: false,
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
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

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
              const IconComp = s.Icon;
              return (
                <View key={s.key} style={styles.slide}>
                  <View style={styles.illustrationContainer}>
                    {/* Animated Rings */}
                    <Animated.View style={[styles.ring, styles.ring1, {
                      borderColor: s.accentColor,
                      transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
                      opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.1] })
                    }]} />
                    <Animated.View style={[styles.ring, styles.ring2, {
                      borderColor: s.accentColor,
                      transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
                      opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.05] })
                    }]} />

                    <View style={[styles.iconCircle, s.isLogo && { backgroundColor: 'transparent' }]}>
                      {s.isLogo ? (
                        <Image 
                          source={require('../../assets/images/logo.png')} 
                          style={{ width: 140, height: 140, borderRadius: 70 }} 
                          resizeMode="cover" 
                        />
                      ) : (
                        <IconComp color={s.accentColor} size={48} strokeWidth={1.5} />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.copyBlock}>
                    <Text style={[styles.overline, { color: C.textSecondary }]}>
                      {s.overline}
                    </Text>
                    
                    {/* Dribbble Highlight Headline */}
                    <View style={styles.headlineWrapper}>
                      <View style={styles.headlineRow}>
                        {s.headlinePre ? (
                          <Text style={[styles.headlineText, { color: C.textPrimary }]}>
                            {s.headlinePre}
                          </Text>
                        ) : null}
                        
                        <View style={[styles.highlightBox, { backgroundColor: C.brandGreen }]}>
                          <Text style={styles.highlightText}>
                            {s.headlineHighlight}
                          </Text>
                        </View>

                        {s.headlinePostLine1 ? (
                          <Text style={[styles.headlineText, { color: C.textPrimary }]}>
                            {s.headlinePostLine1}
                          </Text>
                        ) : null}
                      </View>
                      
                      {s.headlinePostLine2 ? (
                        <Text style={[styles.headlineText, { color: C.textPrimary, marginTop: 4 }]}>
                          {s.headlinePostLine2}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={[styles.bodyText, { color: C.textSecondary }]}>
                      {s.body}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { backgroundColor: i === activeSlide ? C.brandGreen : C.dotInactive },
                  i === activeSlide && styles.dotActive
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: C.brandGreen }]}
            onPress={goNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {activeSlide < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
            </Text>
          </TouchableOpacity>

          {/* Anonymous/Guest Option */}
          {activeSlide === SLIDES.length - 1 && (
            <TouchableOpacity 
              style={[styles.outlineBtn, { borderColor: C.brandGreen }]}
              onPress={() => router.push('/(auth)/login?anonymous=true')}
              activeOpacity={0.8}
            >
              <Ghost color={C.brandGreen} size={20} strokeWidth={2.5} />
              <Text style={[styles.outlineBtnText, { color: C.brandGreen }]}>
                Explore Anonymously
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.65} style={styles.signInRow}>
            <Text style={[styles.signInText, { color: C.textPrimary }]}>
              I already have an account{' '}
              <Text style={{ color: C.brandGreen, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          {/* Trust Badge */}
          <View style={styles.trustRow}>
            <ShieldCheck color={C.textSecondary} size={14} />
            <Text style={[styles.trustText, { color: C.textSecondary }]}>
              Secured with hospital-grade encryption & confidentiality
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  layout: { flex: 1, justifyContent: 'space-between' },
  slideArea: { flex: 1 },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  illustrationContainer: { marginBottom: 30, alignItems: 'center' },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(106, 156, 71, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: { alignItems: 'center', width: '100%', paddingHorizontal: 8 },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  headlineWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  headlineText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 48,
    textAlign: 'center',
  },
  highlightBox: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  highlightText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 48,
  },
  bodyText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  ctaSection: { paddingHorizontal: 28, paddingBottom: 8 },
  primaryBtn: {
    height: 56,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  outlineBtn: {
    height: 56,
    borderRadius: 100,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  outlineBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
  signInRow: { height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  signInText: {
    fontSize: 15,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    opacity: 0.8
  },
  trustText: {
    fontSize: 12,
  }
});
