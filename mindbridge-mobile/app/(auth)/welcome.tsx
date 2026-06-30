import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { 
  ArrowRight, 
  Wind,
  CloudRain,
  Activity,
  Lightbulb
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const boxWidthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(boxWidthAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: false,
      })
    ]).start();
  }, []);

  const C = {
    bg: theme.isDark ? '#121212' : '#FDFBF7',
    text: theme.isDark ? '#FDFBF7' : '#1F2937',
    textMuted: theme.isDark ? '#A8B8C8' : '#6B7A8A',
    brandGreen: theme.isDark ? '#5A8A70' : '#6A9C47',
    cardAnxiety: theme.isDark ? '#1E2622' : '#EDF4E9',
    cardDepression: theme.isDark ? '#1C2226' : '#E8F0F2',
    cardPhysical: theme.isDark ? '#1F261E' : '#EAF5E5',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    scrollContent: {
      paddingBottom: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: insets.top + 20,
      paddingBottom: 20,
    },
    logoText: {
      fontSize: 22,
      fontWeight: '700',
      color: C.text,
      marginLeft: 8,
      letterSpacing: -0.5,
    },
    heroSection: {
      paddingHorizontal: 24,
      paddingTop: 30,
      paddingBottom: 40,
    },
    titleLine: {
      fontSize: 42,
      fontWeight: '800',
      color: C.text,
      lineHeight: 50,
      letterSpacing: -1,
    },
    highlightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    highlightBox: {
      backgroundColor: C.brandGreen,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 4,
      overflow: 'hidden',
    },
    highlightText: {
      fontSize: 42,
      fontWeight: '800',
      color: '#FFFFFF',
      lineHeight: 50,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 16,
      color: C.textMuted,
      lineHeight: 24,
      marginTop: 20,
      marginBottom: 32,
      maxWidth: '90%',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    primaryBtn: {
      backgroundColor: C.brandGreen,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 100,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: C.brandGreen,
      paddingVertical: 14.5,
      paddingHorizontal: 24,
      borderRadius: 100,
      gap: 8,
    },
    secondaryBtnText: {
      color: C.brandGreen,
      fontSize: 16,
      fontWeight: '600',
    },
    cardsSection: {
      paddingHorizontal: 24,
      gap: 16,
    },
    card: {
      borderRadius: 24,
      padding: 24,
      minHeight: 200,
      justifyContent: 'flex-end',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: C.text,
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    cardText: {
      fontSize: 15,
      color: C.textMuted,
      lineHeight: 22,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Lightbulb color={C.brandGreen} size={28} strokeWidth={2.5} />
            <Text style={styles.logoText}>MindBridge</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.titleLine}>Your</Text>
            
            <View style={styles.highlightContainer}>
              <Animated.View style={[styles.highlightBox, {
                width: boxWidthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }]}>
                <Text style={styles.highlightText} numberOfLines={1}>Mental Wellness</Text>
              </Animated.View>
            </View>

            <Text style={styles.titleLine}>Journey Starts Here</Text>

            <Text style={styles.subtitle}>
              Take the first step toward healing with compassionate, expert-led mental health care - from the comfort of your home.
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>Log In</Text>
                <ArrowRight color={C.brandGreen} size={18} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Feature Cards */}
          <View style={styles.cardsSection}>
            <View style={[styles.card, { backgroundColor: C.cardAnxiety }]}>
              <View style={styles.iconWrap}>
                <Wind color={C.brandGreen} size={24} />
              </View>
              <Text style={styles.cardTitle}>Anxiety</Text>
              <Text style={styles.cardText}>
                Overwhelmed by racing thoughts or panic attacks? Learn calming techniques and regain peace of mind.
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: C.cardDepression }]}>
              <View style={styles.iconWrap}>
                <CloudRain color={C.brandGreen} size={24} />
              </View>
              <Text style={styles.cardTitle}>Depression</Text>
              <Text style={styles.cardText}>
                Struggling to find motivation or joy? Our personalized tracking helps you work through it with real tools and support.
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: C.cardPhysical }]}>
              <View style={styles.iconWrap}>
                <Activity color={C.brandGreen} size={24} />
              </View>
              <Text style={styles.cardTitle}>Get more physical activity</Text>
              <Text style={styles.cardText}>
                Feeling stuck or low-energy? Build momentum with personalized guidance to reengage in everyday life.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
