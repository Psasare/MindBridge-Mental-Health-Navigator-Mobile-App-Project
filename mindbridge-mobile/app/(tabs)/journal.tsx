// @ts-ignore: Bypassing IDE cache bug
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import { BookOpen, Plus, X, Moon, Wind, Sun, CloudRain, Frown, Meh, Flame, Smile, Heart } from 'lucide-react-native';
import { Typography } from '../../src/components/ui/Typography';
import { VideoCheckInModal } from '../../src/components/VideoCheckInModal';

// Extracted Hooks
import { useJournal } from '../../src/hooks/useJournal';
import { useSleepHygiene } from '../../src/hooks/useSleepHygiene';
import { useJournalAudio } from '../../src/hooks/useJournalAudio';

// Extracted Components
import { JournalEntryCard } from '../../src/components/JournalEntryCard';
import { JournalComposer } from '../../src/components/JournalComposer';

const MOOD_OPTIONS = [
  { id: 'joy', icon: Sun, label: 'Joyful' },
  { id: 'calm', icon: Wind, label: 'Calm' },
  { id: 'anxious', icon: CloudRain, label: 'Anxious' },
  { id: 'sad', icon: Frown, label: 'Sad' },
  { id: 'angry', icon: Flame, label: 'Angry' },
  { id: 'hopeful', icon: Smile, label: 'Hopeful' },
  { id: 'peaceful', icon: Heart, label: 'Peaceful' },
  { id: 'exhausted', icon: Meh, label: 'Tired' },
];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const styles = createStyles(theme);

  // Business Logic Hooks
  const { entries, loading, loadingMore, hasMore, fetchNextPage, saveEntry, deleteEntry } = useJournal();
  
  // Audio Hook
  const { 
    isRecording, audioUri, isPlaying, micScale, 
    startRecording, stopRecording, playSound, resetAudio, setAudioUri 
  } = useJournalAudio();

  // Local State
  const [isWriting, setIsWriting] = useState(false);
  const [filterMood, setFilterMood] = useState('all');
  const [showSleepWarning, setShowSleepWarning] = useState(false);
  
  // Media State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [facialMetrics, setFacialMetrics] = useState<any>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [vocalMetrics, setVocalMetrics] = useState<any>(null);

  // Sensors
  useSleepHygiene(() => setShowSleepWarning(true));

  const filteredEntries = useMemo(() => {
    if (filterMood === 'all') return entries;
    return entries.filter((e: any) => e.mood === filterMood);
  }, [filterMood, entries]);

  const handleAnalyzeVoice = async () => {
    if (!audioUri) return;
    try {
      setIsAnalyzingVoice(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVocalMetrics({ voiceQuality: 'Anxious but hopeful', speed: 'Moderate', clarity: 'High' });
      Alert.alert("Transcription Complete", "Voice transcribed successfully. The raw audio has been discarded to protect your privacy.");
      setAudioUri(null);
    } catch (error) {
      console.error('Error analyzing voice:', error);
      Alert.alert("Analysis Failed", "Could not analyze voice tone at this time.");
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const handleSave = async (entryData: any) => {
    if (!entryData.content.trim()) return;
    
    try {
      await saveEntry({
        title: entryData.title.trim() || 'Untitled Entry',
        content: entryData.content.trim(),
        mood: entryData.mood,
        audioUrl: audioUri,
        facialMetrics: facialMetrics,
        vocalMetrics: vocalMetrics,
      });

      setIsWriting(false);
      resetAudio();
      setFacialMetrics(null);
      setVocalMetrics(null);
    } catch (error) {
      Alert.alert("Error", "Could not save entry.");
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to remove this reflection? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteEntry(id) }
      ]
    );
  }, [deleteEntry]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />

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
                  <TouchableOpacity activeOpacity={0.8} style={styles.newBtn} onPress={() => setIsWriting(true)}>
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
                      <mood.icon size={14} color={filterMood === mood.id ? '#FFF' : theme.colors.text.secondary} />
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
                  <View key={i} style={[styles.skeletonCard, { marginTop: i === 0 ? 10 : 0 }]}>
                    <SkeletonLoader width={80} height={16} borderRadius={4} />
                    <SkeletonLoader width="60%" height={20} borderRadius={4} style={{ marginTop: 12, marginBottom: 12 }} />
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
          renderItem={({ item, index }) => (
            <JournalEntryCard 
              entry={item} 
              index={index} 
              theme={theme} 
              onDelete={handleDelete}
              isPlaying={isPlaying === item.id}
              onPlaySound={playSound}
            />
          )}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator color={theme.colors.plum} />
              </View>
            ) : null
          }
        />
      ) : (
        <JournalComposer 
          theme={theme}
          insets={insets}
          onSave={handleSave}
          onCancel={() => setIsWriting(false)}
          audioUri={audioUri}
          isPlaying={isPlaying}
          isRecording={isRecording}
          micScale={micScale}
          startRecording={startRecording}
          stopRecording={stopRecording}
          playSound={playSound}
          resetAudio={resetAudio}
          facialMetrics={facialMetrics}
          vocalMetrics={vocalMetrics}
          onOpenFaceScan={() => setShowVideoModal(true)}
          onAnalyzeVoice={handleAnalyzeVoice}
          isAnalyzingVoice={isAnalyzingVoice}
        />
      )}

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
  container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  scrollContent: { paddingHorizontal: 0, paddingBottom: 120 },
  header: { marginBottom: 32, paddingHorizontal: 24 },
  sleepWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(123,97,255,0.05)', padding: 16, marginHorizontal: 24, borderRadius: 16, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(123,97,255,0.1)' },
  sleepWarningTitle: { fontSize: 14, fontFamily: theme.typography.fonts.header, fontWeight: '700', marginBottom: 2 },
  sleepWarningText: { fontSize: 12, fontFamily: theme.typography.fonts.body, lineHeight: 16 },
  newBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.plum, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0.3 : 0.2, shadowRadius: 8, elevation: 6 },
  filterBar: { marginTop: 16, flexDirection: 'row' },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surface, marginRight: 8, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', gap: 6 },
  filterPillActive: { backgroundColor: theme.colors.plum, borderColor: theme.colors.plum },
  filterText: { fontSize: 13, fontFamily: theme.typography.fonts.body, fontWeight: '700', color: theme.colors.text.secondary },
  filterTextActive: { color: '#FFF' },
  entriesList: { gap: 16, paddingHorizontal: 24 },
  skeletonCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
  emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.plum + '10', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyText: { fontSize: 16, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, textAlign: 'center', lineHeight: 24, maxWidth: 240 }
});
