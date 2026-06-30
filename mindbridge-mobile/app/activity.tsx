// @ts-ignore: Bypassing IDE cache bug
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Modal, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, ChevronRight, Footprints, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInUp, useSharedValue, useAnimatedProps, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Fitness Rings Configuration
const CENTER = 70;
const STROKE_WIDTH = 20;
const RADIUS_MOVE = 50;
const CIRCUMFERENCE_MOVE = 2 * Math.PI * RADIUS_MOVE;

// Apple Fitness Style Colors
const COLOR_STEPS = '#9A83FF'; // Purple
const COLOR_CALORIES = '#FA114F'; // Red/Pink Move
const COLOR_DISTANCE = '#1DB0F6'; // Blue
const COLOR_SESSION = '#A4FF28'; // Green

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ActivityScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [steps, setSteps] = useState(0);
  const [liveSteps, setLiveSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hourlySteps, setHourlySteps] = useState<any[]>([]);
  const [hourlyDistance, setHourlyDistance] = useState<any[]>([]);
  const [bestSession, setBestSession] = useState<{steps: number, distance: number, dateStr: string} | null>(null);
  
  // Goals
  const [goalSteps, setGoalSteps] = useState(10000);
  const [goalCalories, setGoalCalories] = useState(400);
  
  const progressCalories = useSharedValue(0);

  // Derived metrics (combine historical + live steps)
  const totalSteps = steps + liveSteps;
  const calories = Math.round(totalSteps * 0.04);
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
      
      setSteps(todaySteps);
      
      const calculatedCals = Math.round(todaySteps * 0.04);
      progressCalories.value = withDelay(300, withTiming(Math.min(calculatedCals / gCals, 1), { duration: 1500, easing: Easing.out(Easing.cubic) }));

      // Fetch 24 hours
      const hSteps = [];
      const hDist = [];
      let maxHrSteps = 0;
      const now = new Date();

      for (let i = 0; i < 24; i++) {
        const dStart = new Date();
        dStart.setHours(i, 0, 0, 0);
        const dEnd = new Date();
        dEnd.setHours(i, 59, 59, 999);
        
        let hrSteps = 0;
        if (canUseSensors && dStart <= now) {
          try {
            const res = await Pedometer.getStepCountAsync(dStart, dEnd);
            if (res && res.steps > 0) hrSteps = res.steps;
          } catch (e) {}
        }
        
        if (hrSteps > maxHrSteps) {
            maxHrSteps = hrSteps;
        }

        const label = i === 0 ? '12 AM' : i === 6 ? '6 AM' : i === 12 ? '12 PM' : i === 18 ? '6 PM' : '';
        hSteps.push({
          value: hrSteps,
          label: label,
          frontColor: COLOR_STEPS,
          topLabelComponent: undefined
        });
        hDist.push({
          value: parseFloat((hrSteps * 0.000762).toFixed(2)),
          label: label,
          frontColor: COLOR_DISTANCE,
          topLabelComponent: undefined
        });
      }
      
      setHourlySteps(hSteps);
      setHourlyDistance(hDist);
      
      if (maxHrSteps > 500) { // arbitrary threshold for a "session"
          setBestSession({
              steps: maxHrSteps,
              distance: parseFloat((maxHrSteps * 0.000762).toFixed(2)),
              dateStr: now.toLocaleDateString('en-GB') // 30/06/2026 format
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

  const animatedPropsCalories = useAnimatedProps(() => ({ strokeDashoffset: CIRCUMFERENCE_MOVE - (CIRCUMFERENCE_MOVE * progressCalories.value) }));

  const styles = createStyles(theme);
  
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  const isGoalMet = totalSteps >= goalSteps;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Summary</Text>
          <Text style={styles.headerDate}>{formattedDate}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.back()}>
          <View style={styles.profileImgPlaceholder}>
            <User color="#FFF" size={20} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Activity Ring */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.cardLarge}>
          <Text style={styles.cardHeader}>Activity Ring</Text>
          <View style={styles.ringRow}>
            <Svg width={CENTER * 2} height={CENTER * 2}>
              <Circle cx={CENTER} cy={CENTER} r={RADIUS_MOVE} stroke={COLOR_CALORIES + '30'} strokeWidth={STROKE_WIDTH} fill="none" />
              <AnimatedCircle
                cx={CENTER} cy={CENTER} r={RADIUS_MOVE}
                stroke={COLOR_CALORIES} strokeWidth={STROKE_WIDTH} fill="none"
                strokeDasharray={CIRCUMFERENCE_MOVE} animatedProps={animatedPropsCalories}
                strokeLinecap="round" transform={`rotate(-90 ${CENTER} ${CENTER})`}
              />
              {/* Arrow inside ring */}
              <View style={styles.ringArrowWrap}>
                 <ArrowRight color="#000" size={16} style={{ transform: [{rotate: '-45deg'}] }}/>
              </View>
            </Svg>
            
            <View style={styles.ringStats}>
              <Text style={styles.ringLabel}>Move</Text>
              <Text style={styles.ringValuePrimary}>{calories}<Text style={styles.ringValueSecondary}>/{goalCalories} KCAL</Text></Text>
            </View>
          </View>
        </Animated.View>

        {/* 2-Column Grid */}
        <View style={styles.gridRow}>
          {/* Step Count */}
          <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.cardSmall}>
            <View style={styles.cardSmallHeader}>
               <Text style={styles.cardSmallTitle}>Step Count</Text>
               <ChevronRight color="#444" size={16} />
            </View>
            <Text style={styles.cardSmallSub}>Today</Text>
            <Text style={[styles.cardSmallValue, { color: COLOR_STEPS }]}>{totalSteps.toLocaleString()}</Text>
            <View style={styles.chartWrapper}>
              {hourlySteps.length > 0 && (
                <BarChart
                    data={hourlySteps}
                    width={(width / 2) - 60}
                    height={80}
                    barWidth={2}
                    spacing={4}
                    initialSpacing={0}
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    hideYAxisText
                    xAxisLabelTextStyle={{ color: '#666', fontSize: 8, marginTop: 4, width: 30, marginLeft: -10 }}
                    noOfSections={1}
                    maxValue={Math.max(...hourlySteps.map(d => d.value), 500) * 1.1}
                    disableScroll
                    barBorderRadius={2}
                  />
              )}
            </View>
          </Animated.View>
          
          {/* Step Distance */}
          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.cardSmall}>
             <View style={styles.cardSmallHeader}>
               <Text style={styles.cardSmallTitle}>Step Distance</Text>
               <ChevronRight color="#444" size={16} />
            </View>
            <Text style={styles.cardSmallSub}>Today</Text>
            <Text style={[styles.cardSmallValue, { color: COLOR_DISTANCE }]}>{distanceKm}<Text style={styles.cardSmallUnit}>KM</Text></Text>
            <View style={styles.chartWrapper}>
               {hourlyDistance.length > 0 && (
                 <BarChart
                    data={hourlyDistance}
                    width={(width / 2) - 60}
                    height={80}
                    barWidth={2}
                    spacing={4}
                    initialSpacing={0}
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    hideYAxisText
                    xAxisLabelTextStyle={{ color: '#666', fontSize: 8, marginTop: 4, width: 30, marginLeft: -10 }}
                    noOfSections={1}
                    maxValue={Math.max(...hourlyDistance.map(d => d.value), 1) * 1.1}
                    disableScroll
                    barBorderRadius={2}
                  />
               )}
            </View>
          </Animated.View>
        </View>

        {/* 2-Column Grid Row 2 */}
        <View style={styles.gridRow}>
          {/* Sessions */}
          <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.cardSmall}>
            <View style={styles.cardSmallHeader}>
               <Text style={styles.cardSmallTitle}>Sessions</Text>
               <ChevronRight color="#444" size={16} />
            </View>
            {bestSession ? (
              <View style={styles.sessionInner}>
                <View style={styles.sessionIconWrap}>
                   <Footprints color={COLOR_SESSION} size={14} />
                </View>
                <Text style={styles.cardSmallTitle}>Outdoor Walk</Text>
                <Text style={[styles.cardSmallValue, { color: COLOR_SESSION, marginTop: 4 }]}>{bestSession.distance.toFixed(2)}<Text style={styles.cardSmallUnit}>KM</Text></Text>
                <Text style={styles.sessionDate}>{bestSession.dateStr}</Text>
              </View>
            ) : (
              <View style={[styles.sessionInner, { justifyContent: 'center' }]}>
                <Text style={[styles.cardSmallSub, { textAlign: 'center', marginTop: 20 }]}>No active walk detected today.</Text>
              </View>
            )}
          </Animated.View>
          
          {/* Awards */}
          <Animated.View entering={FadeInUp.delay(500).duration(800)} style={styles.cardSmall}>
             <View style={styles.cardSmallHeader}>
               <Text style={styles.cardSmallTitle}>Awards</Text>
               <ChevronRight color="#444" size={16} />
            </View>
            <View style={styles.awardInner}>
               <View style={[styles.awardHex, { backgroundColor: isGoalMet ? COLOR_SESSION : '#333' }]}>
                  <Text style={styles.awardText}>{isGoalMet ? '10K' : 'Go'}</Text>
               </View>
               <Text style={styles.awardTitle}>{isGoalMet ? 'Daily Goal Met' : 'Keep Going'}</Text>
               <Text style={styles.sessionDate}>{formattedDate.split(', ')[1]}</Text>
            </View>
          </Animated.View>
        </View>

        {(!permissionGranted || !isAvailable) && (
          <Animated.View entering={FadeInUp.delay(600).duration(800)}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                Pedometer data is unavailable. Please ensure physical activity permissions are granted on your device.
              </Text>
            </View>
          </Animated.View>
        )}
        
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Consent Modal */}
      <Modal visible={showConsentModal} animationType="fade" transparent>
        <View style={styles.consentOverlay}>
          <View style={styles.consentCard}>
            <View style={styles.consentIconWrapper}>
              <Footprints color={COLOR_STEPS} size={32} />
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
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 4,
  },
  profileBtn: {
    marginTop: 4,
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
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringArrowWrap: {
    position: 'absolute',
    top: CENTER - 12,
    left: CENTER - 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_CALORIES,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringStats: {
    marginLeft: 20,
  },
  ringLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ringValuePrimary: {
    color: COLOR_CALORIES,
    fontSize: 24,
    fontWeight: '800',
  },
  ringValueSecondary: {
    color: COLOR_CALORIES,
    fontSize: 14,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardSmall: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    width: (width / 2) - 22,
  },
  cardSmallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSmallTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardSmallSub: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  cardSmallValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  cardSmallUnit: {
    fontSize: 14,
  },
  chartWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  sessionInner: {
    marginTop: 12,
  },
  sessionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_SESSION + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 12,
  },
  awardInner: {
    alignItems: 'center',
    marginTop: 16,
  },
  awardHex: {
    width: 60,
    height: 60,
    transform: [{rotate: '30deg'}],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  awardText: {
    transform: [{rotate: '-30deg'}],
    color: '#000',
    fontWeight: '900',
    fontSize: 18,
  },
  awardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FA114F20',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  errorText: {
    color: COLOR_CALORIES,
    textAlign: 'center',
    fontSize: 13,
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
    backgroundColor: COLOR_STEPS + '20',
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
    backgroundColor: COLOR_STEPS,
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
