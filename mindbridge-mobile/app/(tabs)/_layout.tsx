import { Tabs } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { LayoutDashboard, User, Activity, MessageCircle, Settings, Compass, LayoutGrid, Users, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, Easing } from 'react-native-reanimated';

const APPLE_BLUE = '#007AFF';
const { width } = Dimensions.get('window');

const AnimatedTabBarIcon = ({ focused, color, IconComponent }: { focused: boolean, color: string, IconComponent: any }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(0.8, { damping: 12, stiffness: 200 }),
        withSpring(1.1, { damping: 10, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <IconComponent 
        color={color} 
        size={24} 
        strokeWidth={focused ? 2.5 : 2} 
        fill={focused ? 'transparent' : 'transparent'} 
      />
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, insets, theme, typography }: any) => {
  const hiddenRoutes = ['progress', 'settings', 'insights', 'crisis', 'journal', 'assessments', 'community', 'knowledge-hub', 'privacy', 'journey'];
  
  // Filter out hidden routes
  const visibleRoutes = state.routes.filter((r: any) => !hiddenRoutes.includes(r.name));
  
  // App Store iOS 18/26 "Liquid Glass" Tab Bar Design
  const TAB_BAR_MARGIN = 20;
  const TAB_BAR_WIDTH = width - (TAB_BAR_MARGIN * 2);
  const TAB_WIDTH = TAB_BAR_WIDTH / visibleRoutes.length;
  
  const indicatorPosition = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    // Find the actual index of the focused route among the visible routes
    const activeKey = state.routes[state.index].key;
    const activeVisibleIndex = visibleRoutes.findIndex((r: any) => r.key === activeKey);
    
    if (activeVisibleIndex !== -1) {
      indicatorPosition.value = withSpring(activeVisibleIndex * TAB_WIDTH, {
        damping: 20,
        stiffness: 250,
        mass: 0.8
      });
    }
  }, [state.index, visibleRoutes]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
    
    // Inactive color should be a high-contrast dark color in light mode (e.g. black or dark gray)
    // and light color in dark mode.
    const inactiveColor = theme.isDark ? '#EBEBF5' : '#1C1C1E';
    const color = isFocused ? APPLE_BLUE : inactiveColor;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const Icon = options.tabBarIcon;

    return (
      <TouchableOpacity 
        key={route.key}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          height: 64,
          zIndex: 2,
        }}
      >
        {Icon && Icon({ focused: isFocused, color, size: 24 })}
        <Text style={{ 
          color, 
          fontSize: 10, 
          fontFamily: typography.fonts.ui, 
          fontWeight: isFocused ? '600' : '500', 
          marginTop: 4 
        }}>
          {options.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: insets.bottom > 0 ? insets.bottom : 12,
      left: TAB_BAR_MARGIN,
      right: TAB_BAR_MARGIN,
      height: 64,
      borderRadius: 32,
      overflow: 'hidden',
    }}>
      {/* Dynamic Blur Background */}
      <BlurView 
        intensity={theme.isDark ? 50 : 80} 
        tint={theme.isDark ? 'dark' : 'light'} 
        style={StyleSheet.absoluteFill} 
      />
      
      {/* Semi-transparent border overlay for iOS premium feel */}
      <View style={{
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
      }} />

      {/* Sliding Active Pill Background */}
      <Animated.View style={[
        {
          position: 'absolute',
          top: 6,
          bottom: 6,
          left: 6,
          width: TAB_WIDTH - 12, // slightly inset from the boundaries
          borderRadius: 24,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
          zIndex: 1,
        },
        indicatorStyle
      ]} />

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        ...StyleSheet.absoluteFillObject,
      }}>
        {visibleRoutes.map((route: any, index: number) => renderTab(route, index))}
      </View>
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { typography, isDark, t } = useTheme(); 
  
  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} insets={insets} typography={typography} theme={{ isDark }} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: t('tabs.today') || 'Today',
          tabBarIcon: ({ color, focused }) => <AnimatedTabBarIcon focused={focused} color={color} IconComponent={Home} />
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: t('tools.title') || 'Explore',
          tabBarIcon: ({ color, focused }) => <AnimatedTabBarIcon focused={focused} color={color} IconComponent={LayoutGrid} />
        }} 
      />
      <Tabs.Screen 
        name="ai-guide" 
        options={{ 
          title: t('tabs.oracle') || 'Oracle',
          tabBarIcon: ({ color, focused }) => <AnimatedTabBarIcon focused={focused} color={color} IconComponent={MessageCircle} />
        }} 
      />
      <Tabs.Screen 
        name="garden" 
        options={{ 
          title: t('tabs.tracker') || 'Tracker',
          tabBarIcon: ({ color, focused }) => <AnimatedTabBarIcon focused={focused} color={color} IconComponent={Activity} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t('tabs.profile') || 'Profile',
          tabBarIcon: ({ color, focused }) => <AnimatedTabBarIcon focused={focused} color={color} IconComponent={User} />
        }} 
      />
      
      {/* Hidden Utility Screens */}
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
      <Tabs.Screen name="crisis" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="assessments" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="knowledge-hub" options={{ href: null }} />
      <Tabs.Screen name="privacy" options={{ href: null }} />
      <Tabs.Screen name="journey" options={{ href: null }} />
    </Tabs>
  );
}
