import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

const springConfig = { damping: 15, stiffness: 150, mass: 0.8 };

export const AppleWidget = ({ title, subtitle, icon: Icon, color, onPress, theme, styles, size = 'square', delay = 0, value, label }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePressIn = () => { scale.value = withSpring(0.96, springConfig); };
  const handlePressOut = () => { scale.value = withSpring(1, springConfig); };

  if (size === 'list') {
    return (
      <Animated.View entering={FadeInUp.delay(delay)}>
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View style={[styles.listWidget, animatedStyle]}>
            <View style={[styles.listIconWrap, { backgroundColor: color + (theme.isDark ? '30' : '15') }]}>
              <Icon color={color} size={22} />
            </View>
            <View style={styles.listTextWrap}>
              <Text style={[styles.listTitle, { color: theme.colors.text.primary }]}>{title}</Text>
              {subtitle && <Text style={[styles.listSubtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text>}
            </View>
            <ChevronRight color={theme.colors.text.disabled} size={20} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  const isWide = size === 'wide';
  const isFixed = size === 'fixed';

  return (
    <Animated.View entering={FadeInUp.delay(delay)} style={isWide ? { width: '100%' } : (isFixed ? { width: 142, marginRight: 12 } : { width: '47.5%' })}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} hitSlop={10}>
        <Animated.View style={[styles.widget, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }, isWide ? styles.widgetWide : (isFixed ? styles.widgetFixed : styles.widgetSquare), animatedStyle]}>
          <View style={isWide ? styles.wideContent : styles.squareContent}>
            <View style={[styles.widgetIconWrap, { backgroundColor: color }]}>
              <Icon color={'#FFF'} size={isWide ? 22 : 24} />
            </View>
            <View style={isWide ? styles.wideTextWrap : { marginTop: 12 }}>
              <Text style={[styles.widgetTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>{title}</Text>
              {value ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.text.primary }}>{value}</Text>
                  {label && <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginLeft: 4, textTransform: 'uppercase' }}>{label}</Text>}
                </View>
              ) : (
                subtitle && <Text style={[styles.widgetSubtitle, { color: theme.colors.text.secondary }]} numberOfLines={1}>{subtitle}</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
