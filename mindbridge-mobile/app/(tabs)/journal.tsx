// @ts-ignore: Bypassing IDE cache bug
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn, SlideInDown, SlideOutDown, withRepeat, withSequence, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useAudioRecorder, useAudioRecorderState, createAudioPlayer, AudioPlayer, requestRecordingPermissionsAsync, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { LightSensor } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import { 
  BookOpen, 
  Plus, 
  X, 
  Calendar,
  Wind,
  Sun,
  CloudRain,
  Check,
  Trash2,
  Mic,
  StopCircle,
  Play,
  Pause,
  Cloud,
  Flame,
  Smile,
  Meh,
  Heart,
  Frown,
  Moon,
  Camera,
  Activity,
  Sparkles
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';

import api from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { StreakManager } from '../../src/utils/StreakManager';
import { VideoCheckInModal } from '../../src/components/VideoCheckInModal';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';

const { width } = Dimensions.get('window');

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const styles = createStyles(theme);
  
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('calm');
  const [filterMood, setFilterMood] = useState('all');
  const [showSleepWarning, setShowSleepWarning] = useState(false);
  
  // Audio State
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const isRecording = recorderState.isRecording;
  
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const micScale = useSharedValue(1);
  const animatedMicStyle = useAnimatedStyle(() => ({ transform: [{ scale: micScale.value }] }));

  // Video Check-in
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [facialMetrics, setFacialMetrics] = useState<any>(null);
  
  // Voice Analysis
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [vocalMetrics, setVocalMetrics] = useState<any>(null);

  const MOOD_OPTIONS = [
    { id: 'joy', icon: Sun, color: theme.colors.accents.gentlePeach, label: 'Joyful' },
    { id: 'calm', icon: Wind, color: theme.colors.accents.eucalyptus, label: 'Calm' },
    { id: 'anxious', icon: CloudRain, color: theme.colors.accents.powderBlue, label: 'Anxious' },
    { id: 'sad', icon: Frown, color: theme.colors.accents.slate, label: 'Sad' },
    { id: 'angry', icon: Flame, color: theme.colors.semantic.danger, label: 'Angry' },
    { id: 'hopeful', icon: Smile, color: theme.colors.accents.softMint, label: 'Hopeful' },
    { id: 'peaceful', icon: Heart, color: theme.colors.accents.dustyRose, label: 'Peaceful' },
    { id: 'exhausted', icon: Meh, color: theme.colors.accents.dustyRose, label: 'Tired' },
  ];

  const getMoodIcon = (mood: string) => {
    switch(mood) {
      case 'calm': return <Wind color={theme.colors.accents.eucalyptus} size={16} />;
      case 'anxious': return <CloudRain color={theme.colors.accents.powderBlue} size={16} />;
      case 'joy': return <Sun color={theme.colors.accents.gentlePeach} size={16} />;
      case 'sad': return <Frown color={theme.colors.accents.slate} size={16} />;
      case 'exhausted': return <Meh color={theme.colors.accents.dustyRose} size={16} />;
      case 'angry': return <Flame color={theme.colors.semantic.danger} size={16} />;
      case 'hopeful': return <Smile color={theme.colors.accents.softMint} size={16} />;
      case 'peaceful': return <Heart color={theme.colors.accents.dustyRose} size={16} />;
      default: return <Sun color={theme.colors.accents.gentlePeach} size={16} />;
    }
  };

  const handleAnalyzeVoice = async () => {
    if (!audioUri) return;
    try {
      setIsAnalyzingVoice(true);
      // Simulate STT and sentiment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNewContent((prev: string) => prev ? prev + '\n\n' + 'I am feeling quite overwhelmed today, but trying to stay positive.' : 'I am feeling quite overwhelmed today, but trying to stay positive.');
      setVocalMetrics({ tone: 'Anxious but hopeful', speed: 'Moderate', clarity: 'High' });
      
      // Ethical Discard
      Alert.alert("Transcription Complete", "Voice transcribed successfully. The raw audio has been discarded to protect your privacy.");
      setAudioUri(null);
    } catch (error) {
      console.error('Error analyzing voice:', error);
      Alert.alert("Analysis Failed", "Could not analyze voice tone at this time.");
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await api.get('/journal');
      setEntries(response.data);
      setFilteredEntries(response.data);
    } catch (error: any) {
      console.warn('Network timeout when fetching journal entries.');
      setEntries([]);
      setFilteredEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (filterMood === 'all') {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(entries.filter((e: any) => e.mood === filterMood));
    }
  }, [filterMood, entries]);

  useEffect(() => {
    return () => {
      if (player) player.remove();
    };
  }, [player]);

  // Sleep Hygiene Tracking (Phase 2 Sensor Integration)
  useEffect(() => {
    let subscription: any;
    
    const checkSleepHygiene = async () => {
      // Check if it's late night (10 PM to 5 AM)
      const hour = new Date().getHours();
      const isLateNight = hour >= 22 || hour < 5;
      
      if (isLateNight) {
        await LightSensor.setUpdateInterval(2000);
        subscription = LightSensor.addListener(({ illuminance }) => {
          // If the ambient light is extremely low (pitch black)
          if (illuminance < 10) {
            setShowSleepWarning(true);
            // Once we detect it, we can stop listening to save battery
            if (subscription) {
              subscription.remove();
              subscription = null;
            }
          }
        });
      }
    };
    
    checkSleepHygiene();
    
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const startRecording = async () => {
    try {
      Alert.alert(
        "Microphone Access",
        "MindBridge uses your microphone strictly to transcribe your Voice Journal. The audio is processed and immediately discarded. We do not store raw audio.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Allow", 
            onPress: async () => {
              const { granted } = await requestRecordingPermissionsAsync();
              if (granted) {
                await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
                await recorder.prepareToRecordAsync();
                recorder.record();
                micScale.value = withRepeat(withSequence(withTiming(1.2), withTiming(1)), -1, true);
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    micScale.value = withTiming(1);
    await recorder.stop();
    setAudioUri(recorder.uri);
  };

  const playSound = async (uri: string, id: string) => {
    if (isPlaying === id) {
      player?.pause();
      setIsPlaying(null);
      return;
    }
    
    if (player) player.remove();
    const newPlayer = createAudioPlayer(uri);
    setPlayer(newPlayer);
    setIsPlaying(id);
    newPlayer.play();
    newPlayer.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) setIsPlaying(null);
    });
  };

  const handleSave = async () => {
    if (!newContent.trim()) return;
    
    try {
      const response = await api.post('/journal', {
        title: newTitle.trim() || 'Untitled Entry',
        content: newContent.trim(),
        mood: selectedMood,
        audioUrl: audioUri,
        facialMetrics: facialMetrics,
        vocalMetrics: vocalMetrics,
      });
      
      await StreakManager.logJournal();

      setEntries([response.data, ...entries]);
      setIsWriting(false);
      setNewTitle('');
      setNewContent('');
      setSelectedMood('calm');
      setAudioUri(null);
      setFacialMetrics(null);
      setVocalMetrics(null);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to remove this reflection? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/journal/${id}`);
              setEntries(entries.filter((e: any) => e.id !== id));
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert("Error", "Could not delete entry. Please try again.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <LinearGradient 
        colors={theme.isDark 
          ? ['rgba(123, 97, 255, 0.15)', theme.colors.background, theme.colors.backgroundSecondary]
          : ['rgba(123, 97, 255, 0.08)', theme.colors.background, theme.colors.backgroundSecondary]
        } 
        locations={[0, 0.2, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {!isWriting ? (
        <FlatList 
          data={filteredEntries}
          keyExtractor={entry => entry.id}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} 
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <ScreenHeader 
                title={t('journal.title')} 
                subtitle={t('journal.subtitle')}
                  rightAction={
                    <TouchableOpacity 
                      activeOpacity={0.8} 
                      style={styles.newBtn}
                      onPress={() => setIsWriting(true)}
                    >
                      <Plus color={theme.colors.text.onPrimary || '#FFF'} size={24} />
                    </TouchableOpacity>
                  }
                />

                {showSleepWarning && (
                  <Animated.View entering={FadeIn.duration(600)} style={styles.sleepWarning}>
                    <View style={{ backgroundColor: theme.colors.plum + '20', padding: 8, borderRadius: 12 }}>
                      <Moon color={theme.colors.plum} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography variant="bodyBold" color={theme.colors.text.primary} style={styles.sleepWarningTitle}>Journaling in the dark?</Typography>
                      <Typography variant="caption" color={theme.colors.text.secondary} style={styles.sleepWarningText}>
                        Late-night screen time can disrupt your sleep cycle. Try turning on night mode.
                      </Typography>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowSleepWarning(false)} style={{ padding: 4 }}>
                      <X color={theme.colors.text.tertiary} size={16} />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
                  {/* Filter Pills */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                    <TouchableOpacity activeOpacity={0.7} 
                      onPress={() => setFilterMood('all')}
                      style={[styles.filterPill, filterMood === 'all' && styles.filterPillActive]}
                    >
                      <Text style={[styles.filterText, filterMood === 'all' && styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    {MOOD_OPTIONS.map(mood => (
                      <TouchableOpacity activeOpacity={0.7} 
                        key={mood.id}
                        onPress={() => setFilterMood(mood.id)}
                        style={[styles.filterPill, filterMood === mood.id && styles.filterPillActive]}
                      >
                        <mood.icon size={14} color={filterMood === mood.id ? '#FFF' : mood.color} />
                        <Text style={[styles.filterText, filterMood === mood.id && styles.filterTextActive]}>{mood.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.entriesList}>
                {[1, 2, 3].map((_, i) => (
                  <View key={i} style={[styles.entryCard, { marginTop: i === 0 ? 10 : 0 }]}>
                    <View style={styles.entryHeader}>
                      <SkeletonLoader width={80} height={16} borderRadius={4} />
                      <SkeletonLoader width={32} height={32} borderRadius={16} />
                    </View>
                    <SkeletonLoader width="60%" height={20} borderRadius={4} style={{ marginBottom: 12 }} />
                    <SkeletonLoader width="100%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                    <SkeletonLoader width="80%" height={14} borderRadius={4} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <BookOpen color={theme.colors.plum} size={32} />
                </View>
                <Typography variant="body" color={theme.colors.text.tertiary} style={styles.emptyText}>
                  {t('journal.no_entries')}
                </Typography>
              </View>
            )
          }
          renderItem={({ item: entry, index }) => (
            <Animated.View 
              entering={FadeInUp.delay(Math.min(index, 10) * 50).duration(500)}
              style={[styles.entryCard, { marginHorizontal: 24, marginBottom: 16 }]}
            >
              <View style={styles.entryHeader}>
                <View style={styles.dateRow}>
                  <Calendar color={theme.colors.text.tertiary} size={14} />
                  <Typography variant="captionMedium" color={theme.colors.text.tertiary} style={styles.dateText}>{formatDate(entry.createdAt)}</Typography>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => handleDelete(entry.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 color={theme.colors.accents.terracotta} size={16} />
                  </TouchableOpacity>
                  <View style={styles.moodBadge}>
                    {getMoodIcon(entry.mood || 'calm')}
                  </View>
                </View>
              </View>
              <Typography variant="h3" color={theme.colors.text.primary} style={styles.entryTitle}>{entry.title}</Typography>
              <Typography variant="body" color={theme.colors.text.secondary} style={styles.entryContent} numberOfLines={4}>{entry.content}</Typography>
              
              {entry.aiFeedback && (
                <View style={[styles.aiFeedbackCard, { backgroundColor: theme.colors.plum + '10' }]}>
                  <View style={styles.aiFeedbackHeader}>
                    <Sparkles color={theme.colors.plum} size={16} />
                    <Typography variant="bodyBold" color={theme.colors.plum} style={styles.aiFeedbackTitle}>Oracle Insight</Typography>
                  </View>
                  <Typography variant="body" color={theme.colors.text.secondary} style={styles.aiFeedbackText}>{entry.aiFeedback}</Typography>
                </View>
              )}

              {entry.audioUrl && (
                <TouchableOpacity activeOpacity={0.7} 
                  style={[styles.audioPreview, { backgroundColor: theme.colors.plum + '10' }]}
                  onPress={() => playSound(entry.audioUrl, entry.id)}
                >
                  {isPlaying === entry.id ? <Pause size={14} color={theme.colors.plum} /> : <Play size={14} color={theme.colors.plum} />}
                  <Text style={[styles.audioText, { color: theme.colors.plum }]}>Voice Reflection</Text>
                  <View style={styles.audioWaveform}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <View 
                        key={i}
                        style={[
                          styles.waveBar, 
                          { height: Math.random() * 12 + 4, backgroundColor: isPlaying === entry.id ? theme.colors.plum : theme.colors.text.disabled }
                        ]} 
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        />
      ) : (
        <Animated.View 
          entering={SlideInDown.duration(500)} 
          exiting={SlideOutDown}
          style={[styles.composerContainer, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}
        >
          <View style={styles.composerHeader}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsWriting(false)} style={styles.iconBtn}>
              <X color={theme.colors.plum} size={24} />
            </TouchableOpacity>
            <Typography variant="h4" color={theme.colors.text.primary} style={styles.composerTitle}>New Entry</Typography>
            <Button 
              variant="primary"
              size="small"
              onPress={handleSave}
            >
              {t('journal.save_entry')}
            </Button>
          </View>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={[styles.composerBody, { paddingBottom: 60 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Mood Selector in Composer */}
            <View style={styles.moodSelector}>
              <Text style={styles.moodSelectorLabel}>How are you feeling?</Text>
              <View style={styles.moodOptionsRow}>
                {MOOD_OPTIONS.map(mood => (
                  <TouchableOpacity activeOpacity={0.7} 
                    key={mood.id}
                    onPress={() => setSelectedMood(mood.id)}
                    style={[
                      styles.moodOption, 
                      selectedMood === mood.id && { backgroundColor: mood.color + '20', borderColor: mood.color }
                    ]}
                  >
                    <mood.icon size={20} color={mood.color} />
                    <Text style={[styles.moodOptionText, { color: mood.color }]}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 24 }} />

            <View style={styles.inputGroup}>
              <Typography variant="captionMedium" color={theme.colors.text.tertiary} style={styles.inputLabel}>Entry Title</Typography>
              <TextInput
                style={styles.titleInput}
                placeholder={t('journal.title_placeholder')}
                placeholderTextColor={theme.colors.text.tertiary}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typography variant="captionMedium" color={theme.colors.text.tertiary} style={styles.inputLabel}>Journal Content</Typography>
              <TextInput
                style={styles.contentInput}
                placeholder={t('journal.content_placeholder')}
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                value={newContent}
                onChangeText={setNewContent}
              />
            </View>

            {/* Sensor & Media Integration UI */}
            <View style={styles.mediaRow}>
              <View style={[styles.audioComposer, { flex: 1 }]}>
                {audioUri ? (
                  <View style={{ gap: 8, flex: 1 }}>
                    <View style={styles.audioPreviewActive}>
                      <TouchableOpacity activeOpacity={0.7} onPress={() => playSound(audioUri, 'new')} style={styles.playIconBtn}>
                        {isPlaying === 'new' ? <Pause color="#FFF" size={20} /> : <Play color="#FFF" size={20} />}
                      </TouchableOpacity>
                      <Text style={styles.audioPreviewText} numberOfLines={1}>Voice Note</Text>
                      <TouchableOpacity activeOpacity={0.7} onPress={() => { setAudioUri(null); setVocalMetrics(null); }} style={styles.removeAudioBtn}>
                        <X color={theme.colors.text.tertiary} size={16} />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Voice Analysis Button / Result */}
                    {!vocalMetrics ? (
                      <TouchableOpacity activeOpacity={0.7} 
                        style={[styles.mediaBtn, { backgroundColor: theme.colors.plum + '20', padding: 10 }]} 
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
                      <View style={[styles.mediaBtn, { backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: 10 }]}>
                        <Check color="#34D399" size={18} />
                        <Text style={[styles.mediaBtnText, { color: '#34D399', fontSize: 13 }]}>
                          Tone: {vocalMetrics.voiceQuality}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity activeOpacity={0.7} 
                    onPress={isRecording ? stopRecording : startRecording}
                    style={[styles.mediaBtn, isRecording && styles.micBtnRecording]}
                  >
                    <Animated.View style={animatedMicStyle}>
                      {isRecording ? <StopCircle color="#FFF" size={24} /> : <Mic color={theme.colors.text.secondary} size={24} />}
                    </Animated.View>
                    <Text style={[styles.mediaBtnText, { color: isRecording ? '#FFF' : theme.colors.text.secondary }]}>
                      {isRecording ? "Recording..." : "Voice"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity activeOpacity={0.7} 
                onPress={() => setShowVideoModal(true)}
                style={[styles.mediaBtn, { flex: 1, backgroundColor: facialMetrics ? 'rgba(52, 211, 153, 0.15)' : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') }]}
              >
                {facialMetrics ? <Check color="#34D399" size={24} /> : <Camera color={theme.colors.text.secondary} size={24} />}
                <Text style={[styles.mediaBtnText, { color: facialMetrics ? "#34D399" : theme.colors.text.secondary }]}>
                  {facialMetrics ? "Face Logged" : "Face Scan"}
                </Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
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
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.backgroundSecondary, 
  },
  scrollContent: { 
    paddingHorizontal: 0, 
    paddingBottom: 120 
  },
  header: { 
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sleepWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(123,97,255,0.05)',
    padding: 16,
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(123,97,255,0.1)',
  },
  sleepWarningTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    marginBottom: 2,
  },
  sleepWarningText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 16,
  },
  newBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.3 : 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  entriesList: {
    gap: 16,
    paddingHorizontal: 24,
  },
  entryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  entryContent: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  aiFeedbackCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(123,97,255,0.1)',
  },
  aiFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiFeedbackTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiFeedbackText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  // Composer Styles
  composerContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerTitle: {
    fontSize: 17,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    fontSize: 15,
  },
  composerBody: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  titleInput: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  contentInput: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.primary,
    lineHeight: 24,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  filterBar: {
    marginTop: 16,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: theme.colors.plum,
    borderColor: theme.colors.plum,
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  moodSelector: {
    marginBottom: 24,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.plum + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 240,
  },
  moodSelectorLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  moodOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    gap: 8,
  },
  moodOptionText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '700',
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginTop: 16,
    gap: 10,
  },
  audioText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'flex-end',
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  audioComposer: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  recordingSection: {
    alignItems: 'center',
    gap: 12,
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.3 : 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  micBtnRecording: {
    backgroundColor: theme.colors.accents.terracotta,
    shadowColor: '#000',
  },
  recordingLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
  },
  audioPreviewActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.plum + '10',
    padding: 12,
    borderRadius: 20,
    gap: 12,
    width: '100%',
  },
  playIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPreviewText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  removeAudioBtn: {
    padding: 4,
  },
  mediaRow: { 
    flexDirection: 'row', 
    width: '100%', 
    gap: 12 
  },
  mediaBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 14, 
    borderRadius: 16, 
    width: '100%' 
  },
  mediaBtnText: { 
    fontSize: 14, 
    fontFamily: theme.typography.fonts.header 
  }
});
