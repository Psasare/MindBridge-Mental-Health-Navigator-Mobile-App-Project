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
import Animated, { FadeInUp, FadeIn, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, ChevronLeft, AlertCircle, Ghost } from 'lucide-react-native';
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={themeContext.colors.plum} size={32} />
              <Typography variant="ui" color={themeContext.colors.plum}>Back</Typography>
            </TouchableOpacity>
          </Animated.View>

          {/* Form Content */}
          <Animated.View entering={FadeInUp.duration(800)} style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Typography variant="h1" style={{ marginBottom: 8 }}>Sign In</Typography>
              <Typography variant="body" color={themeContext.colors.text.secondary}>Enter your credentials to continue.</Typography>
            </View>

            {/* HIG Grouped List for Inputs */}
            <View style={styles.groupedList}>
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

            <TouchableOpacity style={styles.forgotPasswordBtn} onPress={() => Alert.alert('Reset Password', 'Instructions have been sent to your email.')}>
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
              >
                Log In
              </Button>

              <Button
                variant="outline"
                size="large"
                onPress={handleAnonymousLogin}
                disabled={loading}
                loading={loading}
                style={styles.actionBtn}
                icon={<Ghost color={themeContext.colors.plum} size={20} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  formContainer: { 
    flex: 1,
  },
  titleContainer: { 
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  groupedList: {
    backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
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
    marginBottom: 32,
  },
  actionsContainer: {
    gap: 16,
  },
  actionBtn: {
    borderRadius: 14,
  },
  signUpContainer: { 
    marginTop: 32, 
    alignItems: 'center', 
    marginBottom: 20 
  },
});
