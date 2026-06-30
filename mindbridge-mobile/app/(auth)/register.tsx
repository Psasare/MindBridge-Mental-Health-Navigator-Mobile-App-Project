import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
  StatusBar
} from 'react-native';
import { useState, useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import Animated, { FadeInUp, FadeIn, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, ChevronLeft, AlertCircle, Search, Check, X, Heart } from 'lucide-react-native';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BlurView } from 'expo-blur';

const { height, width } = Dimensions.get('window');

// ─── Data: Ghanaian Tertiary Institutions ───────────────────────────────────
const GHANA_INSTITUTIONS = [
  "University of Ghana (UG)",
  "Kwame Nkrumah University of Science and Technology (KNUST)",
  "University of Cape Coast (UCC)",
  "University of Education, Winneba (UEW)",
  "University for Development Studies (UDS)",
  "University of Professional Studies, Accra (UPSA)",
  "Ghana Communication Technology University (GCTU)",
  "Ashesi University",
  "Central University",
  "Valley View University",
  "Academic City University College",
  "Lancaster University Ghana",
  "Accra Technical University",
  "Kumasi Technical University",
  "Ho Technical University",
  "Takoradi Technical University",
  "Tamale Technical University",
  "Koforidua Technical University",
  "Sunyani Technical University",
  "Cape Coast Technical University",
  "Presbyterian University College",
  "Methodist University College",
  "Pentecost University",
  "Wisconsin International University College",
  "Regent University College",
  "All Nations University",
  "Ghana Institute of Journalism (GIJ)",
  "GIMPA",
  "UHS (University of Health and Allied Sciences)",
  "UENR (University of Energy and Natural Resources)",
  "AAMUSTED",
  "BlueCrest University College",
  "Kings University College",
  "Mountcrest University College",
  "Garden City University College",
  "Radford University College",
  "Others"
].sort();

const ErrorMessage = ({ message, theme }: { message: string | undefined, theme: any }) => {
  if (!message) return null;
  const styles = createStyles(theme);
  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.errorRow}>
      <AlertCircle color={theme.colors.semantic.danger} size={14} style={{ marginRight: 4 }} />
      <Typography variant="captionMedium" color={theme.colors.semantic.danger}>{message}</Typography>
    </Animated.View>
  );
};

const FormSection = ({ title, theme, children }: { title: string; theme: any; children: React.ReactNode }) => {
  const styles = createStyles(theme);
  return (
    <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.sectionContainer}>
      <Typography variant="label" style={styles.sectionTitle}>{title.toUpperCase()}</Typography>
      <View style={[styles.groupedList, theme.isDark && styles.groupedListDark]}>
        {children}
      </View>
    </Animated.View>
  );
};

