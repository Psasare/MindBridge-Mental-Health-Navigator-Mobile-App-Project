import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, Clock, Flame, Calendar, Trophy } from 'lucide-react-native';

const INITIAL_TASKS = [
  { id: '1', title: 'Morning Reflection', time: '08:00 AM', completed: true, points: 10, category: 'Mind' },
  { id: '2', title: 'Stay Hydrated (2L)', time: 'Throughout day', completed: false, points: 5, category: 'Body' },
  { id: '3', title: 'Quick Breathing', time: '12:00 PM', completed: false, points: 15, category: 'Self-Care' },
  { id: '4', title: '30min Walk', time: '05:00 PM', completed: false, points: 20, category: 'Body' },
  { id: '5', title: 'Gratitude Journal', time: '09:00 PM', completed: false, points: 10, category: 'Mind' },
];

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const styles = createStyles(theme);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;
  const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
          <Text style={styles.title}>{t('journey.title')}</Text>
          <Text style={styles.subtitle}>{t('journey.subtitle')}, {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</Text>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: theme.colors.accents.gentlePeach + '30' }]}>
                <Flame color={theme.colors.accents.gentlePeach} size={20} />
              </View>
              <Text style={styles.statVal} numberOfLines={1} adjustsFontSizeToFit>4 Day</Text>
              <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{t('journey.streak')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: theme.colors.accents.powderBlue + '30' }]}>
                <Trophy color={theme.colors.accents.powderBlue} size={20} />
              </View>
              <Text style={styles.statVal} numberOfLines={1} adjustsFontSizeToFit>{totalPoints}</Text>
              <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{t('journey.points')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: theme.colors.accents.eucalyptus + '30' }]}>
                <CheckCircle2 color={theme.colors.accents.eucalyptus} size={20} />
              </View>
              <Text style={styles.statVal} numberOfLines={1} adjustsFontSizeToFit>{completedCount}/{tasks.length}</Text>
              <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{t('journey.done')}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <Animated.View 
                layout={Layout.springify()}
                style={[styles.progressBarFill, { width: `${progress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}% {t('journey.progress_label')}</Text>
          </View>
        </Animated.View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>{t('journey.daily_plan')}</Text>
          
          {tasks.map((task, index) => (
            <Animated.View 
              key={task.id} 
              entering={FadeInUp.delay(300 + index * 100).duration(600)}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <Text style={styles.timeText}>{task.time}</Text>
                <View style={[styles.timelineLine, index === tasks.length - 1 && { height: 20 }]} />
                <TouchableOpacity activeOpacity={0.7} 
                  onPress={() => toggleTask(task.id)}
                  style={styles.dotContainer}
                >
                  {task.completed ? (
                    <View style={[styles.dot, styles.dotCompleted]}>
                      <CheckCircle2 color="#FFF" size={12} />
                    </View>
                  ) : (
                    <View style={styles.dot} />
                  )}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => toggleTask(task.id)}
                style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
              >
                <View>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  <View style={styles.taskFooter}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{task.category}</Text>
                    </View>
                    <Text style={styles.pointsText}>+{task.points} pts</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statVal: {
    fontSize: 17,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.accent,
    color: theme.colors.text.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.plum,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 100,
  },
  timelineLeft: {
    width: 80,
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    top: 30,
    bottom: 0,
    width: 2,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  dotContainer: {
    position: 'absolute',
    top: 28,
    width: 24,
    height: 24,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.plum,
    backgroundColor: 'transparent',
  },
  dotCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.plum,
    borderWidth: 0,
  },
  taskCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  taskTitle: {
    fontSize: 17,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.disabled,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(123, 97, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '700',
    color: theme.colors.plum,
    textTransform: 'uppercase',
  },
  pointsText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.accents.eucalyptus,
  }
});
