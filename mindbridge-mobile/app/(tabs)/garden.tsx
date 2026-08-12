import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Activity,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Mic,
  StopCircle,
  MapPin,
  Cloud,
  History,
  ArrowRight,
  Clock,
  Sun,
  Wind,
  Heart,
  Moon,
  AlertCircle,
  CloudRain,
  Flame,
  Lightbulb,
  Frown,
  Meh,
  Smile,
  Zap,
  Users,
  Brain,
  Camera
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { useAudioRecorder, useAudioRecorderState, createAudioPlayer, AudioPlayer, requestRecordingPermissionsAsync, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import {
  EnergySelector,
  SleepTracker,
  SocialPicker,
  SymptomCloud
} from '../../src/components/TrackingComponents';
import { VideoCheckInModal } from '../../src/components/VideoCheckInModal';
import { BADGE_DEFINITIONS } from '../../src/utils/StreakManager';
import { Sprout, Leaf, TreePine, PlayCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CHART_W = width - 96;

// ─── Tracker Header ──────────────────────────────────────────────────────────
const TrackerHeader = ({ totalCount, avgMood, theme }: any) => {
  const styles = createStyles(theme);
  return (
    <Animated.View entering={FadeIn.duration(800)} style={styles.headerGrid}>
      <LinearGradient
        colors={theme.isDark ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
        style={styles.statsCard}
      >
        <View style={[styles.statsIcon, { backgroundColor: theme.colors.plum + '15' }]}>
          <Activity color={theme.colors.plum} size={20} />
        </View>
        <Text style={[styles.statsVal, { color: theme.colors.text.primary }]}>{totalCount}</Text>
        <Text style={[styles.statsLabel, { color: theme.colors.text.tertiary }]}>Total Records</Text>
      </LinearGradient>

      <LinearGradient
        colors={theme.isDark ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
        style={styles.statsCard}
      >
        <View style={[styles.statsIcon, { backgroundColor: '#34D39915' }]}>
          <TrendingUp color="#34D399" size={20} />
        </View>
        <Text style={[styles.statsVal, { color: theme.colors.text.primary }]}>{avgMood || '7.2'}</Text>
        <Text style={[styles.statsLabel, { color: theme.colors.text.tertiary }]}>Avg. Mood</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ─── Garden Visualizer ────────────────────────────────────────────────────────
const GardenVisualizer = ({ streak, totalLogs, theme }: any) => {
  const scaleAnim = useSharedValue(0.5);

  useEffect(() => {
    const targetScale = Math.min(1 + (streak * 0.15), 2.5);
    scaleAnim.value = withSpring(targetScale, { damping: 10, mass: 1.2 });
  }, [streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const Icon = streak >= 7 ? TreePine : (streak >= 3 ? Leaf : Sprout);
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32, marginHorizontal: 24, marginBottom: 16, backgroundColor: theme.colors.surface, borderRadius: 32, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
      <Typography variant="bodyBold" color={theme.colors.text.tertiary} style={{ marginBottom: 16 }}>Your Wellness Garden</Typography>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.accents?.eucalyptus + '15' }, animatedStyle]}>
        <Icon color={theme.colors.accents?.eucalyptus || '#34D399'} size={40} />
      </Animated.View>
      <Typography variant="captionMedium" color={theme.colors.text.secondary} style={{ marginTop: 16 }}>{streak} Day Streak</Typography>
    </View>
  );
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WellnessTrackerScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = createStyles(theme);

  const getMoodIcon = (emotion: string, size = 20, color = theme.colors.plum) => {
    switch (emotion?.toLowerCase()) {
      case 'radiant':
      case 'elated': return <Sun size={size} color={color} />;
      case 'serene':
      case 'calm': return <Wind size={size} color={color} />;
      case 'melancholy':
      case 'sad': return <CloudRain size={size} color={color} />;
      case 'anxious': return <AlertCircle size={size} color={color} />;
      case 'frustrated':
      case 'stressed': return <Flame size={size} color={color} />;
      case 'grateful':
      case 'joyful': return <Heart size={size} color={color} />;
      case 'empty':
      case 'tired': return <Moon size={size} color={color} />;
      case 'empowered': return <Zap size={size} color={color} />;
      default: return <Activity size={size} color={color} />;
    }
  };
  const { t } = theme;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const [mood, setMood] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [energy, setEnergy] = useState(6);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('good');
  const [social, setSocial] = useState('alone');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  
  // Privacy Modal
  const [showLocationModal, setShowLocationModal] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const isRecording = recorderState.isRecording;
  
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const formatText = (text: string | null | undefined) => {
    if (!text) return '';
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<AudioPlayer | null>(null);

  // Video Check-in
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [facialMetrics, setFacialMetrics] = useState<any>(null);

  // Voice Analysis
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [vocalMetrics, setVocalMetrics] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (player) player.remove();
    };
  }, [player]);

  const requestAndFetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const _ = await Location.getCurrentPositionAsync({}); // Triggers actual permission/GPS
        // Mock semantic engine based on time of day
        const hour = new Date().getHours();
        let semLoc = 'DORM';
        if (hour > 8 && hour < 12) semLoc = 'LIBRARY';
        else if (hour >= 12 && hour < 14) semLoc = 'SOCIAL_SPACE';
        else if (hour >= 14 && hour < 17) semLoc = 'COUNSELING_CENTER';
        else if (hour >= 17 && hour < 20) semLoc = 'SOCIAL_SPACE';
        
        setLocation(semLoc);
        setWeather('Clear');
      }
    } catch (e) {
      console.log('Location fetch error:', e);
    }
  };

  const handleConsent = async (granted: boolean) => {
    await AsyncStorage.setItem('@location_consent', granted ? 'true' : 'false');
    setShowLocationModal(false);
    if (granted) {
      await requestAndFetchLocation();
    }
  };

  const [aiInsight, setAiInsight] = useState<any>(null);
  const [suggestedResources, setSuggestedResources] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [contextRes, logsRes, insightsRes] = await Promise.all([
        api.get('/ai/oracle-context'),
        api.get('/mood'),
        api.get('/mood/insights'),
      ]);

      setTotalCount(contextRes.data.moodCount || 0);
      setMoodLogs(logsRes.data || []);
      setInsights(insightsRes.data || null);

      // Fetch AI Proactive Insights in the background
      api.get('/ai/proactive-insights').then(res => {
        if (res.data?.gardenInsight) {
          setAiInsight(res.data.gardenInsight);
        }
        if (res.data?.suggestedResources) {
          setSuggestedResources(res.data.suggestedResources);
        }
      }).catch(err => console.log('Failed to fetch proactive insights in garden'));

      // Recent history: last 3 logs
      const logs = logsRes.data || [];
      setHistory(logs.slice(0, 3));

      // Privacy Check
      const consent = await AsyncStorage.getItem('@location_consent');
      if (!consent) {
        setShowLocationModal(true);
      } else if (consent === 'true') {
        await requestAndFetchLocation();
      }
    } catch (e) {
      console.warn('Network timeout when fetching garden context, using local offline fallbacks.');
      setTotalCount(prev => prev);
      setMoodLogs([]);
      setInsights(null);
      setHistory([]);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s > 1 ? s - 1 : 1);

  const StepProgress = ({ current }: { current: number }) => (
    <View style={styles.progressRow}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.progressBar,
            { backgroundColor: i <= current ? theme.colors.plum : theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
        />
      ))}
    </View>
  );

  // Server streak is now the single source of truth
  const [serverStreak, setServerStreak] = useState(0);

  // Load initial streak from dashboard cache or API
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const cached = await AsyncStorage.getItem('dashboard_cache');
        if (cached) {
          const data = JSON.parse(cached);
          if (data.gamification?.currentStreak) {
            setServerStreak(data.gamification.currentStreak);
          }
        }
      } catch (e) {
        console.log('Failed to load cached streak', e);
      }
    };
    loadStreak();
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (granted) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldRouteThroughEarpiece: false });
        await recorder.prepareToRecordAsync();
        recorder.record();
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    await recorder.stop();
    setAudioUri(recorder.uri);
  };

  const playSound = async () => {
    if (!audioUri) return;
    if (isPlaying) {
      if (player) {
        player.pause();
      }
      setIsPlaying(false);
      return;
    }
    if (player) {
      player.remove();
    }
    const newPlayer = createAudioPlayer(audioUri);
    setPlayer(newPlayer);
    setIsPlaying(true);
    newPlayer.play();
    newPlayer.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) setIsPlaying(false);
    });
  };

  const deleteSound = async () => {
    if (player) {
      player.remove();
    }
    setAudioUri(null);
    setVocalMetrics(null);
    setIsPlaying(false);
  };

  const handleAnalyzeVoice = async () => {
    if (!audioUri) return;
    try {
      setIsAnalyzingVoice(true);
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
      });

      const response = await api.post('/ai/analyze-voice', {
        audioBase64: base64Audio,
        mimeType: 'audio/m4a'
      });

      setVocalMetrics(response.data);
    } catch (error) {
      console.error('Error analyzing voice:', error);
      Alert.alert("Analysis Failed", "Could not analyze voice tone at this time.");
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const handleLog = async () => {
    setLoading(true);
    try {
      // 1. Fetch current steps from Pedometer (if available)
      let currentSteps = 0;
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (isAvailable) {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const pedoRes = await Pedometer.getStepCountAsync(start, end);
          currentSteps = pedoRes ? pedoRes.steps : 0;
        }
      } catch (err) {
        console.log('Failed to fetch steps for mood log', err);
      }

      const score = mood ? mood * 2 : 6;
      const response = await api.post('/mood', {
        score,
        emotions: selectedEmotion ? [selectedEmotion] : [],
        energyLevel: energy,
        sleepHours,
        sleepQuality,
        socialSetting: social,
        physicalSymptoms: symptoms,
        weather,
        location,
        note,
        audioUrl: audioUri,
        steps: currentSteps,
        facialMetrics: facialMetrics,
        vocalMetrics: vocalMetrics,
      });

      // Optimistically update the dashboard cache with the new streak
      // Optimistically update the dashboard cache with the new streak
      let newServerStreak = 0;
      if (response.data?.gamification) {
        newServerStreak = response.data.gamification.currentStreak;
        try {
          const cached = await AsyncStorage.getItem('dashboard_cache');
          if (cached) {
            const data = JSON.parse(cached);
            data.gamification = {
              ...data.gamification,
              currentStreak: response.data.gamification.currentStreak
            };
            await AsyncStorage.setItem('dashboard_cache', JSON.stringify(data));
          }
        } catch (e) {
          console.log('Failed to update dashboard cache with new streak', e);
        }
      }

      // Update the server streak state
      if (response.data?.gamification) {
        setServerStreak(response.data.gamification.currentStreak);
      }

      const newLog = { 
        score: mood ? mood * 2 : 6, 
        emotions: selectedEmotion ? [selectedEmotion] : [], 
        createdAt: new Date().toISOString()
      };

      setMoodLogs(prev => [newLog, ...prev]);
      setHistory(prev => [newLog, ...prev].slice(0, 3));
      
      setStep(5);
      setTotalCount(prev => prev + 1);
      fetchData();
    } catch (error) {
      console.warn('Network timeout when saving mood, updating locally.');
      const newLog = { 
        score: mood ? mood * 2 : 6, 
        emotions: selectedEmotion ? [selectedEmotion] : [], 
        createdAt: new Date().toISOString() 
      };
      setMoodLogs(prev => [newLog, ...prev]);
      setHistory(prev => [newLog, ...prev].slice(0, 3));
      setStep(5);
      setTotalCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    const moodsList = [
      { value: 1, icon: CloudRain, label: 'Awful', colors: ['#64748B', '#475569'] },
      { value: 2, icon: Frown, label: 'Bad', colors: ['#EF4444', '#B91C1C'] },
      { value: 3, icon: Meh, label: 'Okay', colors: ['#FBBF24', '#D97706'] },
      { value: 4, icon: Smile, label: 'Good', colors: [theme.colors.plum, '#701A75'] },
      { value: 5, icon: Sun, label: 'Great', colors: ['#10B981', '#047857'] },
    ];
    return (
      <Animated.View entering={FadeInRight.springify().damping(18).mass(0.8)} style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>Core Energy</Text>
        <Text style={[styles.stepSub, { color: theme.colors.text.tertiary }]}>How is your spirit pulsating right now?</Text>
        <View style={styles.moodRow}>
          {moodsList.map((m) => {
            const Icon = m.icon;
            const isSelected = mood === m.value;
            return (
              <TouchableOpacity
                key={m.value}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMood(m.value);
                  setTimeout(() => nextStep(), 200);
                }}
                style={styles.moodCol}
              >
                <LinearGradient
                  colors={isSelected ? (m.colors as unknown as readonly [string, string, ...string[]]) : (theme.isDark ? ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'] : ['rgba(0,0,0,0.015)', 'rgba(0,0,0,0.015)'])}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.moodCircle,
                    isSelected ? { borderColor: m.colors[0], shadowColor: m.colors[0], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } : { borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                  ]}
                >
                  <Icon size={28} color={isSelected ? '#FFF' : theme.colors.text.secondary} />
                </LinearGradient>
                <Text style={[styles.moodText, { color: isSelected ? theme.colors.text.primary : theme.colors.text.secondary }]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderStep2 = () => {
    const emotionsList = [
      { label: 'Radiant', desc: 'Joy', color: '#FBBF24', angle: 0 },
      { label: 'Serene', desc: 'Calm', color: '#10B981', angle: 45 },
      { label: 'Melancholy', desc: 'Sad', color: '#6366F1', angle: 90 },
      { label: 'Anxious', desc: 'Fear', color: '#F97316', angle: 135 },
      { label: 'Frustrated', desc: 'Anger', color: '#EF4444', angle: 180 },
      { label: 'Grateful', desc: 'Love', color: '#EC4899', angle: 225 },
      { label: 'Empty', desc: 'Apathy', color: '#64748B', angle: 270 },
      { label: 'Empowered', desc: 'Power', color: '#8B5CF6', angle: 315 },
    ];

    const R = 85; 
    const cx = 135; 
    const cy = 135; 
    const selectedObj = emotionsList.find(e => e.label === selectedEmotion);

    return (
      <Animated.View entering={FadeInRight.springify().damping(18).mass(0.8)} style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>Emotion Wheel</Text>
        <Text style={[styles.stepSub, { color: theme.colors.text.tertiary }]}>Tap a color segment to select your emotion</Text>
        
        <View style={styles.wheelContainer}>
          <View style={[styles.wheelInnerBg, { borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} />
          
          <View style={[
            styles.wheelCenter, 
            { 
              backgroundColor: theme.colors.surface,
              borderColor: selectedObj ? selectedObj.color : (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
              shadowColor: selectedObj ? selectedObj.color : 'transparent',
              shadowOpacity: selectedObj ? 0.3 : 0,
              shadowRadius: 10,
              elevation: selectedObj ? 4 : 0
            }
          ]}>
            <Text style={[styles.wheelCenterLabel, { color: selectedObj ? selectedObj.color : theme.colors.text.tertiary }]}>
              {selectedObj ? selectedObj.label : 'Select'}
            </Text>
            <Text style={[styles.wheelCenterDesc, { color: theme.colors.text.tertiary }]}>
              {selectedObj ? selectedObj.desc : 'Vibe'}
            </Text>
          </View>

          {emotionsList.map((e) => {
            const rad = (e.angle * Math.PI) / 180;
            const left = cx + R * Math.cos(rad) - 27;
            const top = cy + R * Math.sin(rad) - 27;
            const isSelected = selectedEmotion === e.label;

            return (
              <TouchableOpacity
                key={e.label}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedEmotion(e.label);
                }}
                style={[
                  styles.wheelSegment,
                  {
                    left,
                    top,
                    backgroundColor: e.color,
                    borderColor: isSelected ? (theme.isDark ? '#FFFFFF' : '#000000') : 'transparent',
                    borderWidth: isSelected ? 3 : 0,
                    transform: [{ scale: isSelected ? 1.25 : 1.0 }],
                    shadowColor: e.color,
                    shadowOpacity: isSelected ? 0.4 : 0.1,
                    shadowRadius: isSelected ? 8 : 3,
                    shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                    elevation: isSelected ? 6 : 2
                  }
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity activeOpacity={0.7} 
          disabled={!selectedEmotion}
          style={[
            styles.nextBtn, 
            { 
              backgroundColor: selectedEmotion ? theme.colors.plum : theme.colors.text.disabled,
              opacity: selectedEmotion ? 1 : 0.6,
              marginTop: 24 
            }
          ]} 
          onPress={nextStep}
        >
          <Text style={styles.nextBtnText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStep3 = () => {
    return (
      <Animated.View entering={FadeInRight.springify().damping(18).mass(0.8)} style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>Vital Dimensions</Text>
        <Text style={[styles.stepSub, { color: theme.colors.text.tertiary }]}>Rest, energy, and physical symptoms</Text>
        <ScrollView style={{ width: '100%', maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          <EnergySelector value={energy} onChange={setEnergy} theme={theme} />
          <SleepTracker quality={sleepQuality} hours={sleepHours} onQualityChange={setSleepQuality} onHoursChange={setSleepHours} theme={theme} />
          <SocialPicker value={social} onChange={setSocial} theme={theme} />
          <SymptomCloud selected={symptoms} onToggle={(id: string) => setSymptoms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} theme={theme} />
        </ScrollView>
        <TouchableOpacity activeOpacity={0.7} style={[styles.nextBtn, { backgroundColor: theme.colors.plum, marginTop: 16 }]} onPress={nextStep}>
          <Text style={styles.nextBtnText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStep4 = () => {
    return (
      <Animated.View entering={FadeInRight.springify().damping(18).mass(0.8)} style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>Journaling</Text>
        <Text style={[styles.stepSub, { color: theme.colors.text.tertiary }]}>Capture your voice and surroundings</Text>

        <View style={styles.journalBox}>
          <TextInput
            style={[styles.noteInput, { color: theme.colors.text.primary, borderColor: theme.colors.text.tertiary + '30', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)', borderRadius: 16, padding: 12, minHeight: 100 }]}
            placeholder="Pour your heart out here..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={styles.mediaRow}>
          {isRecording ? (
            <TouchableOpacity activeOpacity={0.7}
              onPress={stopRecording}
              style={[styles.mediaBtn, { backgroundColor: '#EF4444', flex: 1 }]}
            >
              <StopCircle size={20} color="#FFF" />
              <Text style={[styles.mediaBtnText, { color: '#FFF' }]}>Stop Recording</Text>
            </TouchableOpacity>
          ) : audioUri ? (
            <View style={{ flex: 1, gap: 12 }}>
              <View style={styles.playbackContainer}>
                <TouchableOpacity activeOpacity={0.7}
                  onPress={playSound}
                  style={[styles.mediaBtn, { backgroundColor: theme.colors.plum, flex: 1 }]}
                >
                  <Activity size={20} color="#FFF" />
                  <Text style={[styles.mediaBtnText, { color: '#FFF' }]}>{isPlaying ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}
                  onPress={deleteSound}
                  style={styles.deleteAudioBtn}
                >
                  <Text style={{ color: '#EF4444', fontWeight: '800' }}>Delete</Text>
                </TouchableOpacity>
              </View>

              {!vocalMetrics ? (
                <TouchableOpacity activeOpacity={0.7} 
                  style={[styles.mediaBtn, { backgroundColor: theme.colors.plum + '20', padding: 12 }]} 
                  onPress={handleAnalyzeVoice}
                  disabled={isAnalyzingVoice}
                >
                  {isAnalyzingVoice ? (
                    <ActivityIndicator size="small" color={theme.colors.plum} />
                  ) : (
                    <>
                      <Activity color={theme.colors.plum} size={18} />
                      <Text style={[styles.mediaBtnText, { color: theme.colors.plum, fontSize: 13 }]}>Analyze Tone</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={[styles.mediaBtn, { backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: 12 }]}>
                  <CheckCircle2 color="#34D399" size={18} />
                  <Text style={[styles.mediaBtnText, { color: '#34D399', fontSize: 13 }]}>
                    Tone: {vocalMetrics.voiceQuality}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
              <TouchableOpacity activeOpacity={0.7}
                onPress={startRecording}
                style={[styles.mediaBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', flex: 1 }]}
              >
                <Mic size={20} color={theme.colors.text.secondary} />
                <Text style={[styles.mediaBtnText, { color: theme.colors.text.secondary }]}>Audio</Text>
              </TouchableOpacity>
              
              <TouchableOpacity activeOpacity={0.7}
                onPress={() => setShowVideoModal(true)}
                style={[styles.mediaBtn, { backgroundColor: facialMetrics ? 'rgba(52, 211, 153, 0.15)' : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'), flex: 1 }]}
              >
                {facialMetrics ? <CheckCircle2 size={20} color="#34D399" /> : <Camera size={20} color={theme.colors.text.secondary} />}
                <Text style={[styles.mediaBtnText, { color: facialMetrics ? "#34D399" : theme.colors.text.secondary }]}>
                  {facialMetrics ? 'Face Logged' : 'Face Scan'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.envRow}>
          <View style={styles.envTag}><MapPin size={14} color={theme.colors.plum} /><Text style={[styles.envText, { color: theme.colors.text.secondary }]}>{formatText(location) || 'Locating...'}</Text></View>
          <View style={styles.envTag}><Cloud size={14} color={theme.colors.plum} /><Text style={[styles.envText, { color: theme.colors.text.secondary }]}>{weather || 'Syncing...'}</Text></View>
        </View>

        <Button
          variant="primary"
          size="large"
          onPress={handleLog}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {t('tracker.submitBtn')}
        </Button>
      </Animated.View>
    );
  };

  const renderStep5 = () => {
    const streak = serverStreak;
    return (
      <Animated.View entering={FadeIn.duration(500)} style={styles.successContainer}>
        <Animated.View entering={FadeInUp.springify().damping(12).mass(0.8)} style={styles.successIconWrap}>
          <CheckCircle2 color={theme.colors.accents?.eucalyptus || '#34D399'} size={48} />
        </Animated.View>
        <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>{t('tracker.successTitle')}</Text>
        <Text style={[styles.successSubtitle, { color: theme.colors.text.secondary }]}>{t('tracker.successSubtitle')}</Text>

        <Animated.View
          entering={FadeInUp.springify().damping(15).delay(150)}
          style={[styles.streakCard, { backgroundColor: theme.isDark ? 'rgba(239, 108, 0, 0.1)' : '#FFF3E0', borderColor: 'rgba(239, 108, 0, 0.2)' }]}
        >
          <Flame size={40} color="#EF6C00" style={{ marginBottom: 4 }} />
          <Text style={[styles.streakCount, { color: theme.colors.text.primary }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: theme.colors.text.secondary }]}>Day Streak</Text>
        </Animated.View>

        {suggestedResources && suggestedResources.length > 0 && (
          <Animated.View entering={FadeInUp.springify().damping(15).delay(300)} style={{ width: '100%', marginTop: 24 }}>
            <Text style={{ color: theme.colors.text.secondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontFamily: theme.typography.fonts.accent, fontWeight: '700', marginBottom: 12 }}>
              Recommended For You
            </Text>
            {suggestedResources.slice(0, 1).map((res, i) => (
              <TouchableOpacity activeOpacity={0.7} key={res.id || i} style={[styles.historyItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.plum + '30', borderWidth: 1 }]} onPress={() => router.push('/(tabs)/knowledge-hub')}>
                <View style={[styles.moodIndicator, { backgroundColor: theme.colors.plum + '15' }]}>
                  <PlayCircle color={theme.colors.plum} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyMood, { color: theme.colors.text.primary }]}>{res.title || 'Mindfulness Exercise'}</Text>
                  <Text style={[styles.historyTime, { color: theme.colors.text.tertiary }]}>{res.category || 'General'} · Recommended by AI</Text>
                </View>
                <ArrowRight size={16} color={theme.colors.plum} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        <Button
          variant="primary"
          size="large"
          onPress={() => {
            setStep(1);
            setMood(null);
            setSelectedEmotion(null);
            setNote('');
            setAudioUri(null);
            router.push('/(tabs)/dashboard');
          }}
          style={{ marginTop: 32, paddingHorizontal: 32 }}
        >
          Return to Home
        </Button>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('tracker.title')} subtitle={t('tracker.subtitle')} />

        <GardenVisualizer streak={serverStreak} totalLogs={totalCount} theme={theme} />

        <TrackerHeader totalCount={totalCount} theme={theme} />

        <View style={styles.cardContainer}>
          <BlurView intensity={theme.isDark ? 30 : 80} tint={theme.isDark ? 'dark' : 'light'} style={styles.glassCard}>

            {step < 5 && (
              <View style={styles.wizardHeader}>
                <StepProgress current={step} />
                <View style={styles.wizardNav}>
                  {step > 1 ? (
                    <TouchableOpacity activeOpacity={0.7} onPress={prevStep} style={styles.backBtn}>
                      <ArrowRight size={20} color={theme.colors.text.tertiary} style={{ transform: [{ rotate: '180deg' }] }} />
                      <Text style={[styles.backText, { color: theme.colors.text.tertiary }]}>{t('common.back')}</Text>
                    </TouchableOpacity>
                  ) : <View />}
                </View>
              </View>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </BlurView>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: theme.colors.text.primary }]}>{t('tracker.recent_checkins') || 'Recent Check-ins'}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/profile')}><Text style={{ color: theme.colors.plum, fontWeight: '700' }}>View All</Text></TouchableOpacity>
          </View>
          {history.length > 0 ? history.map((item: any, idx: number) => {
            const emotion = item.emotions?.[0] || 'neutral';
            return (
              <View key={idx} style={[styles.historyItem, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                <View style={[styles.moodIndicator, { backgroundColor: theme.colors.plum + '12' }]}>
                  {getMoodIcon(emotion, 20, theme.colors.plum)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyMood, { color: theme.colors.text.primary }]}>{new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                  <View style={styles.historyMeta}>
                    <Clock size={12} color={theme.colors.text.tertiary} />
                    <Text style={[styles.historyTime, { color: theme.colors.text.tertiary }]}>Score: {item.score}/10 · {emotion}</Text>
                  </View>
                </View>
                <ArrowRight size={16} color={theme.colors.text.tertiary} />
              </View>
            );
          }) : (
            <View style={styles.emptyHistory}>
              <History size={40} color={theme.colors.text.disabled} />
              <Text style={{ color: theme.colors.text.tertiary, marginTop: 12 }}>No recent check-ins found</Text>
            </View>
          )}
        </View>

        {/* ── Mood Analysis ── */}
        {moodLogs.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.historyTitle, { color: theme.colors.text.primary, marginBottom: 6 }]}>{t('tracker.mood_analysis') || 'Mood Analysis'}</Text>
            <Text style={[styles.analysisSub, { color: theme.colors.text.tertiary }]}>Your emotional patterns based on {moodLogs.length} check-ins</Text>

            {/* 7-Day / 30-Day Trend Chart */}
            {(() => {
              const activeData = timeRange === '7d'
                ? (insights?.trend || [])
                : moodLogs.slice(0, 30).reverse().map((l: any) => ({
                  value: l.score,
                  label: new Date(l.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
                }));

              if (activeData.length === 0) return null;

              const avgScore = timeRange === '7d'
                ? (insights?.avgMood ?? 0)
                : (activeData.reduce((acc: number, item: any) => acc + (item.value ?? item.score ?? 0), 0) / activeData.length).toFixed(1);

              // Calculate dynamic Best Day of the Week based on all available check-ins
              const weekdayAvg: Record<string, { total: number; count: number }> = {};
              moodLogs.forEach((l: any) => {
                const dayName = new Date(l.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
                if (!weekdayAvg[dayName]) {
                  weekdayAvg[dayName] = { total: 0, count: 0 };
                }
                weekdayAvg[dayName].total += l.score;
                weekdayAvg[dayName].count += 1;
              });

              let bestDayName = 'N/A';
              let bestDayScore = 0;
              Object.entries(weekdayAvg).forEach(([day, val]) => {
                const avg = val.total / val.count;
                if (avg > bestDayScore) {
                  bestDayScore = avg;
                  bestDayName = day;
                }
              });

              return (
                <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.chartHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.analysisCardTitle, { color: theme.colors.text.primary }]}>Mood Trend</Text>
                      <Text style={[styles.analysisCardSub, { color: theme.colors.text.tertiary }]}>Showing last {activeData.length} records</Text>
                    </View>
                    <View style={[styles.toggleContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                      <TouchableOpacity activeOpacity={0.7}
                        style={[styles.toggleBtn, timeRange === '7d' && [styles.toggleActiveBtn, { backgroundColor: theme.colors.plum }]]}
                        onPress={() => setTimeRange('7d')}
                      >
                        <Text style={[styles.toggleBtnText, timeRange === '7d' ? { color: '#FFF' } : { color: theme.colors.text.secondary }]}>Weekly</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.7}
                        style={[styles.toggleBtn, timeRange === '30d' && [styles.toggleActiveBtn, { backgroundColor: theme.colors.plum }]]}
                        onPress={() => setTimeRange('30d')}
                      >
                        <Text style={[styles.toggleBtnText, timeRange === '30d' ? { color: '#FFF' } : { color: theme.colors.text.secondary }]}>Monthly</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{ marginLeft: -8, marginTop: 16 }}>
                    <LineChart
                      data={activeData.map((d: any) => ({
                        value: d.value ?? d.score,
                        label: d.label ?? d.day
                      }))}
                      width={CHART_W}
                      height={120}
                      spacing={CHART_W / (activeData.length + 1)}
                      initialSpacing={16}
                      color={theme.colors.plum}
                      thickness={3}
                      curved
                      dataPointsColor={theme.colors.plum}
                      dataPointsRadius={4}
                      yAxisColor={'transparent'}
                      xAxisColor={theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
                      hideYAxisText
                      maxValue={10}
                      noOfSections={5}
                      yAxisThickness={0}
                      rulesColor={theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                      xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 9, fontWeight: '700' }}
                      backgroundColor={'transparent'}
                    />
                  </View>

                  <View style={styles.trendSummaryRow}>
                    <View style={styles.trendStat}>
                      <Text style={[styles.trendStatNum, { color: theme.colors.plum }]}>{avgScore}</Text>
                      <Text style={[styles.trendStatLabel, { color: theme.colors.text.tertiary }]}>Avg Score</Text>
                    </View>
                    <View style={styles.trendDivider} />
                    <View style={styles.trendStat}>
                      <Text style={[styles.trendStatNum, { color: theme.colors.accents?.eucalyptus || '#34D399' }]}>
                        {activeData.filter((d: any) => (d.value ?? d.score) >= 7).length}
                      </Text>
                      <Text style={[styles.trendStatLabel, { color: theme.colors.text.tertiary }]}>Good Days</Text>
                    </View>
                    <View style={styles.trendDivider} />
                    <View style={styles.trendStat}>
                      <Text style={[styles.trendStatNum, { color: '#EAB308' }]}>
                        {bestDayName}
                      </Text>
                      <Text style={[styles.trendStatLabel, { color: theme.colors.text.tertiary }]}>Best Day</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* AI Insight Capsule - Evaluates actual mood logs to build support tips */}
            {(() => {
              let insightTitle = 'Emotional Reservoir Stable';
              let insightDesc = 'Keep checking in to build a clearer picture of your wellness trends.';
              let IconComponent = Lightbulb;
              let iconColor: string = theme.colors.plum;

              if (aiInsight) {
                insightTitle = aiInsight.title;
                insightDesc = aiInsight.description;
                const iconName = aiInsight.icon;
                if (iconName === 'Users') { IconComponent = Users; iconColor = theme.colors.accents.gentlePeach; }
                else if (iconName === 'Moon') { IconComponent = Moon; iconColor = theme.colors.accents.softLilac; }
                else if (iconName === 'Sun') { IconComponent = Sun; iconColor = theme.colors.accents.gentlePeach; }
                else if (iconName === 'Wind') { IconComponent = Wind; iconColor = theme.colors.accents.powderBlue; }
                else if (iconName === 'Activity') { IconComponent = Activity; iconColor = theme.colors.accents.terracotta; }
                else if (iconName === 'Brain') { IconComponent = Brain; iconColor = theme.colors.plum; }
                else if (iconName === 'Heart') { IconComponent = Heart; iconColor = theme.colors.accents.dustyRose; }
              }

              return (
                <View style={[styles.analysisCard, { backgroundColor: theme.colors.plum + '08', borderColor: theme.colors.plum + '20' }]}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                    <View style={{ marginTop: 2 }}>
                      <IconComponent size={32} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.analysisCardTitle, { color: theme.colors.plum }]}>{insightTitle}</Text>
                      <Text style={[styles.insightBannerText, { color: theme.colors.text.secondary, marginTop: 4, lineHeight: 20 }]}>{insightDesc}</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* Emotion Frequency */}
            {(() => {
              const freq: Record<string, number> = {};
              moodLogs.forEach((l: any) => { (l.emotions || []).forEach((e: string) => { freq[e] = (freq[e] || 0) + 1; }); });
              const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
              const max = sorted[0]?.[1] || 1;
              const totalFreq = Object.values(freq).reduce((a: any, b: any) => a + b, 0);
              const moodColors: Record<string, string> = { elated: '#EAB308', joyful: '#EC4899', calm: '#10B981', okay: '#14B8A6', neutral: '#64748B', tired: '#8B5CF6', anxious: '#475569', sad: '#3B82F6', stressed: '#EF4444' };
              if (sorted.length === 0) return null;
              return (
                <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.analysisCardTitle, { color: theme.colors.text.primary }]}>Emotion Frequency</Text>
                  <Text style={[styles.analysisCardSub, { color: theme.colors.text.tertiary }]}>Your most common emotional states</Text>
                  <View style={{ marginTop: 24, gap: 16 }}>
                    {sorted.map(([emotion, count], idx) => {
                      const color = moodColors[emotion] || theme.colors.plum;
                      const percentage = ((count as number) / (totalFreq as number) * 100).toFixed(0);
                      return (
                      <Animated.View key={emotion} entering={FadeInUp.delay(idx * 150).springify().mass(0.8)} style={{ backgroundColor: color + '08', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: color + '15' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: color + '15', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                            {getMoodIcon(emotion, 22, color)}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 17, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, marginBottom: 3 }}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
                            <Text style={{ fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary }}>{count} {count === 1 ? 'log' : 'logs'}</Text>
                          </View>
                          <View style={{ backgroundColor: color + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                            <Text style={{ color: color, fontFamily: theme.typography.fonts.header, fontSize: 13, fontWeight: '700' }}>{percentage}%</Text>
                          </View>
                        </View>
                        <View style={{ height: 8, borderRadius: 4, backgroundColor: color + '1A', overflow: 'hidden' }}>
                          <Animated.View style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: `${((count as number) / (max as number)) * 100}%` }} />
                        </View>
                      </Animated.View>
                    )})}
                  </View>
                </View>
              );
            })()}

            {/* Sleep vs Mood */}
            {(() => {
              const good = moodLogs.filter((l: any) => l.sleepQuality === 'good' || l.sleepQuality === 'great');
              const poor = moodLogs.filter((l: any) => l.sleepQuality === 'poor' || l.sleepQuality === 'bad');
              if (good.length === 0 && poor.length === 0) return null;
              const avgGood = good.length ? (good.reduce((a: number, l: any) => a + l.score, 0) / good.length).toFixed(1) : 'N/A';
              const avgPoor = poor.length ? (poor.reduce((a: number, l: any) => a + l.score, 0) / poor.length).toFixed(1) : 'N/A';
              return (
                <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.analysisCardTitle, { color: theme.colors.text.primary }]}>Sleep vs Mood</Text>
                  <Text style={[styles.analysisCardSub, { color: theme.colors.text.tertiary }]}>How sleep quality affects your emotional state</Text>
                  <View style={styles.sleepGrid}>
                    <View style={[styles.sleepCell, { backgroundColor: (theme.colors.accents?.eucalyptus || '#34D399') + '15' }]}>
                      <Sun size={28} color={theme.colors.accents?.eucalyptus || '#34D399'} style={{ marginBottom: 8 }} />
                      <Text style={[styles.sleepCellNum, { color: theme.colors.accents?.eucalyptus || '#34D399' }]}>{avgGood}</Text>
                      <Text style={[styles.sleepCellLabel, { color: theme.colors.text.tertiary }]}>Good Sleep</Text>
                      <Text style={[styles.sleepCellSub, { color: theme.colors.text.tertiary }]}>{good.length} nights</Text>
                    </View>
                    <View style={[styles.sleepCell, { backgroundColor: '#F8717115' }]}>
                      <Moon size={28} color="#F87171" style={{ marginBottom: 8 }} />
                      <Text style={[styles.sleepCellNum, { color: '#F87171' }]}>{avgPoor}</Text>
                      <Text style={[styles.sleepCellLabel, { color: theme.colors.text.tertiary }]}>Poor Sleep</Text>
                      <Text style={[styles.sleepCellSub, { color: theme.colors.text.tertiary }]}>{poor.length} nights</Text>
                    </View>
                  </View>
                  {good.length > 0 && poor.length > 0 && Number(avgGood) > Number(avgPoor) && (
                    <View style={[styles.insightBanner, { backgroundColor: theme.colors.plum + '10', flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                      <Lightbulb size={16} color={theme.colors.plum} />
                      <Text style={[styles.insightBannerText, { color: theme.colors.plum, flex: 1 }]}>You feel {(Number(avgGood) - Number(avgPoor)).toFixed(1)} points better on nights you sleep well.</Text>
                    </View>
                  )}
                </View>
              );
            })()}

            {/* Social Setting Impact */}
            {insights?.bestSocialSetting && (
              <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.analysisCardTitle, { color: theme.colors.text.primary }]}>Social Patterns</Text>
                <Text style={[styles.analysisCardSub, { color: theme.colors.text.tertiary }]}>Your mood across different social settings</Text>
                <View style={[styles.insightBanner, { backgroundColor: theme.colors.accents?.gentlePeach ? theme.colors.accents.gentlePeach + '15' : '#FDE68A20', marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                  <Lightbulb size={16} color={theme.colors.plum} />
                  <Text style={[styles.insightBannerText, { color: theme.colors.text.primary, flex: 1 }]}>You tend to feel best when <Text style={{ fontWeight: '900', color: theme.colors.plum }}>{insights.bestSocialSetting.setting}</Text>.</Text>
                </View>
              </View>
            )}

          </View>
        )}

      </ScrollView>

      {/* Privacy Location Modal */}
      <Modal visible={showLocationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <MapPin color={theme.colors.plum} size={32} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Campus Location Tracking</Text>
            <Text style={[styles.modalLabel, { color: theme.colors.text.secondary, lineHeight: 22, marginBottom: 24 }]}>
              We use this to suggest nearby resources. Only approximate campus locations (like "Dorm" or "Library") are stored, never exact GPS coordinates.
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => handleConsent(false)} style={[styles.saveBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', flex: 1 }]}>
                <Text style={[styles.saveBtnText, { color: theme.colors.text.primary }]}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => handleConsent(true)} style={[styles.saveBtn, { backgroundColor: theme.colors.plum, flex: 1 }]}>
                <Text style={[styles.saveBtnText, { color: '#FFF' }]}>Enable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Check In Modal */}
      <VideoCheckInModal
        visible={showVideoModal}
        theme={theme}
        onClose={() => setShowVideoModal(false)}
        onComplete={(metrics) => {
          setFacialMetrics(metrics);
          setShowVideoModal(false);
        }}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  headerGrid: { flexDirection: 'row', gap: 16, paddingHorizontal: 24, marginBottom: 24 },
  statsCard: { flex: 1, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statsIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statsVal: { fontSize: 24, fontFamily: theme.typography.fonts.header },
  statsLabel: { fontSize: 13, fontFamily: theme.typography.fonts.body, marginTop: 2 },
  cardContainer: { paddingHorizontal: 24, marginTop: 8 },
  glassCard: { borderRadius: 36, overflow: 'hidden', padding: 24, minHeight: 360, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  stepContainer: { flex: 1, width: '100%' },
  wizardHeader: { width: '100%', marginBottom: 20 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  wizardNav: { height: 32, justifyContent: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 14, fontFamily: theme.typography.fonts.header },
  stepTitle: { fontSize: 28, fontFamily: theme.typography.fonts.header, marginBottom: 8 },
  stepSub: { fontSize: 15, fontFamily: theme.typography.fonts.body, marginBottom: 16, lineHeight: 22 },
  qBox: { width: '100%', marginBottom: 24 },
  qText: { fontSize: 16, fontFamily: theme.typography.fonts.header, marginBottom: 12 },
  choiceRow: { flexDirection: 'row', gap: 12 },
  choiceBtn: { flex: 1, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  choiceTxt: { fontFamily: theme.typography.fonts.header, fontSize: 16 },
  nextBtn: { width: '100%', height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  nextBtnText: { color: '#FFF', fontSize: 17, fontFamily: theme.typography.fonts.header },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 20 },
  moodCol: { alignItems: 'center', width: (width - 96) / 5 },
  moodCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'solid' },
  moodText: { fontSize: 11, fontFamily: theme.typography.fonts.header, marginTop: 8, textAlign: 'center' },
  wheelContainer: { width: 270, height: 270, alignSelf: 'center', position: 'relative', marginVertical: 16 },
  wheelInnerBg: { width: 180, height: 180, borderRadius: 90, borderWidth: 1.5, borderStyle: 'dashed', position: 'absolute', top: 45, left: 45 },
  wheelCenter: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, position: 'absolute', top: 80, left: 80, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 } },
  wheelCenterLabel: { fontSize: 16, fontFamily: theme.typography.fonts.header },
  wheelCenterDesc: { fontSize: 11, fontFamily: theme.typography.fonts.body, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  wheelSegment: { width: 54, height: 54, borderRadius: 27, position: 'absolute' },
  mediaRow: { width: '100%', marginVertical: 16 },
  mediaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 16, width: '100%' },
  mediaBtnText: { fontSize: 14, fontFamily: theme.typography.fonts.header },
  playbackContainer: { flexDirection: 'row', gap: 8, width: '100%' },
  deleteAudioBtn: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(239, 68, 68, 0.2)' },
  streakCard: { alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 24, borderWidth: 1.5, marginTop: 24, width: '80%', alignSelf: 'center' },
  streakCount: { fontSize: 40, fontFamily: theme.typography.fonts.header, marginTop: 4 },
  streakLabel: { fontSize: 12, fontFamily: theme.typography.fonts.header, textTransform: 'uppercase', letterSpacing: 0.5 },
  envRow: { flexDirection: 'row', gap: 10, marginVertical: 20, alignSelf: 'flex-start' },
  envTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(128,128,128,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  envText: { fontSize: 12, fontFamily: theme.typography.fonts.header },
  journalBox: { width: '100%', marginBottom: 32 },
  noteInput: { minHeight: 80, borderBottomWidth: 1.5, paddingVertical: 12, fontSize: 16, fontFamily: theme.typography.fonts.body },
  plantBtn: { width: '100%', height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  successIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(52, 211, 153, 0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successTitle: { fontSize: 32, fontFamily: theme.typography.fonts.header, marginBottom: 12, textAlign: 'center' },
  successSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 26, paddingHorizontal: 20, fontFamily: theme.typography.fonts.body },

  historySection: { paddingHorizontal: 24, marginTop: 20 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  historyTitle: { fontSize: 22, fontFamily: theme.typography.fonts.header },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1, gap: 16 },
  moodIndicator: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  historyMood: { fontSize: 17, fontFamily: theme.typography.fonts.header },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  historyTime: { fontSize: 14, fontFamily: theme.typography.fonts.body },
  emptyHistory: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  // Analysis
  analysisSection: { paddingHorizontal: 24, marginTop: 40, paddingBottom: 40 },
  analysisSub: { fontSize: 13, fontFamily: theme.typography.fonts.body, marginBottom: 24 },
  analysisCard: { borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(128,128,128,0.08)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  analysisCardTitle: { fontSize: 17, fontFamily: theme.typography.fonts.header, letterSpacing: -0.3 },
  analysisCardSub: { fontSize: 12, fontFamily: theme.typography.fonts.body, marginTop: 3 },
  trendSummaryRow: { flexDirection: 'row', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.08)' },
  trendStat: { flex: 1, alignItems: 'center' },
  trendStatNum: { fontSize: 22, fontFamily: theme.typography.fonts.header },
  trendStatLabel: { fontSize: 10, fontFamily: theme.typography.fonts.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  trendDivider: { width: 1, backgroundColor: 'rgba(128,128,128,0.1)', marginVertical: 4 },
  freqRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  freqLabel: { flex: 1, fontSize: 14, fontFamily: theme.typography.fonts.header },
  freqCount: { fontSize: 12, fontFamily: theme.typography.fonts.header },
  freqBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.1)' },
  freqBarFill: { height: '100%', borderRadius: 3 },
  sleepGrid: { flexDirection: 'row', gap: 12, marginTop: 20 },
  sleepCell: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 4 },
  sleepCellNum: { fontSize: 24, fontFamily: theme.typography.fonts.header, marginTop: 4 },
  sleepCellLabel: { fontSize: 12, fontFamily: theme.typography.fonts.header, textTransform: 'uppercase', letterSpacing: 0.5 },
  sleepCellSub: { fontSize: 11, fontFamily: theme.typography.fonts.body, marginTop: 2 },
  insightBanner: { padding: 16, borderRadius: 20, marginTop: 12 },
  insightBannerText: { fontSize: 14, fontFamily: theme.typography.fonts.body, lineHeight: 20 },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  toggleContainer: { flexDirection: 'row', borderRadius: 20, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  toggleActiveBtn: { },
  toggleBtnText: { fontSize: 12, fontFamily: theme.typography.fonts.header },

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
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.body,
    textAlign: 'center',
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
  }
});
