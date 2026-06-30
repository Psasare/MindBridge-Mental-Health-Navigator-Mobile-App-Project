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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ghost, ShieldCheck } from 'lucide-react-native';

import { useTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/Button';
import { Typography } from '../../src/components/Typography';

// SVGs
import { MindIllustration } from '../../src/components/illustrations/MindIllustration';
import { GuideIllustration } from '../../src/components/illustrations/GuideIllustration';
import { SafeIllustration } from '../../src/components/illustrations/SafeIllustration';

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
      headlinePost: ',\nUnderstood.',
      body: 'Private, evidence-based support designed for every Ghanaian student.',
      accentColor: C.brandGreen,
      IllustrationComponent: MindIllustration,
    },
    {
      key: 'guide',
      overline: 'AI-POWERED CARE',
      headlinePre: '',
      headlineHighlight: 'Guidance',
      headlinePost: '\nOn Your Terms.',
      body: 'Access personalized check-ins, mood tracking, and coping tools at any time.',
      accentColor: C.brandGreen,
      IllustrationComponent: GuideIllustration,
    },
    {
      key: 'safe',
      overline: 'FULLY CONFIDENTIAL',
      headlinePre: 'A ',
      headlineHighlight: 'Safe Space',
      headlinePost: ',\nOnly Yours.',
      body: 'Your data stays private. Talk openly, without fear or judgment.',
      accentColor: C.brandGreen,
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
              const Illustration = s.IllustrationComponent;
              return (
                <View key={s.key} style={styles.slide}>
                  <View style={styles.illustrationContainer}>
                    {/* The original Illustration components */}
                    <Illustration color={s.accentColor} theme={theme} />
                  </View>
                  
                  <View style={styles.copyBlock}>
                    <Text style={[styles.overline, { color: C.textSecondary }]}>
                      {s.overline}
                    </Text>
                    
                    {/* Dribbble Highlight Headline */}
                    <View style={styles.headlineWrapper}>
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
                    </View>
                    
                    {s.headlinePost ? (
                      <Text style={[styles.headlineText, { color: C.textPrimary }]}>
                        {s.headlinePost}
                      </Text>
                    ) : null}

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
  copyBlock: { alignItems: 'center', width: '100%', paddingHorizontal: 8 },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  headlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 0,
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
