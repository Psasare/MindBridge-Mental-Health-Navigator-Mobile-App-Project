import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Award, Flame, Target, Trophy, ChevronLeft, Calendar } from 'lucide-react-native';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

export default function ProgressScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [gamification, setGamification] = useState<any>(null);

  useEffect(() => {
    fetchGamification();
  }, []);

  const fetchGamification = async () => {
    try {
      // Load from cache instantly
      const cached = await AsyncStorage.getItem('progress_cache');
      if (cached) {
        setGamification(JSON.parse(cached));
        setLoading(false);
      }

      // Fetch fresh data in the background
      const res = await api.get('/goals/gamification');
      setGamification(res.data);
      
      // Update cache
      await AsyncStorage.setItem('progress_cache', JSON.stringify(res.data));
    } catch (e) {
      console.warn('Failed to fetch gamification', e);
    } finally {
      setLoading(false);
    }
  };

  const badgesList = [
    { name: 'Riser', icon: Flame, desc: 'Complete 5 morning routines', color: '#FF9800' },
    { name: 'Grounding Master', icon: Target, desc: 'Complete 10 grounding exercises', color: '#4CAF50' },
    { name: 'Scholar', icon: Trophy, desc: 'Complete 5 study sessions', color: '#2196F3' },
    { name: 'Self-Care Pro', icon: Award, desc: 'Consistently practice self-care', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Your Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.plum} />
        </View>
      ) : gamification ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.isDark ? '#2E3A4A' : '#F0EEF9' }]}>
              <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '20' }]}>
                <Flame color="#FF9800" size={24} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{gamification.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Current Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.isDark ? '#2E3A4A' : '#F0EEF9' }]}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.plum + '20' }]}>
                <Award color={theme.colors.plum} size={24} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{gamification.totalPoints}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Total Points</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Badges Earned</Text>
            
            {gamification.badges && gamification.badges.length > 0 ? (
              <View style={styles.badgesGrid}>
                {gamification.badges.map((badgeName: string, i: number) => {
                  const badgeInfo = badgesList.find(b => b.name === badgeName) || { icon: Award, color: theme.colors.plum };
                  const Icon = badgeInfo.icon;
                  return (
                    <View key={i} style={[styles.badgeItem, { backgroundColor: theme.isDark ? '#2E3A4A' : '#F0EEF9' }]}>
                      <View style={[styles.badgeIconWrap, { backgroundColor: badgeInfo.color + '20' }]}>
                        <Icon color={badgeInfo.color} size={32} />
                      </View>
                      <Text style={[styles.badgeName, { color: theme.colors.text.primary }]}>{badgeName}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.isDark ? '#2E3A4A' : '#F0EEF9' }]}>
                <Award color={theme.colors.text.disabled} size={48} />
                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>Complete goals to unlock badges!</Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>All Available Badges</Text>
            {badgesList.map((badge, idx) => {
              const isEarned = gamification.badges?.includes(badge.name);
              const Icon = badge.icon;
              return (
                <View key={idx} style={[styles.availableBadgeRow, { opacity: isEarned ? 1 : 0.4 }]}>
                  <View style={[styles.badgeIconWrapSmall, { backgroundColor: isEarned ? badge.color + '20' : theme.colors.text.disabled + '20' }]}>
                    <Icon color={isEarned ? badge.color : theme.colors.text.disabled} size={20} />
                  </View>
                  <View style={styles.availableBadgeTextWrap}>
                    <Text style={[styles.availableBadgeName, { color: theme.colors.text.primary }]}>{badge.name}</Text>
                    <Text style={[styles.availableBadgeDesc, { color: theme.colors.text.secondary }]}>{badge.desc}</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 32, fontFamily: theme.typography.fonts.header, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 13, fontFamily: theme.typography.fonts.body, fontWeight: '600' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800', marginBottom: 16 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  badgeItem: { width: '47%', padding: 20, borderRadius: 24, alignItems: 'center' },
  badgeIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  badgeName: { fontSize: 14, fontFamily: theme.typography.fonts.header, fontWeight: '700', textAlign: 'center' },
  emptyState: { padding: 40, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 14, fontFamily: theme.typography.fonts.body, textAlign: 'center' },
  availableBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  badgeIconWrapSmall: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  availableBadgeTextWrap: { flex: 1 },
  availableBadgeName: { fontSize: 15, fontFamily: theme.typography.fonts.header, fontWeight: '800', marginBottom: 4 },
  availableBadgeDesc: { fontSize: 13, fontFamily: theme.typography.fonts.body },
});
