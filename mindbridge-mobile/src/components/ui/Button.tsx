import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../theme/colors';
import { Typography } from './Typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  children?: React.ReactNode;
  title?: string; // Fallback for backwards compatibility
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  style,
}) => {
  const actualLoading = isLoading || loading;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { stiffness: 400, damping: 25 });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 25 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  // Resolve colors based on variant
  let backgroundColor = theme.colors.plum;
  let textColor = theme.colors.text.onPrimary;
  let borderColor = 'transparent';

  switch (variant) {
    case 'secondary':
      backgroundColor = theme.colors.sage;
      textColor = theme.colors.text.onPrimary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      borderColor = theme.colors.plum;
      textColor = theme.colors.plum;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = theme.colors.plum;
      break;
  }

  // Resolve sizes
  let paddingVertical = theme.spacing.md;
  let typographyVariant: Exclude<keyof typeof theme.typography, 'fonts'> = 'ui';

  if (size === 'small') {
    paddingVertical = theme.spacing.sm;
    typographyVariant = 'captionMedium';
  } else if (size === 'large') {
    paddingVertical = theme.spacing.lg;
    typographyVariant = 'h4';
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || actualLoading}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical,
          width: fullWidth ? '100%' : 'auto',
          borderRadius: theme.borderRadius.md,
        },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {actualLoading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Typography variant={typographyVariant} color={textColor}>
              {children || title}
            </Typography>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
});
