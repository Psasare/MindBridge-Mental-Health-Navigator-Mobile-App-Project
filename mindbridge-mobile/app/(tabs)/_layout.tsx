import { Tabs } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { LayoutDashboard, User, Activity, MessageCircle, Settings, Compass, LayoutGrid, Users, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View, TouchableOpacity, Text } from 'react-native';
import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

const APPLE_BLUE = '#007AFF';

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
  
  // Split into left (main) and right (profile)
  const mainRoutes = visibleRoutes.filter((r: any) => r.name !== 'profile');
  const profileRoute = visibleRoutes.find((r: any) => r.name === 'profile');

  const renderTab = (route: any, isProfile: boolean) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
    const color = isFocused ? APPLE_BLUE : (theme.isDark ? '#A0A0A0' : '#8E8E93');

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
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        style={{
          flex: isProfile ? 0 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: isProfile ? 0 : 8,
          height: isProfile ? 56 : 'auto',
          width: isProfile ? 56 : 'auto',
        }}
      >
        {Icon && Icon({ focused: isFocused, color, size: 24 })}
        {!isProfile && (
          <Text style={{ 
            color, 
            fontSize: 10, 
            fontFamily: typography.fonts.ui, 
            fontWeight: '500', 
            marginTop: 4 
          }}>
            {options.title}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: insets.bottom > 0 ? insets.bottom : 12,
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 64,
    }}>
      {/* Main Left Pill */}
      <View style={{ flex: 1, height: 64, borderRadius: 32, overflow: 'hidden' }}>
        <BlurView intensity={theme.isDark ? 80 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 32,
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
          {mainRoutes.map((route: any) => renderTab(route, false))}
        </View>
      </View>

      {/* Profile Right Pill (Circle) */}
      {profileRoute && (
        <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden' }}>
          <BlurView intensity={theme.isDark ? 80 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 32,
            borderWidth: 1,
            borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {renderTab(profileRoute, true)}
          </View>
        </View>
      )}
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
