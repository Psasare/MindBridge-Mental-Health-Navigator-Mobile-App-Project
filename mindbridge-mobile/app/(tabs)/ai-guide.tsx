import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../../src/services/api';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import {
  Bot,
  MessageCircle,
  Mic,
  StopCircle,
  Activity,
  Send,
  AlertTriangle,
  ArrowRight,
  Info,
  RefreshCw,
  History,
  X,
  Trash2,
  BrainCircuit,
  Wind,
  Plus,
  Check,
  CheckCheck
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudioRecorder, useAudioRecorderState, requestRecordingPermissionsAsync, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { withRepeat, withSequence, withTiming, withDelay, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 64;

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed",
  "Help me calm down",
  "I can't sleep",
  "I need to vent",
  "How do I handle exam stress?",
  "I feel lonely",
];

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingDot = ({ delay, theme }: any) => {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(-5, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      true
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }]
  }));

  return <Animated.View style={[typingStyles.dot, { backgroundColor: theme.colors.text.primary }, style]} />;
};

const TypingIndicator = ({ theme }: any) => (
  <Animated.View entering={FadeIn.duration(300)} style={[typingStyles.row]}>
    <View style={[typingStyles.avatar, { backgroundColor: theme.colors.text.primary }]}>
      <Bot color={theme.colors.background} size={13} />
    </View>
    <View style={[typingStyles.bubble, {
      backgroundColor: theme.colors.surface,
      borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    }]}>
      <View style={typingStyles.dots}>
        <TypingDot delay={0} theme={theme} />
        <TypingDot delay={150} theme={theme} />
        <TypingDot delay={300} theme={theme} />
      </View>
    </View>
  </Animated.View>
);

const typingStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1 },
  dots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});