const SelectGroup = ({ label, options, selectedValues, onToggle, theme, multiple = false, isLast = false }: { label: string; options: string[]; selectedValues: string | string[]; onToggle: (val: string) => void; theme: any; multiple?: boolean; isLast?: boolean }) => {
  const styles = createStyles(theme);
  return (
    <View>
      <View style={styles.selectGroupRow}>
        <Typography variant="body" style={styles.inputLabelStack}>{label}</Typography>
        <View style={styles.chipContainer}>
          {options.map((opt) => {
            const isSelected = multiple 
              ? (selectedValues as string[]).includes(opt)
              : selectedValues === opt;
            
            return (
              <TouchableOpacity activeOpacity={0.7}
                key={opt}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onToggle(opt)}
              >
                <Typography variant="ui" color={isSelected ? (theme.colors.text.onPrimary || '#FFF') : theme.colors.text.secondary}>
                  {opt}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );
};

const InstitutionPicker = ({ value, onSelect, error, theme }: { value: string; onSelect: (val: string) => void; error?: string; theme: any }) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const styles = createStyles(theme);

  const filtered = GHANA_INSTITUTIONS.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View>
      <View style={styles.inputRow}>
        <Typography variant="body" style={styles.inputLabel}>Institution</Typography>
        <TouchableOpacity 
          style={styles.pickerTrigger}
          onPress={() => setVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerValue, !value && { color: theme.colors.text.disabled }]} numberOfLines={1}>
            {value || "Select..."}
          </Text>
          <ChevronLeft color={theme.colors.text.tertiary} size={20} style={{ transform: [{ rotate: '-180deg' }] }} />
        </TouchableOpacity>
      </View>
      <ErrorMessage message={error} theme={theme} />

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3">Select Institution</Typography>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setVisible(false)} style={styles.closeBtn}>
                <X color={theme.colors.plum} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search color={theme.colors.text.disabled} size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search institution..."
                placeholderTextColor={theme.colors.text.disabled}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={item => item}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.7}
                  style={[styles.listItem, value === item && styles.listItemActive]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.listItemText, value === item && styles.listItemTextActive]}>{item}</Text>
                  {value === item && <Check color={theme.colors.plum} size={18} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function RegisterScreen() {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeContext = useTheme();
  const styles = createStyles(themeContext);

  // Basic Info
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Academic Info
  const [institution, setInstitution] = useState('');
  const [faculty, setFaculty] = useState('');
  const [level, setLevel] = useState('Level 100');
  const [status, setStatus] = useState('Full-time');

  // Mental Health Info
  const [stressSources, setStressSources] = useState<string[]>(['Academics']);
  const [supportTypes, setSupportTypes] = useState<string[]>(['Self-help']);
  const [reminders, setReminders] = useState('Yes');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const usernameShake = useSharedValue(0);
  const emailShake = useSharedValue(0);
  const phoneShake = useSharedValue(0);
  const passwordShake = useSharedValue(0);
  const confirmPasswordShake = useSharedValue(0);

  const shake = (field: string) => {
    let sv;
    if (field === 'username') sv = usernameShake;
    else if (field === 'email') sv = emailShake;
    else if (field === 'phoneNumber') sv = phoneShake;
    else if (field === 'password') sv = passwordShake;
    else if (field === 'confirmPassword') sv = confirmPasswordShake;
    
    if (sv) {
      sv.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  };

  const usernameStyle = useAnimatedStyle(() => ({ transform: [{ translateX: usernameShake.value }] }));
  const emailStyle = useAnimatedStyle(() => ({ transform: [{ translateX: emailShake.value }] }));
  const phoneStyle = useAnimatedStyle(() => ({ transform: [{ translateX: phoneShake.value }] }));
  const passwordStyle = useAnimatedStyle(() => ({ transform: [{ translateX: passwordShake.value }] }));
  const confirmPasswordStyle = useAnimatedStyle(() => ({ transform: [{ translateX: confirmPasswordShake.value }] }));

  const validateField = (field: string) => {
    let newErrors = { ...errors };
    if (field === 'username') {
      if (!username) newErrors.username = 'Required';
      else delete newErrors.username;
    }
    if (field === 'email') {
      if (!email) newErrors.email = 'Required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
      else delete newErrors.email;
    }
    if (field === 'phoneNumber') {
      if (!phoneNumber) newErrors.phoneNumber = 'Required';
      else delete newErrors.phoneNumber;
    }
    if (field === 'password') {
      if (!password) newErrors.password = 'Required';
      else if (password.length < 6) newErrors.password = 'Min 6 characters';
      else delete newErrors.password;
    }
    if (field === 'confirmPassword') {
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      else delete newErrors.confirmPassword;
    }
    setErrors(newErrors);
    
    if (newErrors[field] && !errors[field]) {
      shake(field);
    }
  };

  const validate = () => {
    let newErrors: Record<string, string> = {};
    let valid = true;

    if (!username) { newErrors.username = 'Required'; valid = false; }
    if (!email) { newErrors.email = 'Required'; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Invalid email'; valid = false; }

    if (!phoneNumber) { newErrors.phoneNumber = 'Required'; valid = false; }

    if (!password) { newErrors.password = 'Required'; valid = false; }
    else if (password.length < 6) { newErrors.password = 'Min 6 characters'; valid = false; }

    if (password !== confirmPassword) { newErrors.confirmPassword = 'Mismatch'; valid = false; }

    if (!institution) { newErrors.institution = 'Required'; valid = false; }

    if (!stressSources.length) { Alert.alert('Selection Required', 'Select at least one stress source'); return false; }
    if (!supportTypes.length) { Alert.alert('Selection Required', 'Select at least one support type'); return false; }

    setErrors(newErrors);
    Object.keys(newErrors).forEach(field => shake(field));
    if (!valid) Alert.alert('Check Fields', 'Please correct the errors in the form.');
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name, username, email, phoneNumber, password,
        academic: { institution, faculty, level, status },
        preferences: { stressSources, supportTypes, reminders: reminders === 'Yes' }
      };
      const response = await api.post('/auth/register', payload);
      await signIn(response.data.token, response.data.user);
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Unable to connect to server';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeContext.isDark ? "light-content" : "dark-content"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
            <TouchableOpacity  
              onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonIconBg}>
                <ChevronLeft color={themeContext.isDark ? '#FFF' : '#000'} size={24} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800)} style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Typography variant="h1" style={{ marginBottom: 8 }}>Join MindBridge</Typography>
              <Typography variant="body" color={themeContext.colors.text.secondary}>Let's personalize your experience.</Typography>
            </View>

            <FormSection title="Account Details" theme={themeContext}>
              <View style={styles.inputRow}>
                <Typography variant="body" style={styles.inputLabel}>Name</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.separator} />

              <Animated.View style={[styles.inputRow, usernameStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Username</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Required"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={(txt) => { setUsername(txt); if (errors.username) setErrors({ ...errors, username: undefined }); }}
                  onBlur={() => validateField('username')}
                />
              </Animated.View>
              <ErrorMessage message={errors.username} theme={themeContext} />
              <View style={styles.separator} />

              <Animated.View style={[styles.inputRow, emailStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Email</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Required"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(txt) => { setEmail(txt); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  onBlur={() => validateField('email')}
                />
              </Animated.View>
              <ErrorMessage message={errors.email} theme={themeContext} />
              <View style={styles.separator} />

              <Animated.View style={[styles.inputRow, phoneStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Phone</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Required"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(txt) => { setPhoneNumber(txt); if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined }); }}
                  onBlur={() => validateField('phoneNumber')}
                />
              </Animated.View>
              <ErrorMessage message={errors.phoneNumber} theme={themeContext} />
              <View style={styles.separator} />

              <Animated.View style={[styles.inputRow, passwordStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Password</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Required"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(txt) => { setPassword(txt); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                  onBlur={() => validateField('password')}
                />
                <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color={themeContext.colors.text.tertiary} size={20} /> : <Eye color={themeContext.colors.text.tertiary} size={20} />}
                </TouchableOpacity>
              </Animated.View>
              <ErrorMessage message={errors.password} theme={themeContext} />
              <View style={styles.separator} />

              <Animated.View style={[styles.inputRow, confirmPasswordStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Confirm</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Required"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={(txt) => { setConfirmPassword(txt); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
                  onBlur={() => validateField('confirmPassword')}
                />
              </Animated.View>
              <ErrorMessage message={errors.confirmPassword} theme={themeContext} />
            </FormSection>

            <FormSection title="Academic Context" theme={themeContext}>
              <InstitutionPicker
                value={institution}
                onSelect={setInstitution}
                error={errors.institution}
                theme={themeContext}
              />
              <View style={styles.separator} />

              <View style={styles.inputRow}>
                <Typography variant="body" style={styles.inputLabel}>Faculty</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  value={faculty}
                  onChangeText={setFaculty}
                />
              </View>
              <View style={styles.separator} />

              <SelectGroup
                label="Level / Year of Study"
                options={['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Postgrad']}
                selectedValues={level}
                onToggle={setLevel}
                theme={themeContext}
              />

              <SelectGroup
                label="Student Status"
                options={['Full-time', 'Part-time']}
                selectedValues={status}
                onToggle={setStatus}
                theme={themeContext}
                isLast
              />
            </FormSection>

            <FormSection title="Support Preferences" theme={themeContext}>
              <SelectGroup
                label="Primary Sources of Stress"
                options={['Academics', 'Financial', 'Relationships', 'Social', 'Other']}
                selectedValues={stressSources}
                multiple
                onToggle={(val) => {
                  if (stressSources.includes(val)) setStressSources(stressSources.filter(s => s !== val));
                  else setStressSources([...stressSources, val]);
                }}
                theme={themeContext}
              />

              <SelectGroup
                label="Preferred Support Types"
                options={['Self-help', 'Mood tracking', 'Chat', 'Crisis', 'All']}
                selectedValues={supportTypes}
                multiple
                onToggle={(val) => {
                  if (supportTypes.includes(val)) setSupportTypes(supportTypes.filter(s => s !== val));
                  else setSupportTypes([...supportTypes, val]);
                }}
                theme={themeContext}
              />

              <SelectGroup
                label="Daily Reminder Preference"
                options={['Yes', 'No']}
                selectedValues={reminders}
                onToggle={setReminders}
                theme={themeContext}
                isLast
              />
            </FormSection>

            <View style={styles.personalizationNote}>
              <Heart color={themeContext.colors.plum} size={18} style={{ opacity: 0.8 }} />
              <Typography variant="captionMedium" color={themeContext.colors.text.secondary} style={{ flex: 1, lineHeight: 18 }}>
                This helps us shape a supportive experience tailored just for you.
              </Typography>
            </View>

            <Button
              variant="primary"
              size="large"
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              style={{ marginTop: 24 }}
            >
              Create Account
            </Button>

            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/login')} style={styles.signUpContainer}>
              <Typography variant="body" color={themeContext.colors.text.secondary}>
                Already have an account? <Typography variant="bodyBold" color={themeContext.colors.plum}>Log In</Typography>
              </Typography>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#000000' : '#F2F2F7' },
  scrollContent: { paddingHorizontal: 20, minHeight: height },
  header: { marginTop: 10, marginBottom: 40 },
  backButton: { 
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: { flex: 1, gap: 32 },
  titleContainer: { marginBottom: 8 },
  
  sectionContainer: { gap: 8 },
  sectionTitle: { 
    marginLeft: 16,
    color: theme.colors.text.tertiary, 
    marginBottom: 4,
  },
  groupedList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  groupedListDark: {
    backgroundColor: '#1C1C1E',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    elevation: 4,
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    height: 60 
  },
  inputLabel: { 
    width: 90, 
    color: theme.colors.text.primary 
  },
  inputLabelStack: {
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  input: { 
    flex: 1, 
    color: theme.colors.text.primary, 
    fontSize: 17, 
    fontFamily: theme.typography.fonts.body, 
    height: '100%' 
  },
  separator: { 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
    marginLeft: 16 
  },
  eyeIcon: { padding: 10, marginLeft: 8 },
  
  errorRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 4, marginBottom: 4 },
  
  selectGroupRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  chipActive: { backgroundColor: theme.colors.plum },
  
  // Picker Styles
  pickerTrigger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  pickerValue: { fontSize: 17, color: theme.colors.text.secondary, flex: 1, textAlign: 'right', marginRight: 8, fontFamily: theme.typography.fonts.body },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: height * 0.85, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, borderRadius: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 56, color: theme.colors.text.primary, fontWeight: '600', fontSize: 16 },
  listContent: { paddingBottom: 40 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' },
  listItemActive: { backgroundColor: theme.isDark ? 'rgba(140, 160, 185, 0.1)' : 'rgba(123, 97, 255, 0.05)', borderRadius: 16, paddingHorizontal: 16, marginVertical: 4, borderBottomWidth: 0 },
  listItemText: { fontSize: 16, color: theme.colors.text.primary, fontWeight: '500', flex: 1 },
  listItemTextActive: { color: theme.colors.plum, fontWeight: '700' },

  personalizationNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', padding: 16, borderRadius: 14, marginTop: 8, gap: 12 },
  signUpContainer: { marginTop: 16, alignItems: 'center', marginBottom: 20 },
});
