import React, { useMemo } from 'react';
import { View, Text, StyleSheet, AccessibilityRole } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Flame } from 'lucide-react-native';

export interface StreakJourneyProps {
  /**
   * The current user's active daily streak.
   */
  streak: number;
  /**
   * Number of daily tasks completed today.
   */
  completedCount: number;
  /**
   * The current app theme object from ThemeContext.
   */
  theme: any;
  /**
   * Loading state for the component.
   */
  isLoading?: boolean;
}

/**
 * A highly reusable, accessible, and responsive component displaying the user's weekly 
 * streak journey. Built with production-grade UI standards.
 */
export const StreakJourney: React.FC<StreakJourneyProps> = React.memo(({ 
  streak = 0, 
  completedCount = 0, 
  theme,
  isLoading = false
}) => {
  const days = useMemo(() => ['M', 'T', 'W', 'T', 'F', 'S', 'S'], []);
  const currentDayIndex = (new Date().getDay() + 6) % 7; 
  
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <View style={[styles.premiumJourney, styles.skeletonBackground]} accessible={true} accessibilityLabel="Loading your streak journey">
        <View style={styles.journeyPathLine} />
        <View style={styles.journeyDaysRow}>
          {days.map((_, i) => (
            <View key={i} style={styles.journeyDayItem}>
              <View style={[styles.journeyDayCircle, styles.skeletonCircle]} />
              <View style={styles.skeletonText} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Empty State (Edge Case: brand new user)
  if (streak === 0 && completedCount === 0) {
    return (
      <View style={styles.premiumJourney} accessible={true} accessibilityLabel="Start your streak today by completing a task">
        <View style={styles.journeyPathLine} />
        <View style={styles.journeyDaysRow}>
          {days.map((day, i) => {
            const isToday = i === currentDayIndex;
            return (
              <View key={i} style={styles.journeyDayItem}>
                <View style={[
                  styles.journeyDayCircle, 
                  isToday ? styles.todayCircle : styles.emptyCircle
                ]}>
                  {isToday && <Flame size={18} color={theme.colors.text.disabled} />}
                </View>
                <Text style={[
                  styles.journeyDayText, 
                  { color: isToday ? theme.colors.text.secondary : theme.colors.text.tertiary }
                ]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View 
      style={styles.premiumJourney}
      accessible={true}
      accessibilityRole={"summary" as AccessibilityRole}
      accessibilityLabel={`You are on a ${streak} day streak.`}
    >
      <View style={styles.journeyPathLine} />
      <View style={styles.journeyDaysRow}>
        {days.map((day, i) => {
          const isPast = i < currentDayIndex;
          const isToday = i === currentDayIndex;
          
          const isCompleted = isPast ? (i >= currentDayIndex - streak) : (isToday && completedCount > 0);
          const isMissed = isPast && !isCompleted && streak > 0;
          
          return (
            <View key={i} style={styles.journeyDayItem}>
              <View style={[
                styles.journeyDayCircle,
                isCompleted && styles.beamedCircle,
                isMissed && styles.frozenCircle,
                isToday && styles.todayCircle,
                !isCompleted && !isMissed && !isToday && styles.emptyCircle
              ]}>
                {isCompleted && (
                  <LinearGradient 
                    colors={['#FF9800', '#F44336']} 
                    style={StyleSheet.absoluteFill} 
                  />
                )}
                {isCompleted && <CheckCircle2 size={12} color="#FFF" style={{ zIndex: 1 }} />}
                {isMissed && <View style={styles.frozenCore} />}
                {isToday && (
                  <Flame size={18} color={isCompleted ? "#FF9800" : theme.colors.text.disabled} />
                )}
              </View>
              <Text style={[
                styles.journeyDayText, 
                { color: isToday ? "#FF9800" : (isMissed ? '#93C5FD' : theme.colors.text.tertiary) }
              ]}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

// Extracted styles to ensure component is independent and self-contained
const createStyles = (theme: any) => StyleSheet.create({
  premiumJourney: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0.1 : 0.05,
    shadowRadius: 24,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  journeyPathLine: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    zIndex: 0,
  },
  journeyDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  journeyDayItem: {
    alignItems: 'center',
    gap: 12,
  },
  journeyDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  emptyCircle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.text.disabled + '20'
  },
  beamedCircle: {
    borderColor: 'transparent',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  frozenCircle: {
    backgroundColor: theme.isDark ? 'rgba(147, 197, 253, 0.1)' : '#F0F9FF',
    borderColor: 'rgba(147, 197, 253, 0.3)',
  },
  frozenCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#93C5FD',
    opacity: 0.5,
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: '#FF9800',
    backgroundColor: theme.colors.surface,
    transform: [{ scale: 1.15 }],
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  journeyDayText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
  },
  skeletonBackground: {
    opacity: 0.7,
  },
  skeletonCircle: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderColor: 'transparent',
  },
  skeletonText: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  }
});
