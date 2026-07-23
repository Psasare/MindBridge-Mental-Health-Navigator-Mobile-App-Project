import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { 
  Settings, 
  Moon, 
  Sun, 
  Smartphone, 
  User, 
  Bell, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Shield,
  HelpCircle,
  MessageSquare, 
  LogOut,
  ChevronRight,
  Info,
  X
} from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Switch, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const themeContext = useTheme();
  const styles = createStyles(themeContext);
  const { mode, setMode, colors, isDark, language, setLanguage, t } = themeContext;
  const { signOut } = React.useContext(AuthContext) as any;
  const router = useRouter();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = React.useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = React.useState(false);
  const [isAboutVisible, setIsAboutVisible] = React.useState(false);
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = React.useState(false);
  
  const [feedback, setFeedback] = React.useState('');
  const [isSendingFeedback, setIsSendingFeedback] = React.useState(false);

  const [notifications, setNotifications] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState('Biometric');
  
  const [passForm, setPassForm] = React.useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPass, setIsUpdatingPass] = React.useState(false);

  // Load preferences
  React.useEffect(() => {
    const loadPrefs = async () => {
      const n = await AsyncStorage.getItem('settings_notifications');
      const b = await AsyncStorage.getItem('settings_biometrics');
      if (n !== null) setNotifications(n === 'true');
      if (b !== null) setBiometrics(b === 'true');

      // Check biometric types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('FaceID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      }
    };
    loadPrefs();
  }, []);

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    await AsyncStorage.setItem('settings_notifications', val.toString());
  };

  const toggleBiometrics = async (val: boolean) => {
    if (val) {
      // Check if device supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Not Supported", 
          "Your device does not support biometric authentication or no biometrics are enrolled."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to enable Biometric Unlock',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        setBiometrics(true);
        await AsyncStorage.setItem('settings_biometrics', 'true');
        Alert.alert("Enabled", "Biometric unlock is now active for your account.");
      } else {
        Alert.alert("Authentication Failed", "We could not verify your identity.");
      }
    } else {
      setBiometrics(false);
      await AsyncStorage.setItem('settings_biometrics', 'false');
    }
  };

  const changeLanguage = () => {
    setIsLanguageModalVisible(true);
  };

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang as any);
    setIsLanguageModalVisible(false);
  };


  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSendingFeedback(true);
    // Simulate API call
    setTimeout(() => {
      setIsSendingFeedback(false);
      setIsFeedbackVisible(false);
      setFeedback('');
      Alert.alert("Thank You!", "Your feedback helps us make MindBridge better for everyone.");
    }, 1500);
  };

  const handleUpdatePassword = async () => {
    if (!passForm.current || !passForm.new || !passForm.confirm) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (passForm.new !== passForm.confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (passForm.new.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPass(true);
    try {
      await api.post('/auth/update-password', {
        currentPassword: passForm.current,
        newPassword: passForm.new
      });
      Alert.alert("Success", "Your password has been updated securely.");
      setIsPasswordModalVisible(false);
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update password. Please check your current password.";
      Alert.alert("Security Error", msg);
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const SettingRow = ({ icon: Icon, color, label, value, onPress, isLast, type = 'link' }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={type === 'switch'}
      style={[styles.row, isLast && { borderBottomWidth: 0 }]}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      
      {type === 'link' && (
        <View style={styles.rowRight}>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          <ChevronRight color={colors.text.disabled} size={18} />
        </View>
      )}
      
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: colors.text.disabled + '40', true: colors.plum + '60' }}
          thumbColor={value ? colors.plum : '#f4f3f4'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Settings" subtitle="Customize your wellness experience" />

        {/* ── Theme Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>App Appearance</Text>
          <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.rowIconWrap, { backgroundColor: isDark ? colors.plum + '15' : '#FEF3C7' }]}>
                {isDark ? <Moon color={colors.plum} size={20} /> : <Sun color="#F59E0B" size={20} />}
              </View>
              <Text style={styles.rowLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            </View>
            <ThemeToggle 
              isDark={isDark} 
              onToggle={() => setMode(isDark ? 'light' : 'dark')} 
            />
          </View>
        </View>

        {/* ── Account Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.account_privacy')}</Text>
          <View style={styles.card}>
            <SettingRow 
              icon={User} 
              color={colors.plum} 
              label={t('settings.personal_info')} 
              value="Manage" 
              onPress={() => router.push('/(tabs)/profile')}
            />
            <SettingRow 
              icon={Lock} 
              color={colors.accents.powderBlue} 
              label={t('settings.security_password')} 
              onPress={() => setIsPasswordModalVisible(true)}
            />
            <SettingRow 
              icon={ShieldCheck} 
              color={colors.accents.eucalyptus} 
              label={t('settings.passcode_unlock')} 
              type="switch" 
              value={biometrics} 
              onPress={toggleBiometrics} 
            />
            <SettingRow 
              icon={Shield} 
              color={colors.accents.slate} 
              label={"Data & Privacy"} 
              onPress={() => router.push('/(tabs)/privacy')}
              isLast 
            />
          </View>
        </View>

        {/* ── Notifications Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <SettingRow 
              icon={Bell} 
              color={colors.accents.terracotta} 
              label={t('settings.quest_reminders')} 
              type="switch" 
              value={notifications} 
              onPress={toggleNotifications} 
            />
            <SettingRow 
              icon={Globe} 
              color={colors.accents.powderBlue} 
              label={t('settings.language')} 
              value={language} 
              onPress={changeLanguage}
              isLast 
            />
          </View>
        </View>

        {/* ── Support Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.support_legal')}</Text>
          <View style={styles.card}>
            <SettingRow 
              icon={HelpCircle} 
              color={colors.accents.slate} 
              label={t('settings.help_center')} 
              onPress={() => setIsHelpVisible(true)}
            />
            <SettingRow 
              icon={MessageSquare} 
              color={colors.accents.forestGreen} 
              label={t('settings.feedback')} 
              onPress={() => setIsFeedbackVisible(true)}
            />
            <SettingRow 
              icon={Info} 
              color={colors.text.tertiary} 
              label={t('settings.about')} 
              onPress={() => setIsAboutVisible(true)}
              isLast 
            />
          </View>
        </View>

        {/* ── Logout Section ── */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => {
            Alert.alert(
              t('settings.log_out') || 'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut }
              ]
            );
          }}
          activeOpacity={0.8}
        >
          <LogOut color="#FFF" size={20} />
          <Text style={styles.logoutText}>{t('settings.log_out')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>MindBridge v1.2.0 • Build 2026.05</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Change Password Modal ── */}
      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.accents.powderBlue + '20' }]}>
                <Lock color={colors.accents.powderBlue} size={24} />
              </View>
              <Text style={styles.modalTitle}>Update Password</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsPasswordModalVisible(false)} style={styles.closeBtn}>
                <X color={colors.text.tertiary} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.text.disabled}
                  secureTextEntry
                  value={passForm.current}
                  onChangeText={(val) => setPassForm(prev => ({ ...prev, current: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.text.disabled}
                  secureTextEntry
                  value={passForm.new}
                  onChangeText={(val) => setPassForm(prev => ({ ...prev, new: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-type new password"
                  placeholderTextColor={colors.text.disabled}
                  secureTextEntry
                  value={passForm.confirm}
                  onChangeText={(val) => setPassForm(prev => ({ ...prev, confirm: val }))}
                />
              </View>

              <TouchableOpacity activeOpacity={0.7} 
                style={[styles.modalActionBtn, isUpdatingPass && { opacity: 0.7 }]}
                onPress={handleUpdatePassword}
                disabled={isUpdatingPass}
              >
                {isUpdatingPass ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalActionText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Feedback Modal ── */}
      <Modal visible={isFeedbackVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.accents.forestGreen + '20' }]}>
                <MessageSquare color={colors.accents.forestGreen} size={24} />
              </View>
              <Text style={styles.modalTitle}>Your Feedback</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsFeedbackVisible(false)}><X color={colors.text.tertiary} size={24} /></TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, { height: 120 }]}
              placeholder="How can we improve MindBridge?"
              placeholderTextColor={colors.text.disabled}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
            <TouchableOpacity activeOpacity={0.7} style={styles.modalActionBtn} onPress={submitFeedback} disabled={isSendingFeedback}>
              {isSendingFeedback ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalActionText}>Send Feedback</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── About Modal ── */}
      <Modal visible={isAboutVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.plum + '20' }]}>
                <Info color={colors.plum} size={24} />
              </View>
              <Text style={styles.modalTitle}>About MindBridge</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsAboutVisible(false)}><X color={colors.text.tertiary} size={24} /></TouchableOpacity>
            </View>
            <View style={{ gap: 16 }}>
              <Text style={{ color: colors.text.primary, fontSize: 17, fontWeight: '700', lineHeight: 24 }}>
                Supporting the mental well-being of tertiary students in Ghana.
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 15, lineHeight: 22 }}>
                MindBridge is a premium mental health navigator designed specifically for the unique academic and personal journeys of University and College students in Ghana.
              </Text>
              <View style={{ marginTop: 8, padding: 16, backgroundColor: colors.backgroundSecondary, borderRadius: 20, gap: 4 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '700' }}>MindBridge v1.2.0</Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Handcrafted for Ghanaian Tertiary Education 🇬🇭</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Help Center Modal ── */}
      <Modal visible={isHelpVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.accents.slate + '20' }]}>
                <HelpCircle color={colors.accents.slate} size={24} />
              </View>
              <Text style={styles.modalTitle}>Help Center</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsHelpVisible(false)}><X color={colors.text.tertiary} size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ color: colors.plum, fontWeight: '800', marginBottom: 4 }}>What is a Streak?</Text>
                  <Text style={{ color: colors.text.secondary, lineHeight: 20 }}>A streak records your consecutive days of wellness activities. Complete at least one quest daily to keep it burning!</Text>
                </View>
                <View>
                  <Text style={{ color: colors.plum, fontWeight: '800', marginBottom: 4 }}>Privacy & Data Security</Text>
                  <Text style={{ color: colors.text.secondary, lineHeight: 20 }}>Your data is protected with industry-standard encryption and remains confidential. We use your information only to provide personalized wellness insights and improve your experience.</Text>
                </View>
                <View>
                  <Text style={{ color: colors.plum, fontWeight: '800', marginBottom: 4 }}>Contact Support</Text>
                  <Text style={{ color: colors.text.secondary, lineHeight: 20 }}>For urgent issues, please email support@mindbridge.edu.gh or visit the student clinic.</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Language Modal */}
      <Modal visible={isLanguageModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.select_language')}</Text>
              <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)} style={styles.modalCloseBtn}>
                <X color={colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>{t('settings.language_desc')}</Text>
            
            <View style={styles.languageList}>
              {[
                { id: 'English', label: 'English', icon: '🇬🇧' },
                { id: 'French', label: 'Français', icon: '🇫🇷' },
                { id: 'Twi', label: 'Twi (Akan)', icon: '🇬🇭' },
                { id: 'Ga', label: 'Ga', icon: '🇬🇭' },
                { id: 'Ewe', label: 'Ewe', icon: '🇬🇭' },
                { id: 'Hausa', label: 'Hausa', icon: '🇳🇬' }
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.languageOption,
                    language === lang.id && { backgroundColor: colors.plum + '20', borderColor: colors.plum }
                  ]}
                  onPress={() => handleSelectLanguage(lang.id)}
                >
                  <Text style={styles.languageOptionIcon}>{lang.icon}</Text>
                  <Text style={[
                    styles.languageOptionText, 
                    { color: colors.text.primary },
                    language === lang.id && { fontWeight: '700', color: colors.plum }
                  ]}>
                    {lang.label}
                  </Text>
                  {language === lang.id && <ShieldCheck color={colors.plum} size={20} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.backgroundSecondary, 
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.tertiary,
  },
  themeCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  themeOptionActive: {
    backgroundColor: theme.colors.plum,
  },
  themeOptionText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  themeOptionTextActive: {
    color: '#FFF',
  },
  languageList: {
    marginTop: 15,
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.isDark ? '#333' : '#E5E7EB',
    backgroundColor: theme.isDark ? '#2A2A2A' : '#F9FAFB',
  },
  languageOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  languageOptionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutBtn: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    color: '#FFF',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: theme.typography.fonts.accent,
    color: theme.colors.text.disabled,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDesc: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  modalActionBtn: {
    backgroundColor: theme.colors.plum,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.3 : 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
  }
});
