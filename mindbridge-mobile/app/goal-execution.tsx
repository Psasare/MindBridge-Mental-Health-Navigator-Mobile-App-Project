import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { AuthContext } from '../src/context/AuthContext';
import { X, Play, Pause, CheckCircle2, Star, Activity, Award } from 'lucide-react-native';
import api from '../src/services/api';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function GoalExecutionScreen() {
  const { goalStr } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { userData } = useContext(AuthContext) as any;
  const styles = createStyles(theme);

  const goal = goalStr ? JSON.parse(goalStr as string) : null;

  const [timeLeft, setTimeLeft] = useState((goal?.duration || 0) * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gamificationResult, setGamificationResult] = useState<any>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const markComplete = () => {
    setIsCompleted(true);
    setIsActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const submitCompletion = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const rawTimeSpent = (goal?.duration * 60) - timeLeft;
      const timeSpent = isNaN(rawTimeSpent) || rawTimeSpent < 0 ? 0 : rawTimeSpent;

      const res = await api.post('/goals/complete', {
        goalId: goal.id,
        rating,
        timeSpent
      });

      // Optimistically update the dashboard cache
      try {
        const cached = await AsyncStorage.getItem('dashboard_cache');
        if (cached) {
          const data = JSON.parse(cached);
          if (data.completedGoalIds) {
            data.completedGoalIds = [...new Set([...data.completedGoalIds, goal.id])];
            await AsyncStorage.setItem('dashboard_cache', JSON.stringify(data));
          }
        }
      } catch (cacheErr) {
        console.warn('Failed to optimistically update dashboard cache', cacheErr);
      }

      setGamificationResult(res.data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error('Failed to submit goal completion', e);
      setIsSubmitting(false);
      // Let them return anyway
      router.back();
    }
  };

  if (!goal) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} style={styles.closeBtn} onPress={() => router.back()}>
          <X color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {gamificationResult ? (
          <Animated.View entering={FadeInDown} style={styles.successContainer}>
            <View style={styles.badgeContainer}>
              <Award color={theme.colors.plum} size={64} />
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>Goal Completed!</Text>
            <Text style={[styles.successSubtitle, { color: theme.colors.text.secondary }]}>
              You earned <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>+{gamificationResult.pointsAwarded} pts</Text>
            </Text>
            {gamificationResult.badgeUnlocked && (
              <View style={styles.badgeUnlockedCard}>
                <Text style={styles.badgeUnlockedText}>New Badge Unlocked!</Text>
                <Text style={styles.badgeName}>{gamificationResult.badgeUnlocked}</Text>
              </View>
            )}
            <TouchableOpacity activeOpacity={0.7} style={[styles.primaryBtn, { backgroundColor: theme.colors.plum, marginTop: 40 }]} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : !isCompleted ? (
          <Animated.View entering={FadeInDown}>
            <View style={styles.categoryBadge}>
              <Activity size={14} color={theme.colors.plum} />
              <Text style={styles.categoryText}>{goal.category.toUpperCase().replace('_', ' ')}</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{goal.name}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{goal.duration} mins</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{goal.points} pts</Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
              <Text style={[styles.descriptionTitle, { color: theme.colors.text.primary }]}>Instructions</Text>
              <Text style={[styles.description, { color: theme.colors.text.secondary }]}>{goal.description}</Text>
              
              <View style={styles.divider} />
              
              <Text style={[styles.descriptionTitle, { color: theme.colors.text.primary }]}>Why it helps</Text>
              <Text style={[styles.description, { color: theme.colors.text.secondary }]}>{goal.whyItHelps}</Text>
            </View>

            {goal.duration > 0 && (
              <View style={styles.timerContainer}>
                <Text style={[styles.timerText, { color: theme.colors.text.primary }]}>{formatTime(timeLeft)}</Text>
                <TouchableOpacity activeOpacity={0.7} 
                  style={[styles.timerBtn, { backgroundColor: isActive ? theme.colors.semantic.danger + '20' : theme.colors.plum + '20' }]} 
                  onPress={toggleTimer}
                >
                  {isActive ? <Pause color={theme.colors.semantic.danger} size={32} /> : <Play color={theme.colors.plum} size={32} />}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity activeOpacity={0.7} style={[styles.primaryBtn, { backgroundColor: theme.colors.plum, marginTop: 40 }]} onPress={markComplete}>
              <CheckCircle2 color="#FFF" size={24} />
              <Text style={styles.primaryBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={SlideInDown}>
            <Text style={[styles.title, { color: theme.colors.text.primary, textAlign: 'center' }]}>How did it go?</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary, textAlign: 'center' }]}>Rate how helpful this was for you.</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity activeOpacity={0.7} key={star} onPress={() => setRating(star)}>
                  <Star 
                    size={48} 
                    color={rating >= star ? '#FFD700' : theme.colors.text.disabled} 
                    fill={rating >= star ? '#FFD700' : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity activeOpacity={0.7} 
              style={[styles.primaryBtn, { backgroundColor: rating > 0 ? theme.colors.plum : theme.colors.text.disabled, marginTop: 40 }]} 
              onPress={submitCompletion}
              disabled={rating === 0 || isSubmitting}
            >
              <Text style={styles.primaryBtnText}>{isSubmitting ? 'Submitting...' : 'Claim Points'}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.plum + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    color: theme.colors.plum,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    marginBottom: 32,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  metaBadge: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  metaBadgeText: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginVertical: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 64,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    marginBottom: 24,
  },
  timerBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 12,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  badgeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.plum + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 32,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.body,
    marginBottom: 32,
  },
  badgeUnlockedCard: {
    backgroundColor: '#FFD700' + '20',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700' + '40',
    width: '100%',
  },
  badgeUnlockedText: {
    color: '#FF9800',
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  badgeName: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    fontSize: 24,
  }
});
