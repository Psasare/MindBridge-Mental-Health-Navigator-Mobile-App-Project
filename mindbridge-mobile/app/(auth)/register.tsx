import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
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
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ChevronLeft, GraduationCap, Heart, User, AlertCircle, Search, Check, X } from 'lucide-react-native';
import AuthCharacters, { AuthField } from '../../src/components/AuthCharacters';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';

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

// ─── Custom Components ───────────────────────────────────────────────────────

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

const FormSection = ({ title, icon: Icon, theme, children }: { title: string; icon: any; theme: any; children: React.ReactNode }) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Icon color={theme.colors.plum} size={20} />
        </View>
        <Typography variant="h3">{title}</Typography>
      </View>
      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
};

const SelectGroup = ({ label, options, selectedValues, onToggle, theme, multiple = false }: { label: string; options: string[]; selectedValues: string | string[]; onToggle: (val: string) => void; theme: any; multiple?: boolean }) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipContainer}>
        {options.map((opt) => {
          const isSelected = multiple 
            ? (selectedValues as string[]).includes(opt)
            : selectedValues === opt;
          
          return (
            <TouchableOpacity
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
  );
};

// Searchable Dropdown Modal
const InstitutionPicker = ({ value, onSelect, error, theme }: { value: string; onSelect: (val: string) => void; error?: string; theme: any }) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const styles = createStyles(theme);

  const filtered = GHANA_INSTITUTIONS.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.inputWrapper}>
      <Typography variant="label" style={styles.label}>Institution / University</Typography>
      <TouchableOpacity
        style={[styles.input, styles.pickerTrigger, error && styles.inputError]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.pickerValue, !value && { color: theme.colors.text.disabled }]} numberOfLines={1}>
          {value || "Select your institution"}
        </Text>
        <ChevronLeft color={theme.colors.plum} size={20} style={{ transform: [{ rotate: '-90deg' }] }} />
      </TouchableOpacity>
      <ErrorMessage message={error} theme={theme} />

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Institution</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
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
                <TouchableOpacity
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
  const [focusedField, setFocusedField] = useState<AuthField | 'name' | 'username' | 'phoneNumber' | 'confirmPassword'>('none');
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
      if (!username) newErrors.username = 'Username is required';
      else delete newErrors.username;
    }
    if (field === 'email') {
      if (!email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
      else delete newErrors.email;
    }
    if (field === 'phoneNumber') {
      if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      else delete newErrors.phoneNumber;
    }
    if (field === 'password') {
      if (!password) newErrors.password = 'Password is required';
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

    if (!username) { newErrors.username = 'Username is required'; valid = false; }
    if (!email) { newErrors.email = 'Email is required'; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Enter a valid email'; valid = false; }

    if (!phoneNumber) { newErrors.phoneNumber = 'Phone number is required'; valid = false; }

    if (!password) { newErrors.password = 'Password is required'; valid = false; }
    else if (password.length < 6) { newErrors.password = 'Min 6 characters'; valid = false; }

    if (password !== confirmPassword) { newErrors.confirmPassword = 'Passwords do not match'; valid = false; }

    if (!institution) { newErrors.institution = 'Please select your institution'; valid = false; }

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
      <LinearGradient 
        colors={themeContext.isDark 
          ? ['rgba(123, 97, 255, 0.15)', themeContext.colors.background, themeContext.colors.backgroundSecondary]
          : ['rgba(123, 97, 255, 0.12)', themeContext.colors.background, themeContext.colors.backgroundSecondary]
        } 
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />

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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={themeContext.colors.plum} size={32} />
            </TouchableOpacity>
          </Animated.View>

          {/* Graphics / Character */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.characterContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} resizeMode="cover" />
            </View>
            <View style={styles.characterPos}>
              <AuthCharacters focusedField={focusedField} showPassword={showPassword} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).duration(500)} style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Typography variant="h1" style={{ marginBottom: 8 }}>Join MindBridge</Typography>
              <Typography variant="body" color={themeContext.colors.text.secondary}>Let's personalize your experience.</Typography>
            </View>

            <FormSection title="Account Details" icon={User} theme={themeContext}>
              <View style={styles.inputWrapper}>
                <Typography variant="label" style={styles.label}>Full Name (Optional)</Typography>
                <TextInput
                  style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                  placeholder="Prosper Shaibu Asare"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('none')}
                />
              </View>

              <Animated.View style={[styles.inputWrapper, usernameStyle]}>
                <Typography variant="label" style={styles.label}>Username</Typography>
                <TextInput
                  style={[
                    styles.input, 
                    focusedField === 'username' && styles.inputFocused,
                    errors.username ? styles.inputError : null
                  ]}
                  placeholder="asare09"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={(txt) => { setUsername(txt); if (errors.username) setErrors({ ...errors, username: undefined }); }}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => { setFocusedField('none'); validateField('username'); }}
                />
                <ErrorMessage message={errors.username} theme={themeContext} />
              </Animated.View>

              <Animated.View style={[styles.inputWrapper, emailStyle]}>
                <Typography variant="label" style={styles.label}>Email Address</Typography>
                <TextInput
                  style={[
                    styles.input, 
                    focusedField === 'email' && styles.inputFocused,
                    errors.email ? styles.inputError : null
                  ]}
                  placeholder="anna@example.com"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(txt) => { setEmail(txt); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => { setFocusedField('none'); validateField('email'); }}
                />
                <ErrorMessage message={errors.email} theme={themeContext} />
              </Animated.View>

              <Animated.View style={[styles.inputWrapper, phoneStyle]}>
                <Typography variant="label" style={styles.label}>Phone Number</Typography>
                <TextInput
                  style={[
                    styles.input, 
                    focusedField === 'phoneNumber' && styles.inputFocused,
                    errors.phoneNumber ? styles.inputError : null
                  ]}
                  placeholder="+233 55 123 4567"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(txt) => { setPhoneNumber(txt); if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined }); }}
                  onFocus={() => setFocusedField('phoneNumber')}
                  onBlur={() => { setFocusedField('none'); validateField('phoneNumber'); }}
                />
                <ErrorMessage message={errors.phoneNumber} theme={themeContext} />
              </Animated.View>

              <Animated.View style={[styles.inputWrapper, passwordStyle]}>
                <Typography variant="label" style={styles.label}>Password</Typography>
                <View style={[
                  styles.passwordContainer, 
                  focusedField === 'password' && styles.inputFocused,
                  errors.password ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={themeContext.colors.text.disabled}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(txt) => { setPassword(txt); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => { setFocusedField('none'); validateField('password'); }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? <EyeOff color={themeContext.colors.text.disabled} size={22} /> : <Eye color={themeContext.colors.text.disabled} size={22} />}
                  </TouchableOpacity>
                </View>
                <ErrorMessage message={errors.password} theme={themeContext} />
              </Animated.View>

              <Animated.View style={[styles.inputWrapper, confirmPasswordStyle]}>
                <Typography variant="label" style={styles.label}>Confirm Password</Typography>
                <TextInput
                  style={[
                    styles.input, 
                    focusedField === 'confirmPassword' && styles.inputFocused,
                    errors.confirmPassword ? styles.inputError : null
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={(txt) => { setConfirmPassword(txt); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => { setFocusedField('none'); validateField('confirmPassword'); }}
                />
                <ErrorMessage message={errors.confirmPassword} theme={themeContext} />
              </Animated.View>
            </FormSection>

            <FormSection title="Academic Context" icon={GraduationCap} theme={themeContext}>
              <InstitutionPicker
                value={institution}
                onSelect={setInstitution}
                error={errors.institution}
                theme={themeContext}
              />

              <View style={styles.inputWrapper}>
                <Typography variant="label" style={styles.label}>Faculty / Department</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  value={faculty}
                  onChangeText={setFaculty}
                />
              </View>

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
              />
            </FormSection>

            <FormSection title="Support Preferences" icon={Heart} theme={themeContext}>
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
              />
            </FormSection>

            <View style={styles.personalizationNote}>
              <Heart color={themeContext.colors.plum} size={20} style={{ opacity: 0.7 }} />
              <Typography variant="bodyBold" color={themeContext.colors.plum} style={{ flex: 1, lineHeight: 20 }}>
                This information helps us shape a supportive experience tailored just for you.
              </Typography>
            </View>

            <Button
              variant="primary"
              size="large"
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              style={{ marginTop: 16 }}
            >
              Create Account
            </Button>

            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.signUpContainer}>
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
  container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  scrollContent: { paddingHorizontal: 24, minHeight: height },
  header: { marginTop: 10, marginBottom: 20 },
  backButton: { width: 44, height: 44, justifyContent: 'center', marginLeft: -8 },
  
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
    height: 140,
  },
  logoCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    overflow: 'hidden', 
    backgroundColor: theme.colors.surface, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: theme.isDark ? 0.3 : 0.1, 
    shadowRadius: 16, 
    elevation: 8 
  },
  logoImage: { width: '100%', height: '100%' },
  characterPos: { position: 'absolute', bottom: -10 },
  
  formContainer: { flex: 1, gap: 32 },
  titleContainer: { marginBottom: 8 },
  title: { color: theme.colors.text.primary, fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  subtitle: { color: theme.colors.text.secondary, fontSize: 16, fontWeight: '500' },
  
  sectionContainer: { gap: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.isDark ? 'rgba(140, 160, 185, 0.1)' : 'rgba(123, 97, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.5 },
  sectionCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, gap: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0.2 : 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' },
  
  inputWrapper: { gap: 8 },
  label: { marginLeft: 4, textTransform: 'uppercase' },
  input: { backgroundColor: theme.colors.background, color: theme.colors.text.primary, fontSize: 16, fontFamily: theme.typography.fonts.ui, height: 60, borderRadius: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  inputFocused: {
    borderColor: theme.colors.plum,
    borderWidth: 1.5,
    shadowColor: theme.colors.plum,
    shadowOpacity: theme.isDark ? 0.3 : 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  inputError: { borderColor: theme.colors.semantic.danger, borderWidth: 2 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, marginTop: 4 },
  errorText: { color: theme.colors.semantic.danger, fontSize: 13, fontWeight: '600' },
  
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 16, height: 60, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 20, fontSize: 16, color: theme.colors.text.primary, fontFamily: theme.typography.fonts.ui },
  eyeIcon: { padding: 16 },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  chipActive: { backgroundColor: theme.colors.plum, borderColor: theme.colors.plum },
  chipText: { fontSize: 15, color: theme.colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: theme.colors.text.onPrimary || '#FFF' },

  // Picker Styles
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerValue: { fontSize: 16, fontWeight: '600', color: theme.colors.text.primary, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: height * 0.85, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.5 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, borderRadius: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 56, color: theme.colors.text.primary, fontWeight: '600', fontSize: 16 },
  listContent: { paddingBottom: 40 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' },
  listItemActive: { backgroundColor: theme.isDark ? 'rgba(140, 160, 185, 0.1)' : 'rgba(123, 97, 255, 0.05)', borderRadius: 16, paddingHorizontal: 16, marginVertical: 4, borderBottomWidth: 0 },
  listItemText: { fontSize: 16, color: theme.colors.text.primary, fontWeight: '500', flex: 1 },
  listItemTextActive: { color: theme.colors.plum, fontWeight: '700' },

  personalizationNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(140, 160, 185, 0.1)' : 'rgba(123, 97, 255, 0.05)', padding: 16, borderRadius: 20, marginTop: 8, gap: 16, borderWidth: 1, borderColor: theme.isDark ? 'rgba(140, 160, 185, 0.15)' : 'rgba(123, 97, 255, 0.1)' },
  
  signUpContainer: { marginTop: 16, alignItems: 'center', marginBottom: 20 },
});
