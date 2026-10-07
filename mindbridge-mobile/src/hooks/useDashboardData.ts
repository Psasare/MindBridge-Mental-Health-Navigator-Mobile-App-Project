import { useState, useCallback, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Pedometer } from 'expo-sensors';
import { CircleDashed, Flower2, Leaf, Sun } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const getGrowthStage = (count: number) => {
  if (count >= 20) return { label: 'Ancient Tree', icon: Flower2, color: '#8B5CF6' };
  if (count >= 14) return { label: 'Full Bloom', icon: Flower2, color: '#7B61FF' };
  if (count >= 8) return { label: 'Healthy Plant', icon: Leaf, color: '#34D399' };
  if (count >= 4) return { label: 'Sprouting', icon: Sun, color: '#FBBF24' };
  if (count >= 1) return { label: 'New Seed', icon: Leaf, color: '#60A5FA' };
  return { label: 'Empty Garden', icon: CircleDashed, color: '#94A3B8' };
};

export const useDashboardData = () => {
  const { userData: authData } = useContext(AuthContext) as any;
  const [stepCount, setStepCount] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', 'aggregate', authData?.id],
    queryFn: async () => {
      const response = await api.get('/dashboard/aggregate');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    retry: 2
  });

  const initPedometer = useCallback(async () => {
    try {
      const { status } = await Pedometer.getPermissionsAsync();
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable && status === 'granted') {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const result = await Pedometer.getStepCountAsync(start, end);
        if (result) {
          setStepCount(result.steps);
        }
      }
    } catch (e) {
      console.log('Pedometer access denied or failed:', e);
    }
  }, []);

  const logs = data?.oracleContext?.recentJournal || [];
  const growth = getGrowthStage(logs.length);
  const gardenStats = { count: logs.length, stage: growth.label, icon: growth.icon, color: growth.color };
  
  const todayStr = new Date().toDateString();
  const rituals = {
    garden: data?.oracleContext?.latestMood && new Date(data.oracleContext.latestMood.createdAt).toDateString() === todayStr,
    journal: logs.some((log: any) => new Date(log.createdAt).toDateString() === todayStr),
    breathing: false 
  };
  
  return {
    rituals,
    moodHistory: data?.moodHistory || [],
    journalHistory: logs,
    chatHistory: data?.oracleContext?.history || [],
    assessments: data?.oracleContext?.assessments || [],
    latestPost: data?.oracleContext?.latestCommunityPost || null,
    suggestedResources: data?.proactiveInsights?.suggestedResources || [],
    gardenStats,
    userData: { 
      name: data?.oracleContext?.onboarding?.firstName || authData?.name || 'Friend', 
      language: 'English', 
      streak: data?.gamification?.currentStreak || 0 
    },
    stepCount,
    recentLocation: data?.oracleContext?.latestMood?.location || null,
    aiPrompt: data?.proactiveInsights?.dashboardPrompt || null,
    microGoals: data?.proactiveInsights?.microGoals || [],
    actionableCopingMechanisms: data?.proactiveInsights?.actionableCopingMechanisms || [],
    insightSeverity: data?.proactiveInsights?.severity || 'mild',
    isLoading,
    dailyGoals: data?.dailyGoals?.goals || [],
    completedGoalIds: data?.dailyGoals?.completedIds || [],
    gamification: data?.gamification || { totalPoints: 0, currentStreak: 0 },
    checkStatus: refetch,
    initPedometer,
  };
};
