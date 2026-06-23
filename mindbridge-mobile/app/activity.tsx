import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Footprints, Flame, Navigation, Activity as ActivityIcon, Settings, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInUp, useSharedValue, useAnimatedProps, withTiming, Easing, withDelay, FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

const { width } = Dimensions.get('window');

// Fitness Rings Configuration
const CENTER = 130;
const STROKE_WIDTH = 22;
const RADIUS_STEPS = 100;
const RADIUS_CALORIES = 76;
const RADIUS_DISTANCE = 52;

const CIRCUMFERENCE_STEPS = 2 * Math.PI * RADIUS_STEPS;
const CIRCUMFERENCE_CALORIES = 2 * Math.PI * RADIUS_CALORIES;
const CIRCUMFERENCE_DISTANCE = 2 * Math.PI * RADIUS_DISTANCE;

// Apple Fitness Style Colors
const COLOR_STEPS = '#FA114F';    // Pink/Red
const COLOR_CALORIES = '#A4FF28'; // Neon Green
const COLOR_DISTANCE = '#1DB0F6'; // Bright Blue

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [weeklySteps, setWeeklySteps] = useState<any[]>([]);
  
  // Goals
  const [goalSteps, setGoalSteps] = useState(10000);
  const [goalCalories, setGoalCalories] = useState(400);
  const goalDistance = (goalSteps * 0.000762).toFixed(2);
  
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoalSteps, setTempGoalSteps] = useState(10000);
  const [tempGoalCalories, setTempGoalCalories] = useState(400);
  
  const progressSteps = useSharedValue(0);
  const progressCalories = useSharedValue(0);
  const progressDistance = useSharedValue(0);

  // Derived metrics
  const calories = Math.round(steps * 0.04);
  const distanceKm = (steps * 0.000762).toFixed(2);

  const saveGoals = async () => {
    setGoalSteps(tempGoalSteps);
    setGoalCalories(tempGoalCalories);
    await AsyncStorage.setItem('@activity_goal_steps', tempGoalSteps.toString());
    await AsyncStorage.setItem('@activity_goal_calories', tempGoalCalories.toString());
    setShowSettings(false);
    
    // Re-animate rings based on new goals
    const currentSteps = steps;
    const calculatedCals = Math.round(currentSteps * 0.04);
    const calculatedDist = currentSteps * 0.000762;
    const currentGoalDistance = tempGoalSteps * 0.000762;
    
    progressSteps.value = withTiming(Math.min(currentSteps / tempGoalSteps, 1), { duration: 1000 });
    progressCalories.value = withTiming(Math.min(calculatedCals / tempGoalCalories, 1), { duration: 1000 });
    progressDistance.value = withTiming(Math.min(calculatedDist / currentGoalDistance, 1), { duration: 1000 });
  };

  useEffect(() => {
    const initAndFetch = async () => {
      // 1. Init Goals
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
      setTempGoalSteps(gSteps);
      setTempGoalCalories(gCals);

      // 2. Fetch DB History as Fallback
      let moodHistory: any[] = [];
      try {
        const dbRes = await api.get('/mood');
        moodHistory = dbRes.data || [];
      } catch (e) {
        console.log('Failed to fetch mood history fallback', e);
      }

      // 3. Fetch Pedometer Data
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);
        
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        
        let todaySteps = 0;
        
        // Fetch Today's Real Steps
        if (available) {
          try {
            const todayRes = await Pedometer.getStepCountAsync(start, end);
            if (todayRes) todaySteps = todayRes.steps;
          } catch (e) {}
        }
        
        // Fallback for today's steps
        if (todaySteps === 0 && moodHistory && moodHistory.length > 0) {
          const logForToday = moodHistory.find(m => {
            const md = new Date(m.createdAt);
            return md >= start && md <= end;
          });
          if (logForToday && logForToday.steps) todaySteps = logForToday.steps;
        }

        setSteps(todaySteps);
        
        const calculatedCals = Math.round(todaySteps * 0.04);
        const calculatedDist = todaySteps * 0.000762;
        const gDist = gSteps * 0.000762;

        // Animate the 3 rings
        progressSteps.value = withDelay(300, withTiming(Math.min(todaySteps / gSteps, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));
        progressCalories.value = withDelay(400, withTiming(Math.min(calculatedCals / gCals, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));
        progressDistance.value = withDelay(500, withTiming(Math.min(calculatedDist / gDist, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));

        // Fetch Last 7 Days of Real Steps for Chart
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const dStart = new Date();
          dStart.setDate(dStart.getDate() - i);
          dStart.setHours(0, 0, 0, 0);
          
          const dEnd = new Date(dStart);
          dEnd.setHours(23, 59, 59, 999);
          if (i === 0) dEnd.setTime(end.getTime());

          let dailySteps = 0;
          if (available) {
            try {
              const res = await Pedometer.getStepCountAsync(dStart, dEnd);
              if (res && res.steps > 0) dailySteps = res.steps;
            } catch (e) {}
          }

          // Fallback to moodHistory if dailySteps is 0
          if (dailySteps === 0 && moodHistory && moodHistory.length > 0) {
            const logForDay = moodHistory.find(m => {
              const md = new Date(m.createdAt);
              return md >= dStart && md <= dEnd;
            });
            if (logForDay && logForDay.steps) {
              dailySteps = logForDay.steps;
            }
          }

          weekData.push({
            value: dailySteps,
            label: dStart.toLocaleDateString('en-US', { weekday: 'narrow' }),
            frontColor: dailySteps >= gSteps ? COLOR_STEPS : COLOR_STEPS + '50',
            topLabelComponent: () => (
              <Text style={{ color: theme.colors.text.tertiary, fontSize: 10, marginBottom: 4, fontWeight: '600' }}>
                {dailySteps > 0 ? (dailySteps > 999 ? (dailySteps/1000).toFixed(1)+'k' : dailySteps) : ''}
              </Text>
            )
          });
        }
        setWeeklySteps(weekData);

      } catch (e) {
        setIsAvailable(false);
        console.log('Pedometer error:', e);
      }
    };
    
    initAndFetch();
  }, []);

  const animatedPropsSteps = useAnimatedProps(() => ({ strokeDashoffset: CIRCUMFERENCE_STEPS - (CIRCUMFERENCE_STEPS * progressSteps.value) }));
  const animatedPropsCalories = useAnimatedProps(() => ({ strokeDashoffset: CIRCUMFERENCE_CALORIES - (CIRCUMFERENCE_CALORIES * progressCalories.value) }));
  const animatedPropsDistance = useAnimatedProps(() => ({ strokeDashoffset: CIRCUMFERENCE_DISTANCE - (CIRCUMFERENCE_DISTANCE * progressDistance.value) }));

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <LinearGradient 
        colors={theme.isDark 
          ? [theme.colors.background, theme.colors.backgroundSecondary] 
          : [theme.colors.background, theme.colors.backgroundSecondary]
        } 
        style={StyleSheet.absoluteFillObject} 
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.85}>
          <X color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.closeBtn} activeOpacity={0.85}>
          <Settings color={theme.colors.text.primary} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.ringContainer}>
          <Svg width={CENTER * 2} height={CENTER * 2} style={styles.svg}>
            {/* Background Rings */}
            <Circle cx={CENTER} cy={CENTER} r={RADIUS_STEPS} stroke={COLOR_STEPS + '20'} strokeWidth={STROKE_WIDTH} fill="none" />
            <Circle cx={CENTER} cy={CENTER} r={RADIUS_CALORIES} stroke={COLOR_CALORIES + '20'} strokeWidth={STROKE_WIDTH} fill="none" />
            <Circle cx={CENTER} cy={CENTER} r={RADIUS_DISTANCE} stroke={COLOR_DISTANCE + '20'} strokeWidth={STROKE_WIDTH} fill="none" />

            {/* Foreground Animated Rings */}
            <AnimatedCircle
              cx={CENTER} cy={CENTER} r={RADIUS_STEPS}
              stroke={COLOR_STEPS} strokeWidth={STROKE_WIDTH} fill="none"
              strokeDasharray={CIRCUMFERENCE_STEPS} animatedProps={animatedPropsSteps}
              strokeLinecap="round" transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
            <AnimatedCircle
              cx={CENTER} cy={CENTER} r={RADIUS_CALORIES}
              stroke={COLOR_CALORIES} strokeWidth={STROKE_WIDTH} fill="none"
              strokeDasharray={CIRCUMFERENCE_CALORIES} animatedProps={animatedPropsCalories}
              strokeLinecap="round" transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
            <AnimatedCircle
              cx={CENTER} cy={CENTER} r={RADIUS_DISTANCE}
              stroke={COLOR_DISTANCE} strokeWidth={STROKE_WIDTH} fill="none"
              strokeDasharray={CIRCUMFERENCE_DISTANCE} animatedProps={animatedPropsDistance}
              strokeLinecap="round" transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          </Svg>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.statsContainer}>
          {/* Steps */}
          <View style={[styles.statBox, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Footprints color={COLOR_STEPS} size={18} style={{ marginRight: 6 }} />
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Steps</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{steps.toLocaleString()}</Text>
            <Text style={[styles.statSub, { color: theme.colors.text.tertiary }]}>Goal: {goalSteps}</Text>
          </View>
          
          {/* Calories */}
          <View style={[styles.statBox, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Flame color={COLOR_CALORIES} size={18} style={{ marginRight: 6 }} />
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Calories</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{calories}</Text>
            <Text style={[styles.statSub, { color: theme.colors.text.tertiary }]}>Goal: {goalCalories} kcal</Text>
          </View>

          {/* Distance */}
          <View style={[styles.statBox, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Navigation color={COLOR_DISTANCE} size={18} style={{ marginRight: 6 }} />
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Distance</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{distanceKm} <Text style={{fontSize: 16}}>km</Text></Text>
            <Text style={[styles.statSub, { color: theme.colors.text.tertiary }]}>Goal: {goalDistance} km</Text>
          </View>
        </Animated.View>

        {/* Weekly Chart */}
        {weeklySteps.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400).duration(800)} style={[styles.chartCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)' }]}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>Weekly Steps</Text>
                <Text style={[styles.chartSubtitle, { color: theme.colors.text.tertiary }]}>Your past 7 days</Text>
              </View>
              <ActivityIcon color={COLOR_STEPS} size={20} />
            </View>
            
            <View style={{ marginTop: 24, marginLeft: -10 }}>
              <BarChart
                data={weeklySteps}
                width={width - 80}
                height={160}
                barWidth={24}
                spacing={16}
                roundedTop
                roundedBottom={false}
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10 }}
                noOfSections={3}
                maxValue={Math.max(...weeklySteps.map(d => d.value), 2000)}
                formatYLabel={(label: string) => {
                  const val = parseInt(label);
                  if (val >= 1000) return (val/1000).toFixed(0) + 'k';
                  return label;
                }}
                isAnimated
                animationDuration={1000}
                xAxisLabelTextStyle={{ color: theme.colors.text.secondary, fontSize: 12, fontWeight: '600', marginTop: 4 }}
              />
            </View>
          </Animated.View>
        )}

        {!isAvailable && (
          <Animated.View entering={FadeInUp.delay(500).duration(800)}>
            <View style={[styles.errorCard, { backgroundColor: theme.colors.semantic.danger + '15' }]}>
              <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
                Pedometer data is unavailable. Please ensure physical activity permissions are granted on your device.
              </Text>
            </View>
          </Animated.View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Activity Goals</Text>
              <TouchableOpacity onPress={() => {
                setShowSettings(false);
                setTempGoalSteps(goalSteps);
                setTempGoalCalories(goalCalories);
              }} style={styles.modalClose}>
                <X color={theme.colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: theme.colors.text.secondary }]}>Daily Step Goal</Text>
              <TextInput 
                style={[styles.modalInput, { color: theme.colors.text.primary, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                keyboardType="numeric"
                value={tempGoalSteps.toString()}
                onChangeText={(val) => setTempGoalSteps(parseInt(val) || 0)}
              />
              
              <Text style={[styles.modalLabel, { color: theme.colors.text.secondary, marginTop: 16 }]}>Daily Calorie Goal (kcal)</Text>
              <TextInput 
                style={[styles.modalInput, { color: theme.colors.text.primary, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                keyboardType="numeric"
                value={tempGoalCalories.toString()}
                onChangeText={(val) => setTempGoalCalories(parseInt(val) || 0)}
              />
              
              <TouchableOpacity onPress={saveGoals} style={[styles.saveBtn, { backgroundColor: theme.colors.plum }]}>
                <Check color="#FFF" size={20} />
                <Text style={styles.saveBtnText}>Save Goals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    letterSpacing: 0.5,
  },
  content: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  },
  statValue: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.ui,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statSub: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.ui,
    marginTop: 4,
  },
  chartCard: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
  },
  chartSubtitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    marginTop: 4,
  },
  errorCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    paddingBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.ui,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 32,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: theme.typography.fonts.ui,
    fontWeight: '700',
    marginLeft: 8,
  }
});
