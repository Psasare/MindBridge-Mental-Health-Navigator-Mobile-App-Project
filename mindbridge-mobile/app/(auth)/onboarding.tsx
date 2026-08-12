import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { translations, Language, TranslationSchema } from '../../src/utils/translations';
import { FadeInUp, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import Reanimated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { 
  ChevronRight, ChevronLeft, ShieldCheck, User, CheckCircle2,
  Info, GraduationCap, BookOpen, Brain, MessageSquare, Activity, Heart, Users, Zap
} from 'lucide-react-native';
import { AnimatedLogoLoader } from '../../src/components/AnimatedLogoLoader';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';

const { width, height } = Dimensions.get('window');

type StepType = 'privacy' | 'text' | 'single-choice' | 'multiple-choice' | 'sliders' | 'summary' | 'consent';

interface OnboardingStep {
  id: string;
  type: StepType;
  title: string;
  subtitle?: string;
  whyWeAsk?: string;
  options?: { label: string; value: string; }[];
  sliderQuestions?: { label: string; key: string }[];
  required?: boolean;
  icon?: any;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'consent',
    type: 'consent',
    title: 'Consent & Commitment',
    required: true,
    icon: ShieldCheck,
  },
  {
    id: 'q1',
    type: 'text',
    title: "Let's get to know you!",
    subtitle: "What should we call you?",
    whyWeAsk: "We'll use this to make our conversations feel personal",
    required: false,
    icon: User,
  },
  {
    id: 'q2',
    type: 'single-choice',
    title: "Welcome!",
    subtitle: "Which university are you attending?",
    whyWeAsk: "We'll connect you with campus-specific resources and support",
    options: [
      { label: "KNUST", value: "KNUST" },
      { label: "University of Ghana", value: "UG" },
      { label: "University of Cape Coast", value: "UCC" },
      { label: "Ashesi University", value: "Ashesi" },
      { label: "GIMPA", value: "GIMPA" },
      { label: "Other", value: "Other" },
    ],
    required: true,
    icon: GraduationCap,
  },
  {
    id: 'q3',
    type: 'single-choice',
    title: "What year are you in?",
    subtitle: "Select your current level:",
    whyWeAsk: "Different years bring different stressors. Level 400? We know about thesis pressure!",
    options: [
      { label: "Level 100 (First year)", value: "100" },
      { label: "Level 200 (Second year)", value: "200" },
      { label: "Level 300 (Third year)", value: "300" },
      { label: "Level 400 (Final year)", value: "400" },
      { label: "Postgraduate", value: "500" },
    ],
    required: true,
    icon: BookOpen,
  },
  {
    id: 'q4',
    type: 'single-choice',
    title: "What are you studying?",
    subtitle: "Select from common programs:",
    whyWeAsk: "Some programs have unique pressures we want to understand",
    options: [
      { label: "Engineering", value: "Engineering" },
      { label: "Medicine/Health Sciences", value: "Medicine/Health Sciences" },
      { label: "Business/Economics", value: "Business/Economics" },
      { label: "Arts/Humanities", value: "Arts/Humanities" },
      { label: "Science", value: "Science" },
      { label: "Social Sciences", value: "Social Sciences" },
      { label: "Law", value: "Law" },
      { label: "Other", value: "Other" },
    ],
    required: false,
    icon: Brain,
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    title: "What brings you to MindBridge?",
    subtitle: "Select all that apply:",
    whyWeAsk: "This helps us prioritize what matters most to you",
    options: [
      { label: "Academic stress", value: "academic_stress" },
      { label: "Anxiety or worry", value: "anxiety" },
      { label: "Feeling sad or down", value: "sadness" },
      { label: "Loneliness or isolation", value: "loneliness" },
      { label: "Relationship issues", value: "relationships" },
      { label: "Financial stress", value: "financial" },
      { label: "Family pressure", value: "family" },
      { label: "Just want to track my mental health", value: "tracking" },
      { label: "Other", value: "other" },
    ],
    required: false,
    icon: MessageSquare,
  },
  {
    id: 'q6',
    type: 'sliders',
    title: "Current Stressors",
    subtitle: "On a scale of 1-5, how much are these affecting you right now?",
    whyWeAsk: "We'll watch for patterns and offer support when these spike",
    sliderQuestions: [
      { label: "Exams & Tests", key: "exams" },
      { label: "Assignments", key: "assignments" },
      { label: "Financial concerns", key: "financial" },
      { label: "Social/relationships", key: "social" },
      { label: "Family expectations", key: "family" },
      { label: "Future uncertainty", key: "future" },
    ],
    required: false,
    icon: Activity,
  },
  {
    id: 'q7',
    type: 'multiple-choice',
    title: "What helps you feel better?",
    subtitle: "Select what you already do or want to try:",
    whyWeAsk: "We'll ONLY suggest coping strategies you're comfortable with",
    options: [
      { label: "Exercise or movement", value: "exercise" },
      { label: "Writing or journaling", value: "journaling" },
      { label: "Prayer or meditation", value: "prayer" },
      { label: "Talking to someone", value: "talking" },
      { label: "Listening to music", value: "music" },
      { label: "Resting or sleeping", value: "rest" },
      { label: "Deep breathing", value: "breathing" },
      { label: "Other", value: "other" },
    ],
    required: true,
    icon: Heart,
  },
  {
    id: 'q8',
    type: 'single-choice',
    title: "How important is faith in your life?",
    subtitle: "Select your preference:",
    whyWeAsk: "We respect your beliefs and will tailor our support accordingly",
    options: [
      { label: "Very important", value: "VERY_IMPORTANT" },
      { label: "Somewhat important", value: "SOMEWHAT_IMPORTANT" },
      { label: "Not important", value: "NOT_IMPORTANT" },
    ],
    required: false,
    icon: Heart,
  },
  {
    id: 'q9',
    type: 'single-choice',
    title: "Who do you have in your corner?",
    subtitle: "Right now, I feel:",
    whyWeAsk: "If you're feeling alone, we'll connect you with peer support",
    options: [
      { label: "Supported (I have people)", value: "STRONG" },
      { label: "Somewhat alone", value: "SOMEWHAT" },
      { label: "Very alone", value: "ALONE" },
    ],
    required: false,
    icon: Users,
  },
  {
    id: 'q10',
    type: 'multiple-choice',
    title: "What are you hoping to achieve?",
    subtitle: "Select your top goals (choose up to 3):",
    whyWeAsk: "We'll help you track progress toward what matters to you",
    options: [
      { label: "Reduce stress and anxiety", value: "reduce_stress" },
      { label: "Improve my mood", value: "improve_mood" },
      { label: "Build emotional resilience", value: "build_resilience" },
      { label: "Sleep better", value: "sleep_better" },
      { label: "Develop healthy habits", value: "healthy_habits" },
      { label: "Connect with peer support", value: "peer_support" },
      { label: "Track my mental health journey", value: "track_journey" },
      { label: "Prepare for counseling", value: "prepare_counseling" },
      { label: "Practice mindfulness", value: "mindfulness" },
      { label: "Improve my academic performance", value: "academic_performance" },
    ],
    required: false,
    icon: Zap,
  },
  {
    id: 'summary',
    type: 'summary',
    title: "Your Personalized Profile",
    required: true,
    icon: CheckCircle2,
  }
];

