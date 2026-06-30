import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'large' | 'compact';
  noPadding?: boolean;
  noDate?: boolean;
}

export const ScreenHeader = ({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack, 
  rightAction,
  variant = 'large',
  noPadding = false,
  noDate = false
}: ScreenHeaderProps) => {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <View style={[styles.outerContainer, noPadding && { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }]}>
      {/* Top Navigation Row */}
      <View style={styles.navRow}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <BlurView intensity={theme.isDark ? 20 : 40} tint={theme.isDark ? 'dark' : 'light'} style={styles.blurCircle}>
              <ChevronLeft color={theme.colors.plum} size={24} strokeWidth={2.5} />
            </BlurView>
          </TouchableOpacity>
        ) : (
          !noDate && (
            <View style={styles.dateWrap}>
              <Text style={styles.dateText}>{today.toUpperCase()}</Text>
            </View>
          )
        )}
        
        <View style={styles.rightActions}>
          {rightAction}
        </View>
      </View>

      {/* Main Title Content */}
      <Animated.View 
        entering={FadeInDown.springify().damping(15).stiffness(100)} 
        style={[styles.content, variant === 'compact' && styles.contentCompact]}
      >
        <Text style={[styles.title, variant === 'compact' && { fontSize: 24, lineHeight: 32 }]}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </Animated.View>
    </View>
  );
};


const createStyles = (theme: any) => StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    marginBottom: 12,
  },
  dateWrap: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  dateText: {
    fontSize: 10,
    fontFamily: theme.typography.fonts.header,
    color: theme.colors.text.tertiary,
    letterSpacing: 2,
  },
  iconBtn: {
    overflow: 'hidden',
    borderRadius: 22,
  },
  blurCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    marginTop: 0,
  },
  contentCompact: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 40,
    fontFamily: theme.typography.fonts.header,
    color: theme.colors.text.primary,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: theme.typography.fonts.humanist,
    color: theme.colors.text.secondary,
    marginTop: 8,
    lineHeight: 24,
    opacity: theme.isDark ? 1 : 0.8,
  },
});

