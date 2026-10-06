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
import { DashboardSkeleton } from '../../src/components/DashboardSkeleton';
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
import { CalendarStrip } from '../../src/components/dashboard/CalendarStrip';
import { ProgressRings } from '../../src/components/dashboard/ProgressRings';
import { WeeklyPulse } from '../../src/components/dashboard/WeeklyPulse';
import { QuoteSlideshow } from '../../src/components/dashboard/QuoteSlideshow';
import { AppleWidget } from '../../src/components/dashboard/AppleWidget';
import { RitualItem } from '../../src/components/dashboard/RitualItem';
import { DetailedOverviewCard } from '../../src/components/dashboard/DetailedOverviewCard';
import { QuestItem } from '../../src/components/dashboard/QuestItem';
import { StreakJourney } from '../../src/components/dashboard/StreakJourney';
import { useDashboardData } from '../../src/hooks/useDashboardData';
import { AppTourModal } from '../../src/components/AppTourModal';
import { ReadMoreText } from '../../src/components/ReadMoreText';
import { InterventionModal } from '../../src/components/InterventionModal';
import { CelebrationModal } from '../../src/components/CelebrationModal';

const { width } = Dimensions.get('window');
const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };

// ─── Sub-Components ─────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useContext(LanguageContext);
  const styles = createStyles(theme);

  const {
    rituals,
    moodHistory,
    journalHistory,
    chatHistory,
    assessments,
    latestPost,
    suggestedResources,
    gardenStats,
    userData,
    stepCount,
    recentLocation,
    aiPrompt,
    microGoals,
    actionableCopingMechanisms,
    insightSeverity,
    isLoading,
    dailyGoals,
    completedGoalIds,
    gamification,
    checkStatus,
    initPedometer,
  } = useDashboardData();

  const formatText = (text: string | null | undefined) => {
    if (!text) return '';
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const completedCount = completedGoalIds.length;
  
  // Modals state
  const [showIntervention, setShowIntervention] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebData, setCelebData] = useState<{ milestone: number, type: 'STREAK' | 'JOURNAL' }>({ milestone: 0, type: 'STREAK' });
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const checkTour = async () => {
      try {
        const hasSeenTour = await AsyncStorage.getItem('@app_tour_seen');
        if (hasSeenTour !== 'true') {
          setShowTour(true);
        }
      } catch (e) {
        console.error('Error checking tour state:', e);
      }
    };
    setTimeout(checkTour, 500); 
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
      initPedometer();
    }, [checkStatus, initPedometer])
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


      {isLoading ? (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeIn.duration(300)} style={{ flex: 1, paddingTop: insets.top }}>
          <DashboardSkeleton />
        </Animated.View>
      ) : (
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <ScreenHeader title={`${getGreeting()}, ${userData.name}`} subtitle={t('dashboard.nurturePeaceToday')} noPadding />
          </View>
          <ProgressRings completed={completedCount} total={dailyGoals.length || 1} theme={theme} styles={styles} t={t} />
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
            <StreakJourney streak={gamification.currentStreak} theme={theme} completedCount={completedCount} />
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
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/progress')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Flame size={20} color="#FF9800" fill={completedCount >= 1 ? "#FF9800" : "transparent"} />
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
                    goal={goal}
                    theme={theme} 
                    icon={Activity} 
                    title={formatText(goal.name)} 
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
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/journal')}><Text style={{ color: theme.colors.plum, fontSize: 13, fontWeight: '700' }}>{t('dashboard.viewAll')}</Text></TouchableOpacity>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <View style={[styles.reflectionTag, { backgroundColor: theme.colors.plum + '15' }]}>
                      <BookOpen size={10} color={theme.colors.plum} />
                      <Text style={styles.reflectionTagText} numberOfLines={1}>{t('dashboard.clarityTitle').toUpperCase()}</Text>
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
                <TouchableOpacity activeOpacity={0.7} 
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
      )}

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

      <AppTourModal 
        visible={showTour} 
        theme={theme} 
        onClose={async () => {
          setShowTour(false);
          await AsyncStorage.setItem('@app_tour_seen', 'true');
        }} 
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
  pulseGlass: { backgroundColor: theme.colors.surface, borderRadius: 32, overflow: 'hidden', padding: 24, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0 : 0.05, shadowRadius: 15, elevation: theme.isDark ? 0 : 5 },
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
  ritualsContainer: { backgroundColor: theme.colors.surface, marginHorizontal: 24, borderRadius: 32, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: theme.isDark ? 0 : 0.05, shadowRadius: 15, elevation: theme.isDark ? 0 : 5 },
  ritualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  ritualTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  ritualRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ritualItem: { alignItems: 'center', width: (width - 48 - 48) / 3 },
  ritualIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  checkBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.surface, borderRadius: 10, padding: 2 },
  ritualLabel: { fontSize: 11, fontFamily: theme.typography.fonts.accent, fontWeight: '800', textAlign: 'center' },
  widget: { backgroundColor: theme.colors.surface, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0 : 0.04, shadowRadius: 12, elevation: theme.isDark ? 0 : 3 },
  widgetSquare: { aspectRatio: 1, padding: 20 },
  widgetWide: { padding: 24, minHeight: 110 },
  widgetFixed: { width: 142, aspectRatio: 1, padding: 16 },
  squareContent: { flex: 1, justifyContent: 'space-between' },
  wideContent: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  widgetIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wideTextWrap: { flex: 1, marginLeft: 16 },
  widgetTitle: { fontSize: 15, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  widgetSubtitle: { fontSize: 12, fontFamily: theme.typography.fonts.body, marginTop: 2 },
  listContainer: { backgroundColor: theme.colors.surface, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: theme.isDark ? 0 : 0.05, shadowRadius: 12, elevation: theme.isDark ? 0 : 3 },
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
  reflectionTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  reflectionTagText: { fontSize: 9, fontFamily: theme.typography.fonts.accent, fontWeight: '800', color: theme.colors.plum, letterSpacing: 0.5, flexShrink: 1 },
  reflectionTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800', letterSpacing: -0.5 },
  reflectionDate: { fontSize: 11, fontFamily: theme.typography.fonts.accent, fontWeight: '800', marginTop: 2, opacity: 0.6 },
  reflectionArrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reflectionContentBox: { borderRadius: 16, padding: 16, marginTop: 4, borderLeftWidth: 4 },
  reflectionContent: { fontSize: 13, fontFamily: theme.typography.fonts.body, lineHeight: 20, opacity: 0.8 },
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  detailedCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 28, padding: 20, shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: theme.isDark ? 0 : 0.06, shadowRadius: 12, elevation: theme.isDark ? 0 : 4, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
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
  crisisCard: { backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 32, borderWidth: 1.5, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', shadowColor: theme.isDark ? 'transparent' : '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: theme.isDark ? 0 : 0.08, shadowRadius: 15, elevation: theme.isDark ? 0 : 5 },
  crisisIconWrap: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  crisisTitle: { fontSize: 20, fontFamily: theme.typography.fonts.header, fontWeight: '800', marginBottom: 4 },
  crisisSubtitle: { fontSize: 14, fontFamily: theme.typography.fonts.body, lineHeight: 20 },
  disclaimerCard: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0 : 0.03,
    shadowRadius: 10,
    elevation: theme.isDark ? 0 : 2,
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
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 12,
    elevation: theme.isDark ? 0 : 4,
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
    shadowColor: theme.isDark ? 'transparent' : '#000',
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
  questItemContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  questItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  questExpandedContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  questDescription: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 20,
    marginBottom: 12,
  },
  questStartBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  questStartBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
  },
});
