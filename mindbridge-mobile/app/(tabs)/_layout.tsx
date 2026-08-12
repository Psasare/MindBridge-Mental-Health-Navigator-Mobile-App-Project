import { Tabs } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { LayoutDashboard, User, Activity, MessageCircle, Settings, Compass, LayoutGrid, Users, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, typography, isDark, t } = useTheme();
  
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.plum,
      tabBarInactiveTintColor: isDark ? '#A0A0A0' : '#8E8E93',
      tabBarShowLabel: false,
      tabBarStyle: { 
        position: 'absolute',
        backgroundColor: 'transparent',
        bottom: Math.max(insets.bottom, 20),
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 35,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        paddingBottom: 0,
      },
      tabBarBackground: () => (
        <View style={{ flex: 1, borderRadius: 35, overflow: 'hidden' }}>
          <BlurView 
            intensity={isDark ? 80 : 60} 
            tint={isDark ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFill} 
          />
          {/* Subtle border to enhance the glass effect */}
          <View style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 35,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
          }} />
        </View>
      ),
      tabBarItemStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
      },
      headerShown: false,
    }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: t('tabs.today'),
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.plum}20` : 'transparent',
              padding: 12,
              borderRadius: 20,
            }}>
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: t('tools.title') || 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.plum}20` : 'transparent',
              padding: 12,
              borderRadius: 20,
            }}>
              <LayoutGrid color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="ai-guide" 
        options={{ 
          title: t('tabs.oracle') || 'Oracle',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.plum}20` : 'transparent',
              padding: 12,
              borderRadius: 20,
            }}>
              <MessageCircle color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="garden" 
        options={{ 
          title: t('tabs.tracker') || 'Tracker',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.plum}20` : 'transparent',
              padding: 12,
              borderRadius: 20,
            }}>
              <Activity color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t('tabs.profile') || 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.plum}20` : 'transparent',
              padding: 12,
              borderRadius: 20,
            }}>
              <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
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
