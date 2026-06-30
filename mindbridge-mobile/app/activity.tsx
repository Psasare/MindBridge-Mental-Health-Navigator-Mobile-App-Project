// @ts-ignore: Bypassing IDE cache bug
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Modal } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronRight, Footprints, User, Activity as ActivityIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { FadeInUp, useSharedValue, useAnimatedProps, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

const { width } = Dimensions.get('window');

// Fitness Rings Configuration
const CENTER = 100;
const STROKE_WIDTH = 18;
const R_MOVE = 80;
const R_EXERCISE = 60;
const R_STAND = 40;

const C_MOVE = 2 * Math.PI * R_MOVE;
const C_EXERCISE = 2 * Math.PI * R_EXERCISE;
const C_STAND = 2 * Math.PI * R_STAND;

// Apple Fitness Colors
const COLOR_MOVE = '#FA114F'; // Red/Pink
const COLOR_EXERCISE = '#A4FF28'; // Green
const COLOR_STAND = '#1DB0F6'; // Blue

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ActivityScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [steps, setSteps] = useState(0);
  const [liveSteps, setLiveSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [weeklySteps, setWeeklySteps] = useState<any[]>([]);
  const [bestSession, setBestSession] = useState<{steps: number, distance: number, dateStr: string} | null>(null);
  
  // Goals
  const [goalSteps, setGoalSteps] = useState(10000);
  const [goalCalories, setGoalCalories] = useState(400);
  const goalExercise = 30; // 30 minutes
  const goalStand = 12; // 12 hours
  
  const progressMove = useSharedValue(0);
  const progressExercise = useSharedValue(0);
  const progressStand = useSharedValue(0);

  // Derived metrics
  const totalSteps = steps + liveSteps;
  const moveCals = Math.round(totalSteps * 0.04);
  const exerciseMins = Math.round(totalSteps / 100);
  // Estimate stand hours based on time of day (just for demonstration if no pedometer)
  const standHours = Math.min(Math.max(1, new Date().getHours() - 6), 12);
  const distanceKm = (totalSteps * 0.000762).toFixed(2);

  const fetchPedometerData = async (gSteps: number, gCals: number) => {
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      const available = await Pedometer.isAvailableAsync();
      const canUseSensors = available && status === 'granted';
      
      setIsAvailable(available);
      setPermissionGranted(status === 'granted');
      
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      
      let todaySteps = 0;
      
      if (canUseSensors) {
        try {
          const todayRes = await Pedometer.getStepCountAsync(start, end);
          if (todayRes) todaySteps = todayRes.steps;
          
          Pedometer.watchStepCount(result => {
            setLiveSteps(result.steps);
          });
        } catch (e) {}
      }

      // Fetch Mood History for fallback
      let moodHistory: any[] = [];
      try {
        const response = await api.get('/mood');
        moodHistory = response.data;
      } catch (e) {
        console.log('Could not fetch mood history for fallback', e);
      }

      if (todaySteps === 0 && moodHistory && moodHistory.length > 0) {
        const logForToday = moodHistory.find(m => {
          const md = new Date(m.createdAt);
          return md >= start && md <= end;
        });
        if (logForToday && logForToday.steps) todaySteps = logForToday.steps;
      }
      
      setSteps(todaySteps);
      
      const calcMove = Math.round(todaySteps * 0.04);
      const calcEx = Math.round(todaySteps / 100);
      const calcStand = standHours;

      progressMove.value = withDelay(100, withTiming(Math.min(calcMove / gCals, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));
      progressExercise.value = withDelay(300, withTiming(Math.min(calcEx / goalExercise, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));
      progressStand.value = withDelay(500, withTiming(Math.min(calcStand / goalStand, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));

      // Fetch Last 7 Days
      const wSteps = [];
      let maxDaySteps = 0;
      let maxDayDate = new Date();

      for (let i = 6; i >= 0; i--) {
        const dStart = new Date();
        dStart.setDate(dStart.getDate() - i);
        dStart.setHours(0, 0, 0, 0);
        
        const dEnd = new Date(dStart);
        dEnd.setHours(23, 59, 59, 999);
        if (i === 0) dEnd.setTime(end.getTime());

        let dailySteps = 0;
        if (canUseSensors && dStart <= end) {
          try {
            const res = await Pedometer.getStepCountAsync(dStart, dEnd);
            if (res && res.steps > 0) dailySteps = res.steps;
          } catch (e) {}
        }

        if (dailySteps === 0 && moodHistory && moodHistory.length > 0) {
          const logForDay = moodHistory.find(m => {
            const md = new Date(m.createdAt);
            return md >= dStart && md <= dEnd;
          });
          if (logForDay && logForDay.steps) {
            dailySteps = logForDay.steps;
          }
        }
        
        if (dailySteps > maxDaySteps) {
            maxDaySteps = dailySteps;
            maxDayDate = new Date(dStart);
        }

        const label = dStart.toLocaleDateString('en-US', { weekday: 'narrow' });
        
        wSteps.push({
          value: dailySteps,
          label: label,
          frontColor: COLOR_MOVE, // Apple uses red for general movement charts
          topLabelComponent: () => null
        });
      }
      
      setWeeklySteps(wSteps);
      
      if (maxDaySteps > 2000) { 
          setBestSession({
              steps: maxDaySteps,
              distance: parseFloat((maxDaySteps * 0.000762).toFixed(2)),
              dateStr: maxDayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          });
      } else {
          setBestSession(null);
      }

    } catch (e) {
      setIsAvailable(false);
      console.log('Pedometer error:', e);
    }
  };

  useEffect(() => {
    const initAndFetch = async () => {
      let gSteps = 10000;
      let gCals = 400;
      try {
        const savedSteps = await AsyncStorage.getItem('@activity_goal_steps');
        const savedCals = await AsyncStorage.getItem('@activity_goal_calories');
        if (savedSteps) gSteps = parseInt(savedSteps);
        if (savedCals) gCals = parseInt(savedCals);
      } catch (e) {}
      
      setGoalSteps(gSteps);
      setGoalCalories(gCals);

      const hasConsented = await AsyncStorage.getItem('@activity_consent_granted');
      if (hasConsented !== 'true') {
        setShowConsentModal(true);
        return;
      }

      await fetchPedometerData(gSteps, gCals);
    };
    
    initAndFetch();
  }, []);

  const handleConsentAllow = async () => {
    await AsyncStorage.setItem('@activity_consent_granted', 'true');
    setShowConsentModal(false);
    await fetchPedometerData(goalSteps, goalCalories);
  };

  const animatedPropsMove = useAnimatedProps(() => ({ strokeDashoffset: C_MOVE - (C_MOVE * progressMove.value) }));
  const animatedPropsExercise = useAnimatedProps(() => ({ strokeDashoffset: C_EXERCISE - (C_EXERCISE * progressExercise.value) }));
  const animatedPropsStand = useAnimatedProps(() => ({ strokeDashoffset: C_STAND - (C_STAND * progressStand.value) }));

  const styles = createStyles(theme);
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerDate}>{formattedDate}</Text>
          <Text style={styles.headerTitle}>Summary</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.back()}>
          <View style={styles.profileImgPlaceholder}>
            <User color="#FFF" size={20} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Activity Rings Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.cardLarge}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>Activity</Text>
            <ChevronRight color="#666" size={16} />
          </View>
          
          <View style={styles.ringsContainer}>
            <View style={styles.svgWrapper}>
              <Svg width={CENTER * 2} height={CENTER * 2}>
                <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                  {/* Tracks */}
                  <Circle cx={CENTER} cy={CENTER} r={R_MOVE} stroke={COLOR_MOVE + '30'} strokeWidth={STROKE_WIDTH} fill="none" />
                  <Circle cx={CENTER} cy={CENTER} r={R_EXERCISE} stroke={COLOR_EXERCISE + '30'} strokeWidth={STROKE_WIDTH} fill="none" />
                  <Circle cx={CENTER} cy={CENTER} r={R_STAND} stroke={COLOR_STAND + '30'} strokeWidth={STROKE_WIDTH} fill="none" />
                  
                  {/* Animated Progress Rings */}
                  <AnimatedCircle cx={CENTER} cy={CENTER} r={R_MOVE} stroke={COLOR_MOVE} strokeWidth={STROKE_WIDTH} fill="none" strokeDasharray={C_MOVE} animatedProps={animatedPropsMove} strokeLinecap="round" />
                  <AnimatedCircle cx={CENTER} cy={CENTER} r={R_EXERCISE} stroke={COLOR_EXERCISE} strokeWidth={STROKE_WIDTH} fill="none" strokeDasharray={C_EXERCISE} animatedProps={animatedPropsExercise} strokeLinecap="round" />
                  <AnimatedCircle cx={CENTER} cy={CENTER} r={R_STAND} stroke={COLOR_STAND} strokeWidth={STROKE_WIDTH} fill="none" strokeDasharray={C_STAND} animatedProps={animatedPropsStand} strokeLinecap="round" />
                </G>
              </Svg>
            </View>
            
            <View style={styles.metricsCol}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: COLOR_MOVE }]}>Move</Text>
                <Text style={styles.metricValue}>{moveCals}<Text style={styles.metricUnit}>/{goalCalories} KCAL</Text></Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: COLOR_EXERCISE }]}>Exercise</Text>
                <Text style={styles.metricValue}>{exerciseMins}<Text style={styles.metricUnit}>/{goalExercise} MIN</Text></Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: COLOR_STAND }]}>Stand</Text>
                <Text style={styles.metricValue}>{standHours}<Text style={styles.metricUnit}>/{goalStand} HRS</Text></Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Trends */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.cardLarge}>
           <View style={styles.cardHeaderRow}>
             <Text style={styles.cardHeader}>Steps</Text>
             <ChevronRight color="#666" size={16} />
           </View>
           <Text style={styles.trendValue}>{totalSteps.toLocaleString()}</Text>
           <Text style={styles.trendSub}>Today</Text>
           
           <View style={styles.chartWrapper}>
              {weeklySteps.length > 0 && (
                <BarChart
                    data={weeklySteps}
                    width={width - 80}
                    height={100}
                    barWidth={18}
                    spacing={16}
                    initialSpacing={0}
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    hideYAxisText
                    xAxisLabelTextStyle={{ color: '#8E8E93', fontSize: 12, marginTop: 8, textAlign: 'center' }}
                    noOfSections={1}
                    maxValue={Math.max(...weeklySteps.map(d => d.value), 500) * 1.1}
                    disableScroll
                    barBorderRadius={6}
                  />
              )}
            </View>
        </Animated.View>

        {/* Workouts / Sessions */}
        <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.cardLarge}>
           <View style={styles.cardHeaderRow}>
             <Text style={styles.cardHeader}>Workouts</Text>
             <ChevronRight color="#666" size={16} />
           </View>
           
           {bestSession ? (
             <View style={styles.workoutRow}>
               <View style={styles.workoutIconWrap}>
                 <Footprints color="#FFF" size={24} />
               </View>
               <View style={styles.workoutInfo}>
                 <Text style={styles.workoutTitle}>Outdoor Walk</Text>
                 <Text style={styles.workoutDate}>{bestSession.dateStr}</Text>
               </View>
               <View style={styles.workoutStats}>
                 <Text style={styles.workoutDist}>{bestSession.distance.toFixed(2)} KM</Text>
               </View>
             </View>
           ) : (
             <Text style={styles.emptyText}>No recent workouts to display.</Text>
           )}
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Consent Modal */}
      <Modal visible={showConsentModal} animationType="fade" transparent>
        <View style={styles.consentOverlay}>
          <View style={styles.consentCard}>
            <View style={styles.consentIconWrapper}>
              <ActivityIcon color={COLOR_MOVE} size={32} />
            </View>
            <Text style={styles.consentTitle}>Activity Tracking</Text>
            <Text style={styles.consentBody}>
              MindBridge uses your phone's sensors to securely track your steps, calculate active calories, and measure your distance to give you holistic insights connecting your physical health to your mental well-being.
            </Text>
            
            <TouchableOpacity onPress={handleConsentAllow} style={styles.consentBtnPrimary} activeOpacity={0.8}>
              <Text style={styles.consentBtnPrimaryText}>Allow Tracking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowConsentModal(false)} style={styles.consentBtnSecondary} activeOpacity={0.7}>
              <Text style={styles.consentBtnSecondaryText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Apple pure black
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    fontFamily: theme.typography.fonts.header,
  },
  headerDate: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileBtn: {
    marginTop: 8,
  },
  profileImgPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardLarge: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ringsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  svgWrapper: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  metricsCol: {
    width: '100%',
    gap: 12,
  },
  metricRow: {
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  trendValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: -8,
  },
  trendSub: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 16,
  },
  workoutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A4FF28', // Green for workouts
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDate: {
    color: '#8E8E93',
    fontSize: 14,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDist: {
    color: '#A4FF28',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 20,
  },
  consentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  consentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
  },
  consentIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLOR_MOVE + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  consentTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  consentBody: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  consentBtnPrimary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLOR_MOVE,
    alignItems: 'center',
    marginBottom: 12,
  },
  consentBtnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  consentBtnSecondary: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  consentBtnSecondaryText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  }
});
