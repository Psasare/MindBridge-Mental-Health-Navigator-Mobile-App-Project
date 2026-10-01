import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Flame } from 'lucide-react-native';

export const StreakJourney = ({ streak, theme, styles, completedCount }: any) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDayIndex = (new Date().getDay() + 6) % 7; 

  return (
    <View style={styles.premiumJourney}>
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
                !isCompleted && !isMissed && !isToday && { backgroundColor: theme.colors.surface, borderColor: theme.colors.text.disabled + '20' }
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
};
