import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Activity } from 'lucide-react-native';

export const WeeklyPulse = ({ theme, styles, data, t }: any) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const pulseData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayLog = data.find((log: any) => new Date(log.createdAt).toDateString() === d.toDateString());
    return dayLog ? dayLog.score * 10 : 0; // Score is 1-10, scale to 0-100
  });

  return (
    <View style={styles.pulseCard}>
      <BlurView intensity={theme.isDark ? 40 : 80} tint={theme.isDark ? 'dark' : 'light'} style={[styles.pulseGlass, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)', borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)' }]}>
        <View style={styles.pulseHeader}>
          <View>
            <Text style={[styles.pulseTitle, { color: theme.colors.text.primary }]}>{t('dashboard.weeklyPulse')}</Text>
            <Text style={[styles.pulseSubtitle, { color: theme.colors.text.tertiary }]}>{t('dashboard.emotionalRhythm')}</Text>
          </View>
          <Activity color={theme.colors.plum} size={20} />
        </View>

        <View style={styles.pulseGraph}>
          {pulseData.map((val: number, i: number) => (
            <View key={i} style={styles.pulseCol}>
              <View style={[styles.pulseBarBg, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(123,97,255,0.08)' }]}>
                <Animated.View 
                  entering={FadeInUp.delay(i * 100).duration(800)}
                  style={[styles.pulseBarFill, { 
                    height: `${val}%`, 
                    backgroundColor: val > 70 ? theme.colors.accents.eucalyptus : (val > 40 ? theme.colors.plum : theme.colors.accents.terracotta)
                  }]} 
                />
              </View>
              <Text style={[styles.pulseDayLabel, { color: theme.colors.text.tertiary }]}>{days[i]}</Text>
            </View>
          ))}
        </View>
      </BlurView>
    </View>
  );
};
