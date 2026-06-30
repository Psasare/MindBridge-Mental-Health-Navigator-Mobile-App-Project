// @ts-ignore: Bypassing IDE cache bug
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronRight, Footprints, Activity as ActivityIcon, Edit3, X, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInUp, useSharedValue, useAnimatedProps, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

const { width } = Dimensions.get('window');

// Hero Ring Configuration
const CENTER = 120;
const STROKE_WIDTH = 24;
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ActivityScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [steps, setSteps] = useState(0);
  const [liveSteps, setLiveSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);
  
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const [weeklySteps, setWeeklySteps] = useState<any[]>([]);
  const [bestSession, setBestSession] = useState<{steps: number, distance: number, dateStr: string} | null>(null);
  
  // Goals
  const [goalSteps, setGoalSteps] = useState(10000);
  const [goalCalories, setGoalCalories] = useState(400);
  const [goalDistance, setGoalDistance] = useState(5.0);
  
  // Form Inputs
  const [inputSteps, setInputSteps] = useState('10000');
  const [inputCalories, setInputCalories] = useState('400');
  const [inputDistance, setInputDistance] = useState('5.0');
  
  const progressSteps = useSharedValue(0);
  const progressCals = useSharedValue(0);
  const progressDist = useSharedValue(0);

  // Derived Real Metrics
  const totalSteps = steps + liveSteps;
  const calsBurned = Math.round(totalSteps * 0.04);
  const distanceKm = parseFloat((totalSteps * 0.000762).toFixed(2));

  const fetchPedometerData = async (gSteps: number, gCals: number, gDist: number) => {
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
      
      const cCalc = Math.round(todaySteps * 0.04);
      const dCalc = parseFloat((todaySteps * 0.000762).toFixed(2));

      // Animate Hero Ring and Bars
      progressSteps.value = withDelay(100, withTiming(Math.min(todaySteps / gSteps, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));
      progressCals.value = withDelay(300, withTiming(Math.min(cCalc / gCals, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));
      progressDist.value = withDelay(500, withTiming(Math.min(dCalc / gDist, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));

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
          frontColor: '#FA114F', 
          topLabelComponent: () => null
        });
      }
      
      setWeeklySteps(wSteps);
      
      if (maxDaySteps > 1000) { 
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
      let gDist = 5.0;
      try {
        const savedSteps = await AsyncStorage.getItem('@activity_goal_steps');
        const savedCals = await AsyncStorage.getItem('@activity_goal_calories');
        const savedDist = await AsyncStorage.getItem('@activity_goal_distance');
        if (savedSteps) gSteps = parseInt(savedSteps);
        if (savedCals) gCals = parseInt(savedCals);
        if (savedDist) gDist = parseFloat(savedDist);
      } catch (e) {}
      
      setGoalSteps(gSteps);
      setGoalCalories(gCals);
      setGoalDistance(gDist);
      
      setInputSteps(gSteps.toString());
      setInputCalories(gCals.toString());
      setInputDistance(gDist.toString());

      const hasConsented = await AsyncStorage.getItem('@activity_consent_granted');
      if (hasConsented !== 'true') {
        setShowConsentModal(true);
        return;
      }

      await fetchPedometerData(gSteps, gCals, gDist);
    };
    
    initAndFetch();
  }, []);

  const handleConsentAllow = async () => {
    await AsyncStorage.setItem('@activity_consent_granted', 'true');
    setShowConsentModal(false);
    await fetchPedometerData(goalSteps, goalCalories, goalDistance);
  };
  
  const handleSaveGoals = async () => {
    const newSteps = parseInt(inputSteps) || 10000;
    const newCals = parseInt(inputCalories) || 400;
    const newDist = parseFloat(inputDistance) || 5.0;
    
    await AsyncStorage.setItem('@activity_goal_steps', newSteps.toString());
    await AsyncStorage.setItem('@activity_goal_calories', newCals.toString());
    await AsyncStorage.setItem('@activity_goal_distance', newDist.toString());
    
    setGoalSteps(newSteps);
    setGoalCalories(newCals);
    setGoalDistance(newDist);
    setShowGoalModal(false);
    
    // Re-animate with new goals instantly
    progressSteps.value = withTiming(Math.min(totalSteps / newSteps, 1), { duration: 800 });
    progressCals.value = withTiming(Math.min(calsBurned / newCals, 1), { duration: 800 });
    progressDist.value = withTiming(Math.min(distanceKm / newDist, 1), { duration: 800 });
  };

  const animatedPropsSteps = useAnimatedProps(() => ({ strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * progressSteps.value) }));
  
  // Progress Bar Width Interpolations (0% to 100%)
  const animatedBarStyleCals = {
    width: useSharedValue(0) // We will interpolate this in the render via inline styles and useSharedValue, or just use simple percentages since Reanimated supports it directly in style via animatedProps. Actually, let's use standard Reanimated interpolation
  };

  const styles = createStyles(theme);
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.colors.background === '#FDFBF7' ? 'dark-content' : 'light-content'} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerDate}>{formattedDate}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* MindBridge Hero Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.cardLarge}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>Today's Progress</Text>
            <TouchableOpacity onPress={() => setShowGoalModal(true)} style={styles.editBtn} activeOpacity={0.7}>
              <Text style={styles.editBtnText}>Edit Goals</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.heroContainer}>
            {/* Steps Hero Ring */}
            <View style={styles.svgWrapper}>
              <Svg width={CENTER * 2} height={CENTER * 2}>
                <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={'#FA114F20'} strokeWidth={STROKE_WIDTH} fill="none" />
                <AnimatedCircle cx={CENTER} cy={CENTER} r={RADIUS} stroke={'#FA114F'} strokeWidth={STROKE_WIDTH} fill="none" strokeDasharray={CIRCUMFERENCE} animatedProps={animatedPropsSteps} strokeLinecap="round" rotation="-90" origin={`${CENTER}, ${CENTER}`} />
              </Svg>
              <View style={styles.heroCenterText}>
                <Footprints color={'#FA114F'} size={28} style={{ marginBottom: 4 }} />
                <Text style={styles.heroValue}>{totalSteps.toLocaleString()}</Text>
                <Text style={styles.heroUnit}>/ {goalSteps.toLocaleString()} steps</Text>
              </View>
            </View>

            {/* Calories Horizontal Bar */}
            <View style={styles.barContainer}>
              <View style={styles.barHeader}>
                <Text style={styles.barLabel}>Calories</Text>
                <Text style={styles.barValues}>{calsBurned} <Text style={styles.barUnit}>/ {goalCalories} kcal</Text></Text>
              </View>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { backgroundColor: '#4ADBC8', width: `${Math.min((calsBurned / goalCalories) * 100, 100)}%` }]} />
              </View>
            </View>

            {/* Distance Horizontal Bar */}
            <View style={styles.barContainer}>
              <View style={styles.barHeader}>
                <Text style={styles.barLabel}>Distance</Text>
                <Text style={styles.barValues}>{distanceKm} <Text style={styles.barUnit}>/ {goalDistance} km</Text></Text>
              </View>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { backgroundColor: theme.colors.ocean, width: `${Math.min((distanceKm / goalDistance) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Trends Chart */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.cardLarge}>
           <View style={styles.cardHeaderRow}>
             <Text style={styles.cardHeader}>Weekly Steps</Text>
           </View>
           
           <View style={styles.chartWrapper}>
              {weeklySteps.length > 0 && (
                <BarChart
                    data={weeklySteps}
                    width={width - 80}
                    height={120}
                    barWidth={18}
                    spacing={16}
                    initialSpacing={0}
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    hideYAxisText
                    xAxisLabelTextStyle={{ color: theme.colors.text.secondary, fontSize: 12, marginTop: 8, textAlign: 'center' }}
                    noOfSections={1}
                    maxValue={Math.max(...weeklySteps.map(d => d.value), 1000) * 1.1}
                    disableScroll
                    barBorderRadius={6}
                  />
              )}
            </View>
        </Animated.View>

        {/* Best Workout Session */}
        <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.cardLarge}>
           <View style={styles.cardHeaderRow}>
             <Text style={styles.cardHeader}>Best Day</Text>
           </View>
           
           {bestSession ? (
             <View style={styles.workoutRow}>
               <View style={styles.workoutIconWrap}>
                 <Target color={theme.colors.surface} size={24} />
               </View>
               <View style={styles.workoutInfo}>
                 <Text style={styles.workoutTitle}>{bestSession.steps.toLocaleString()} Steps</Text>
                 <Text style={styles.workoutDate}>{bestSession.dateStr}</Text>
               </View>
               <View style={styles.workoutStats}>
                 <Text style={styles.workoutDist}>{bestSession.distance.toFixed(2)} KM</Text>
               </View>
             </View>
           ) : (
             <Text style={styles.emptyText}>Keep walking to record your best day!</Text>
           )}
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Goal Setting Modal */}
      <Modal visible={showGoalModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.goalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Set Your Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)} style={styles.closeBtn} activeOpacity={0.7}>
                <X color={theme.colors.text.secondary} size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Steps</Text>
              <TextInput style={styles.textInput} keyboardType="numeric" value={inputSteps} onChangeText={setInputSteps} placeholderTextColor={theme.colors.text.tertiary} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <TextInput style={styles.textInput} keyboardType="numeric" value={inputCalories} onChangeText={setInputCalories} placeholderTextColor={theme.colors.text.tertiary} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (km)</Text>
              <TextInput style={styles.textInput} keyboardType="numeric" value={inputDistance} onChangeText={setInputDistance} placeholderTextColor={theme.colors.text.tertiary} />
            </View>
            
            <TouchableOpacity onPress={handleSaveGoals} style={styles.saveBtn} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Consent Modal */}
      <Modal visible={showConsentModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.goalCard}>
            <View style={[styles.workoutIconWrap, { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.plum + '20', marginBottom: 20 }]}>
              <ActivityIcon color={theme.colors.plum} size={32} />
            </View>
            <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 12 }]}>Activity Tracking</Text>
            <Text style={[styles.emptyText, { marginBottom: 32, paddingVertical: 0 }]}>
              Would you like your steps to be tracked and calculated? MindBridge uses your phone's sensors to securely track your steps, calculate active calories, and measure your distance to connect physical health to your mental well-being.
            </Text>
            
            <TouchableOpacity onPress={handleConsentAllow} style={styles.saveBtn} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Allow Tracking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowConsentModal(false)} style={[styles.saveBtn, { backgroundColor: 'transparent' }]} activeOpacity={0.7}>
              <Text style={[styles.saveBtnText, { color: theme.colors.text.secondary }]}>Not Now</Text>
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
    backgroundColor: theme.colors.background,
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
    color: theme.colors.text.primary,
    fontSize: 34,
    fontWeight: '800',
    fontFamily: theme.typography.fonts.header,
  },
  headerDate: {
    color: theme.colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardLarge: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeader: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: theme.typography.fonts.ui,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.plum + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editBtnText: {
    color: theme.colors.plum,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  heroContainer: {
    alignItems: 'center',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 32,
  },
  heroCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroValue: {
    color: theme.colors.text.primary,
    fontSize: 40,
    fontWeight: '800',
    fontFamily: theme.typography.fonts.header,
  },
  heroUnit: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: -2,
  },
  barContainer: {
    width: '100%',
    marginBottom: 20,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  barLabel: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  barValues: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  barUnit: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  barTrack: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.backgroundSecondary || '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm || theme.colors.background,
    padding: 16,
    borderRadius: 16,
  },
  workoutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.ocean, 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  workoutDate: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDist: {
    color: theme.colors.ocean,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: theme.colors.text.primary,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: theme.typography.fonts.header,
  },
  closeBtn: {
    padding: 4,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.backgroundSecondary || '#E5E7EB',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: theme.colors.plum,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fonts.ui,
  }
});
