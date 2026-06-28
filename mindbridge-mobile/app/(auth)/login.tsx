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
  StatusBar
} from 'react-native';
import { useState, useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';
import Animated, { FadeInUp, FadeIn, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, ChevronLeft, AlertCircle, Ghost } from 'lucide-react-native';
import AuthCharacters, { AuthField } from '../../src/components/AuthCharacters';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';

const { height, width } = Dimensions.get('window');

const ErrorMessage = ({ message, theme }: { message: string, theme: any }) => {
  if (!message) return null;
  const styles = createStyles(theme);
  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.errorRow}>
      <AlertCircle color={theme.colors.semantic.danger} size={14} style={{ marginRight: 4 }} />
      <Typography variant="captionMedium" color={theme.colors.semantic.danger}>{message}</Typography>
    </Animated.View>
  );
};

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();
  const { anonymous } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const themeContext = useTheme();
  const styles = createStyles(themeContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<AuthField>('none');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const emailShake = useSharedValue(0);
  const passwordShake = useSharedValue(0);

  const shake = (field: 'email' | 'password') => {
    const sv = field === 'email' ? emailShake : passwordShake;
    sv.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const emailStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: emailShake.value }]
  }));

  const passwordStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passwordShake.value }]
  }));

  const validateField = (field: 'email' | 'password') => {
    let newErrors = { ...errors };
    if (field === 'email') {
      if (!email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
      else delete newErrors.email;
    }
    if (field === 'password') {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else delete newErrors.password;
    }
    setErrors(newErrors);
    
    if (newErrors[field] && !errors[field]) {
      shake(field);
    }
  };

  const validate = () => {
    let valid = true;
    let newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    if (newErrors.email) shake('email');
    if (newErrors.password) shake('password');
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await signIn(response.data.token, response.data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Unable to connect to server';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        await signIn('guest-token-' + Date.now());
        router.replace('/(auth)/onboarding');
      } catch (e) {
        Alert.alert('Error', 'Unable to start anonymous session');
      } finally {
        setLoading(false);
      }
    }, 1500);
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
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage} 
                resizeMode="cover"
              />
            </View>
            <View style={styles.characterPos}>
              <AuthCharacters 
                focusedField={focusedField} 
                showPassword={showPassword} 
              />
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.duration(800).duration(500)} style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Typography variant="h1" style={{ marginBottom: 8 }}>Welcome back</Typography>
              <Typography variant="body" color={themeContext.colors.text.secondary}>Sign in to your account.</Typography>
            </View>

            <View style={styles.inputGroup}>
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
                  onChangeText={(txt) => {
                    setEmail(txt);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => {
                    setFocusedField('none');
                    validateField('email');
                  }}
                />
                <ErrorMessage message={errors.email || ''} theme={themeContext} />
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
                    onChangeText={(txt) => {
                      setPassword(txt);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      setFocusedField('none');
                      validateField('password');
                    }}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff color={themeContext.colors.text.disabled} size={22} />
                    ) : (
                      <Eye color={themeContext.colors.text.disabled} size={22} />
                    )}
                  </TouchableOpacity>
                </View>
                <ErrorMessage message={errors.password || ''} theme={themeContext} />
              </Animated.View>

              <TouchableOpacity style={styles.forgotPasswordBtn} onPress={() => Alert.alert('Reset Password', 'Instructions have been sent to your email.')}>
                <Typography variant="ui" color={themeContext.colors.plum}>Forgot password?</Typography>
              </TouchableOpacity>
            </View>

            <Button
              variant="primary"
              size="large"
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
            >
              Log In
            </Button>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Typography variant="captionMedium" color={themeContext.colors.text.secondary}>OR</Typography>
              <View style={styles.divider} />
            </View>

            <Button
              variant="outline"
              size="large"
              onPress={handleAnonymousLogin}
              disabled={loading}
              loading={loading}
              icon={<Ghost color={themeContext.colors.plum} size={20} />}
            >
              Continue Anonymously
            </Button>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              style={styles.signUpContainer}
            >
              <Typography variant="body" color={themeContext.colors.text.secondary}>
                Don't have an account? <Typography variant="bodyBold" color={themeContext.colors.plum}>Sign Up</Typography>
              </Typography>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.backgroundSecondary 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    minHeight: height,
  },
  header: { 
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center',
    marginLeft: -8,
  },
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
    shadowColor: theme.colors.plum, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: theme.isDark ? 0.3 : 0.1, 
    shadowRadius: 16, 
    elevation: 8 
  },
  logoImage: { width: '100%', height: '100%' },
  characterPos: {
    position: 'absolute',
    bottom: -10,
    right: '25%',
  },
  formContainer: { 
    flex: 1,
  },
  titleContainer: { 
    marginBottom: 32,
  },
  inputGroup: { 
    gap: 20,
    marginBottom: 32,
  },
  inputWrapper: { gap: 8 },
  label: { 
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  input: { 
    backgroundColor: theme.colors.surface, 
    color: theme.colors.text.primary, 
    fontSize: 16, 
    fontFamily: theme.typography.fonts.ui,
    height: 60, 
    borderRadius: 20, 
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
  },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.surface, 
    borderRadius: 20,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.ui,
  },
  inputFocused: {
    borderColor: theme.colors.plum,
    borderWidth: 1.5,
    shadowColor: theme.colors.plum,
    shadowOpacity: theme.isDark ? 0.3 : 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  inputError: { 
    borderWidth: 2,
    borderColor: theme.colors.semantic.danger 
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, marginTop: 4 },
  eyeIcon: { padding: 16 },
  forgotPasswordBtn: { alignSelf: 'flex-end' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' },
  signUpContainer: { marginTop: 32, alignItems: 'center', marginBottom: 20 },
});
