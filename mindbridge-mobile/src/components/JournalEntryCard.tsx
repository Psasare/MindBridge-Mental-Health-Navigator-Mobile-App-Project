import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Calendar, Trash2, Wind, Sun, CloudRain, Frown, Meh, Flame, Smile, Heart, Sparkles, Play, Pause } from 'lucide-react-native';
import { Typography } from './ui/Typography';

const getMoodIcon = (mood: string, colors: any) => {
  switch (mood) {
    case 'calm': return <Wind color={colors.accents.eucalyptus} size={16} />;
    case 'anxious': return <CloudRain color={colors.accents.powderBlue} size={16} />;
    case 'joy': return <Sun color={colors.accents.gentlePeach} size={16} />;
    case 'sad': return <Frown color={colors.accents.slate} size={16} />;
    case 'exhausted': return <Meh color={colors.accents.dustyRose} size={16} />;
    case 'angry': return <Flame color={colors.semantic.danger} size={16} />;
    case 'hopeful': return <Smile color={colors.accents.softMint} size={16} />;
    case 'peaceful': return <Heart color={colors.accents.dustyRose} size={16} />;
    default: return <Sun color={colors.accents.gentlePeach} size={16} />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

interface JournalEntryCardProps {
  entry: any;
  index: number;
  theme: any;
  onDelete: (id: string) => void;
  isPlaying: boolean;
  onPlaySound: (url: string, id: string) => void;
}

export const JournalEntryCard = memo(({ entry, index, theme, onDelete, isPlaying, onPlaySound }: JournalEntryCardProps) => {
  const styles = createStyles(theme);

  return (
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
          <TouchableOpacity activeOpacity={0.7} onPress={() => onDelete(entry.id)} style={styles.deleteBtn}>
            <Trash2 color={theme.colors.accents.terracotta} size={16} />
          </TouchableOpacity>
          <View style={styles.moodBadge}>
            {getMoodIcon(entry.mood || 'calm', theme.colors)}
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
          onPress={() => onPlaySound(entry.audioUrl, entry.id)}
        >
          {isPlaying ? <Pause size={14} color={theme.colors.plum} /> : <Play size={14} color={theme.colors.plum} />}
          <Text style={[styles.audioText, { color: theme.colors.plum }]}>Voice Reflection</Text>
          <View style={styles.audioWaveform}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: Math.random() * 12 + 4, backgroundColor: isPlaying ? theme.colors.plum : theme.colors.text.disabled }
                ]}
              />
            ))}
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return prevProps.entry.id === nextProps.entry.id && 
         prevProps.isPlaying === nextProps.isPlaying && 
         prevProps.theme.isDark === nextProps.theme.isDark;
});

const createStyles = (theme: any) => StyleSheet.create({
  entryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.1 : 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, fontFamily: theme.typography.fonts.accent, fontWeight: '600', color: theme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  moodBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  entryTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 8, letterSpacing: -0.3 },
  entryContent: { fontSize: 15, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, lineHeight: 22 },
  aiFeedbackCard: { marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(123,97,255,0.1)' },
  aiFeedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiFeedbackTitle: { fontSize: 13, fontFamily: theme.typography.fonts.header, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  aiFeedbackText: { fontSize: 14, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, lineHeight: 20 },
  audioPreview: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginTop: 16, gap: 10 },
  audioText: { fontSize: 13, fontFamily: theme.typography.fonts.header, fontWeight: '700' },
  audioWaveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: 'flex-end' },
  waveBar: { width: 2, borderRadius: 1 },
});
