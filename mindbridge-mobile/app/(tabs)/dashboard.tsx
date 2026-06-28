import React, { useContext, useState, useEffect, useCallback } from 'react';
import api from '../../src/services/api';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Pressable,
  Platform,
  ActivityIndicator,
  Linking
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakManager } from '../../src/utils/StreakManager';
import { AuthContext } from '../../src/context/AuthContext';
import { LanguageContext } from '../../src/context/LanguageContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pedometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn
} from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Clock,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Library,
  ShieldAlert,
  Users,
  Bot,
  Leaf,
  Wind,
  ChevronRight,
  Flower2,
  Sun,
  AlertTriangle,
  CircleDashed,
  TrendingUp,
  Activity,
  Heart,
  ExternalLink,
  MessageCircle,
  BarChart2,
  BrainCircuit,
  Info,
  PenLine,
  ChevronDown,
  Flame,
  Feather,
  Footprints,
  Calendar,
} from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { ReadMoreText } from '../../src/components/ReadMoreText';
import { InterventionModal } from '../../src/components/InterventionModal';
import { CelebrationModal } from '../../src/components/CelebrationModal';

const { width } = Dimensions.get('window');
const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };

// ─── Sub-Components ─────────────────────────────────────────────────────────

// ─── Calendar Strip ──────────────────────────────────────────────────────────
const CalendarStrip = ({ theme, styles }: any) => {
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const todayDayIndex = today.getDay();

  // Build 7 days: 3 before today, today, 3 after
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
  // reset today reference after mutation above
  const nowAgain = new Date();

  return (
    <Animated.View entering={FadeInUp.delay(50).duration(600)} style={styles.calendarCard}>
      {/* Date Header */}
      <View style={styles.calendarHeader}>
        <View style={styles.calendarDateBlock}>
          <Text style={styles.calendarDayName}>
            {dayNames[nowAgain.getDay()].toUpperCase()}
          </Text>
          <Text style={styles.calendarDayNumber}>
            {nowAgain.getDate()}
          </Text>
        </View>
        <View style={styles.calendarMonthBlock}>
          <Text style={styles.calendarMonthText}>
            {monthNames[nowAgain.getMonth()]}
          </Text>
          <Text style={styles.calendarYearText}>
            {nowAgain.getFullYear()}
          </Text>
        </View>
        <View style={styles.calendarIconWrap}>
          <Calendar color={theme.colors.plum} size={20} strokeWidth={2} />
        </View>
      </View>

      {/* Week Strip */}
      <View style={styles.calendarWeekStrip}>
        {days.map((day, i) => (
          <View key={i} style={styles.calendarDayCol}>
            <Text style={[
              styles.calendarWeekDayName,
              { color: day.isToday ? theme.colors.plum : theme.colors.text.tertiary }
            ]}>{day.dayName}</Text>
            <View style={[
              styles.calendarDayCircle,
              day.isToday && { backgroundColor: theme.colors.plum },
              !day.isToday && day.isPast && { opacity: 0.4 },
            ]}>
              <Text style={[
                styles.calendarDayNum,
                { color: day.isToday ? '#FFF' : theme.colors.text.primary }
              ]}>{day.date}</Text>
            </View>
            {day.isToday && <View style={[styles.calendarTodayDot, { backgroundColor: theme.colors.plum }]} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const ProgressRings = ({ completed, total, theme, styles, t }: any) => {
  const size = 52;
  const strokeWidth = 5;
  const progress = completed / total;

  return (
    <View style={[styles.ringsContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)' }]}>
      <View style={styles.ringWrap}>
        <View style={[styles.ringBg, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: theme.colors.plum + '15' }]} />
        <View style={[styles.ringFill, { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          borderTopColor: theme.colors.plum, 
          borderRightColor: progress >= 0.33 ? theme.colors.plum : 'transparent', 
          borderBottomColor: progress >= 0.66 ? theme.colors.plum : 'transparent', 
          borderLeftColor: progress >= 1.0 ? theme.colors.plum : 'transparent', 
          borderTopWidth: strokeWidth, 
          borderRightWidth: strokeWidth, 
          borderBottomWidth: strokeWidth, 
          borderLeftWidth: strokeWidth, 
          transform: [{ rotate: '-45deg' }] 
        }]} />
      </View>
      <View style={{ marginRight: 4 }}>
        <Text style={[styles.ringsCount, { color: theme.colors.text.primary }]}>{completed}/{total}</Text>
        <Text style={[styles.ringsLabel, { color: theme.colors.text.secondary }]}>Goals</Text>
      </View>
    </View>
  );
};

// ─── Weekly Pulse Widget ─────────────────────────────────────────────────────

const WeeklyPulse = ({ theme, styles, data, t }: any) => {
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

// QUOTES are now fetched from theme translations

const QuoteSlideshow = ({ theme, styles, t }: any) => {
  const [index, setIndex] = useState(0);
  const quotes = t('dashboard.motivations') as any[];
  
  useEffect(() => {
    const timer = setInterval(() => { 
      setIndex((prev) => (prev + 1) % (Array.isArray(quotes) ? quotes.length : 1)); 
    }, 7000);
    return () => clearInterval(timer);
  }, [quotes]);

  const quote = Array.isArray(quotes) ? quotes[index] : { text: "...", author: "..." };

  return (
    <Animated.View entering={FadeInUp.delay(50).duration(500)} style={styles.quoteCardContainer}>
      <LinearGradient colors={[theme.colors.plum, theme.isDark ? '#2E3A4A' : '#4A3E4F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quoteCard}>
        <View style={styles.quoteMarkContainer}><Text style={styles.largeQuoteMark}>“</Text></View>
        <Animated.View key={index} entering={FadeIn.duration(1000)}>
          <Text style={styles.quoteText}>{quote.text}</Text>
          <Text style={styles.quoteAuthor}>{quote.author}</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const AppleWidget = ({ title, subtitle, icon: Icon, color, onPress, theme, styles, size = 'square', delay = 0, value, label }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => { scale.value = withSpring(0.96, springConfig); };
  const handlePressOut = () => { scale.value = withSpring(1, springConfig); };

  if (size === 'list') {
    return (
      <Animated.View entering={FadeInUp.delay(delay)}>
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View style={[styles.listWidget, animatedStyle]}>
            <View style={[styles.listIconWrap, { backgroundColor: color + (theme.isDark ? '30' : '15') }]}>
              <Icon color={color} size={22} />
            </View>
            <View style={styles.listTextWrap}>
              <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{title}</Text>
              {subtitle && <Text style={[styles.listSubtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>}
            </View>
            <ChevronRight color={theme.colors.text.disabled} size={20} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  const isWide = size === 'wide';
  const isFixed = size === 'fixed';

  return (
    <Animated.View entering={FadeInUp.delay(delay)} style={isWide ? { width: '100%' } : (isFixed ? { width: 142, marginRight: 12 } : { width: '47.5%' })}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} hitSlop={10}>
        <Animated.View style={[styles.widget, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }, isWide ? styles.widgetWide : (isFixed ? styles.widgetFixed : styles.widgetSquare), animatedStyle]}>
          <View style={isWide ? styles.wideContent : styles.squareContent}>
            <View style={[styles.widgetIconWrap, { backgroundColor: color }]}>
              <Icon color={'#FFF'} size={isWide ? 22 : 24} />
            </View>
            <View style={isWide ? styles.wideTextWrap : { marginTop: 12 }}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>{title}</Text>
              {value ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.text.primary }}>{value}</Text>
                  {label && <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginLeft: 4, textTransform: 'uppercase' }}>{label}</Text>}
                </View>
              ) : (
                subtitle && <Text style={[styles.widgetSubtitle, { color: theme.colors.text.secondary }]} numberOfLines={1}>{subtitle}</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const RitualItem = ({ label, done, icon: Icon, color, theme, styles, onPress }: any) => (
  <TouchableOpacity style={styles.ritualItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.ritualIconCircle, { backgroundColor: done ? color : (theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }]}>
      <Icon color={done ? '#FFF' : theme.colors.text.disabled} size={24} />
      {done && <View style={styles.checkBadge}><CheckCircle2 color="#FFF" size={12} fill={color} /></View>}
    </View>
    <Text style={[styles.ritualLabel, { color: done ? theme.colors.text.primary : theme.colors.text.tertiary }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Detailed Overview Cards ────────────────────────────────────────────────

const DetailedOverviewCard = ({ title, value, label, icon: Icon, color, progress, theme, styles, onPress, subtitle }: any) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.detailedCard, { backgroundColor: theme.colors.surface }]}>
    <View style={styles.detailedHeader}>
      <View style={[styles.detailedIconWrap, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <ChevronRight color={theme.colors.text.disabled} size={18} />
    </View>
    <View style={styles.detailedContent}>
      <Text style={[styles.detailedTitle, { color: theme.colors.text.tertiary }]}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginVertical: 4 }}>
        <Text style={[styles.detailedValue, { color: theme.colors.text.primary }]}>{value}</Text>
        <Text style={[styles.detailedLabel, { color: theme.colors.text.secondary }]}>{label}</Text>
      </View>
      {subtitle && <Text style={[styles.detailedSubtitle, { color: theme.colors.text.tertiary }]}>{subtitle}</Text>}
      {progress !== undefined && (
        <View style={styles.detailedProgressBg}>
          <View style={[styles.detailedProgressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

const QuestItem = ({ icon: Icon, title, subtitle, done, theme, isLast, onPress, styles }: any) => (
  <TouchableOpacity 
    style={[styles.questItem, isLast && { borderBottomWidth: 0 }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.questIconWrap, { backgroundColor: done ? theme.colors.accents.eucalyptus + '15' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
      <Icon size={20} color={done ? theme.colors.accents.eucalyptus : theme.colors.text.tertiary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.questTitle, done && { textDecorationLine: 'line-through', color: theme.colors.text.disabled }]}>{title}</Text>
      <Text style={styles.questSubtitle}>{subtitle}</Text>
    </View>
    <View style={[styles.questCheck, done && { backgroundColor: theme.colors.accents.eucalyptus, borderColor: theme.colors.accents.eucalyptus }]}>
      {done && <CheckCircle2 size={16} color="#FFF" />}
    </View>
  </TouchableOpacity>
);

const StreakJourney = ({ streak, theme, styles, completedCount }: any) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDayIndex = (new Date().getDay() + 6) % 7; 

  return (
    <View style={styles.premiumJourney}>
      <View style={styles.journeyPathLine} />
      <View style={styles.journeyDaysRow}>
        {days.map((day, i) => {
          const isPast = i < currentDayIndex;
          const isToday = i === currentDayIndex;
          
          // isCompleted: Was the task done on this day?
          // For today, we beam if even ONE quest is done.
          const isCompleted = isPast ? (i >= currentDayIndex - streak) : (isToday && completedCount > 0);
          
          // isMissed: Only show frozen if the user HAD a streak but missed this specific past day
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

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userData: authData } = useContext(AuthContext) as any;
  const { t } = useContext(LanguageContext);
  const styles = createStyles(theme);
  
  const [rituals, setRituals] = useState({
    garden: false,
    journal: false,
    breathing: false
  });
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [journalHistory, setJournalHistory] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [latestPost, setLatestPost] = useState<any>(null);
  const [suggestedResources, setSuggestedResources] = useState<any[]>([]);
  const [gardenStats, setGardenStats] = useState({ count: 0, stage: 'Empty Garden', icon: CircleDashed, color: '#94A3B8' });
  const [userData, setUserData] = useState({ name: authData?.name || 'Friend', language: 'English', streak: 0 });
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [recentLocation, setRecentLocation] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [microGoals, setMicroGoals] = useState<string[]>([]);
  const [actionableCopingMechanisms, setActionableCopingMechanisms] = useState<string[]>([]);
  const [insightSeverity, setInsightSeverity] = useState<string>('mild');
  
  // Gamification States
  const [dailyGoals, setDailyGoals] = useState<any[]>([]);
  const [completedGoalIds, setCompletedGoalIds] = useState<string[]>([]);
  const [gamification, setGamification] = useState({ totalPoints: 0, currentStreak: 0 });

  const completedCount = completedGoalIds.length;
  
  // Modals state
  const [showIntervention, setShowIntervention] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebData, setCelebData] = useState<{ milestone: number, type: 'STREAK' | 'JOURNAL' }>({ milestone: 0, type: 'STREAK' });

  const getGrowthStage = (count: number) => {
    if (count >= 20) return { label: 'Ancient Tree', icon: Flower2, color: '#8B5CF6' };
    if (count >= 14) return { label: 'Full Bloom', icon: Flower2, color: '#7B61FF' };
    if (count >= 8) return { label: 'Healthy Plant', icon: Leaf, color: '#34D399' };
    if (count >= 4) return { label: 'Sprouting', icon: Sun, color: '#FBBF24' };
    if (count >= 1) return { label: 'New Seed', icon: Leaf, color: '#60A5FA' };
    return { label: 'Empty Garden', icon: CircleDashed, color: '#94A3B8' };
  };

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem('dashboard_cache');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.journalHistory) setJournalHistory(data.journalHistory);
        if (data.moodHistory) setMoodHistory(data.moodHistory);
        if (data.chatHistory) setChatHistory(data.chatHistory);
        if (data.gardenStats) setGardenStats(data.gardenStats);
        if (data.assessments) setAssessments(data.assessments);
        if (data.latestPost) setLatestPost(data.latestPost);
        if (data.recentLocation) setRecentLocation(data.recentLocation);
        if (data.aiPrompt) setAiPrompt(data.aiPrompt);
        if (data.suggestedResources) setSuggestedResources(data.suggestedResources);
        if (data.actionableCopingMechanisms) setActionableCopingMechanisms(data.actionableCopingMechanisms);
        if (data.insightSeverity) setInsightSeverity(data.insightSeverity);
        if (data.microGoals) setMicroGoals(data.microGoals);
        if (data.gamification) setGamification(data.gamification);
        if (data.dailyGoals) setDailyGoals(data.dailyGoals);
        if (data.completedGoalIds) setCompletedGoalIds(data.completedGoalIds);
        if (data.rituals) setRituals(data.rituals);
        if (data.userData) setUserData(data.userData);
      }
    } catch (e) {
      console.warn('Failed to load dashboard cache:', e);
    }
  };

  useEffect(() => {
    loadCachedData();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const todayStr = new Date().toDateString();
      const res = await api.get('/ai/oracle-context');
      const moodsRes = await api.get('/mood');
      
      const logs = res.data.recentJournal || [];
      const newMoodHistory = moodsRes.data || [];
      const newChatHistory = res.data.history || [];
      const growth = getGrowthStage(logs.length);
      const newGardenStats = { count: logs.length, stage: growth.label, icon: growth.icon, color: growth.color };
      const newAssessments = res.data.assessments || [];
      const newLatestPost = res.data.latestCommunityPost || null;
      const newRecentLocation = res.data.latestMood?.location || recentLocation;
      
      let newUserData = { ...userData };
      if (res.data.onboarding?.firstName) {
        const onboardingName = res.data.onboarding.firstName;
        newUserData.name = (onboardingName === 'TESTKW' && authData?.name) ? authData.name : onboardingName;
      }
      
      // Parallel unblocking requests
      const [aiRes, gamificationRes, goalsRes] = await Promise.allSettled([
        api.get('/ai/proactive-insights'),
        api.get('/goals/gamification'),
        api.get('/goals/daily')
      ]);

      let newAiPrompt = aiPrompt;
      let newSuggested = suggestedResources;
      let newCoping = actionableCopingMechanisms;
      let newSeverity = insightSeverity;
      let newMicroGoals = microGoals;

      if (aiRes.status === 'fulfilled' && aiRes.value.data) {
        newAiPrompt = aiRes.value.data.dashboardPrompt || newAiPrompt;
        newSuggested = aiRes.value.data.suggestedResources || newSuggested;
        let uniqueCoping: string[] = [];
        if (aiRes.value.data.actionableCopingMechanisms) {
          uniqueCoping = Array.from(new Set(aiRes.value.data.actionableCopingMechanisms)) as string[];
          newCoping = uniqueCoping;
        }
        newSeverity = aiRes.value.data.severity || newSeverity;
        if (aiRes.value.data.microGoals) {
          newMicroGoals = (Array.from(new Set(aiRes.value.data.microGoals)) as string[]).filter(g => !uniqueCoping.includes(g));
        }
      }

      let newGamification = gamification;
      if (gamificationRes.status === 'fulfilled' && gamificationRes.value.data) {
        newGamification = {
          totalPoints: gamificationRes.value.data.totalPoints || 0,
          currentStreak: gamificationRes.value.data.currentStreak || 0
        };
      } else {
        // Fallback to res.data.streak if gamification fails to load
        newGamification = { ...gamification, currentStreak: res.data.streak || gamification.currentStreak };
      }
      
      let newDailyGoals = dailyGoals;
      let newCompletedIds = completedGoalIds;
      if (goalsRes.status === 'fulfilled' && goalsRes.value.data) {
        newDailyGoals = goalsRes.value.data.goals || [];
        newCompletedIds = goalsRes.value.data.completedIds || [];
      }

      const breathingDone = await AsyncStorage.getItem(`breathing_${todayStr}`) === 'true';
      const newRituals = {
        garden: res.data.latestMood && new Date(res.data.latestMood.createdAt).toDateString() === todayStr,
        journal: logs.some((log: any) => new Date(log.createdAt).toDateString() === todayStr),
        breathing: breathingDone
      };

      // Set State
      setJournalHistory(logs);
      setMoodHistory(newMoodHistory);
      setChatHistory(newChatHistory);
      setGardenStats(newGardenStats);
      setAssessments(newAssessments);
      setLatestPost(newLatestPost);
      setRecentLocation(newRecentLocation);
      setUserData(newUserData);
      setAiPrompt(newAiPrompt);
      setSuggestedResources(newSuggested);
      setActionableCopingMechanisms(newCoping);
      setInsightSeverity(newSeverity);
      setMicroGoals(newMicroGoals);
      setGamification(newGamification);
      setDailyGoals(newDailyGoals);
      setCompletedGoalIds(newCompletedIds);
      setRituals(newRituals);

      // Cache State for next launch
      AsyncStorage.setItem('dashboard_cache', JSON.stringify({
        journalHistory: logs,
        moodHistory: newMoodHistory,
        chatHistory: newChatHistory,
        gardenStats: newGardenStats,
        assessments: newAssessments,
        latestPost: newLatestPost,
        recentLocation: newRecentLocation,
        userData: newUserData,
        aiPrompt: newAiPrompt,
        suggestedResources: newSuggested,
        actionableCopingMechanisms: newCoping,
        insightSeverity: newSeverity,
        microGoals: newMicroGoals,
        gamification: newGamification,
        dailyGoals: newDailyGoals,
        completedGoalIds: newCompletedIds,
        rituals: newRituals
      }));

      // Check for interventions locally if recent mood was logged and is critically low
      if (newMoodHistory.length > 0) {
        const latestMood = newMoodHistory[0];
        const isRecent = new Date(latestMood.createdAt).toDateString() === todayStr;
        if (isRecent && latestMood.score <= 3) {
          const shownIntervention = await AsyncStorage.getItem(`intervention_${todayStr}`);
          if (!shownIntervention) {
            setShowIntervention(true);
            await AsyncStorage.setItem(`intervention_${todayStr}`, 'true');
          }
        }
      }

      // Check for milestones
      const activeStreak = newGamification.currentStreak;
      if (activeStreak === 3 || activeStreak === 7 || activeStreak === 14 || activeStreak === 30) {
        const shownMilestone = await AsyncStorage.getItem(`milestone_${activeStreak}`);
        if (!shownMilestone) {
          setCelebData({ milestone: activeStreak, type: 'STREAK' });
          setShowCelebration(true);
          await AsyncStorage.setItem(`milestone_${activeStreak}`, 'true');
        }
      }

    } catch (e) {
      console.warn('Network timeout when fetching dashboard context, using local offline fallbacks.', e);
      if (authData) {
        setUserData(prev => ({ ...prev, name: authData.name || 'Friend' }));
      }
    }
  }, [authData, userData, gamification, aiPrompt, suggestedResources, actionableCopingMechanisms, insightSeverity, microGoals, dailyGoals, completedGoalIds, recentLocation]);

  // Pedometer setup
  useEffect(() => {
    const checkSteps = async () => {
      try {
        const { status } = await Pedometer.requestPermissionsAsync();
        const isAvailable = await Pedometer.isAvailableAsync();
        if (isAvailable && status === 'granted') {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const pedoRes = await Pedometer.getStepCountAsync(start, end);
          setStepCount(pedoRes.steps);
        }
      } catch (e) {
        console.log('Pedometer access denied or failed:', e);
      }
    };
    checkSteps();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [checkStatus])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  const getContextualPrompt = (t: any, moodHistory: any[], streak: number, steps: number | null, location: string | null) => {
    let prompt = "";

    // Contextual logic
    if (location === 'COUNSELING_CENTER') {
      prompt = "You're near the Counseling Center. Walk-in hours are open until 5 PM if you need to talk.";
    } else if (location === 'LIBRARY' && new Date().getHours() > 10) {
      prompt = "Studying hard? Remember to take a 5-minute mental break.";
    } else if (location === 'DORM' && new Date().getHours() >= 10 && new Date().getHours() <= 18 && (steps === null || steps < 2000)) {
      prompt = "You've been in your room for a while. A quick walk around campus can boost your mood!";
    } else if (location === 'SOCIAL_SPACE') {
      prompt = "Enjoying the campus energy? Social connections are great for your wellness.";
    } else if (steps !== null && steps > 8000) {
      prompt = "Amazing physical activity today! Notice how your body feels right now.";
    } else if (steps !== null && steps < 500 && new Date().getHours() >= 15) {
      prompt = "You've been quite still today. A brief 10-minute walk can clear your mind.";
    } else if (streak >= 3) {
      prompt = `You're on a ${streak}-day streak! Keep the amazing momentum going.`;
    } else if (moodHistory.length > 0 && moodHistory[0].score <= 4) {
      prompt = "We noticed yesterday was a bit tough. Take it easy today, you're doing great.";
    } else if (new Date().getHours() >= 5 && new Date().getHours() < 12) {
      prompt = t('dashboard.startWithIntention') || "Start your day with intention.";
    } else if (new Date().getHours() >= 17 && new Date().getHours() < 21) {
      prompt = t('dashboard.windDownAndReflect') || "Wind down and reflect on your day.";
    } else {
      prompt = t('dashboard.howWasYourDay') || "How are you feeling right now?";
    }

    return prompt;
  };

  const contextualPrompt = getContextualPrompt(t, moodHistory, userData.streak, stepCount, recentLocation);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={theme.isDark 
          ? [theme.colors.background, theme.colors.backgroundSecondary, '#080C18'] 
          : [theme.colors.background, theme.colors.backgroundSecondary, '#E0E3EB']
        } style={StyleSheet.absoluteFillObject} />
        <View style={[styles.bgBlob, { top: -100, right: -100, backgroundColor: theme.colors.plum + '08' }]} />
        <View style={[styles.bgBlob, { bottom: 100, left: -50, backgroundColor: theme.colors.accents.powderBlue + '05' }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <ScreenHeader title={`${getGreeting()}, ${userData.name}`} subtitle={t('dashboard.nurturePeaceToday')} noPadding />
          </View>
          <ProgressRings completed={completedCount} total={5} theme={theme} styles={styles} t={t} />
        </View>

        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.section}>
          <View style={styles.premiumJourneyCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitleText, { color: theme.colors.text.primary }]}>{t('dashboard.yourJourney')}</Text>
                <Text style={styles.sectionSubtitleText}>{t('dashboard.nurturePeaceToday')}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Flame size={14} color="#FF9800" />
                <Text style={[styles.streakText, { color: "#FF9800" }]}>{gamification.currentStreak}</Text>
              </View>
            </View>
            <StreakJourney streak={gamification.currentStreak} theme={theme} styles={styles} completedCount={completedCount} />
          </View>
        </Animated.View>

        <View style={styles.section}><QuoteSlideshow theme={theme} styles={styles} t={t} /></View>

        {/* ── Daily Personalized Goals ── */}
        {(dailyGoals.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitleText, { color: theme.colors.text.primary }]}>Your Daily Goals</Text>
                <Text style={styles.sectionSubtitleText}>Curated for your current mental state</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/progress')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: theme.colors.plum, fontSize: 13, fontWeight: '700' }}>Gamification</Text>
                <Flame size={20} color="#FF9800" fill={completedCount >= 3 ? "#FF9800" : "transparent"} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.questsCard}>
              {(insightSeverity === 'severe' || insightSeverity === 'critical') && (
                <QuestItem 
                  key="crisis-alert"
                  theme={theme} 
                  icon={AlertTriangle} 
                  title="Contact Campus Counseling" 
                  subtitle="Severe distress detected" 
                  done={false} 
                  onPress={() => router.push('/(tabs)/crisis')}
                  styles={styles}
                  isLast={false}
                />
              )}
              {dailyGoals.map((goal: any, idx: number) => {
                const isDone = completedGoalIds.includes(goal.id);
                return (
                  <QuestItem 
                    key={goal.id}
                    theme={theme} 
                    icon={Activity} 
                    title={goal.name} 
                    subtitle={`${goal.duration} min • ${goal.points} pts`} 
                    done={isDone} 
                    onPress={() => {
                      if (!isDone) {
                        router.push({
                          pathname: '/goal-execution',
                          params: { goalStr: JSON.stringify(goal) }
                        });
                      }
                    }}
                    styles={styles}
                    isLast={idx === dailyGoals.length - 1}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* ── Mood Garden Snapshot ── */}
        {journalHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitleText, { color: theme.colors.text.primary }]}>{t('dashboard.latestReflection')}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/journal')}><Text style={{ color: theme.colors.plum, fontSize: 13, fontWeight: '700' }}>{t('dashboard.viewAll')}</Text></TouchableOpacity>
            </View>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => router.push('/(tabs)/journal')}
              style={[styles.reflectionCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.reflectionHeader}>
                <View style={[styles.reflectionMood, { backgroundColor: theme.colors.plum + '10' }]}>
                  <BrainCircuit size={22} color={theme.colors.plum} strokeWidth={1.5} />
                </View>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={styles.reflectionTag}>
                      <BookOpen size={10} color={theme.colors.plum} />
                      <Text style={styles.reflectionTagText}>{t('dashboard.clarityTitle').toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: theme.colors.text.tertiary, fontWeight: '700' }}>• {new Date(journalHistory[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  </View>
                  <Text style={[styles.reflectionTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>{journalHistory[0].title || 'Untitled Reflection'}</Text>
                </View>
                <View style={[styles.reflectionArrow, { backgroundColor: theme.colors.plum + '08' }]}>
                  <ChevronRight color={theme.colors.plum} size={18} />
                </View>
              </View>
              <View style={[styles.reflectionContentBox, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(123,97,255,0.03)', borderColor: theme.colors.plum + '20' }]}>
                <ReadMoreText 
                  style={[styles.reflectionContent, { color: theme.colors.text.secondary }]} 
                  text={journalHistory[0].content} 
                  numberOfLines={2}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Tools & Resources ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: theme.colors.text.primary }]}>Tools & Resources</Text>
          </View>
          <View style={styles.bentoContainer}>
            {/* Top Row: Mood Garden (Large Feature) */}
            <TouchableOpacity activeOpacity={0.9} style={[styles.bentoLarge, { backgroundColor: theme.colors.accents.eucalyptus + '15', borderColor: theme.colors.accents.eucalyptus + '30' }]} onPress={() => router.push('/(tabs)/garden')}>
              <View style={[styles.bentoIconWrap, { backgroundColor: theme.colors.accents.eucalyptus }]}>
                <Leaf color="#FFF" size={24} />
              </View>
              <View style={styles.bentoTextWrap}>
                <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>{t('dashboard.moodGarden')}</Text>
                <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>{gardenStats.stage} • {gardenStats.count} {t('dashboard.seeds')}</Text>
              </View>
            </TouchableOpacity>

            {/* Middle Row: Journal & Reframer */}
            <View style={styles.bentoRow}>
              <TouchableOpacity activeOpacity={0.9} style={[styles.bentoSmall, { backgroundColor: theme.colors.accents.powderBlue + '15', borderColor: theme.colors.accents.powderBlue + '30' }]} onPress={() => router.push('/(tabs)/journal')}>
                <View style={[styles.bentoIconWrap, { backgroundColor: theme.colors.accents.powderBlue }]}>
                  <BookOpen color="#FFF" size={20} />
                </View>
                <View style={styles.bentoTextWrap}>
                  <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>{t('dashboard.journal')}</Text>
                  <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>{t('dashboard.reflections')}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} style={[styles.bentoSmall, { backgroundColor: theme.colors.plum + '15', borderColor: theme.colors.plum + '30' }]} onPress={() => router.push('/cbt-reframe')}>
                <View style={[styles.bentoIconWrap, { backgroundColor: theme.colors.plum }]}>
                  <BrainCircuit color="#FFF" size={20} />
                </View>
                <View style={styles.bentoTextWrap}>
                  <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>Reframer</Text>
                  <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>Challenge thoughts</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Third Row: Activity/Assessments & Community */}
            <View style={styles.bentoRow}>
              {stepCount !== null ? (
                <TouchableOpacity activeOpacity={0.9} style={[styles.bentoSmall, { backgroundColor: theme.colors.accents.slate + '15', borderColor: theme.colors.accents.slate + '30' }]} onPress={() => router.push('/activity')}>
                  <View style={[styles.bentoIconWrap, { backgroundColor: theme.colors.accents.slate }]}>
                    <Footprints color="#FFF" size={20} />
                  </View>
                  <View style={styles.bentoTextWrap}>
                    <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>{t('dashboard.activity')}</Text>
                    <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>{stepCount} {t('dashboard.steps')}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity activeOpacity={0.9} style={[styles.bentoSmall, { backgroundColor: theme.colors.accents.slate + '15', borderColor: theme.colors.accents.slate + '30' }]} onPress={() => router.push('/(tabs)/assessments')}>
                  <View style={[styles.bentoIconWrap, { backgroundColor: theme.colors.accents.slate }]}>
                    <ClipboardList color="#FFF" size={20} />
                  </View>
                  <View style={styles.bentoTextWrap}>
                    <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>{t('dashboard.assessments')}</Text>
                    <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>{assessments.length} {t('dashboard.done')}</Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity activeOpacity={0.9} style={[styles.bentoSmall, { backgroundColor: theme.colors.accents.dustyRose + '15', borderColor: theme.colors.accents.dustyRose + '30' }]} onPress={() => router.push('/(tabs)/community')}>
                <View style={[styles.bentoIconWrap, { backgroundColor: theme.colors.accents.dustyRose }]}>
                  <Users color="#FFF" size={20} />
                </View>
                <View style={styles.bentoTextWrap}>
                  <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>{t('dashboard.community')}</Text>
                  <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>{t('dashboard.connect')}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Bottom Row: Crisis Support Banner */}
            <TouchableOpacity activeOpacity={0.9} style={[styles.bentoBanner, { backgroundColor: theme.colors.semantic.danger + '15', borderColor: theme.colors.semantic.danger + '30' }]} onPress={() => router.push('/(tabs)/crisis')}>
              <View style={[styles.bentoBannerIcon, { backgroundColor: theme.colors.semantic.danger }]}>
                <ShieldAlert color="#FFF" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bentoTitle, { color: theme.colors.text.primary }]}>{t('dashboard.crisisSupport')}</Text>
                <Text style={[styles.bentoSub, { color: theme.colors.text.secondary }]}>{t('dashboard.247Help')}</Text>
              </View>
              <ChevronRight color={theme.colors.semantic.danger} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Suggested Resources ── */}
        {suggestedResources && suggestedResources.length > 0 && (
          <View style={styles.sectionCompact}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 24 }]}>
              <View>
                <Text style={[styles.sectionTitleText, { color: theme.colors.text.primary }]}>{t('dashboard.recommendedForYou')}</Text>
                <Text style={styles.sectionSubtitleText}>{t('dashboard.basedOnReflections')}</Text>
              </View>
              <Library size={20} color={theme.colors.plum} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll} decelerationRate="fast">
              {suggestedResources.map((res: any, idx: number) => (
                <TouchableOpacity 
                  key={idx}
                  style={[styles.resourceCardWide, { backgroundColor: theme.colors.surface, marginRight: 16 }]}
                  onPress={async () => {
                    if (res.url) {
                      if (res.url.startsWith('tel:')) {
                        Linking.openURL(res.url);
                      } else {
                        await WebBrowser.openBrowserAsync(res.url, {
                          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                          toolbarColor: theme.colors.background,
                        });
                      }
                    } else {
                      router.push('/(tabs)/knowledge-hub');
                    }
                  }}
                >
                  <View style={styles.resourceInfo}>
                    <View style={styles.resourceTag}><Text style={styles.resourceTagText}>{res.category}</Text></View>
                    <Text style={[styles.resourceTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>{res.title}</Text>
                    <View style={styles.resourceMeta}>
                      <Text style={[styles.resourceMetaText, { color: theme.colors.text.tertiary }]}>{res.type.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.resourceAction}>
                    <ChevronRight color={theme.colors.plum} size={20} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Clinical Disclaimer ── */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={[styles.disclaimerCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(123,97,255,0.03)', borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(123,97,255,0.1)' }]}>
            <View style={styles.disclaimerHeader}>
              <Info size={16} color={theme.colors.text.tertiary} />
              <Text style={[styles.disclaimerTitle, { color: theme.colors.text.tertiary }]}>Clinical Disclaimer</Text>
            </View>
            <Text style={[styles.disclaimerText, { color: theme.colors.text.tertiary }]}>
              MindBridge is an AI-powered guidance and context-aware system designed specifically for students. 
              <Text style={{ fontWeight: '700' }}> It is not a replacement for professional therapy or clinical mental health services.</Text> If you are in immediate distress, please visit the Crisis Support section.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Interventions & Celebrations */}
      <InterventionModal 
        visible={showIntervention} 
        onClose={() => setShowIntervention(false)} 
        onConnectPeer={() => { setShowIntervention(false); router.push('/(tabs)/community'); }}
        onViewResources={() => { setShowIntervention(false); router.push('/(tabs)/explore'); }}
      />

      <CelebrationModal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
        milestone={celebData.milestone}
        type={celebData.type}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  bgBlob: { position: 'absolute', width: 400, height: 400, borderRadius: 200 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  section: { marginBottom: 32, paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleText: { fontSize: 20, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  sectionSubtitleText: { fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, marginTop: 2 },
  sectionCompact: { marginBottom: 32 },
  horizontalScroll: { paddingLeft: 24, paddingRight: 8 },
  ringsContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(123,97,255,0.1)' },
  ringWrap: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  ringBg: { position: 'absolute' },
  ringFill: { position: 'absolute' },
  ringsCount: { fontSize: 15, fontFamily: theme.typography.fonts.header, fontWeight: '800', lineHeight: 18 },
  ringsLabel: { fontSize: 10, fontFamily: theme.typography.fonts.accent, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  pulseCard: { marginBottom: 8 },
  pulseGlass: { borderRadius: 32, overflow: 'hidden', padding: 24, borderWidth: 1 },
  pulseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pulseTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  pulseSubtitle: { fontSize: 13, fontFamily: theme.typography.fonts.body, marginTop: 2 },
  pulseGraph: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80, paddingHorizontal: 4 },
  pulseCol: { alignItems: 'center', gap: 8 },
  pulseBarBg: { width: 14, height: 60, borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end' },
  pulseBarFill: { width: '100%', borderRadius: 7 },
  pulseDayLabel: { fontSize: 11, fontFamily: theme.typography.fonts.accent, fontWeight: '800', opacity: 0.9 },
  quoteCardContainer: { shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: theme.isDark ? 0 : 0.1, shadowRadius: 20, elevation: theme.isDark ? 0 : 10 },
  quoteCard: { borderRadius: 32, padding: 32, minHeight: 180, justifyContent: 'center', overflow: 'hidden' },
  quoteMarkContainer: { position: 'absolute', top: -20, left: 20, opacity: 0.1 },
  largeQuoteMark: { fontSize: 140, color: '#FFF', fontFamily: theme.typography.fonts.header },
  quoteText: { fontSize: 17, fontFamily: theme.typography.fonts.body, color: '#FFF', lineHeight: 26, textAlign: 'center', fontStyle: 'italic', marginBottom: 16 },
  quoteAuthor: { fontSize: 10, fontFamily: theme.typography.fonts.accent, color: 'rgba(255,255,255,0.7)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 },
  ritualsContainer: { marginHorizontal: 24, borderRadius: 32, padding: 24, marginBottom: 32, borderWidth: 1 },
  ritualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  ritualTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  ritualRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ritualItem: { alignItems: 'center', width: (width - 48 - 48) / 3 },
  ritualIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  checkBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFF', borderRadius: 10, padding: 2 },
  ritualLabel: { fontSize: 11, fontFamily: theme.typography.fonts.accent, fontWeight: '800', textAlign: 'center' },
  widget: { borderRadius: 28, overflow: 'hidden', borderWidth: 1 },
  widgetSquare: { aspectRatio: 1, padding: 20 },
  widgetWide: { padding: 24, minHeight: 110 },
  widgetFixed: { width: 142, aspectRatio: 1, padding: 16 },
  squareContent: { flex: 1, justifyContent: 'space-between' },
  wideContent: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  widgetIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wideTextWrap: { flex: 1, marginLeft: 16 },
  widgetTitle: { fontSize: 15, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  widgetSubtitle: { fontSize: 12, fontFamily: theme.typography.fonts.body, marginTop: 2 },
  listContainer: { borderRadius: 28, overflow: 'hidden', borderWidth: 1 },
  listWidget: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  listIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  listSubtitle: { fontSize: 13, fontFamily: theme.typography.fonts.body },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
  reflectionCard: { 
    borderRadius: 32, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 12,
    elevation: theme.isDark ? 0 : 3,
  },
  reflectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  reflectionMood: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reflectionTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  reflectionTagText: { fontSize: 9, fontFamily: theme.typography.fonts.accent, fontWeight: '800', color: theme.colors.plum, letterSpacing: 1 },
  reflectionTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800', letterSpacing: -0.5 },
  reflectionDate: { fontSize: 11, fontFamily: theme.typography.fonts.accent, fontWeight: '800', marginTop: 2, opacity: 0.6 },
  reflectionArrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reflectionContentBox: { borderRadius: 16, padding: 16, marginTop: 4, borderLeftWidth: 4 },
  reflectionContent: { fontSize: 13, fontFamily: theme.typography.fonts.body, lineHeight: 20, opacity: 0.8 },
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  detailedCard: { flex: 1, borderRadius: 28, padding: 20, shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0 : 0.05, shadowRadius: 10, elevation: theme.isDark ? 0 : 2 },
  detailedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailedIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailedContent: {},
  detailedTitle: { fontSize: 10, fontFamily: theme.typography.fonts.header, fontWeight: '800', letterSpacing: 1 },
  detailedValue: { fontSize: 24, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  detailedLabel: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '800', marginBottom: 4 },
  detailedSubtitle: { fontSize: 11, fontFamily: theme.typography.fonts.body, fontWeight: '600', marginBottom: 12 },
  detailedProgressBg: { height: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' },
  detailedProgressFill: { height: '100%', borderRadius: 2 },
  resourceCardWide: { 
    width: width * 0.75, 
    borderRadius: 32, 
    padding: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 16,
    shadowColor: theme.isDark ? 'transparent' : '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: theme.isDark ? 0 : 0.05, 
    shadowRadius: 12, 
    elevation: theme.isDark ? 0 : 3, 
    overflow: 'hidden' 
  },
  resourceCard: { borderRadius: 32, padding: 24, flexDirection: 'row', alignItems: 'center', shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0 : 0.05, shadowRadius: 12, elevation: theme.isDark ? 0 : 3, overflow: 'hidden' },
  resourceInfo: { flex: 1 },
  resourceTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(123, 97, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  resourceTagText: { fontSize: 10, fontFamily: theme.typography.fonts.accent, fontWeight: '800', color: '#7B61FF', letterSpacing: 0.5 },
  resourceTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800', marginBottom: 8 },
  resourceSubtitle: { fontSize: 14, fontFamily: theme.typography.fonts.body, lineHeight: 20, marginBottom: 16 },
  resourceMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resourceMetaText: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '800' },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 4 },
  resourceAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(123, 97, 255, 0.08)', alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  crisisCard: { flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 32, borderWidth: 1.5 },
  crisisIconWrap: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  crisisTitle: { fontSize: 20, fontFamily: theme.typography.fonts.header, fontWeight: '800', marginBottom: 4 },
  crisisSubtitle: { fontSize: 14, fontFamily: theme.typography.fonts.body, lineHeight: 20 },
  disclaimerCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  disclaimerText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 20,
    opacity: 0.8,
  },
  questsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    marginTop: 16,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  questIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTitle: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  questSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.tertiary,
    fontWeight: '600',
  },
  questCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questProgress: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  questProgressText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
  },
  journeyContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  journeyScroll: {
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 0,
  },
  journeyStepWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  journeyDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  currentJourneyDot: {
    transform: [{ scale: 1.2 }],
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0 : 0.2,
    shadowRadius: 8,
    elevation: theme.isDark ? 0 : 6,
  },
  journeyDotText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
  },
  journeyLine: {
    width: 30,
    height: 4,
    marginHorizontal: -2,
    zIndex: 1,
  },
  journeyDayLabel: {
    position: 'absolute',
    bottom: -22,
    width: 60,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    color: theme.colors.text.tertiary,
    left: -10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.plum + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
  },
  premiumJourneyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 15,
    elevation: theme.isDark ? 0 : 5,
  },
  premiumJourney: {
    marginTop: 20,
    height: 60,
    justifyContent: 'center',
  },
  journeyPathLine: {
    position: 'absolute',
    top: 19,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    zIndex: 1,
  },
  journeyDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  journeyDayItem: {
    alignItems: 'center',
    gap: 8,
  },
  journeyDayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 5,
    elevation: theme.isDark ? 0 : 2,
  },
  beamedCircle: {
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0 : 0.2,
    shadowRadius: 12,
    elevation: theme.isDark ? 0 : 10,
    borderWidth: 0,
  },
  frozenCircle: {
    backgroundColor: theme.isDark ? 'rgba(147, 197, 253, 0.08)' : '#F0F9FF',
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    shadowOpacity: 0,
  },
  frozenCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#93C5FD',
    opacity: 0.6,
  },
  todayCircle: {
    backgroundColor: theme.colors.surface,
    borderColor: '#FF9800',
    borderWidth: 2,
    transform: [{ scale: 1.12 }],
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: theme.isDark ? 0 : 0.15,
    shadowRadius: 10,
    elevation: theme.isDark ? 0 : 6,
  },
  journeyDayText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  crisisActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Calendar Strip
  calendarCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.15 : 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  calendarDateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.plum,
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  calendarDayName: {
    fontSize: 9,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  calendarDayNumber: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 26,
  },
  calendarMonthBlock: {
    flex: 1,
  },
  calendarMonthText: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  calendarYearText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    color: theme.colors.text.tertiary,
    marginTop: 1,
  },
  calendarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.plum + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWeekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  calendarDayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingTop: 14,
  },
  calendarWeekDayName: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayNum: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
  },
  calendarTodayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  // Bento Layout
  bentoContainer: { gap: 12 },
  bentoRow: { flexDirection: 'row', gap: 12 },
  bentoLarge: { height: 160, borderRadius: 28, padding: 20, borderWidth: 1, justifyContent: 'space-between' },
  bentoSmall: { flex: 1, height: 140, borderRadius: 28, padding: 18, borderWidth: 1, justifyContent: 'space-between' },
  bentoBanner: { height: 86, borderRadius: 24, paddingHorizontal: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  bentoIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bentoBannerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  bentoTextWrap: { marginTop: 'auto' },
  bentoTitle: { fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '800', marginBottom: 4 },
  bentoSub: { fontSize: 12, fontFamily: theme.typography.fonts.body, fontWeight: '500', opacity: 0.8 },
});
