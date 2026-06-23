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
      tabBarInactiveTintColor: colors.text.secondary,
      tabBarShowLabel: true,
      tabBarLabelStyle: { 
        fontFamily: typography.fonts.header, 
        fontSize: 10,
        marginBottom: 4
      },
      tabBarStyle: { 
        position: 'absolute',
        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
        borderTopWidth: 0,
        height: 64 + insets.bottom,
        paddingBottom: insets.bottom,
        elevation: 0,
      },
      tabBarBackground: () => (
        <BlurView 
          intensity={isDark ? 50 : 80} 
          tint={isDark ? 'dark' : 'light'} 
          style={StyleSheet.absoluteFill} 
        />
      ),
      headerShown: false,
    }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => <Home color={color} size={24} strokeWidth={2.2} />
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: t('tools.title') || 'Explore',
          tabBarIcon: ({ color, focused }) => <LayoutGrid color={color} size={24} strokeWidth={focused ? 2.2 : 1.8} />
        }} 
      />
      <Tabs.Screen 
        name="ai-guide" 
        options={{ 
          title: t('tabs.oracle') || 'Oracle',
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} strokeWidth={2} />
        }} 
      />
      <Tabs.Screen 
        name="garden" 
        options={{ 
          title: t('tabs.tracker') || 'Tracker',
          tabBarIcon: ({ color }) => <Activity color={color} size={24} strokeWidth={2} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t('tabs.profile') || 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} strokeWidth={2} />
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
