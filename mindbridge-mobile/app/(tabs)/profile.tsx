import React, { useContext, useState, useEffect } from 'react';
import api from '../../src/services/api';
import { Linking } from 'react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  StatusBar,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring, FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  GraduationCap,
  Heart,
  ClipboardEdit,
  Flame,
  Trophy,
  Award,
  CheckCircle2,
  TrendingUp,
  Settings as SettingsIcon,
  PhoneCall,
  X,
  Camera,
  ShieldAlert,
  Phone,
  Mic,
  Search,
  Check
} from 'lucide-react-native';

import { AuthContext } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { BADGE_DEFINITIONS } from '../../src/utils/StreakManager';
import type { UserStats } from '../../src/utils/StreakManager';

const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };

const UNIVERSITIES = [
  "KNUST",
  "University of Ghana (UG)",
  "University of Cape Coast (UCC)",
  "Ashesi University",
  "Academic City",
  "Lancaster University Ghana",
  "Valley View University",
  "UPSA",
  "GIMPA",
  "Other"
];

const StatsCard = ({ icon: Icon, value, label, color, theme }: any) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.statsCard}>
      <View style={[styles.statsIconWrap, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80; // 20px margin each side + 20px card padding each side

const getMoodColor = (score: number, theme: any) => {
  if (score >= 8) return theme.colors.accents.eucalyptus;  // great
  if (score >= 6) return theme.colors.accents.powderBlue;  // good
  if (score >= 4) return theme.colors.plum;                // okay
  if (score >= 2) return theme.colors.accents.dustyRose;   // low
  return theme.colors.semantic.danger;                     // very low
};

const getMoodLabel = (score: number) => {
  if (score >= 8) return 'Great';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Okay';
  if (score >= 2) return 'Low';
  return 'Very Low';
};

const MoodChart = ({ trend, theme }: any) => {
  const styles = createStyles(theme);

  if (!trend || trend.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartText}>No mood data yet. Start your first check-in to see your trends here.</Text>
      </View>
    );
  }

  const chartData = trend.map((item: any) => ({
    value: item.score,
    label: item.day,
    dataPointColor: getMoodColor(item.score, theme),
    dataPointRadius: 5,
  }));

  const latestScore = trend[trend.length - 1]?.score || 0;
  const latestColor = getMoodColor(latestScore, theme);

  return (
    <View>
      {/* Current mood badge */}
      <View style={styles.chartBadgeRow}>
        <View style={[styles.chartBadge, { backgroundColor: latestColor + '18' }]}>
          <View style={[styles.chartBadgeDot, { backgroundColor: latestColor }]} />
          <Text style={[styles.chartBadgeText, { color: latestColor }]}>
            Latest: {getMoodLabel(latestScore)} ({latestScore}/10)
          </Text>
        </View>
      </View>

      {/* Line Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={140}
          spacing={CHART_WIDTH / (chartData.length + 1)}
          initialSpacing={20}
          color={theme.colors.plum}
          thickness={3}
          curved
          hideDataPoints={false}
          dataPointsColor={theme.colors.plum}
          dataPointsRadius={5}
          yAxisColor={'transparent'}
          xAxisColor={theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
          hideYAxisText
          maxValue={10}
          noOfSections={5}
          yAxisThickness={0}
          rulesColor={theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
          rulesType="solid"
          xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontWeight: '700' }}
          backgroundColor={'transparent'}
          pointerConfig={{
            pointerStripHeight: 120,
            pointerStripColor: theme.colors.plum + '30',
            pointerStripWidth: 1.5,
            pointerColor: theme.colors.plum,
            radius: 6,
            pointerLabelWidth: 80,
            pointerLabelHeight: 40,
            activatePointersOnLongPress: false,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any[]) => (
              <View style={[styles.pointerLabel, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.pointerScore, { color: getMoodColor(items[0].value, theme) }]}>
                  {items[0].value}/10
                </Text>
                <Text style={styles.pointerMoodLabel}>{getMoodLabel(items[0].value)}</Text>
              </View>
            ),
          }}
        />
      </View>

      {/* Score scale legend */}
      <View style={styles.chartLegend}>
        {[{label:'Very Low',color:theme.colors.semantic.danger},{label:'Low',color:theme.colors.accents.dustyRose},{label:'Okay',color:theme.colors.plum},{label:'Good',color:theme.colors.accents.powderBlue},{label:'Great',color:theme.colors.accents.eucalyptus}].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const ProfileListItem = ({ icon: Icon, title, color, theme, isLast = false, onPress, destructive = false }: any) => {
  const scale = useSharedValue(1);
  const styles = createStyles(theme);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => { scale.value = withSpring(0.98, springConfig); };
  const handlePressOut = () => { scale.value = withSpring(1, springConfig); };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.listItem, animatedStyle]}>
        <View style={[styles.listIconWrap, { backgroundColor: destructive ? 'rgba(239, 68, 68, 0.1)' : color + (theme.isDark ? '25' : '15') }]}>
          <Icon color={destructive ? theme.colors.semantic.danger : color} size={20} />
        </View>
        <Text style={[styles.listTitle, destructive && { color: theme.colors.semantic.danger }]}>{title}</Text>
        <ChevronRight color={theme.colors.text.disabled} size={20} />
      </Animated.View>
      {!isLast && <View style={styles.divider} />}
    </Pressable>
  );
};

