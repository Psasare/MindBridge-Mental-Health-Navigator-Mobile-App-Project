import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { BrainCircuit, ChevronLeft, ArrowRight, ShieldAlert, Sparkles, Footprints, Info, BookmarkPlus } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

export default function CBTReframeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  // Pulse animation for loading state
  const pulseOpacity = useSharedValue(0.5);
  useEffect(() => {
    if (loading) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [loading]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseOpacity.value === 1 ? 1 : 0.95 + (pulseOpacity.value * 0.05) }]
  }));

  const handleAnalyze = async () => {
    if (!thought.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      const res = await api.post('/self-help/cbt-reframe', { negativeThought: thought });
      setResult(res.data);
    } catch (error) {
      console.error('Error analyzing thought:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToJournal = async () => {
    if (!result) return;
    try {
      await api.post('/journal', {
        title: 'Reframed Thought',
        content: `Original Thought:\n${thought}\n\nIdentified Distortions:\n${result.distortions?.join(', ')}\n\nReframed Perspective:\n${result.reframe}\n\nNext Step:\n${result.nextStep}`,
        moodScore: 5,
        emotions: ['Clarity']
      });
      setSaved(true);
    } catch (error) {
      console.error('Error saving to journal', error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={theme.colors.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Thought Reframer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!result && !loading && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.introBlock}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.plum + '15' }]}>
              <BrainCircuit color={theme.colors.plum} size={36} />
            </View>
            <Text style={[styles.introTitle, { color: theme.colors.text.primary }]}>Challenge Your Thoughts</Text>
            <Text style={[styles.introDesc, { color: theme.colors.text.secondary }]}>
              Pour out a negative or stressful thought you're having right now. Let the Oracle help you identify cognitive distortions and build a more balanced perspective.
            </Text>
          </Animated.View>
        )}

        {/* Input Area */}
        <Animated.View style={[styles.inputSection, (result || loading) && styles.inputSectionCompact]}>
          <View style={[styles.inputContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }, (result || loading) && { height: 80 }]}
              placeholder="e.g., I completely failed that test, I'm never going to graduate..."
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              value={thought}
              onChangeText={setThought}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
          
          {!result && (
            <TouchableOpacity 
              style={[styles.analyzeBtn, { backgroundColor: theme.colors.plum, opacity: thought.trim().length > 0 ? 1 : 0.5 }]} 
              onPress={handleAnalyze}
              disabled={thought.trim().length === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.analyzeBtnText}>Analyze & Reframe</Text>
                  <ArrowRight color="#FFF" size={20} />
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {loading && (
          <Animated.View style={[styles.loadingContainer, animatedPulseStyle]}>
            <View style={[styles.pulseCircle, { backgroundColor: theme.colors.plum + '20' }]}>
              <BrainCircuit color={theme.colors.plum} size={40} />
            </View>
            <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>The Oracle is analyzing your thought...</Text>
            <Text style={[styles.loadingSub, { color: theme.colors.text.secondary }]}>Identifying cognitive distortions</Text>
          </Animated.View>
        )}

        {result && !loading && (
          <View style={styles.resultContainer}>
            {/* Distortions */}
            <Animated.View entering={FadeInUp.delay(100).duration(600)} style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.semantic.danger + '20' }]}>
              <View style={styles.resultHeader}>
                <View style={[styles.headerIconBg, { backgroundColor: theme.colors.semantic.danger + '15' }]}>
                  <ShieldAlert size={20} color={theme.colors.semantic.danger} />
                </View>
                <Text style={[styles.resultLabel, { color: theme.colors.text.primary }]}>Identified Distortions</Text>
              </View>
              <Text style={[styles.cardDescription, { color: theme.colors.text.secondary }]}>Your thought contains these common mental traps:</Text>
              <View style={styles.tagContainer}>
                {result.distortions?.map((d: string, i: number) => (
                  <View key={i} style={[styles.tag, { backgroundColor: theme.colors.semantic.danger + '10', borderColor: theme.colors.semantic.danger + '30' }]}>
                    <Text style={[styles.tagText, { color: theme.colors.semantic.danger }]}>{d}</Text>
                    <Info size={14} color={theme.colors.semantic.danger} style={{ marginLeft: 6, opacity: 0.7 }} />
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Reframe */}
            <Animated.View entering={FadeInUp.delay(300).duration(600)} style={[styles.resultCard, styles.reframeCard, { backgroundColor: theme.colors.accents.eucalyptus + '08', borderColor: theme.colors.accents.eucalyptus + '40' }]}>
              <View style={styles.resultHeader}>
                <View style={[styles.headerIconBg, { backgroundColor: theme.colors.accents.eucalyptus + '20' }]}>
                  <Sparkles size={20} color={theme.colors.accents.eucalyptus} />
                </View>
                <Text style={[styles.resultLabel, { color: theme.colors.text.primary }]}>A More Balanced Perspective</Text>
              </View>
              <Text style={[styles.resultText, { color: theme.colors.text.primary }]}>{result.reframe}</Text>
            </Animated.View>

            {/* Next Step */}
            <Animated.View entering={FadeInUp.delay(500).duration(600)} style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.plum + '20' }]}>
              <View style={styles.resultHeader}>
                <View style={[styles.headerIconBg, { backgroundColor: theme.colors.plum + '15' }]}>
                  <Footprints size={20} color={theme.colors.plum} />
                </View>
                <Text style={[styles.resultLabel, { color: theme.colors.text.primary }]}>Suggested Action</Text>
              </View>
              <Text style={[styles.resultText, { color: theme.colors.text.secondary }]}>{result.nextStep}</Text>
            </Animated.View>

            {/* Actions */}
            <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.plum + '30' }]} 
                onPress={() => { setThought(''); setResult(null); }}
              >
                <Text style={[styles.actionBtnText, { color: theme.colors.text.primary }]}>Reframe Another</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtnPrimary, { backgroundColor: saved ? theme.colors.accents.eucalyptus : theme.colors.plum }]} 
                onPress={handleSaveToJournal}
                disabled={saved}
              >
                <BookmarkPlus size={20} color="#FFF" />
                <Text style={[styles.actionBtnText, { color: '#FFF' }]}>{saved ? "Saved to Journal" : "Save to Journal"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 110,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  introBlock: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputSectionCompact: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  input: {
    height: 140,
    fontSize: 17,
    lineHeight: 26,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  loadingSub: {
    fontSize: 15,
    opacity: 0.7,
  },
  resultContainer: {
    gap: 16,
  },
  resultCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
  },
  reframeCard: {
    borderWidth: 1.5,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultText: {
    fontSize: 17,
    lineHeight: 26,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
