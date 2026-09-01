import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Trash2, ChevronLeft, Mic, Camera, Activity, Lock, Database } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

const PrivacyRule = ({ icon: Icon, title, description, color, theme }: any) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.ruleCard}>
      <View style={[styles.ruleIconWrap, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleDesc}>{description}</Text>
      </View>
    </View>
  );
};

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const { signOut } = useContext(AuthContext) as any;

  const handleDeleteData = () => {
    Alert.alert(
      "Delete All Data",
      "Are you sure you want to permanently delete all your data? This includes your mood history, journal entries, streaks, and profile. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Data", 
          style: "destructive",
          onPress: async () => {
            try {
              // Delete all data stored in AsyncStorage
              await AsyncStorage.clear();
              Alert.alert("Data Deleted", "All your data has been successfully deleted from this device.");
              // Sign out the user
              signOut();
              router.replace('/(auth)/welcome');
            } catch (e) {
              Alert.alert("Error", "Could not delete data. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>


      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={theme.colors.text.primary} size={24} />
          </TouchableOpacity>
          <ScreenHeader 
            title="Data & Privacy" 
            subtitle="Your data belongs to you"
          />
        </View>

        <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.plum + '15' }]}>
            <Shield color={theme.colors.plum} size={32} />
          </View>
          <Text style={styles.heroTitle}>Our Ethical Commitment</Text>
          <Text style={styles.heroText}>
            MindBridge is built on strict ethical guidelines. We process data locally whenever possible, never sell your data to third parties, and allow you to permanently delete your information at any time.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>Sensor Usage</Text>
          <PrivacyRule 
            theme={theme}
            icon={Mic}
            title="Microphone"
            description="Used strictly for Voice Journaling and Voice Check-ins. Audio is transcribed immediately and raw files are discarded. We never store raw audio."
            color={theme.colors.accents.powderBlue}
          />
          <PrivacyRule 
            theme={theme}
            icon={Camera}
            title="Camera"
            description="Used optionally during Check-ins for facial metric analysis. Video feeds are processed locally on-device and never saved or uploaded."
            color={theme.colors.accents.eucalyptus}
          />
          <PrivacyRule 
            theme={theme}
            icon={Activity}
            title="Accelerometer"
            description="Used in the background to detect potential physical crisis states (e.g., phone drops/shaking). We only detect patterns, not your location."
            color={theme.colors.semantic.warning}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <PrivacyRule 
            theme={theme}
            icon={Lock}
            title="Encryption"
            description="Any data synced to the cloud is encrypted, anonymized, and strictly protected against unauthorized access."
            color={theme.colors.plum}
          />
          <PrivacyRule 
            theme={theme}
            icon={Database}
            title="Full Control"
            description="You have the right to request your data or permanently delete it below."
            color={theme.colors.accents.slate}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerText}>This action is irreversible and will erase all your local data.</Text>
          
          <TouchableOpacity 
            style={[styles.deleteBtn, { backgroundColor: theme.colors.semantic.danger + '15' }]} 
            onPress={handleDeleteData}
            activeOpacity={0.8}
          >
            <Trash2 color={theme.colors.semantic.danger} size={20} />
            <Text style={[styles.deleteBtnText, { color: theme.colors.semantic.danger }]}>Delete All My Data</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  bgBlob: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.8 },
  scrollContent: { paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginRight: 10 },
  heroSection: { alignItems: 'center', paddingHorizontal: 30, marginBottom: 32 },
  heroIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 20, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, marginBottom: 8, textAlign: 'center' },
  heroText: { fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, marginBottom: 16 },
  ruleCard: { flexDirection: 'row', gap: 14, backgroundColor: theme.colors.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' },
  ruleIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ruleTitle: { fontSize: 15, fontFamily: theme.typography.fonts.header, color: theme.colors.text.primary, marginBottom: 4 },
  ruleDesc: { fontSize: 12, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary, lineHeight: 18 },
  dangerZone: { marginHorizontal: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.semantic.danger + '40', backgroundColor: theme.colors.semantic.danger + '05', marginTop: 10 },
  dangerTitle: { fontSize: 16, fontFamily: theme.typography.fonts.header, color: theme.colors.semantic.danger, marginBottom: 6 },
  dangerText: { fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, marginBottom: 20 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 16 },
  deleteBtnText: { fontSize: 15, fontFamily: theme.typography.fonts.header },
});