const ProfileListGroup = ({ children, delay, theme }: any) => {
  const styles = createStyles(theme);
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)} style={styles.listGroup}>
      {children}
    </Animated.View>
  );
};

// ─── Main Profile Screen ───────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const router = useRouter();
  const { signOut, userToken, userData, userData: authData } = useContext(AuthContext) as any;
  const styles = createStyles(theme);

  const isGuest = userToken?.startsWith('guest-token');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showUniPicker, setShowUniPicker] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfile(res.data);
      setEditData({
        name: res.data.name,
        phoneNumber: res.data.phoneNumber,
        studentId: res.data.studentId,
        username: res.data.username,
        university: res.data.onboarding?.university,
        program: res.data.onboarding?.program,
        level: res.data.onboarding?.level,
      });
    } catch (e: any) {
      console.warn('Network issue fetching profile:', e.message);
      // Fallback to AuthContext data if network fails
      if (userData) {
        setProfile({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          onboarding: {
            university: userData.academic?.institution,
            program: userData.academic?.faculty,
            level: userData.academic?.level,
          }
        });
        setEditData({
          name: userData.name,
          username: userData.username,
          university: userData.academic?.institution,
          program: userData.academic?.faculty,
          level: userData.academic?.level,
        });
      }

      if (e.response?.status === 401 || e.response?.status === 404) {
        Alert.alert('Session Expired', 'Please log in again to continue.');
        signOut();
        router.replace('/(auth)/welcome');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchInsights();
    loadGamificationStats();
  }, []);

  const loadGamificationStats = async () => {
    try {
      const res = await api.get('/goals/gamification');
      const g = res.data;
      setUserStats({
        currentStreak: g.currentStreak || 0,
        longestStreak: g.longestStreak || 0,
        lastCheckInDate: g.lastCompletedAt || null,
        totalCheckIns: g.totalPoints ? Math.floor(g.totalPoints / 10) : 0,
        totalJournals: 0,
        totalCrisisUses: 0,
        totalPeerSupport: 0,
        points: g.totalPoints || 0,
        badges: g.badges || [],
      });
    } catch (e) {
      console.log('Failed to load gamification stats from server', e);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await api.get('/mood/insights');
      setInsights(res.data);
    } catch (e) {}
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      try {
        await api.put('/profile', { profileImage: selectedUri });
        setProfile((prev: any) => ({ ...prev, profileImage: selectedUri }));
      } catch (e) {
        Alert.alert('Error', 'Could not upload image');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put('/profile', editData);
      setIsEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      // Offline fallback: optimistically update the local state
      console.warn('Network timeout when updating profile, saving locally instead.');
      setProfile((prev: any) => ({
        ...prev,
        name: editData.name,
        phoneNumber: editData.phoneNumber,
        studentId: editData.studentId,
        username: editData.username,
        onboarding: {
          ...prev?.onboarding,
          university: editData.university,
          program: editData.program,
          level: editData.level
        }
      }));
      setIsEditing(false);
      Alert.alert('Saved Locally', 'Your changes have been saved to your device. They will sync when the connection is restored.');
    }
  };

  const handleLogout = () => {
    signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <View style={StyleSheet.absoluteFillObject}>
        
        <View style={[styles.bgBlob, { top: -80, left: -80, backgroundColor: theme.colors.plum + '08' }]} />
        <View style={[styles.bgBlob, { bottom: 0, right: -100, backgroundColor: theme.colors.accents.softMint + '05' }]} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader 
          title={t('profile.title')} 
          subtitle={t('profile.subtitle')}
          rightAction={
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => router.push('/(tabs)/settings')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SettingsIcon color={theme.colors.plum} size={22} />
            </TouchableOpacity>
          }
        />

        <Animated.View entering={FadeInUp.duration(600)} style={styles.headerProfile}>
          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.9} onPress={pickImage}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, { backgroundColor: theme.colors.plum + '20', alignItems: 'center', justifyContent: 'center' }]}>
                <User color={theme.colors.plum} size={48} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Award color="#FFF" size={12} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.name || userData?.name}</Text>
          <Text style={styles.userHandle}>@{profile?.username || 'username'}</Text>
          <Text style={styles.userEmail}>{isGuest ? "Guest User" : profile?.email}</Text>
          
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtnText}>{t('profile.edit_profile')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.statsGrid}>
          <StatsCard theme={theme} icon={Flame} value={String(userStats?.currentStreak ?? profile?.stats?.streak ?? 0)} label={t('profile.stats_streak')} color={theme.colors.accents.gentlePeach} />
          <StatsCard theme={theme} icon={Trophy} value={String(userStats?.points ?? profile?.stats?.points ?? 0)} label={t('profile.stats_points')} color={theme.colors.accents.powderBlue} />
          <StatsCard theme={theme} icon={CheckCircle2} value={String(userStats?.totalCheckIns ?? profile?.stats?.seeds ?? 0)} label={"Check-ins"} color={theme.colors.accents.eucalyptus} />
          <StatsCard theme={theme} icon={Award} value={String(userStats?.badges?.length ?? profile?.stats?.badges ?? 0)} label={t('profile.stats_badges')} color={theme.colors.plum} />
        </Animated.View>

        {/* Badges Section */}
        {userStats && userStats.badges.length > 0 && (
          <Animated.View entering={FadeInUp.delay(150).duration(800)} style={styles.badgesSection}>
            <View style={styles.sectionLabelRow}>
              <Award size={14} color={theme.colors.text.tertiary} />
              <Text style={styles.sectionLabel}>Achievements</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
              {userStats.badges.map((badgeId, idx) => {
                const badge = BADGE_DEFINITIONS[badgeId];
                if (!badge) return null;
                // Just map icons safely, using a default if string lookup fails
                const BadgeIcon = {
                  'Flame': Flame,
                  'BookOpen': ClipboardEdit,
                  'Shield': Shield,
                  'Heart': Heart,
                  'Footprints': CheckCircle2
                }[badge.icon] || Award;
                
                return (
                  <View key={idx} style={[styles.badgeCard, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[styles.badgeIconWrap, { backgroundColor: badge.color + '15' }]}>
                      <BadgeIcon color={badge.color} size={24} />
                    </View>
                    <Text style={[styles.badgeName, { color: theme.colors.text.primary }]}>{badge.name}</Text>
                    <Text style={[styles.badgeDesc, { color: theme.colors.text.tertiary }]} numberOfLines={2}>{badge.description}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Mood Visualization */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <TrendingUp color={theme.colors.plum} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.insightsTitle}>{t('profile.mood_insights')}</Text>
              <Text style={styles.insightsSubtitle}>Your last {insights?.trend?.length || 0} check-ins</Text>
            </View>
            {insights?.hasData && (
              <View style={[styles.avgBadge, { backgroundColor: theme.colors.plum + '12' }]}>
                <Text style={[styles.avgBadgeNum, { color: theme.colors.plum }]}>{insights.avgMood}</Text>
                <Text style={[styles.avgBadgeLabel, { color: theme.colors.plum }]}>avg</Text>
              </View>
            )}
          </View>

          <MoodChart trend={insights?.trend} theme={theme} />

          {insights?.hasData && (
            <View style={styles.correlationGrid}>
              <View style={[styles.correlationCard, { backgroundColor: theme.colors.accents.eucalyptus + '10' }]}>
                <TrendingUp size={16} color={theme.colors.accents.eucalyptus} />
                <Text style={styles.correlationVal}>{insights.totalLogs}</Text>
                <Text style={styles.correlationLab}>Total Check-ins</Text>
              </View>
              <View style={[styles.correlationCard, { backgroundColor: theme.colors.accents.gentlePeach + '10' }]}>
                <Heart size={16} color={theme.colors.accents.gentlePeach} />
                <Text style={[styles.correlationVal, { fontSize: 13 }]} numberOfLines={1}>
                  {insights.bestSocialSetting?.setting || 'N/A'}
                </Text>
                <Text style={styles.correlationLab}>Best Setting</Text>
              </View>
              <View style={[styles.correlationCard, { backgroundColor: theme.colors.accents.powderBlue + '10' }]}>
                <Mic size={16} color={theme.colors.accents.powderBlue} />
                <Text style={styles.correlationVal}>{insights.voiceJournals || '0'}</Text>
                <Text style={styles.correlationLab}>Voice Logs</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity activeOpacity={0.7} 
            style={[styles.detailedInsightsBtn, { backgroundColor: theme.colors.plum + '10' }]}
            onPress={() => router.push('/(tabs)/insights')}
          >
            <Text style={[styles.detailedInsightsText, { color: theme.colors.plum }]}>View Detailed Analytics</Text>
            <ChevronRight color={theme.colors.plum} size={16} />
          </TouchableOpacity>
        </Animated.View>

        <ProfileListGroup delay={400} theme={theme}>
          <View style={styles.sectionLabelRow}>
            <User size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.sectionLabel}>{t('profile.identity_personal')}</Text>
          </View>
          <ProfileListItem 
            theme={theme} 
            icon={PhoneCall} 
            title={profile?.phoneNumber || 'Add Phone Number'} 
            color={theme.colors.plum}
            onPress={() => {
              if (profile?.phoneNumber) {
                Linking.openURL(`tel:${profile.phoneNumber}`);
              } else {
                setIsEditing(true);
              }
            }}
          />
          <ProfileListItem 
            theme={theme} 
            icon={Mail} 
            title={profile?.email || 'No email'} 
            color={theme.colors.accents.powderBlue}
            onPress={() => profile?.email && Linking.openURL(`mailto:${profile.email}`)}
          />
          <ProfileListItem 
            theme={theme} 
            icon={Heart} 
            title={`${profile?.onboarding?.communicationStyle || 'Gentle'} Style • ${profile?.onboarding?.preferredLanguage || 'English'}`} 
            color={theme.colors.accents.dustyRose} 
            isLast
            onPress={() => setIsEditing(true)}
          />
        </ProfileListGroup>

        <ProfileListGroup delay={500} theme={theme}>
          <View style={styles.sectionLabelRow}>
            <ShieldAlert size={14} color={theme.colors.semantic.danger} />
            <Text style={[styles.sectionLabel, { color: theme.colors.semantic.danger }]}>{t('profile.crisis_support')}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} 
            style={[styles.crisisCard, { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }]}
            onPress={() => router.push('/(tabs)/crisis')}
          >
            <View style={[styles.crisisIconWrap, { backgroundColor: theme.colors.semantic.danger }]}>
              <Phone size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.crisisTitle}>{t('crisis.emergency_contact') || 'Emergency Hotline'}</Text>
              <Text style={styles.crisisSubtitle}>{t('crisis.immediate_help') || 'Tap for immediate mental health support'}</Text>
            </View>
            <ChevronRight color={theme.colors.semantic.danger} size={20} />
          </TouchableOpacity>
        </ProfileListGroup>

        <ProfileListGroup delay={600} theme={theme}>
          <View style={styles.sectionLabelRow}>
            <GraduationCap size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.sectionLabel}>{t('profile.academic_info')}</Text>
          </View>
          <ProfileListItem 
            theme={theme} 
            icon={GraduationCap} 
            title={profile?.onboarding?.university || 'University not set'} 
            color={theme.colors.accents.powderBlue}
            onPress={() => setIsEditing(true)}
          />
          <ProfileListItem 
            theme={theme} 
            icon={ClipboardEdit} 
            title={`${profile?.onboarding?.program || 'Program'} • Level ${profile?.onboarding?.level || 'N/A'}`} 
            color={theme.colors.accents.eucalyptus}
            onPress={() => setIsEditing(true)}
          />
          <ProfileListItem 
            theme={theme} 
            icon={Shield} 
            title={`ID: ${profile?.studentId || 'Not provided'}`} 
            color={theme.colors.accents.slate}
            isLast
            onPress={() => setIsEditing(true)}
          />
        </ProfileListGroup>

        <ProfileListGroup delay={700} theme={theme}>
          <ProfileListItem
            theme={theme}
            icon={TrendingUp}
            title={t('journey.title') || "My Journey"}
            color={theme.colors.accents.powderBlue}
            onPress={() => router.push('/(tabs)/journey')}
          />
          <ProfileListItem
            theme={theme}
            icon={Shield}
            title={t('onboarding.privacyTitle') || "Privacy & Security"}
            color={theme.colors.plum}
            onPress={() => router.push('/(tabs)/privacy')}
          />
          <ProfileListItem
            theme={theme}
            icon={Bell}
            title={t('settings.notifications') || "Reminders"}
            color={theme.colors.accents.softMint}
            onPress={() => router.push('/(tabs)/settings')}
          />
          <ProfileListItem
            theme={theme}
            icon={HelpCircle}
            title={t('settings.help_center') || "Help & Support"}
            color={theme.colors.text.secondary}
            onPress={() => setShowHelp(true)}
          />
          <ProfileListItem 
            theme={theme}
            icon={LogOut} 
            title={isGuest ? 'End Session' : (t('settings.log_out') || 'Sign Out')} 
            color={theme.colors.text.secondary} 
            destructive 
            isLast 
            onPress={() => {
              Alert.alert(
                isGuest ? 'End Session' : (t('settings.log_out') || 'Sign Out'),
                isGuest ? 'Are you sure you want to end your guest session?' : 'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: isGuest ? 'End' : (t('settings.log_out') || 'Sign Out'), style: 'destructive', onPress: signOut }
                ]
              );
            }}
          />
        </ProfileListGroup>

        {/* Help Center Modal */}
        <Modal visible={showHelp} animationType="slide" transparent statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowHelp(false)}>
              <BlurView intensity={theme.isDark ? 30 : 15} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            </Pressable>
            <Animated.View entering={SlideInDown.duration(400)} style={styles.modalContentWrap}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Help & Support</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setShowHelp(false)} style={styles.closeBtn}>
                    <X size={20} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {[
                    { q: 'How does MindBridge work?', a: 'MindBridge uses AI to provide personalized mental health and academic support. Track your mood, journal your thoughts, and chat with the Oracle for guidance.' },
                    { q: 'Is my data private?', a: 'Yes. All your data is encrypted and stored securely. We never share your personal information with third parties. You can delete your data at any time.' },
                    { q: 'What is the Oracle?', a: 'The Oracle is your AI-powered mental wellness companion. It reads your mood history and journal entries to give you context-aware, personalized responses.' },
                    { q: 'How do I earn points?', a: 'You earn 100 points for each mood check-in and 200 points for each journal entry. Points unlock badges and milestones on your wellness journey.' },
                    { q: 'What if I am in crisis?', a: 'Please visit the Crisis Support section in the app immediately or call your local emergency services. MindBridge is not a replacement for professional help.' },
                  ].map((item, i) => (
                    <View key={i} style={[styles.helpItem, { borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                      <Text style={[styles.helpQ, { color: theme.colors.text.primary }]}>{item.q}</Text>
                      <Text style={[styles.helpA, { color: theme.colors.text.secondary }]}>{item.a}</Text>
                    </View>
                  ))}
                  <TouchableOpacity activeOpacity={0.7}
                    style={[styles.saveBtn, { marginTop: 16, marginBottom: 32, backgroundColor: theme.colors.semantic.danger + 'DD' }]}
                    onPress={() => { setShowHelp(false); router.push('/(tabs)/crisis'); }}
                  >
                    <Text style={styles.saveBtnText}>Go to Crisis Support</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal visible={isEditing} animationType="fade" transparent statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsEditing(false)}>
              <BlurView intensity={theme.isDark ? 30 : 15} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            </Pressable>
            
            <Animated.View entering={SlideInDown.duration(400)} style={styles.modalContentWrap}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Update Profile</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setIsEditing(false)} style={styles.closeBtn}>
                    <X size={20} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editData.name} 
                    onChangeText={t => setEditData({...editData, name: t})}
                    placeholder="Enter your name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editData.username} 
                    onChangeText={t => setEditData({...editData, username: t})}
                    placeholder="Enter username"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editData.phoneNumber} 
                    onChangeText={t => setEditData({...editData, phoneNumber: t})}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>University</Text>
                  <TouchableOpacity activeOpacity={0.7} 
                    style={styles.pickerTrigger} 
                    onPress={() => setShowUniPicker(true)}
                  >
                    <Text style={[styles.pickerTriggerText, !editData.university && { color: theme.colors.text.disabled }]}>
                      {editData.university || "Select University"}
                    </Text>
                    <ChevronRight size={20} color={theme.colors.text.tertiary} style={{ transform: [{ rotate: showUniPicker ? '90deg' : '0deg' }] }} />
                  </TouchableOpacity>
                  
                  <Modal visible={showUniPicker} animationType="slide" transparent>
                    <View style={styles.uniModalOverlay}>
                      <View style={styles.uniModalContent}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>Select Institution</Text>
                          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowUniPicker(false)} style={styles.closeBtn}>
                            <X color={theme.colors.text.tertiary} size={24} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                          <Search color={theme.colors.text.disabled} size={20} style={styles.searchIcon} />
                          <TextInput
                            style={styles.searchInput}
                            placeholder="Search institution..."
                            placeholderTextColor={theme.colors.text.disabled}
                            value={uniSearch}
                            onChangeText={setUniSearch}
                          />
                        </View>

                        <FlatList
                          data={UNIVERSITIES.filter(i => i.toLowerCase().includes(uniSearch.toLowerCase()))}
                          keyExtractor={item => item}
                          contentContainerStyle={styles.listContent}
                          renderItem={({ item }) => (
                            <TouchableOpacity activeOpacity={0.7}
                              style={[styles.listItemSearch, editData.university === item && styles.listItemActiveSearch]}
                              onPress={() => {
                                setEditData({...editData, university: item});
                                setShowUniPicker(false);
                              }}
                            >
                              <Text style={[styles.listItemText, editData.university === item && styles.listItemTextActive]}>{item}</Text>
                              {editData.university === item && <Check color={theme.colors.plum} size={18} />}
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </View>
                  </Modal>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Program of Study</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editData.program} 
                    onChangeText={t => setEditData({...editData, program: t})}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Level</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editData.level} 
                    onChangeText={t => setEditData({...editData, level: t})}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Student ID (Optional)</Text>
                  <TextInput 
                    style={styles.input} 
                    value={editData.studentId} 
                    onChangeText={t => setEditData({...editData, studentId: t})}
                    placeholder="Enter student ID"
                  />
                </View>
              </ScrollView>

              <TouchableOpacity activeOpacity={0.7} style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  bgBlob: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.5 },
  headerProfile: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 20 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.surface, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: theme.isDark ? 0.3 : 0.15, shadowRadius: 20, elevation: 10, marginBottom: 16 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 46 },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.plum, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.colors.surface },
  userName: { fontSize: 24, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, marginBottom: 2 },
  userHandle: { fontSize: 15, fontFamily: theme.typography.fonts.body, color: theme.colors.plum, fontWeight: '700', marginBottom: 6 },
  userEmail: { fontSize: 14, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, marginBottom: 20 },
  editBtn: { backgroundColor: theme.colors.plum + '10', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  editBtnText: { color: theme.colors.plum, fontFamily: theme.typography.fonts.header, fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, paddingHorizontal: 20 },
  statsCard: { width: '48%', backgroundColor: theme.colors.surface, padding: 20, borderRadius: 28, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' },
  statsIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statsValue: { fontSize: 20, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary },
  statsLabel: { fontSize: 12, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, marginTop: 2 },
  insightsCard: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: 32, marginBottom: 24, marginHorizontal: 20, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', overflow: 'hidden' },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  insightsTitle: { fontSize: 17, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary },
  insightsSubtitle: { fontSize: 12, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, marginTop: 1 },
  avgBadge: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  avgBadgeNum: { fontSize: 20, fontFamily: theme.typography.fonts.header, lineHeight: 22 },
  avgBadgeLabel: { fontSize: 9, fontFamily: theme.typography.fonts.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  badgesSection: { marginBottom: 24 },
  badgesScroll: { paddingHorizontal: 20, gap: 12 },
  badgeCard: { width: 110, padding: 12, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeName: { fontSize: 13, fontFamily: theme.typography.fonts.header, textAlign: 'center', marginBottom: 2 },
  badgeDesc: { fontSize: 10, fontFamily: theme.typography.fonts.body, textAlign: 'center' },
  detailedInsightsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, marginTop: 16, gap: 6 },
  detailedInsightsText: { fontSize: 14, fontFamily: theme.typography.fonts.header },
  // Chart styles
  emptyChart: { paddingVertical: 32, alignItems: 'center' },
  emptyChartText: { fontSize: 14, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, textAlign: 'center', lineHeight: 22, maxWidth: 240 },
  chartBadgeRow: { flexDirection: 'row', marginBottom: 16 },
  chartBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  chartBadgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  chartBadgeText: { fontSize: 12, fontFamily: theme.typography.fonts.header },
  chartWrapper: { marginLeft: -24, marginRight: -24 },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary },
  pointerLabel: { borderRadius: 10, padding: 6, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  pointerScore: { fontSize: 14, fontFamily: theme.typography.fonts.header, lineHeight: 16 },
  pointerMoodLabel: { fontSize: 9, fontFamily: theme.typography.fonts.accent, color: theme.colors.text.tertiary, textTransform: 'uppercase' },
  // Correlation
  correlationGrid: { flexDirection: 'row', gap: 10, marginTop: 24, borderTopWidth: 1, borderTopColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', paddingTop: 20 },
  correlationCard: { flex: 1, padding: 12, borderRadius: 18, alignItems: 'center', gap: 4 },
  correlationVal: { fontSize: 16, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, textTransform: 'capitalize', textAlign: 'center' },
  correlationLab: { fontSize: 10, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, textAlign: 'center' },
  listGroup: { backgroundColor: theme.colors.surface, borderRadius: 32, marginBottom: 24, marginHorizontal: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: theme.colors.surface },
  listIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  listTitle: { flex: 1, fontSize: 16, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, letterSpacing: -0.3 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', marginLeft: 72 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontFamily: theme.typography.fonts.accent, color: theme.colors.text.tertiary, letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  modalContentWrap: { height: '85%', width: '100%' },
  modalContent: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, paddingTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  modalBody: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontFamily: theme.typography.fonts.accent, color: theme.colors.text.tertiary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 16, padding: 16, color: theme.colors.text.primary, fontSize: 16, fontFamily: theme.typography.fonts.body },
  saveBtn: { backgroundColor: theme.colors.plum, padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveBtnText: { color: '#FFF', fontSize: 17, fontFamily: theme.typography.fonts.header },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
  },
  pickerTriggerText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.primary,
  },
  uniModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  uniModalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: SCREEN_WIDTH * 2, maxHeight: '85%', padding: 24, paddingBottom: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 56, color: theme.colors.text.primary, fontFamily: theme.typography.fonts.body, fontSize: 16 },
  listContent: { paddingBottom: 40 },
  listItemSearch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' },
  listItemActiveSearch: { backgroundColor: theme.isDark ? 'rgba(140, 160, 185, 0.1)' : 'rgba(123, 97, 255, 0.05)', borderRadius: 16, paddingHorizontal: 16, marginVertical: 4, borderBottomWidth: 0 },
  listItemText: { fontSize: 16, color: theme.colors.text.primary, fontFamily: theme.typography.fonts.body, flex: 1 },
  listItemTextActive: { color: theme.colors.plum, fontFamily: theme.typography.fonts.header },
  crisisCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 16,
    gap: 12
  },
  crisisIconWrap: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  crisisTitle: { 
    fontSize: 16, 
    fontFamily: theme.typography.fonts.header, 
    color: theme.colors.text.primary 
  },
  crisisSubtitle: { 
    fontSize: 12, 
    fontFamily: theme.typography.fonts.body, 
    color: theme.colors.text.secondary 
  },
  helpItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  helpQ: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.header,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  helpA: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 22,
  },
});

