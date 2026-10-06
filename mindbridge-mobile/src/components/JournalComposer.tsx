import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X, Play, Pause, Activity, Check, Camera, Mic, StopCircle, Wind, Sun, CloudRain, Frown, Meh, Flame, Smile, Heart } from 'lucide-react-native';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';

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

const MoodSelector = memo(({ selectedMood, onSelectMood, theme, styles }: any) => {
  return (
    <View style={styles.moodSelector}>
      <Text style={styles.moodSelectorLabel}>How are you feeling?</Text>
      <View style={styles.moodOptionsRow}>
        {MOOD_OPTIONS.map(mood => (
          <TouchableOpacity activeOpacity={0.7} key={mood.id} onPress={() => onSelectMood(mood.id)}
            style={[
              styles.moodOption,
              selectedMood === mood.id && { backgroundColor: theme.colors.plum + '20', borderColor: theme.colors.plum }
            ]}>
            <mood.icon size={20} color={selectedMood === mood.id ? theme.colors.plum : theme.colors.text.secondary} />
            <Text style={[styles.moodOptionText, { color: selectedMood === mood.id ? theme.colors.plum : theme.colors.text.secondary }]}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

export const JournalComposer = memo(({ 
  theme, 
  insets, 
  onSave, 
  onCancel, 
  audioUri, 
  isPlaying, 
  isRecording, 
  micScale, 
  startRecording, 
  stopRecording, 
  playSound, 
  resetAudio,
  facialMetrics,
  vocalMetrics,
  onOpenFaceScan,
  onAnalyzeVoice,
  isAnalyzingVoice
}: any) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = theme;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('calm');

  const handleSave = useCallback(() => {
    onSave({ title, content, mood: selectedMood });
  }, [onSave, title, content, selectedMood]);

  const handleSelectMood = useCallback((id: string) => {
    setSelectedMood(id);
  }, []);

  return (
    <Animated.View
      entering={SlideInDown.duration(500)}
      exiting={SlideOutDown}
      style={[styles.composerContainer, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}
    >
      <View style={styles.composerHeader}>
        <TouchableOpacity activeOpacity={0.7} onPress={onCancel} style={styles.iconBtn}>
          <X color={theme.colors.plum} size={24} />
        </TouchableOpacity>
        <Typography variant="h4" color={theme.colors.text.primary} style={styles.composerTitle}>New Entry</Typography>
        <Button variant="primary" size="small" fullWidth={false} onPress={handleSave}>{t('journal.save_entry')}</Button>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.composerBody, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <MoodSelector 
            selectedMood={selectedMood} 
            onSelectMood={handleSelectMood} 
            theme={theme} 
            styles={styles} 
          />

          <View style={{ height: 24 }} />

          <View style={styles.inputGroup}>
            <Typography variant="captionMedium" color={theme.colors.text.tertiary} style={styles.inputLabel}>Entry Title</Typography>
            <TextInput
              style={styles.titleInput}
              placeholder={t('journal.title_placeholder')}
              placeholderTextColor={theme.colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="captionMedium" color={theme.colors.text.tertiary} style={styles.inputLabel}>Journal Content</Typography>
            <TextInput
              style={styles.contentInput}
              placeholder={t('journal.content_placeholder')}
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              value={content}
              onChangeText={setContent}
            />
          </View>

          <View style={styles.mediaRow}>
            <View style={[styles.audioComposer, { flex: 1 }]}>
              {audioUri ? (
                <View style={{ gap: 8, flex: 1 }}>
                  <View style={styles.audioPreviewActive}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => playSound(audioUri, 'new')} style={styles.playIconBtn}>
                      {isPlaying === 'new' ? <Pause color="#FFF" size={20} /> : <Play color="#FFF" size={20} />}
                    </TouchableOpacity>
                    <Text style={styles.audioPreviewText} numberOfLines={1}>Voice Note</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={resetAudio} style={styles.removeAudioBtn}>
                      <X color={theme.colors.text.tertiary} size={16} />
                    </TouchableOpacity>
                  </View>

                  {!vocalMetrics ? (
                    <TouchableOpacity activeOpacity={0.7} style={[styles.mediaBtn, { backgroundColor: theme.colors.plum + '20', padding: 10 }]} onPress={onAnalyzeVoice} disabled={isAnalyzingVoice}>
                      {isAnalyzingVoice ? <ActivityIndicator size="small" color={theme.colors.plum} /> : <>
                        <Activity color={theme.colors.plum} size={18} />
                        <Text style={[styles.mediaBtnText, { color: theme.colors.plum, fontSize: 13 }]}>Analyze Tone</Text>
                      </>}
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.mediaBtn, { backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: 10 }]}>
                      <Check color="#34D399" size={18} />
                      <Text style={[styles.mediaBtnText, { color: '#34D399', fontSize: 13 }]}>Tone: {vocalMetrics.voiceQuality}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity activeOpacity={0.7} onPress={isRecording ? stopRecording : startRecording} style={[styles.mediaBtn, isRecording && styles.micBtnRecording]}>
                  <Animated.View style={{ transform: [{ scale: micScale.value }] }}>
                    {isRecording ? <StopCircle color="#FFF" size={24} /> : <Mic color={theme.colors.text.secondary} size={24} />}
                  </Animated.View>
                  <Text style={[styles.mediaBtnText, { color: isRecording ? '#FFF' : theme.colors.text.secondary }]}>{isRecording ? "Recording..." : "Voice"}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={onOpenFaceScan} style={[styles.mediaBtn, { flex: 1, backgroundColor: facialMetrics ? 'rgba(52, 211, 153, 0.15)' : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') }]}>
              {facialMetrics ? <Check color="#34D399" size={24} /> : <Camera color={theme.colors.text.secondary} size={24} />}
              <Text style={[styles.mediaBtnText, { color: facialMetrics ? "#34D399" : theme.colors.text.secondary }]}>{facialMetrics ? "Face Logged" : "Face Scan"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
});

const createStyles = (theme: any) => StyleSheet.create({
  composerContainer: { flex: 1, backgroundColor: theme.colors.surface },
  composerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  composerTitle: { fontSize: 17, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.primary },
  composerBody: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 },
  inputGroup: { gap: 8, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontFamily: theme.typography.fonts.accent, fontWeight: '700', color: theme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 },
  titleInput: { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 16, padding: 16, fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.primary, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  contentInput: { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 16, padding: 16, minHeight: 200, fontSize: 16, fontFamily: theme.typography.fonts.body, color: theme.colors.text.primary, lineHeight: 24, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  moodSelector: { marginBottom: 24 },
  moodSelectorLabel: { fontSize: 13, fontFamily: theme.typography.fonts.accent, fontWeight: '700', color: theme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  moodOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moodOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', gap: 8 },
  moodOptionText: { fontSize: 14, fontFamily: theme.typography.fonts.body, fontWeight: '700' },
  audioComposer: { marginTop: 32, marginBottom: 20, alignItems: 'center', paddingVertical: 24, borderRadius: 24, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderStyle: 'dashed' },
  micBtnRecording: { backgroundColor: theme.colors.accents.terracotta, shadowColor: '#000' },
  audioPreviewActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.plum + '10', padding: 12, borderRadius: 20, gap: 12, width: '100%' },
  playIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.plum, alignItems: 'center', justifyContent: 'center' },
  audioPreviewText: { flex: 1, fontSize: 14, fontFamily: theme.typography.fonts.body, fontWeight: '600', color: theme.colors.text.primary },
  removeAudioBtn: { padding: 4 },
  mediaRow: { flexDirection: 'row', width: '100%', gap: 12 },
  mediaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 16, width: '100%' },
  mediaBtnText: { fontSize: 14, fontFamily: theme.typography.fonts.header }
});