// ─── Individual Message ────────────────────────────────────────────────────────
const MessageItem = ({ item, theme, router, t, handleSend }: any) => {
  const msgStyles = createMsgStyles(theme);
  const onLongPress = async () => {
    await Clipboard.setStringAsync(item.text);
    Alert.alert('Copied', 'Message copied to clipboard.');
  };

  if (item.type === 'typing') return <TypingIndicator theme={theme} />;

  if (item.isAi) {
    return (
      <Animated.View entering={FadeInDown.duration(350).springify()} style={msgStyles.rowAi}>
        <View style={[msgStyles.avatarSmall, { backgroundColor: theme.colors.text.primary }]}>
          <Bot color={theme.colors.background} size={13} />
        </View>
        <View style={{ flex: 1 }}>
          {item.suggestCrisis ? (
            <View style={msgStyles.crisisBubble}>
              <View style={msgStyles.crisisTop}>
                <AlertTriangle color="#E60000" size={13} />
                <Text style={msgStyles.crisisLabel}>IMMEDIATE SUPPORT AVAILABLE</Text>
              </View>
              <Text style={[msgStyles.textAi, { color: theme.colors.text.primary }]}>{item.text}</Text>
              <TouchableOpacity 
                style={msgStyles.crisisBtn}
                onPress={() => router.push('/(tabs)/crisis')}
                activeOpacity={0.85}
              >
                <Text style={msgStyles.crisisBtnText}>Open Crisis Support</Text>
                <ArrowRight color="#FFF" size={15} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={onLongPress}
                style={[msgStyles.bubbleAi, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }]}
              >
                <Text style={[msgStyles.textAi, { color: theme.colors.text.primary }]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
              
              {/* Contextual Action Card based on Current State */}
              {item.state && item.state.primaryCondition && item.state.primaryCondition !== 'unknown' && item.state.primaryCondition !== 'neutral' && (
                <Animated.View entering={FadeInUp.delay(300)} style={msgStyles.stateCard}>
                  {item.state.label !== 'Stable' && (
                  <View style={[msgStyles.stateHeader, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                    <Activity size={12} color={theme.colors.text.primary} />
                    <Text style={[msgStyles.stateLabel, { color: theme.colors.text.primary }]}>
                      {item.state.severity?.toUpperCase()} {item.state.primaryCondition?.toUpperCase()} DETECTED
                    </Text>
                  </View>
                  )}
                  
                  <Text style={[msgStyles.stateActionText, { color: theme.colors.text.secondary }]}>
                    {item.state.severity === 'severe' || item.state.severity === 'critical'
                      ? 'We strongly recommend speaking with a campus counselor about this.'
                      : `Here is a tool that might help with your ${item.state.primaryCondition}:`}
                  </Text>

                  <TouchableOpacity activeOpacity={0.7} 
                    style={[msgStyles.stateActionBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    onPress={() => {
                      if (item.state.severity === 'severe' || item.state.severity === 'critical') router.push('/(tabs)/crisis');
                      else if (item.state.primaryCondition.toLowerCase().includes('anxi') || item.state.primaryCondition.toLowerCase().includes('stress')) router.push('/breathing');
                      else router.push('/cbt-reframe');
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {(item.state.severity === 'severe' || item.state.severity === 'critical') ? <MessageCircle size={16} color={theme.colors.text.primary} /> : 
                       (item.state.primaryCondition.toLowerCase().includes('anxi') || item.state.primaryCondition.toLowerCase().includes('stress')) ? <Wind size={16} color={theme.colors.text.primary} /> : 
                       <BrainCircuit size={16} color={theme.colors.text.primary} />}
                      <Text style={[msgStyles.stateActionBtnText, { color: theme.colors.text.primary }]}>
                        {(item.state.severity === 'severe' || item.state.severity === 'critical') ? 'Contact Counseling' : 
                         (item.state.primaryCondition.toLowerCase().includes('anxi') || item.state.primaryCondition.toLowerCase().includes('stress')) ? 'Start Breathing Exercise' : 'Use Thought Reframer'}
                      </Text>
                    </View>
                    <ArrowRight size={16} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          )}
          <Text style={[msgStyles.time, { color: theme.colors.text.secondary }]}>{item.time}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={msgStyles.rowUser}>
      <View style={{ alignItems: 'flex-end' }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={onLongPress}
          style={[msgStyles.bubbleUser, { backgroundColor: item.status === 'error' ? '#EF4444' : theme.colors.text.primary }]}
        >
          <Text style={[msgStyles.textUser, { color: theme.colors.background }]}>{item.text}</Text>
        </TouchableOpacity>
        
        {item.status === 'error' && (
          <TouchableOpacity style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }} onPress={() => handleSend(item.text, item.audioBase64, item.id)}>
            <RefreshCw size={12} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '700' }}>{item.error || 'Connection failed. Tap to retry.'}</Text>
          </TouchableOpacity>
        )}
        
        {item.status !== 'error' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text style={[msgStyles.timeUser, { color: theme.colors.text.secondary, marginRight: 4, marginTop: 0 }]}>{item.time}</Text>
            {item.status === 'sending' && <Text style={{ fontSize: 10, color: theme.colors.text.tertiary, fontStyle: 'italic' }}>Sending...</Text>}
            {item.status === 'delivered' && <CheckCheck size={12} color="#34D399" />}
            {(!item.status || item.status === 'sent') && <Check size={12} color={theme.colors.text.tertiary} />}
          </View>
        )}
      </View>
    </View>
  );
};

const createMsgStyles = (theme: any) => StyleSheet.create({
  rowAi: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
  rowUser: { alignSelf: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  bubbleAi: { maxWidth: width * 0.74, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  bubbleUser: { maxWidth: width * 0.74, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 20, borderBottomRightRadius: 4 },
  textAi: { fontSize: 15.5, lineHeight: 24, fontFamily: theme.typography.fonts.ui },
  textUser: { fontSize: 16, fontFamily: theme.typography.fonts.body, lineHeight: 22 },
  time: { fontSize: 11, fontWeight: '500', marginTop: 5, marginLeft: 2, fontFamily: theme.typography.fonts.accent },
  timeUser: { fontSize: 11, fontWeight: '500', marginTop: 5, fontFamily: theme.typography.fonts.accent },
  crisisBubble: { maxWidth: width * 0.78, borderWidth: 1.5, borderColor: '#E60000', borderRadius: 20, borderBottomLeftRadius: 4, padding: 16, backgroundColor: 'rgba(230,0,0,0.06)' },
  crisisTop: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  crisisLabel: { fontSize: 10, fontWeight: '800', color: '#E60000', letterSpacing: 0.8, fontFamily: theme.typography.fonts.accent },
  crisisBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E60000', paddingVertical: 11, borderRadius: 12, marginTop: 12, gap: 8 },
  crisisBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14, fontFamily: theme.typography.fonts.header },
  stateCard: { marginTop: 8, maxWidth: width * 0.74, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(123,97,255,0.2)', backgroundColor: theme.isDark ? 'rgba(123,97,255,0.06)' : 'rgba(123,97,255,0.03)' },
  stateHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8, gap: 6 },
  stateLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, fontFamily: theme.typography.fonts.accent },
  stateActionText: { fontSize: 13, lineHeight: 18, fontFamily: theme.typography.fonts.body, marginBottom: 10 },
  stateActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1 },
  stateActionBtnText: { fontSize: 13, fontWeight: '700', fontFamily: theme.typography.fonts.header },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function AIGuideScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const router = useRouter();
  const { userData: authData } = useContext(AuthContext) as any;
  const S = createStyles(theme);

  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const isRecording = recorderState.isRecording;
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(44);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomPad = TAB_BAR_HEIGHT + insets.bottom;
  const INPUT_AREA_HEIGHT = inputHeight + 32;

  const fetchSessions = async () => {
    try {
      const response = await api.get('/ai/sessions');
      setSessions(response.data);
    } catch (e) {
      console.error('Failed to fetch sessions');
    }
  };

  const loadSession = async (sessionId: string) => {
    setLoading(true);
    setActiveSessionId(sessionId);
    try {
      const response = await api.get(`/ai/sessions/${sessionId}`);
      const sessionMessages = (response.data || []).reverse().map((msg: any, idx: number) => ({
        id: msg.id || `msg-${idx}`,
        isAi: msg.role === 'model',
        text: msg.content,
        createdAt: msg.createdAt,
        time: msg.createdAt 
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Past'
      }));
      setMessages(sessionMessages);
    } catch (e) {
      console.error('Failed to load session messages');
    } finally {
      setLoading(false);
      setIsHistoryVisible(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    const firstName = authData?.name?.split(' ')[0] || 'Friend';
    setMessages([{ id: 'welcome', isAi: true, text: t('ai.greetingWelcome').replace('{name}', firstName), time: 'Now', suggestCrisis: false }]);
  };

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await api.get('/ai/oracle-context');
        const data = response.data;
        let rawName = data.onboarding?.firstName || data.userName || authData?.name || 'Friend';
        const firstName = rawName.split(' ')[0];
        
        let greeting = t('ai.greetingStandard');
        if (data.latestMood) {
          const emotions = data.latestMood.emotions?.join(', ') || 'something meaningful';
          const score = data.latestMood.score;
          if (score <= 4) {
            greeting = t('ai.greetingHeavy').replace('{name}', firstName).replace('{emotions}', emotions.toLowerCase());
          } else if (score >= 8) {
            greeting = t('ai.greetingGlowing').replace('{name}', firstName).replace('{emotions}', emotions.toLowerCase());
          } else {
            greeting = t('ai.greetingRecent').replace('{name}', firstName).replace('{emotions}', emotions.toLowerCase());
          }
        } else {
          greeting = t('ai.greetingWelcome').replace('{name}', firstName);
        }

        setMessages([{ id: 'welcome', isAi: true, text: greeting, time: 'Now', suggestCrisis: false }]);
        await fetchSessions();
      } catch {
        setMessages([{ id: 'welcome', text: t('ai.greetingWelcome').replace('{name}', authData?.name || 'Friend'), isAi: true, time: 'Now' }]);
      }
    };
    fetchContext();
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (granted) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldRouteThroughEarpiece: false });
        await recorder.prepareToRecordAsync();
        recorder.record();
      } else {
        Alert.alert('Permission to record audio was denied');
      }
    } catch (err) {
      Alert.alert('Could not start recording');
    }
  };

  const stopRecording = async () => {
    await recorder.stop();
    const uri = recorder.uri;
    if (uri) {
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        handleSend("🎙️ Voice Note", base64);
      } catch (err) {
        Alert.alert('Error reading audio file');
      }
    }
  };

  const handleSend = async (textOverride?: string, audioBase64?: string, retryId?: string) => {
    const textToSend = textOverride || message;
    if (!textToSend.trim() && !audioBase64) return;
    
    const msgId = retryId || 'user_' + Date.now() + '_' + Math.random();

    if (!retryId) {
      const userMsg = { 
        id: msgId, 
        text: textToSend, 
        isAi: false, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending',
        audioBase64
      };
      setMessages(prev => [...prev, userMsg]);
      if (!textOverride) setMessage('');
    } else {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'sending', error: null } : m));
    }
    
    setLoading(true);

    try {
      const payload: any = { message: textToSend };
      if (audioBase64) {
        payload.audioBase64 = audioBase64;
      }
      if (activeSessionId) {
        payload.sessionId = activeSessionId;
      }
      const res = await api.post('/ai/chat', payload);
      
      if (res.data.sessionId && res.data.sessionId !== activeSessionId) {
        setActiveSessionId(res.data.sessionId);
        // Refresh sessions list in background
        fetchSessions();
      }

      const aiMsg = {
        id: 'ai_' + Date.now() + '_' + Math.random(),
        text: res.data.response,
        isAi: true,
        suggestCrisis: res.data.suggestCrisis,
        state: res.data.state,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => {
        const marked = prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m);
        return [...marked, aiMsg];
      });
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Connection lost. Tap to retry.';
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'error', error: errorMsg } : m));
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };


  const handleDeleteSession = (sessionId: string) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this chat session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/ai/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (activeSessionId === sessionId) {
              startNewChat();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete session.');
          }
        },
      },
    ]);
  };

  const getGroupedSessions = () => {
    const groups: { [key: string]: any[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': [],
    };
    const now = new Date();
    
    const isToday = (d: Date) => d.toDateString() === now.toDateString();
    const isYesterday = (d: Date) => {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return d.toDateString() === yesterday.toDateString();
    };
    const isWithin7Days = (d: Date) => {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return d > sevenDaysAgo;
    };

    sessions.forEach(session => {
      let dateKey = 'Older';
      if (session.updatedAt || session.createdAt) {
        const date = new Date(session.updatedAt || session.createdAt);
        if (isToday(date)) {
          dateKey = 'Today';
        } else if (isYesterday(date)) {
          dateKey = 'Yesterday';
        } else if (isWithin7Days(date)) {
          dateKey = 'Previous 7 Days';
        }
      } else {
        dateKey = 'Today';
      }
      groups[dateKey].push(session);
    });

    return groups;
  };

  const listData = loading ? [...messages, { id: '__typing__', type: 'typing' }] : messages;
  const showPrompts = messages.length <= 1 && !loading;

  return (
    <View style={[S.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      <BlurView intensity={theme.isDark ? 60 : 80} tint={theme.isDark ? 'dark' : 'light'} style={[S.header, { paddingTop: insets.top + 10 }]}>
        <View style={S.headerInner}>
          <View style={[S.headerAvatar, { backgroundColor: theme.colors.text.primary }]}>
            <Bot color={theme.colors.background} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.headerTitle, { color: theme.colors.text.primary }]}>{t('ai.title')}</Text>
            <View style={S.statusRow}>
              <View style={S.dot} />
              <Text style={[S.headerSub, { color: theme.colors.text.secondary }]}>{loading ? 'Reflecting…' : 'Always here for you'}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={[S.headerBtn, { marginRight: 4 }]} onPress={startNewChat}>
            <Plus color={theme.colors.text.secondary} size={22} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={S.headerBtn} onPress={() => setIsHistoryVisible(true)}>
            <History color={theme.colors.text.secondary} size={19} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={[S.disclaimer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <Info color={theme.colors.text.primary} size={13} />
          <Text style={[S.disclaimerText, { color: theme.colors.text.primary }]}>{t('ai.disclaimer')}</Text>
        </View>



        {showPrompts && (
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={S.prompts}>
            <View style={S.promptsHeader}>
              <Text style={[S.promptsLabel, { color: theme.colors.text.secondary }]}>Suggested Starters</Text>
            </View>
            <View style={S.promptsGrid}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <TouchableOpacity activeOpacity={0.7} key={i} style={[S.chip, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }]} onPress={() => handleSend(p)}>
                  <Text style={[S.chipText, { color: theme.colors.text.secondary }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={listData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageItem item={item} theme={theme} router={router} t={t} handleSend={handleSend} />}
          contentContainerStyle={[S.listContent, { paddingBottom: (isKeyboardVisible ? 12 : bottomPad) + INPUT_AREA_HEIGHT + 12 }]}
          showsVerticalScrollIndicator={false}
          onLayout={scrollToEnd}
          onContentSizeChange={scrollToEnd}
        />

        <View style={[S.inputPanel, { paddingBottom: isKeyboardVisible ? 8 : (bottomPad + 8), backgroundColor: theme.isDark ? 'rgba(18,18,18,0.97)' : 'rgba(255,255,255,0.97)' }]}>
          <View style={[S.inputRow, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderColor: message.trim() ? theme.colors.text.primary : (theme.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)') }]}>
            <TextInput
              ref={inputRef}
              style={[S.input, { color: theme.colors.text.primary }]}
              placeholder={t('ai.placeholder')}
              placeholderTextColor={theme.colors.text.secondary}
              value={message}
              onChangeText={setMessage}
              multiline
              onContentSizeChange={e => setInputHeight(Math.min(Math.max(44, e.nativeEvent.contentSize.height), 120))}
            />
            <View style={S.inputActions}>
              <TouchableOpacity activeOpacity={0.7} style={[S.micBtn, isRecording && { backgroundColor: '#EF4444' }]} onPress={isRecording ? stopRecording : startRecording}>
                {isRecording ? <StopCircle color="#FFF" size={20} /> : <Mic color={theme.colors.text.primary} size={20} />}
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={[S.sendBtn, { backgroundColor: theme.colors.text.primary }, !message.trim() && !isRecording && { opacity: 0.5 }]} onPress={() => handleSend()} disabled={!message.trim() || loading}>
                <Send color={theme.colors.background} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Chat History Modal ── */}
      <Modal
        visible={isHistoryVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHistoryVisible(false)}
      >
        <View style={S.modalOverlay}>
          <BlurView intensity={100} tint={theme.isDark ? 'dark' : 'light'} style={S.modalContainer}>
            <View style={[S.modalHeader, { borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <View style={S.modalHeaderLeft}>
                <History color={theme.colors.text.primary} size={20} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[S.modalTitle, { color: theme.colors.text.primary }]}>Chat Sessions</Text>
                  <Text style={[S.modalSubtitle, { color: theme.colors.text.secondary }]}>Past interactions with Oracle</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsHistoryVisible(false)} style={[S.closeBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <X color={theme.colors.text.primary} size={18} />
              </TouchableOpacity>
            </View>

            {sessions.length === 0 ? (
              <View style={S.emptyHistory}>
                <MessageCircle color={theme.colors.text.disabled} size={40} strokeWidth={1.5} />
                <Text style={[S.emptyText, { color: theme.colors.text.secondary }]}>No past conversations found.</Text>
                <Text style={[S.emptySub, { color: theme.colors.text.secondary }]}>Your sessions will appear here.</Text>
              </View>
            ) : (
              <ScrollView 
                contentContainerStyle={S.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {(() => {
                  const grouped = getGroupedSessions();
                  return ['Today', 'Yesterday', 'Previous 7 Days', 'Older'].map(category => {
                    const items = grouped[category];
                    if (!items || items.length === 0) return null;
                    
                    return (
                      <View key={category} style={S.historyGroup}>
                        <View style={S.groupLabelRow}>
                          <Text style={[S.groupLabelText, { color: theme.colors.text.primary }]}>{category}</Text>
                          <View style={[S.groupLabelLine, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
                        </View>

                        {items.map((session, index) => {
                          const isActive = session.id === activeSessionId;
                          return (
                            <TouchableOpacity 
                              key={session.id || index}
                              activeOpacity={0.7}
                              onPress={() => loadSession(session.id)}
                              style={[
                                S.sessionItem,
                                { 
                                  backgroundColor: isActive ? (theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)') : (theme.isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF'),
                                  borderColor: isActive ? theme.colors.text.primary : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                                }
                              ]}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={[S.sessionTitle, { color: isActive ? theme.colors.text.primary : theme.colors.text.primary }]} numberOfLines={1}>
                                  {session.title || 'New Conversation'}
                                </Text>
                                <Text style={[S.sessionDate, { color: theme.colors.text.secondary }]}>
                                  {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                                </Text>
                              </View>
                              <TouchableOpacity activeOpacity={0.7} onPress={() => handleDeleteSession(session.id)} style={{ padding: 8 }}>
                                <Trash2 color={theme.colors.text.tertiary} size={16} />
                              </TouchableOpacity>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  });
                })()}
              </ScrollView>
            )}
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(123,97,255,0.1)', zIndex: 10 },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, gap: 12 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: theme.typography.fonts.header, fontWeight: '800', letterSpacing: -0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#34D399' },
  headerSub: { fontSize: 12, fontFamily: theme.typography.fonts.body, fontWeight: '500' },
  headerBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 14, marginBottom: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: theme.typography.fonts.ui },
  modeToggle: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 16 },
  modeText: { fontSize: 13, fontFamily: theme.typography.fonts.header, fontWeight: '700' },
  prompts: { paddingHorizontal: 20, marginVertical: 12 },
  promptsHeader: { marginBottom: 10 },
  promptsLabel: { fontSize: 11, fontFamily: theme.typography.fonts.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  promptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 14, fontFamily: theme.typography.fonts.body, fontWeight: '500' },
  listContent: { paddingTop: 8 },
  inputPanel: { paddingHorizontal: 20, paddingTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 28, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 6, gap: 8 },
  input: { flex: 1, fontSize: 16, fontFamily: theme.typography.fonts.body, lineHeight: 22, paddingTop: 10, paddingBottom: 10, minHeight: 44, maxHeight: 120 },
  inputActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { height: '80%', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, marginBottom: 20 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  modalSubtitle: { fontSize: 12, fontFamily: theme.typography.fonts.body, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyHistory: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyText: { fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 13, fontFamily: theme.typography.fonts.body, marginTop: 4, textAlign: 'center', opacity: 0.8 },
  modalScrollContent: { paddingBottom: 40, gap: 14 },
  historyGroup: { marginVertical: 8 },
  groupLabelRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
  groupLabelText: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  groupLabelLine: { flex: 1, height: 1 },
  sessionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginVertical: 6 },
  sessionTitle: { fontSize: 15, fontFamily: theme.typography.fonts.body, fontWeight: '600', marginBottom: 4 },
  sessionDate: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '500' },
});
