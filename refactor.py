import re

file_path = 'mindbridge-mobile/app/(tabs)/dashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports_to_add = '''import { CalendarStrip } from '../../src/components/dashboard/CalendarStrip';
import { ProgressRings } from '../../src/components/dashboard/ProgressRings';
import { WeeklyPulse } from '../../src/components/dashboard/WeeklyPulse';
import { QuoteSlideshow } from '../../src/components/dashboard/QuoteSlideshow';
import { AppleWidget } from '../../src/components/dashboard/AppleWidget';
import { RitualItem } from '../../src/components/dashboard/RitualItem';
import { DetailedOverviewCard } from '../../src/components/dashboard/DetailedOverviewCard';
import { QuestItem } from '../../src/components/dashboard/QuestItem';
import { StreakJourney } from '../../src/components/dashboard/StreakJourney';
import { useDashboardData } from '../../src/hooks/useDashboardData';
'''

content = content.replace("import { AppTourModal } from '../../src/components/AppTourModal';", 
                          imports_to_add + "import { AppTourModal } from '../../src/components/AppTourModal';")

# 2. Replace the massive state block with useDashboardData
# We need to find the start of DashboardScreen
start_marker = "export default function DashboardScreen() {"
end_marker = "const getGreeting = () => {"

if start_marker in content and end_marker in content:
    before = content.split(start_marker)[0]
    after = content.split(end_marker)[1]
    
    new_logic = f'''export default function DashboardScreen() {{
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {{ t }} = useContext(LanguageContext);
  const styles = createStyles(theme);

  const {{
    rituals,
    moodHistory,
    journalHistory,
    chatHistory,
    assessments,
    latestPost,
    suggestedResources,
    gardenStats,
    userData,
    stepCount,
    recentLocation,
    aiPrompt,
    microGoals,
    actionableCopingMechanisms,
    insightSeverity,
    isLoading,
    dailyGoals,
    completedGoalIds,
    gamification,
    checkStatus,
    initPedometer,
  }} = useDashboardData();

  const formatText = (text: string | null | undefined) => {{
    if (!text) return '';
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }};

  const completedCount = completedGoalIds.length;
  
  // Modals state
  const [showIntervention, setShowIntervention] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebData, setCelebData] = useState<{{ milestone: number, type: 'STREAK' | 'JOURNAL' }}>({{ milestone: 0, type: 'STREAK' }});
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {{
    const checkTour = async () => {{
      try {{
        const hasSeenTour = await AsyncStorage.getItem('@app_tour_seen');
        if (hasSeenTour !== 'true') {{
          setShowTour(true);
        }}
      }} catch (e) {{
        console.error('Error checking tour state:', e);
      }}
    }};
    setTimeout(checkTour, 500); 
  }}, []);

  useFocusEffect(
    useCallback(() => {{
      checkStatus();
      initPedometer();
    }}, [checkStatus, initPedometer])
  );

  {end_marker}'''
    
    content = before + new_logic + after

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
