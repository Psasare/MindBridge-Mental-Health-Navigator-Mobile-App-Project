import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Calendar } from 'lucide-react-native';

export const CalendarStrip = ({ theme, styles }: any) => {
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return {
      date: d.getDate(),
      dayName: dayNames[d.getDay()].slice(0, 1),
      isToday: d.toDateString() === today.toDateString(),
      isPast: d < new Date(today.setHours(0,0,0,0)),
    };
  });
  const nowAgain = new Date();

  return (
    <Animated.View entering={FadeInUp.delay(50).duration(600)} style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <View style={styles.calendarDateBlock}>
          <Text style={styles.calendarDayName}>{dayNames[nowAgain.getDay()].toUpperCase()}</Text>
          <Text style={styles.calendarDayNumber}>{nowAgain.getDate()}</Text>
        </View>
        <View style={styles.calendarMonthBlock}>
          <Text style={styles.calendarMonthText}>{monthNames[nowAgain.getMonth()]}</Text>
          <Text style={styles.calendarYearText}>{nowAgain.getFullYear()}</Text>
        </View>
        <View style={styles.calendarIconWrap}>
          <Calendar color={theme.colors.plum} size={20} strokeWidth={2} />
        </View>
      </View>

      <View style={styles.calendarWeekStrip}>
        {days.map((day, i) => (
          <View key={i} style={styles.calendarDayCol}>
            <Text style={[styles.calendarWeekDayName, { color: day.isToday ? theme.colors.plum : theme.colors.text.tertiary }]}>{day.dayName}</Text>
            <View style={[styles.calendarDayCircle, day.isToday && { backgroundColor: theme.colors.plum }, !day.isToday && day.isPast && { opacity: 0.4 }]}>
              <Text style={[styles.calendarDayNum, { color: day.isToday ? '#FFF' : theme.colors.text.primary }]}>{day.date}</Text>
            </View>
            {day.isToday && <View style={[styles.calendarTodayDot, { backgroundColor: theme.colors.plum }]} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};
