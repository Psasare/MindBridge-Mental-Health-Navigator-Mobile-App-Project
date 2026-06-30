import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import api from '../../src/services/api';
import { useRouter } from 'expo-router';
import { 
  ClipboardList, 
  Activity, 
  BrainCircuit, 
  GraduationCap, 
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Award,
  Compass,
  PlayCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ASSESSMENT_QUESTIONS: Record<string, Record<string, { question: string; options: string[] }[]>> = {
  English: {
    phq9: [
      { question: "Little interest or pleasure in doing things", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Feeling down, depressed, or hopeless", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Trouble falling or staying asleep, or sleeping too much", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Feeling tired or having little energy", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Poor appetite or overeating", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Trouble concentrating on things, such as reading the newspaper or watching television", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Thoughts that you would be better off dead or of hurting yourself in some way", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
    ],
    gad7: [
      { question: "Feeling nervous, anxious, or on edge", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Not being able to stop or control worrying", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Worrying too much about different things", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Trouble relaxing", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Being so restless that it is hard to sit still", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Becoming easily annoyed or irritable", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { question: "Feeling afraid as if something awful might happen", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
    ],
    burnout: [
      { question: "Feeling emotionally exhausted by your studies", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Feeling completely worn out at the end of a day at university/school", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Feeling tired when you wake up in the morning and have to face another day of classes", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Feeling that you are becoming less interested or more cynical about your studies", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Doubting the usefulness or value of your academic program", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Feeling that you cannot cope with the academic workload", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Lacking motivation to attend classes or study", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Finding it hard to concentrate on schoolwork or assignments", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Feeling less confident in your ability to succeed in exams/tests", options: ["Never", "Seldom", "Often", "Always"] },
      { question: "Feeling physically exhausted or getting frequent headaches/stomachaches from academic stress", options: ["Never", "Seldom", "Often", "Always"] }
    ],
    pss: [
      { question: "In the last month, how often have you been upset because of something that happened unexpectedly?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you felt that you were unable to control the important things in your life?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you felt nervous and 'stressed'?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you felt confident about your ability to handle your personal problems?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you felt that things were going your way?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you found that you could not cope with all the things that you had to do?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you been able to control irritations in your life?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you felt that you were on top of things?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you been angered because of things that were outside of your control?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] },
      { question: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", options: ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"] }
    ],
    cssrs: [
      { question: "Have you wished you were dead or wished you could go to sleep and not wake up?", options: ["No", "Yes"] },
      { question: "Have you actually had any thoughts of killing yourself?", options: ["No", "Yes"] },
      { question: "Have you been thinking about how you might do this?", options: ["No", "Yes"] },
      { question: "Have you had these thoughts and had some intention of acting on them?", options: ["No", "Yes"] }
    ],
    brs: [
      { question: "I tend to bounce back quickly after hard times", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
      { question: "I have a hard time making it through stressful events", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
      { question: "It does not take me long to recover from a stressful event", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
      { question: "It is hard for me to snap back when something bad happens", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
      { question: "I usually come through difficult times with little trouble", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
      { question: "I tend to take a long time to get over set-backs in my life", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] }
    ]
  },
  French: {
    phq9: [
      { question: "Peu d'intérêt ou de plaisir à faire des choses", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Se sentir triste, déprimé ou sans espoir", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Difficultés à s'endormir ou à rester endormi, ou trop dormir", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Se sentir fatigué ou manquer d'énergie", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Manque d'appétit ou trop manger", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Mauvaise opinion de vous-même — ou sentiment d'être un raté ou d'avoir déçu votre famille", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Difficultés à se concentrer, par exemple en lisant ou en regardant la télévision", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Bouger ou parler si lentement que les autres auraient pu le remarquer ? Ou l'inverse — être si agité que vous bougez beaucoup plus que d'habitude", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Pensées que vous seriez mieux mort ou de vous faire du mal d'une manière ou d'une autre", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] }
    ],
    gad7: [
      { question: "Se sentir nerveux, anxieux ou sur les nerfs", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Ne pas pouvoir s'empêcher ou s'arrêter de s'inquiéter", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Trop s'inquiéter pour différentes choses", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Difficultés à se détendre", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Être si agité qu'il est difficile de rester assis", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Devenir facilement agacé ou irritable", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] },
      { question: "Avoir peur comme si quelque chose d'horrible allait se passer", options: ["Pas du tout", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"] }
    ],
    burnout: [
      { question: "Se sentir émotionnellement épuisé par vos études", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Se sentir complètement vidé à la fin d'une journée à l'université/école", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Se sentir fatigué au réveil le matin face à une autre journée de cours", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Sentiment de vous désintéresser ou de devenir cynique envers vos études", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Douter de l'utilité ou de la valeur de votre programme académique", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Sentiment de ne pas pouvoir faire face à la charge de travail académique", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Manque de motivation pour assister aux cours ou étudier", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Difficultés à se concentrer sur les devoirs ou le travail scolaire", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Manque de confiance en vos capacités à réussir les examens/tests", options: ["Jamais", "Rarement", "Souvent", "Toujours"] },
      { question: "Se sentir physiquement épuisé ou avoir des maux de tête/d'estomac dus au stress académique", options: ["Jamais", "Rarement", "Souvent", "Toujours"] }
    ]
  },
  Twi: {
    phq9: [
      { question: "Anigyeɛ anaa ɔpɛ a wode yɛ nneɛma a ɛkɔ fam", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Wo nkae a ɛkɔ fam, awerɛhow, anaa anidaso a nnim", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ɔhaw wɔ nna mu, anaa nna a ɛboro so", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ɔbrɛ anaa ahoɔden a ɛkɔ fam", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Adidi a ɛkɔ fam anaa adidi a ɛboro so", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Wo nkae sɛ woyɛ onipa a woanhyehyɛ wo ho yiye anaa woama w’abusua abam abu", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ɔhaw wɔ adwene a wode bɛsi nneɛma so, te sɛ akenkan anaa television hwɛ", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ɔkasa anaa kootoo a ɛyɛ bɔkɔɔ a afoforo bɛtumi ahu, anaa ahotoso a enni hɔ a wodi nea ɛboro so", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Nsusuwii a ɛkyerɛ sɛ wowu a anka ɛye anaa wopɛ sɛ wopira wo ho", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] }
    ],
    gad7: [
      { question: "Wo nkae a ɛyɛ hu, dadwen, anaa wo ho a ɛpopɔ", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Dadwen a wuntumi nnye ho hwee", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Dadwen a ɛboro so wɔ nneɛma ahorow ho", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ɔbrɛ wɔ ahomegye mu", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ahotoso a enni hɔ a wutumi tena baako", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Abufuw a ɛba ntɛm", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] },
      { question: "Ehu sɛ biribi bɔne bi bɛtumi aba", options: ["Koraa", "Nna kakra", "Nna dodow no ara", "Daa biara"] }
    ],
    burnout: [
      { question: "Ɔbrɛ wɔ adwene mu wɔ wo sukuu ho", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Ɔbrɛ a ɛboro so wɔ sukuu da awiei", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Ɔbrɛ a wote nka anɔpa a wobɛkɔ sukuu bio", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Ɔpɛ a ɛkɔ fam wɔ wo sukuu adesua ho", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Akyinnye wɔ sukuu a wukɔ yi mfaso ho", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Sukuu nnwuma a wutumi yɛ", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Ɔpɛ a enni hɔ sɛ wobɛkɔ adesua mu", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Akyinnye wɔ adesua so adwene a wode bɛsi so", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Ahotoso a ɛkɔ fam wɔ sɔhwɛ a wobɛtumi apase", options: ["Da", "Mbere kakra", "Taataa", "Daa"] },
      { question: "Ɔbrɛ wɔ honam mu anaa tiyadeɛ a efi sukuu dadwen mu ba", options: ["Da", "Mbere kakra", "Taataa", "Daa"] }
    ]
  }
};

const getQuestionsForLanguage = (lang: string, type: string) => {
  const currentLang = ASSESSMENT_QUESTIONS[lang] ? lang : 'English';
  return ASSESSMENT_QUESTIONS[currentLang][type] || ASSESSMENT_QUESTIONS['English'][type];
};

const calculatePHQ9 = (score: number) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
};

const calculateGAD7 = (score: number) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
};

const calculateBurnout = (score: number) => {
  if (score <= 9) return 'Low Burnout';
  if (score <= 19) return 'Moderate Burnout';
  return 'High Burnout';
};

const calculatePSS = (answers: number[]) => {
  const score = answers.reduce((sum, val, idx) => {
    if ([3, 4, 6, 7].includes(idx)) return sum + (4 - val);
    return sum + val;
  }, 0);
  if (score <= 13) return { score, severity: 'Low Stress' };
  if (score <= 26) return { score, severity: 'Moderate Stress' };
  return { score, severity: 'High Stress' };
};

const calculateBRS = (answers: number[]) => {
  const sum = answers.reduce((sum, val, idx) => {
    let score = val + 1;
    if ([1, 3, 5].includes(idx)) score = 6 - score;
    return sum + score;
  }, 0);
  const mean = sum / 6;
  if (mean < 3.0) return { score: Math.round(sum), severity: 'Low Resilience' };
  if (mean <= 4.3) return { score: Math.round(sum), severity: 'Normal Resilience' };
  return { score: Math.round(sum), severity: 'High Resilience' };
};

const calculateCSSRS = (answers: number[]) => {
  const score = answers.reduce((sum, val) => sum + val, 0);
  if (score > 1) return { score, severity: 'High Risk' };
  if (score > 0) return { score, severity: 'Moderate Risk' };
  return { score, severity: 'Low Risk' };
};

const getAssessments = (theme: any, t: any) => [
  {
    id: 'phq9',
    title: 'Patient Health Questionnaire',
    subtitle: 'PHQ-9 Depression Screener',
    duration: `3 ${t('assessments.minutes')}`,
    icon: Activity,
    color: theme.colors.accents.powderBlue,
  },
  {
    id: 'gad7',
    title: 'General Anxiety Disorder',
    subtitle: 'GAD-7 Anxiety Screener',
    duration: `2 ${t('assessments.minutes')}`,
    icon: BrainCircuit,
    color: theme.colors.accents.eucalyptus,
  },
  {
    id: 'burnout',
    title: t('assessments.burnout_test'),
    subtitle: 'Student Stress Test',
    duration: `4 ${t('assessments.minutes')}`,
    icon: GraduationCap,
    color: theme.colors.accents.terracotta,
  },
  {
    id: 'pss',
    title: t('assessments.pss_screening') || 'Perceived Stress Scale',
    subtitle: 'PSS-10 Screener',
    duration: `3 ${t('assessments.minutes')}`,
    icon: Activity,
    color: theme.colors.accents.softLilac,
  },
  {
    id: 'brs',
    title: t('assessments.brs_screening') || 'Brief Resilience Scale',
    subtitle: 'BRS Screener',
    duration: `2 ${t('assessments.minutes')}`,
    icon: Award,
    color: theme.colors.accents.sand,
  }
];

const getRecentResults = (theme: any) => [
  {
    id: '1',
    test: 'GAD-7',
    date: 'Oct 12',
    score: 'Mild Anxiety',
    trend: 'down',
    color: theme.colors.accents.eucalyptus,
  },
  {
    id: '2',
    test: 'PHQ-9',
    date: 'Sep 28',
    score: 'Minimal',
    trend: 'stable',
    color: theme.colors.accents.powderBlue,
  }
];

const AssessmentCard = ({ assessment, delay, theme, onStart }: any) => {
  const styles = createStyles(theme);
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)}>
      <TouchableOpacity 
        style={styles.assessmentCard} 
        activeOpacity={0.8}
        onPress={() => onStart(assessment.id)}
      >
        <View style={[styles.assessmentIconWrap, { backgroundColor: assessment.color + (theme.isDark ? '25' : '20') }]}>
          <assessment.icon color={assessment.color} size={28} />
        </View>
        <Text style={styles.assessmentTitle}>{assessment.title}</Text>
        <Text style={styles.assessmentSubtitle}>{assessment.subtitle}</Text>
        <View style={styles.assessmentFooter}>
          <Text style={styles.durationText}>{assessment.duration}</Text>
          <View style={[styles.startBtn, { backgroundColor: assessment.color }]}>
            <Text style={styles.startBtnText}>Start</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AssessmentsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const styles = createStyles(theme);
  const assessments = getAssessments(theme, t);
  const router = useRouter();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state hooks
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [submittingResult, setSubmittingResult] = useState<boolean>(false);
  const [calculatedResult, setCalculatedResult] = useState<{ score: number; severity: string } | null>(null);
  const [personalizedQuestions, setPersonalizedQuestions] = useState<any[]>([]);
  const [personalizedFeedback, setPersonalizedFeedback] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/ai/oracle-context');
        setResults(response.data.assessments || []);
      } catch (error: any) {
        console.warn('Network timeout when fetching assessment results.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStartTest = async (id: string) => {
    setActiveTestId(id);
    setCurrentQuestionIndex(0);
    setCalculatedResult(null);
    setShowResultModal(false);
    setPersonalizedFeedback(null);

    setLoading(true);
    try {
      const res = await api.get(`/ai/personalized-assessment?type=${id}`);
      setPersonalizedQuestions(res.data.questions || []);
      setAnswers(new Array(res.data.questions?.length || 0).fill(-1));
    } catch (e) {
      Alert.alert('Error', 'Failed to generate assessment questions.');
      setActiveTestId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRequest = () => {
    if (showResultModal) {
      setActiveTestId(null);
      return;
    }
    Alert.alert(
      t('assessments.exit_title') || 'Exit Screening?',
      t('assessments.exit_msg') || 'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        { text: t('common.confirm') || 'Exit', style: 'destructive', onPress: () => setActiveTestId(null) }
      ]
    );
  };

  const handleSelectAnswer = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = idx;
    setAnswers(newAnswers);

    // Smoothly auto-advance after 250ms if not the last question
    if (currentQuestionIndex < personalizedQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 250);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < personalizedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await handleSubmitResult();
    }
  };

  const handleSubmitResult = async () => {
    if (!activeTestId) return;
    setSubmittingResult(true);
    try {
      const qna = personalizedQuestions.map((q: any, i: number) => ({
        question: q.question,
        answer: q.options[answers[i]]
      }));
      
      const res = await api.post('/ai/personalized-assessment', { answers: qna, type: activeTestId });
      setPersonalizedFeedback(res.data);
      
      // Save result for history
      await api.post('/ai/assessments', {
        type: getTestTitle(activeTestId),
        score: res.data.score || 0,
        severity: res.data.severity || 'Moderate'
      });

      setShowResultModal(true);
      
      // Refresh history immediately
      const refreshResponse = await api.get('/ai/oracle-context');
      setResults(refreshResponse.data.assessments || []);
    } catch (error) {
      console.error('Error submitting assessment result:', error);
      Alert.alert('Error', 'Failed to save screening result. Please try again.');
    } finally {
      setSubmittingResult(false);
    }
  };

  const getActiveColor = () => {
    if (activeTestId === 'phq9') return theme.colors.accents.powderBlue;
    if (activeTestId === 'gad7') return theme.colors.accents.eucalyptus;
    if (activeTestId === 'pss') return theme.colors.accents.softLilac;
    if (activeTestId === 'brs') return theme.colors.accents.sand;
    return theme.colors.accents.terracotta;
  };
  
  const getActiveIcon = () => {
    const test = assessments.find((a: any) => a.id === activeTestId);
    return test?.icon || Activity;
  };

  const getTestTitle = (id: string | null) => {
    if (id === 'phq9') return 'Patient Health Questionnaire';
    if (id === 'gad7') return 'General Anxiety Disorder';
    if (id === 'pss') return t('assessments.pss_screening') || 'Perceived Stress Scale';
    if (id === 'brs') return t('assessments.brs_screening') || 'Brief Resilience Scale';
    if (id === 'cssrs') return t('assessments.cssrs_screening') || 'Columbia-Suicide Severity Screener';
    return t('assessments.burnout_test') || 'Student Burnout';
  };

  const renderQuestionWizard = () => {
    if (!activeTestId) return null;
    
    // If loading dynamic questions, show spinner
    if (loading) {
      return (
        <View style={[styles.wizardContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={getActiveColor()} />
          <Text style={{ marginTop: 16, color: theme.colors.text.tertiary }}>Consulting the Oracle...</Text>
        </View>
      );
    }

    const questions = personalizedQuestions;
    
    // Safety check if questions failed to load or are empty
    if (!questions || questions.length === 0) return null;

    const currentQuestion = questions[currentQuestionIndex];
    
    // Another safety check in case index is out of bounds
    if (!currentQuestion) return null;

    const progress = (currentQuestionIndex + 1) / questions.length;

    return (
      <View style={styles.wizardContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: getActiveColor() }]} />
          </View>
          <Text style={styles.progressText}>
            {t('assessments.question') || 'Question'} {currentQuestionIndex + 1} {t('assessments.of') || 'of'} {questions.length}
          </Text>
        </View>

        {/* Question Card */}
        <ScrollView contentContainerStyle={styles.questionScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = answers[currentQuestionIndex] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    isSelected && { 
                      borderColor: getActiveColor(), 
                      backgroundColor: getActiveColor() + '15' 
                    }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectAnswer(idx)}
                >
                  <View style={[
                    styles.optionRadio, 
                    isSelected && { borderColor: getActiveColor(), backgroundColor: getActiveColor() }
                  ]}>
                    {isSelected && <View style={styles.optionRadioInner} />}
                  </View>
                  <Text style={[
                    styles.optionText, 
                    isSelected && { color: theme.colors.text.primary, fontWeight: '700' }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navContainer}>
          <TouchableOpacity activeOpacity={0.7}
            style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]}
            disabled={currentQuestionIndex === 0}
            onPress={handlePrevQuestion}
          >
            <ArrowLeft color={currentQuestionIndex === 0 ? theme.colors.text.disabled : theme.colors.text.primary} size={20} />
            <Text style={[styles.navBtnText, currentQuestionIndex === 0 && { color: theme.colors.text.disabled }]}>
              {t('common.back') || 'Back'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7}
            style={[
              styles.navBtn, 
              styles.navBtnNext,
              answers[currentQuestionIndex] === -1 && styles.navBtnDisabled,
              { backgroundColor: getActiveColor() }
            ]}
            disabled={answers[currentQuestionIndex] === -1 || submittingResult}
            onPress={handleNextQuestion}
          >
            {submittingResult ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={[styles.navBtnText, { color: '#FFF' }]}>
                  {currentQuestionIndex === questions.length - 1 
                    ? (t('common.confirm') || 'Submit') 
                    : (t('common.next') || 'Next')}
                </Text>
                <ArrowRight color="#FFF" size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResultScreen = () => {
    if (!activeTestId || !personalizedFeedback) return null;

    const isSevere = personalizedFeedback.severity === 'High Risk' || personalizedFeedback.crisisAlert;
    const Icon = getActiveIcon();
    
    return (
      <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.successIconWrap, { backgroundColor: getActiveColor() + '20', borderColor: getActiveColor() + '40' }]}>
          <Icon color={getActiveColor()} size={48} />
        </View>
        <Text style={styles.resultHeading}>{getTestTitle(activeTestId)}</Text>
        <Text style={styles.resultSubheading}>Here is your clinical evaluation:</Text>
        
        {/* Score and Severity Card */}
        <View style={[styles.resultCard, { borderColor: getActiveColor(), flexDirection: 'column' }]}>
          <View style={{ flexDirection: 'row', width: '100%', marginBottom: 16 }}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreTitle}>Clinical Score</Text>
              <Text style={[styles.scoreValue, { color: getActiveColor() }]}>{personalizedFeedback.score || 0}</Text>
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.severityContainer}>
              <Text style={styles.severityTitle}>Risk Level</Text>
              <View style={[
                styles.severityBadge, 
                { backgroundColor: isSevere ? 'rgba(230, 0, 0, 0.15)' : 'rgba(90, 138, 112, 0.15)' }
              ]}>
                <Text style={[
                  styles.severityText, 
                  { color: isSevere ? theme.colors.semantic.danger : theme.colors.semantic.success }
                ]}>
                  {personalizedFeedback.severity}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Explanation */}
          <View style={{ borderTopWidth: 1, borderTopColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', paddingTop: 16 }}>
            <Text style={{ color: theme.colors.text.secondary, fontSize: 14, lineHeight: 22, textAlign: 'center', fontFamily: theme.typography.fonts.body }}>
              {personalizedFeedback.explanation || "This score helps us understand where you are at today so we can provide the best resources."}
            </Text>
          </View>
        </View>

        {/* AI Insight & Prescription Card */}
        <View style={[
          styles.actionCard, 
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            alignItems: 'flex-start',
            padding: 24,
            marginBottom: 24
          }
        ]}>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontFamily: theme.typography.fonts.accent, fontWeight: '700', marginBottom: 12 }}>
            Oracle Insight & Next Steps
          </Text>
          <Text style={{ color: theme.colors.text.primary, fontSize: 15, lineHeight: 24, fontFamily: theme.typography.fonts.body, marginBottom: 20 }}>
            {personalizedFeedback.insight} {personalizedFeedback.recommendation}
          </Text>

          {personalizedFeedback.suggestedResources && personalizedFeedback.suggestedResources.length > 0 ? (
            <View style={{ width: '100%' }}>
              <Text style={{ color: theme.colors.text.secondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontFamily: theme.typography.fonts.accent, fontWeight: '700', marginBottom: 12 }}>
                Recommended For You
              </Text>
              {personalizedFeedback.suggestedResources.map((res: any, i: number) => (
                <TouchableOpacity activeOpacity={0.7} 
                  key={res.id || i} 
                  style={[styles.resultItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.text.tertiary + '30', borderWidth: 1, padding: 12, marginBottom: 8 }]} 
                  onPress={() => {
                    setActiveTestId(null);
                    router.push('/(tabs)/knowledge-hub');
                  }}
                >
                  <View style={[styles.resultIconWrap, { backgroundColor: getActiveColor() + '15' }]}>
                    <PlayCircle color={getActiveColor()} size={20} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTest, { color: theme.colors.text.primary, fontSize: 14 }]}>{res.title}</Text>
                    <Text style={{ color: theme.colors.text.tertiary, fontSize: 12 }}>{res.category}</Text>
                  </View>
                  <ChevronRight color={getActiveColor()} size={20} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity activeOpacity={0.7}
              style={[
                styles.actionBtn, 
                { backgroundColor: isSevere ? theme.colors.semantic.danger : getActiveColor() }
              ]}
              onPress={() => {
                setActiveTestId(null);
                router.push(isSevere ? '/(tabs)/crisis' : '/(tabs)/knowledge-hub');
              }}
            >
              <Text style={styles.actionBtnText}>
                {isSevere ? 'Connect with Support' : 'Explore Resources'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Done Button (Hidden if strict CSSRS positive) */}
        {!(activeTestId === 'cssrs' && isSevere) && (
          <TouchableOpacity activeOpacity={0.7}
            style={styles.doneBtn}
            onPress={() => setActiveTestId(null)}
          >
            <Text style={styles.doneBtnText}>Close & Return</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  const processedResults = results.map((result, idx) => {
    const previousResult = results.find((r, prevIdx) => prevIdx > idx && r.type === result.type);
    const diff = previousResult ? result.score - previousResult.score : null;
    return { ...result, diff };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient 
          colors={theme.isDark 
            ? [theme.colors.background, theme.colors.backgroundSecondary, '#080C18'] 
            : [theme.colors.background, theme.colors.backgroundSecondary, '#E0E3EB']
          } 
          style={StyleSheet.absoluteFillObject} 
        />
        <View style={[styles.bgBlob, { top: -50, left: -100, backgroundColor: theme.colors.accents.powderBlue + '08' }]} />
        <View style={[styles.bgBlob, { bottom: -100, right: -100, backgroundColor: theme.colors.plum + '08' }]} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader 
          title={t('assessments.title')} 
          subtitle={t('assessments.subtitle')}
          rightAction={
            <TouchableOpacity activeOpacity={0.7} 
              style={styles.infoBtn}
              onPress={() => Alert.alert(t('assessments.privacy_title'), t('assessments.privacy_msg'))}
            >
              <Info color={theme.colors.plum} size={24} />
            </TouchableOpacity>
          }
        />

        {/* Personalized AI Check-in Banner */}
        <Animated.View entering={FadeInUp.delay(50).duration(800)} style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => handleStartTest('oracle-insight')}
            style={[styles.aiBanner, { backgroundColor: theme.colors.plum }]}
          >
            <View style={styles.aiBannerContent}>
              <View style={[styles.aiIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <BrainCircuit color="#FFF" size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiBannerTitle}>Personalized AI Check-In</Text>
                <Text style={styles.aiBannerSubtitle}>Dynamic assessment tailored to your recent logs</Text>
              </View>
              <ChevronRight color="#FFF" size={24} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(800)}>
          <Text style={styles.sectionTitle}>{t('assessments.available_tests')}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPadding}
            snapToInterval={width * 0.65 + 16}
            decelerationRate="fast"
          >
            {assessments.map((assessment, index) => (
              <AssessmentCard 
                key={assessment.id} 
                assessment={assessment} 
                delay={200 + (index * 100)} 
                theme={theme} 
                onStart={handleStartTest}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('assessments.recent_results')}</Text>
          <View style={styles.resultsContainer}>
            {loading ? (
              <View style={{ padding: 20 }}>
                {[1, 2].map((_, i) => (
                  <View key={i} style={[styles.resultItem, { padding: 0, paddingVertical: 10 }]}>
                    <SkeletonLoader width={40} height={40} borderRadius={12} style={{ marginRight: 16 }} />
                    <View style={styles.resultInfo}>
                      <SkeletonLoader width={100} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                      <SkeletonLoader width={60} height={14} borderRadius={4} />
                    </View>
                    <View style={styles.resultRight}>
                      <SkeletonLoader width={40} height={14} borderRadius={4} />
                    </View>
                  </View>
                ))}
              </View>
            ) : results.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text.secondary }}>No assessments taken yet.</Text>
              </View>
            ) : (
              processedResults.map((result: any, index: number) => (
                <React.Fragment key={result.id}>
                  <TouchableOpacity 
                    style={styles.resultItem}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert(
                      `${result.type} Result`,
                      `Date: ${formatDate(result.createdAt)}\nScore: ${result.score}\nSeverity: ${result.severity}${result.diff !== null ? `\nChange: ${result.diff > 0 ? '+' : ''}${result.diff} since previous` : ''}`
                    )}
                  >
                    <View style={[styles.resultIconWrap, { backgroundColor: theme.colors.accents.powderBlue + (theme.isDark ? '25' : '15') }]}>
                      {result.diff !== null && result.diff > 0 ? <TrendingUp color={theme.colors.accents.terracotta} size={18} /> : 
                       result.diff !== null && result.diff < 0 ? <TrendingDown color={theme.colors.accents.powderBlue} size={18} /> : 
                       <Minus color={theme.colors.accents.powderBlue} size={18} />}
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTest}>{result.type}</Text>
                      <Text style={[styles.resultScore, { color: (result.score > 15 || result.severity.includes('Risk') || result.severity.includes('High')) ? theme.colors.semantic.danger : theme.colors.text.primary }]}>
                        {result.severity} ({result.score})
                      </Text>
                      {result.diff !== null && (
                        <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
                          {result.diff > 0 ? '+' : ''}{result.diff} pts
                        </Text>
                      )}
                    </View>
                    <View style={styles.resultRight}>
                      <Text style={styles.resultDate}>{formatDate(result.createdAt)}</Text>
                      <ChevronRight color={theme.colors.text.disabled} size={18} />
                    </View>
                  </TouchableOpacity>
                  {index < processedResults.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.educationalCard}>
          <View style={styles.eduIconWrap}>
            <Info color={theme.colors.plum} size={20} />
          </View>
          <View style={styles.eduContent}>
            <Text style={styles.eduTitle}>Why take assessments?</Text>
            <Text style={styles.eduText}>These tools provide insights into your emotional state. They do not replace professional medical advice or formal diagnosis.</Text>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Active Screening Modal */}
      <Modal
        visible={activeTestId !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseRequest}
      >
        <LinearGradient 
          colors={theme.isDark 
            ? ['#0A0F1E', '#111520', theme.colors.backgroundSecondary] 
            : ['#F8F5F2', '#EAEBED', '#FFFFFF']
          } 
          style={[styles.modalBg, { paddingTop: insets.top, paddingBottom: insets.bottom + 10 }]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity activeOpacity={0.7} onPress={handleCloseRequest} style={styles.modalCloseBtn}>
              <X color={theme.colors.text.primary} size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitleText}>
              {getTestTitle(activeTestId)}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Modal Content */}
          {showResultModal ? renderResultScreen() : renderQuestionWizard()}
        </LinearGradient>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  aiBanner: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiBannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
  },
  container: {
    flex: 1,
  },
  bgBlob: { 
    position: 'absolute', 
    width: 400, 
    height: 400, 
    borderRadius: 200 
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  infoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 24,
    letterSpacing: -0.5,
  },
  horizontalScrollPadding: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 24,
  },
  assessmentCard: {
    width: width * 0.65,
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.2 : 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
  },
  assessmentIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  assessmentTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  assessmentSubtitle: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    marginBottom: 24,
  },
  assessmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
    color: theme.colors.text.disabled,
  },
  startBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.3 : 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  startBtnText: {
    color: '#FFF',
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  resultsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  resultIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTest: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  resultScore: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
  },
  resultRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  resultDate: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    color: theme.colors.text.disabled,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginLeft: 76,
  },
  educationalCard: {
    flexDirection: 'row',
    backgroundColor: theme.isDark ? 'rgba(123, 97, 255, 0.1)' : 'rgba(123, 97, 255, 0.08)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(123, 97, 255, 0.15)' : 'rgba(123, 97, 255, 0.15)',
  },
  eduIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  eduContent: {
    flex: 1,
  },
  eduTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.plum,
    marginBottom: 4,
  },
  eduText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  modalBg: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  modalTitleText: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  wizardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  questionScroll: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.15 : 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    color: theme.colors.text.primary,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.1 : 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.text.disabled,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.isDark ? theme.colors.text.primary : '#FFF',
  },
  optionText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    backgroundColor: theme.colors.surface,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnNext: {
    flex: 1,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  navBtnText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    color: theme.colors.text.primary,
  },
  resultScroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  resultHeading: {
    fontSize: 26,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  resultSubheading: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 28,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0.2 : 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
    color: theme.colors.text.disabled,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    marginHorizontal: 16,
  },
  severityContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '600',
    color: theme.colors.text.disabled,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  severityText: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '900',
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
