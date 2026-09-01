import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Pressable
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import {
  BookOpen,
  ClipboardList,
  Library,
  ShieldAlert,
  Users,
  Settings,
  Bot,
  Wind,
  ChevronRight,
  Sprout,
  Compass
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };

const ToolCard = ({ item, theme, onPress, index }: any) => {
  const styles = createStyles(theme);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => { scale.value = withSpring(0.96, springConfig); };
  const handlePressOut = () => { scale.value = withSpring(1, springConfig); };

  const isLarge = index === 0;

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(600)} style={isLarge ? { width: '100%', marginBottom: 16 } : { width: (width - 56) / 2, marginBottom: 16 }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[
          styles.toolCard, 
          isLarge && styles.toolCardLarge,
          animatedStyle
        ]}>
          {isLarge && (
            <LinearGradient
              colors={[item.color + '15', 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <View style={[styles.toolIconWrap, { backgroundColor: item.color + (theme.isDark ? '30' : '15') }, isLarge && { width: 56, height: 56, borderRadius: 20 }]}>
            <item.icon color={item.color} size={isLarge ? 28 : 24} />
          </View>
          <View style={isLarge ? styles.toolTextWrapLarge : styles.toolTextWrap}>
            <Text style={[styles.toolTitle, isLarge && { fontSize: 20 }]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.toolSubtitle} numberOfLines={2}>{item.subtitle}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const ToolListItem = ({ item, theme, onPress, isLast, delay }: any) => {
  const styles = createStyles(theme);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => { scale.value = withSpring(0.98, springConfig); };
  const handlePressOut = () => { scale.value = withSpring(1, springConfig); };

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.listItem, animatedStyle]}>
          <View style={[styles.listIconWrap, { backgroundColor: item.color + (theme.isDark ? '25' : '15') }]}>
            <item.icon color={item.color} size={22} />
          </View>
          <View style={styles.listTextWrap}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listSubtitle}>{item.subtitle}</Text>
          </View>
          <ChevronRight color={theme.colors.text.disabled} size={20} />
        </Animated.View>
      </Pressable>
      {!isLast && <View style={styles.divider} />}
    </Animated.View>
  );
};

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = theme;
  const styles = createStyles(theme);

  const featuredTools = [
    { id: 'ai-guide', title: 'Oracle AI Guide', subtitle: 'Your personalized mental wellness companion', icon: Bot, color: theme.colors.plum },
    { id: 'garden', title: 'Growth Garden', subtitle: 'Nurture your mental space', icon: Sprout, color: theme.colors.accents.eucalyptus },
    { id: 'journal', title: 'Reflective Journal', subtitle: 'Gain clarity through writing', icon: BookOpen, color: theme.colors.accents.powderBlue },
    { id: 'breathing', title: 'Breathwork', subtitle: 'Find calm in 2 mins', icon: Wind, color: theme.colors.accents.gentlePeach, isNotTab: true },
    { id: 'grounding', title: 'Sensory Grounding', subtitle: '5-4-3-2-1 exercise', icon: ClipboardList, color: theme.colors.accents.slate, isNotTab: true },
    { id: 'compass', title: 'Find North', subtitle: 'Physical spatial grounding', icon: Compass, color: theme.colors.semantic.warning, isNotTab: true },
  ];

  const exploreGroups = [
    {
      title: t('tools.knowledge_checks') || 'Knowledge & Exploration',
      items: [
        { id: 'assessments', title: 'Clinical Assessments', subtitle: 'Track mood and anxiety patterns', icon: ClipboardList, color: theme.colors.accents.forestGreen },
        { id: 'knowledge-hub', title: 'Knowledge Hub', subtitle: 'Curated articles and audio guides', icon: Library, color: theme.colors.accents.powderBlue },
      ]
    },
    {
      title: t('tools.support_connection') || 'Support & Connection',
      items: [
        { id: 'community', title: 'Peer Support', subtitle: 'Connect with understanding students', icon: Users, color: theme.colors.plum },
        { id: 'crisis', title: 'Crisis Response', subtitle: 'Immediate help when you need it', icon: ShieldAlert, color: theme.colors.semantic.danger },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />


      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader 
          title={t('tools.title') || "Explore Tools"} 
          subtitle={t('tools.subtitle') || "Discover curated exercises and resources tailored for your mind."}
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
              <Settings color={theme.colors.plum} size={22} />
            </TouchableOpacity>
          }
        />

        {/* Featured Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tools.daily_growth') || 'Daily Practices'}</Text>
          <View style={styles.gridContainer}>
            {featuredTools.map((item, index) => (
              <ToolCard 
                key={item.id} 
                item={item} 
                theme={theme} 
                index={index}
                onPress={() => item.isNotTab ? router.push(`/${item.id}` as any) : router.push(`/(tabs)/${item.id}` as any)}
              />
            ))}
          </View>
        </View>

        {/* List Groups */}
        {exploreGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.listCard}>
              {group.items.map((item, index) => (
                <ToolListItem 
                  key={item.id}
                  item={item}
                  theme={theme}
                  delay={(groupIndex * 200) + (index * 100) + 400}
                  isLast={index === group.items.length - 1}
                  onPress={() => router.push(`/(tabs)/${item.id}` as any)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  bgBlob: { 
    position: 'absolute', 
    width: 400, 
    height: 400, 
    borderRadius: 200 
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: -0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  toolCardLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  toolIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toolTextWrap: {
    flex: 1,
  },
  toolTextWrapLarge: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 0, // removed bottom margin for large card since it's a row
  },
  toolTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  listCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.1 : 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listTextWrap: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.tertiary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginLeft: 80,
  }
});