const DiscreteSlider = ({ value, onValueChange, theme }: { value: number, onValueChange: (val: number) => void, theme: any }) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderTrack} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        {[1, 2, 3, 4, 5].map((val) => (
          <TouchableOpacity activeOpacity={0.7} 
            key={val} 
            onPress={() => onValueChange(val)}
            style={[
              styles.sliderDot,
              value >= val && styles.sliderDotActive
            ]}
          >
            <Text style={[styles.sliderDotText, value >= val && styles.sliderDotTextActive]}>{val}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeContext = useTheme();
    const { updateUserData, userData: authData } = useContext(AuthContext);
    const styles = createStyles(themeContext);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({
      stressors: {}
    });
    const [showSkipModal, setShowSkipModal] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const preferredLanguage = (authData?.preferredLanguage as Language) || 'English';
    const t: TranslationSchema = translations[preferredLanguage] || translations.English;

    const step = ONBOARDING_STEPS[currentStepIndex];

    // Questions 1 to 10 mapped to index 1 to 10
    const isQuestionStep = currentStepIndex > 0 && currentStepIndex < ONBOARDING_STEPS.length - 1;
    const questionNumber = currentStepIndex;

    useEffect(() => {
      let progress = 0;
      if (isQuestionStep) {
        progress = questionNumber / 10;
      } else if (currentStepIndex === ONBOARDING_STEPS.length - 1) {
        progress = 1;
      }
      Animated.spring(progressAnim, {
        toValue: progress,
        useNativeDriver: false,
      }).start();
    }, [currentStepIndex]);

    const finishOnboarding = async () => {
      try {
        setIsFinishing(true);
        
        // Map frontend answers to backend schema
        const payload = {
          firstName: answers['q1'],
          university: answers['q2'],
          level: answers['q3'],
          program: answers['q4'],
          primaryGoals: answers['q10'] || [],
          interests: answers['q7'] || [],
          // Simplified stress level mapping
          stressLevel: answers.stressors ? Math.max(1, ...Object.values(answers.stressors).map(v => Number(v))) : 3,
          stressSources: answers['q5'] || [],
          supportTypes: answers['q7'] || [],
          currentMood: 'Good', 
          sleepPattern: 'Average',
          preferredLanguage: preferredLanguage,
        };

        await api.post('/onboarding', payload);
        await AsyncStorage.setItem('onboarding_completed', 'true');
        await AsyncStorage.setItem('onboarding_answers', JSON.stringify(answers));
        
        // Update auth state so layout redirect happens
        await updateUserData({ isOnboarded: true });

        // Delay slightly for effect
        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 1500);
      } catch (error) {
        console.error('Failed to save onboarding:', error);
        // Even if error, update local state to allow access (can try again later)
        await updateUserData({ isOnboarded: true });
        router.replace('/(tabs)/dashboard');
      }
    };

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleSkipRequest = () => {
    if (step.required) return;
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    setShowSkipModal(false);
    handleNext();
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSelectSingle = (value: string) => {
    setAnswers({ ...answers, [step.id]: value });
  };

  const handleSelectMultiple = (value: string) => {
    const currentList = answers[step.id] || [];
    if (currentList.includes(value)) {
      setAnswers({ ...answers, [step.id]: currentList.filter((v: string) => v !== value) });
    } else {
      if (step.id === 'q10' && currentList.length >= 5) return; // Max 5 for goals
      setAnswers({ ...answers, [step.id]: [...currentList, value] });
    }
  };

  const handleSliderChange = (key: string, value: number) => {
    setAnswers({
      ...answers,
      stressors: {
        ...(answers.stressors || {}),
        [key]: value
      }
    });
  };

  const hasValidAnswer = () => {
    if (step.type === 'text') return (answers[step.id]?.trim()?.length || 0) >= 2;
    if (step.type === 'single-choice') return !!answers[step.id];
    if (step.type === 'multiple-choice') return (answers[step.id]?.length || 0) > 0;
    if (step.type === 'sliders') return answers.stressors && Object.keys(answers.stressors).length > 0;
    return true;
  };

  const isNextEnabled = hasValidAnswer();

  const renderContent = () => {
    switch (step.type) {
      case 'consent':
        const userName = authData?.name || 'Friend';
        const userUni = authData?.academic?.institution || 'your university';
        
        return (
          <View style={styles.stepContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 100 }}
              style={{ flex: 1 }}
            >
              <View style={[styles.centerContent, { marginTop: 40, marginBottom: 20 }]}>
                <View style={styles.iconCircle}>
                  <ShieldCheck color={themeContext.colors.plum} size={40} strokeWidth={1.5} />
                </View>
                <Typography variant="h2" style={styles.title}>Privacy & Data Commitment</Typography>
              </View>

              <Typography variant="h3" style={styles.consentGreeting}>Your Privacy Matters</Typography>
              <Typography variant="body" color={themeContext.colors.text.secondary} style={styles.consentBody}>
                MindBridge uses your personal and academic information, including your studies at {userUni}, to provide a tailored mental health and academic support experience. Your privacy is protected according to university standards.
              </Typography>
              
              <View style={styles.consentPointsBox}>
                <View style={styles.consentPointRow}>
                  <View style={styles.consentCheckWrap}>
                    <CheckCircle2 color={themeContext.colors.accents.eucalyptus} size={20} />
                  </View>
                  <Typography variant="bodyBold" style={styles.consentPointText}>Your data is secured with industry-standard encryption to ensure total confidentiality.</Typography>
                </View>
                <View style={styles.consentPointRow}>
                  <View style={styles.consentCheckWrap}>
                    <CheckCircle2 color={themeContext.colors.accents.eucalyptus} size={20} />
                  </View>
                  <Typography variant="bodyBold" style={styles.consentPointText}>You maintain full control and can manage or remove your data permissions at any time.</Typography>
                </View>
                <View style={styles.consentPointRow}>
                  <View style={styles.consentCheckWrap}>
                    <CheckCircle2 color={themeContext.colors.accents.eucalyptus} size={20} />
                  </View>
                  <Typography variant="bodyBold" style={styles.consentPointText}>We only use your information to improve your wellness and academic experience.</Typography>
                </View>
              </View>

              <View style={styles.commitmentCard}>
                <Typography variant="label" color={themeContext.colors.plum} style={styles.consentCommitmentTitle}>Important Safety Note</Typography>
                <Typography variant="body" color={themeContext.colors.text.secondary} style={styles.consentCommitmentText}>
                  MindBridge is a supportive wellness tool and should not be used as a replacement for professional clinical care. If you ever feel you are in immediate danger or distress, please reach out to emergency services or campus support.
                </Typography>
              </View>

              <Button
                variant="primary"
                size="large"
                onPress={handleNext}
                style={{ marginTop: 32, marginBottom: 20 }}
              >
                Agree and Continue
              </Button>
              
              <TouchableOpacity  onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} style={{ marginBottom: 20, alignSelf: 'center' }} activeOpacity={0.6}>
                <Typography variant="bodyBold" color={themeContext.colors.text.tertiary} style={styles.exitText}>Decline and Exit</Typography>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );

      case 'text':
        return (
          <View style={styles.stepContainer}>
            {step.icon && (
              <View style={styles.stepIconWrap}>
                <step.icon color={themeContext.colors.plum} size={26} strokeWidth={2} />
              </View>
            )}
            <Typography variant="h2" style={styles.title}>{step.title}</Typography>
            <Typography variant="body" color={themeContext.colors.text.secondary} style={styles.subtitle}>{step.subtitle}</Typography>
            <TextInput
              style={styles.textInput}
              placeholder="Your name"
              placeholderTextColor={themeContext.colors.text.disabled}
              value={answers[step.id] || ''}
              onChangeText={(text) => setAnswers({ ...answers, [step.id]: text })}
              autoFocus
            />
            {step.whyWeAsk && (
              <View style={styles.whyWeAskBox}>
                <Info color={themeContext.colors.plum} size={16} />
                <Typography variant="captionMedium" color={themeContext.colors.plum} style={styles.whyWeAskText}>{step.whyWeAsk}</Typography>
              </View>
            )}
          </View>
        );

      case 'single-choice':
      case 'multiple-choice':
        const titleWithContext = step.id === 'q2' && answers['q1'] 
          ? `Welcome, ${answers['q1']}!` 
          : step.title;

        return (
          <View style={styles.stepContainer}>
            {step.icon && (
              <View style={styles.stepIconWrap}>
                <step.icon color={themeContext.colors.plum} size={26} strokeWidth={2} />
              </View>
            )}
            <Typography variant="h2" style={styles.title}>{titleWithContext}</Typography>
            <Typography variant="body" color={themeContext.colors.text.secondary} style={styles.subtitle}>{step.subtitle}</Typography>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 100 }}>
              {step.options?.map((opt) => {
                const isSelected = step.type === 'multiple-choice' 
                  ? (answers[step.id] || []).includes(opt.value)
                  : answers[step.id] === opt.value;

                return (
                  <TouchableOpacity 
                    key={opt.value}
                    style={[
                      styles.optionBtn,
                      isSelected && styles.optionBtnActive
                    ]}
                    onPress={() => step.type === 'multiple-choice' ? handleSelectMultiple(opt.value) : handleSelectSingle(opt.value)}
                    activeOpacity={0.7}
                  >
                    {step.type === 'multiple-choice' && (
                      <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <CheckCircle2 color={themeContext.colors.surface} size={16} />}
                      </View>
                    )}
                    <Typography variant={isSelected ? "bodyBold" : "body"} color={isSelected ? themeContext.colors.plum : themeContext.colors.text.primary} style={[
                      styles.optionLabel,
                      step.type === 'multiple-choice' && { marginLeft: 12 }
                    ]}>
                      {opt.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {step.whyWeAsk && (
              <View style={styles.whyWeAskBox}>
                <Info color={themeContext.colors.plum} size={16} />
                <Typography variant="captionMedium" color={themeContext.colors.plum} style={styles.whyWeAskText}>{step.whyWeAsk}</Typography>
              </View>
            )}
          </View>
        );

      case 'sliders':
        return (
          <View style={styles.stepContainer}>
            {step.icon && (
              <View style={styles.stepIconWrap}>
                <step.icon color={themeContext.colors.plum} size={26} strokeWidth={2} />
              </View>
            )}
            <Typography variant="h2" style={styles.title}>{step.title}</Typography>
            <Typography variant="body" color={themeContext.colors.text.secondary} style={styles.subtitle}>{step.subtitle}</Typography>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              {step.sliderQuestions?.map((q) => (
                <View key={q.key} style={styles.sliderItem}>
                  <Typography variant="bodyBold" style={styles.sliderLabel}>{q.label}</Typography>
                  <DiscreteSlider 
                    value={answers.stressors?.[q.key] || 0} 
                    onValueChange={(val) => handleSliderChange(q.key, val)}
                    theme={themeContext}
                  />
                </View>
              ))}
            </ScrollView>

            {step.whyWeAsk && (
              <View style={styles.whyWeAskBox}>
                <Info color={themeContext.colors.plum} size={16} />
                <Typography variant="captionMedium" color={themeContext.colors.plum} style={styles.whyWeAskText}>{step.whyWeAsk}</Typography>
              </View>
            )}
          </View>
        );

      case 'summary':
        const name = answers['q1'] || 'Friend';
        const level = ONBOARDING_STEPS.find(s => s.id === 'q3')?.options?.find(o => o.value === answers['q3'])?.label || answers['q3'];
        const program = answers['q4'] || 'student';
        const uni = answers['q2'];
        const goalsLabels = (answers['q10'] || []).map((val: string) => 
          ONBOARDING_STEPS.find(s => s.id === 'q10')?.options?.find(o => o.value === val)?.label
        ).filter(Boolean).join(', ');
        
        return (
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <User color={themeContext.colors.plum} size={40} strokeWidth={1.5} />
            </View>
            <Typography variant="h2" style={styles.title}>{t.onboarding.summaryTitle || step.title}</Typography>
            <Typography variant="h3" style={styles.summaryGreeting}>Hey {name}!</Typography>
            
            <View style={styles.summaryBox}>
              <Typography variant="bodyBold" color={themeContext.colors.text.secondary} style={styles.summaryBoxTitle}>Here's what we learned about you:</Typography>
              
              <TouchableOpacity activeOpacity={0.7} onPress={() => jumpToStep(2)} style={styles.summaryItemRow}>
                <Typography variant="body" style={styles.summaryItem}>• {level} {program} at {uni}</Typography>
                <Typography variant="ui" color={themeContext.colors.plum} style={styles.editLabel}>Edit</Typography>
              </TouchableOpacity>

              {(answers['q5'] && answers['q5'].length > 0) && (
                <TouchableOpacity activeOpacity={0.7} onPress={() => jumpToStep(6)} style={styles.summaryItemRow}>
                  <Typography variant="body" style={styles.summaryItem}>• Working on: {answers['q5'].length} concern(s)</Typography>
                  <Typography variant="ui" color={themeContext.colors.plum} style={styles.editLabel}>Edit</Typography>
                </TouchableOpacity>
              )}

              {(answers['q7'] && answers['q7'].length > 0) && (
                <TouchableOpacity activeOpacity={0.7} onPress={() => jumpToStep(8)} style={styles.summaryItemRow}>
                  <Typography variant="body" style={styles.summaryItem}>• Coping via: {answers['q7'].length} method(s)</Typography>
                  <Typography variant="ui" color={themeContext.colors.plum} style={styles.editLabel}>Edit</Typography>
                </TouchableOpacity>
              )}

              {goalsLabels ? (
                <TouchableOpacity activeOpacity={0.7} onPress={() => jumpToStep(11)} style={styles.summaryItemRow}>
                  <Typography variant="body" style={styles.summaryItem}>• Goals: {goalsLabels}</Typography>
                  <Typography variant="ui" color={themeContext.colors.plum} style={styles.editLabel}>Edit</Typography>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.summaryFooterBox}>
              <Typography variant="bodyBold" color={themeContext.colors.accents.eucalyptus} style={styles.summaryItem}>✓ Personalize AI conversations</Typography>
              <Typography variant="bodyBold" color={themeContext.colors.accents.eucalyptus} style={styles.summaryItem}>✓ Suggest relevant resources</Typography>
              <Typography variant="bodyBold" color={themeContext.colors.accents.eucalyptus} style={styles.summaryItem}>✓ Track your progress</Typography>
            </View>

            <Button
              variant="primary"
              size="large"
              onPress={handleNext}
              style={{ marginTop: 30 }}
            >
              Let's Begin!
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={themeContext.isDark ? "light-content" : "dark-content"} />

      {/* Header with Back and Progress */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backBtn}>
              <ChevronLeft color={themeContext.colors.plum} size={28} />
            </TouchableOpacity>
          ) : <View style={{ width: 28 }} />}
          
          {isQuestionStep && (
            <Typography variant="bodyBold" color={themeContext.colors.plum} style={styles.progressText}>Question {questionNumber} of 10</Typography>
          )}
          
          <View style={{ width: 28 }} />
        </View>

        {isQuestionStep && (
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }) 
                }
              ]} 
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Reanimated.View 
          key={currentStepIndex} 
          entering={FadeInRight.duration(400)} 
          exiting={FadeOutLeft.duration(300)}
          style={{ flex: 1 }}
        >
          {renderContent()}
        </Reanimated.View>
      </View>

      {/* Footer for non-privacy and non-summary steps */}
      {isQuestionStep && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
          <View style={styles.leftFooterActions}>
            <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backFooterBtn}>
              <ChevronLeft color={themeContext.colors.plum} size={24} />
            </TouchableOpacity>
            
            {!step.required && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleSkipRequest} style={styles.skipBtn}>
                <Typography variant="bodyBold" color={themeContext.colors.text.secondary} style={styles.skipText}>{t.common.skip}</Typography>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity activeOpacity={0.7} 
            onPress={handleNext} 
            style={[styles.nextBtn, !isNextEnabled && styles.nextBtnDisabled]}
            disabled={!isNextEnabled}
          >
            <Typography variant="bodyBold" color={themeContext.colors.text.onPrimary || '#FFF'} style={styles.nextBtnText}>{t.common.next}</Typography>
            <ChevronRight color={themeContext.colors.text.onPrimary || '#FFF'} size={20} />
          </TouchableOpacity>
        </View>
      )}

      {/* Skip Confirmation Modal */}
      <Modal visible={showSkipModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Reanimated.View entering={FadeInUp} style={styles.modalContent}>
            <Typography variant="h2" style={styles.modalTitle}>Wait a moment</Typography>
            <Typography variant="body" color={themeContext.colors.text.secondary} style={styles.modalText}>{t.onboarding.skipConfirm}</Typography>
            <Button variant="primary" size="large" onPress={confirmSkip} style={{ marginBottom: 12 }}>
              {t.onboarding.skipConfirmAction}
            </Button>
            <Button variant="outline" size="large" onPress={() => setShowSkipModal(false)}>
              {t.onboarding.skipConfirmCancel}
            </Button>
          </Reanimated.View>
        </View>
      </Modal>

      {/* Finishing / Transition Modal */}
      <Modal visible={isFinishing} transparent animationType="fade">
        <AnimatedLogoLoader />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  background: { ...StyleSheet.absoluteFillObject },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  backBtn: { padding: 4 },
  progressTrack: { height: 8, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: theme.colors.plum, borderRadius: 4 },
  progressText: { fontSize: 14, fontWeight: '700', color: theme.colors.plum, opacity: 0.8 },
  content: { flex: 1, paddingHorizontal: 24 },
  
  // Layouts
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stepContainer: { flex: 1, paddingTop: 10 },
  
  // Shared
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: theme.isDark ? 0.2 : 0.08, shadowRadius: 16, elevation: 8 },
  stepIconWrap: { width: 52, height: 52, borderRadius: 18, backgroundColor: theme.colors.plum + '12', alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  
  // Privacy / Consent
  privacyText: { fontSize: 15, color: theme.colors.text.primary, lineHeight: 28, textAlign: 'center', paddingHorizontal: 10 },
  consentGreeting: { fontSize: 20, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 12, marginTop: 8, letterSpacing: -0.5 },
  consentBody: { fontSize: 15, color: theme.colors.text.secondary, lineHeight: 24, marginBottom: 24, fontWeight: '500' },
  consentPointsBox: { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(123, 97, 255, 0.04)', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(123, 97, 255, 0.1)' },
  consentPointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 14 },
  consentCheckWrap: { marginTop: 2, backgroundColor: theme.isDark ? 'rgba(95, 141, 123, 0.1)' : 'rgba(95, 141, 123, 0.08)', borderRadius: 10, padding: 4 },
  consentPointText: { flex: 1, fontSize: 15, color: theme.colors.text.primary, fontWeight: '600', lineHeight: 22 },
  commitmentCard: { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 24, padding: 24, borderLeftWidth: 4, borderLeftColor: theme.colors.plum, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  consentCommitmentTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.plum, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  consentCommitmentText: { fontSize: 14, color: theme.colors.text.secondary, lineHeight: 22, fontWeight: '500' },
  // Options
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingVertical: 20, borderRadius: 24, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', marginBottom: 12 },
  optionBtnActive: { backgroundColor: theme.isDark ? 'rgba(123, 97, 255, 0.15)' : 'rgba(123, 97, 255, 0.08)', borderColor: theme.isDark ? 'rgba(123, 97, 255, 0.4)' : 'rgba(123, 97, 255, 0.2)' },
  optionLabel: { flex: 1, fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: theme.colors.text.primary },
  optionLabelActive: { color: theme.colors.plum, fontFamily: 'Montserrat-Bold' },
  
  // Checkbox
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: theme.colors.plum, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.colors.plum },
  
  // Input
  textInput: { backgroundColor: theme.colors.surface, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 20, fontSize: 18, fontFamily: 'Montserrat-Medium', color: theme.colors.text.primary, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
  
  // Sliders
  sliderItem: { marginBottom: 24, backgroundColor: theme.colors.surface, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
  sliderLabel: { fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: theme.colors.text.primary, marginBottom: 16 },
  sliderContainer: { position: 'relative', width: '100%', height: 40, justifyContent: 'center' },
  sliderTrack: { position: 'absolute', top: 19, left: 10, right: 10, height: 4, borderRadius: 2, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
  sliderDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  sliderDotActive: { backgroundColor: theme.colors.plum, borderColor: theme.colors.plum },
  sliderDotText: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: theme.colors.text.secondary },
  sliderDotTextActive: { color: theme.colors.text.onPrimary || '#FFF' },

  // Why We Ask
  whyWeAskBox: { flexDirection: 'row', backgroundColor: theme.isDark ? 'rgba(123, 97, 255, 0.1)' : 'rgba(123, 97, 255, 0.08)', padding: 16, borderRadius: 16, marginTop: 24, alignItems: 'center' },
  whyWeAskText: { flex: 1, fontSize: 14, color: theme.colors.plum, marginLeft: 12, fontFamily: 'Montserrat-Medium', lineHeight: 20 },

  // Summary
  summaryGreeting: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: theme.colors.text.primary, marginBottom: 24 },
  summaryBox: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: 24, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
  summaryBoxTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: theme.colors.plum, marginBottom: 12 },
  summaryItem: { flex: 1, fontSize: 15, fontFamily: 'Montserrat-Medium', color: theme.colors.text.secondary, marginBottom: 8, lineHeight: 22 },
  summaryItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  editLabel: { fontSize: 13, fontFamily: 'Montserrat-Bold', color: theme.colors.plum, marginLeft: 10, backgroundColor: theme.isDark ? 'rgba(123, 97, 255, 0.15)' : 'rgba(123, 97, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  summaryFooterBox: { width: '100%', paddingHorizontal: 10, marginTop: 10 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: theme.colors.surface, borderRadius: 32, padding: 32, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'Montserrat-ExtraBold', color: theme.colors.text.primary, marginBottom: 12 },
  modalText: { fontSize: 16, fontFamily: 'Montserrat-Medium', color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  modalPrimaryBtn: { backgroundColor: theme.colors.plum, paddingVertical: 18, paddingHorizontal: 32, borderRadius: 24, width: '100%', alignItems: 'center' },
  modalPrimaryBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Montserrat-Bold' },
  modalSecondaryBtn: { paddingVertical: 18, width: '100%', alignItems: 'center', marginTop: 8 },
  modalSecondaryBtnText: { color: theme.colors.text.tertiary, fontSize: 15, fontFamily: 'Montserrat-SemiBold' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, justifyContent: 'space-between', backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', zIndex: 100 },
  leftFooterActions: { flexDirection: 'row', alignItems: 'center' },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1.5, borderColor: theme.colors.plumLight, borderRadius: 24, marginLeft: 12 },
  skipText: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: theme.colors.plumLight },
  backFooterBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.isDark ? 'rgba(123, 97, 255, 0.1)' : 'rgba(123, 97, 255, 0.08)', alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.plum, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 24 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: theme.colors.text.onPrimary || '#FFF', marginRight: 8 },
  
  // Primary Action
  primaryBtn: { backgroundColor: theme.colors.plum, paddingVertical: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryBtnText: { color: theme.colors.text.onPrimary || '#FFF', fontSize: 17, fontFamily: 'Montserrat-ExtraBold', textAlign: 'center' },
});
