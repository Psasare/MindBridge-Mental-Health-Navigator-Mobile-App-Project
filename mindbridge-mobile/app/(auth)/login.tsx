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
  StatusBar
} from 'react-native';
import { useState, useContext } from 'react';
import { AuthContext } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';
import Animated, { FadeInUp, FadeIn, useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, ChevronLeft, AlertCircle, Ghost, ArrowRight } from 'lucide-react-native';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BlurView } from 'expo-blur';

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

  const emailStyle = useAnimatedStyle(() => ({ transform: [{ translateX: emailShake.value }] }));
  const passwordStyle = useAnimatedStyle(() => ({ transform: [{ translateX: passwordShake.value }] }));

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

          {/* Form Content */}
          <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Typography variant="h1" style={{ marginBottom: 12 }}>Sign In</Typography>
              <Typography variant="body" color={themeContext.colors.text.secondary}>Enter your credentials to continue your journey.</Typography>
            </View>

            {/* HIG Grouped List for Inputs */}
            <View style={[styles.groupedList, themeContext.isDark && styles.groupedListDark]}>
              <Animated.View style={[styles.inputRow, emailStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Email</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="anna@example.com"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(txt) => {
                    setEmail(txt);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onBlur={() => validateField('email')}
                />
              </Animated.View>
              <View style={styles.separator} />
              <Animated.View style={[styles.inputRow, passwordStyle]}>
                <Typography variant="body" style={styles.inputLabel}>Password</Typography>
                <TextInput
                  style={styles.input}
                  placeholder="Required"
                  placeholderTextColor={themeContext.colors.text.disabled}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(txt) => {
                    setPassword(txt);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  onBlur={() => validateField('password')}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff color={themeContext.colors.text.tertiary} size={20} />
                  ) : (
                    <Eye color={themeContext.colors.text.tertiary} size={20} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
            
            {/* Errors */}
            {(errors.email || errors.password) && (
              <View style={styles.errorContainer}>
                <ErrorMessage message={errors.email || ''} theme={themeContext} />
                <ErrorMessage message={errors.password || ''} theme={themeContext} />
              </View>
            )}

            <TouchableOpacity style={styles.forgotPasswordBtn} onPress={() => Alert.alert('Reset Password', 'Instructions have been sent to your email.')} activeOpacity={0.7}>
              <Typography variant="ui" color={themeContext.colors.plum}>Forgot password?</Typography>
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              <Button
                variant="primary"
                size="large"
                onPress={handleLogin}
                disabled={loading}
                loading={loading}
                style={styles.actionBtn}
                icon={<ArrowRight color="#FFF" size={20} />}
                iconPosition="right"
              >
                Continue
              </Button>

              <Button
                variant="outline"
                size="large"
                onPress={handleAnonymousLogin}
                disabled={loading}
                loading={loading}
                style={styles.actionBtnOutline}
                icon={<Ghost color={themeContext.isDark ? '#FFF' : themeContext.colors.text.primary} size={20} />}
              >
                Continue Anonymously
              </Button>
            </View>

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
    backgroundColor: theme.isDark ? '#000000' : '#F2F2F7', 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    minHeight: height,
  },
  header: { 
    marginTop: 10,
    marginBottom: 40,
  },
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
  formContainer: { 
    flex: 1,
  },
  titleContainer: { 
    marginBottom: 40,
    alignItems: 'flex-start',
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
    height: 60,
  },
  inputLabel: {
    width: 90,
    color: theme.colors.text.primary,
  },
  input: { 
    flex: 1,
    color: theme.colors.text.primary, 
    fontSize: 17, 
    fontFamily: theme.typography.fonts.body,
    height: '100%', 
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginLeft: 16,
  },
  eyeIcon: { 
    padding: 10,
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  errorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  forgotPasswordBtn: { 
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionBtn: {
    borderRadius: 16,
    height: 56,
  },
  actionBtnOutline: {
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
  },
  signUpContainer: { 
    marginTop: 32, 
    alignItems: 'center', 
    marginBottom: 20 
  },
});
