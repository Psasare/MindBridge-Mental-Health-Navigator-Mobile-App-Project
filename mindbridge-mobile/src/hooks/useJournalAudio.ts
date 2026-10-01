import { useState, useEffect } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  createAudioPlayer,
  AudioPlayer,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  setAudioModeAsync
} from 'expo-audio';
import { Alert } from 'react-native';
import { useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export const useJournalAudio = () => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const isRecording = recorderState.isRecording;

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  
  const micScale = useSharedValue(1);

  useEffect(() => {
    return () => {
      if (player) player.remove();
    };
  }, [player]);

  const startRecording = async () => {
    try {
      Alert.alert(
        "Microphone Access",
        "MindBridge uses your microphone strictly to transcribe your Voice Journal. The audio is processed and immediately discarded. We do not store raw audio.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Allow",
            onPress: async () => {
              const { granted } = await requestRecordingPermissionsAsync();
              if (granted) {
                await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldRouteThroughEarpiece: false });
                await recorder.prepareToRecordAsync();
                recorder.record();
                micScale.value = withRepeat(withSequence(withTiming(1.2), withTiming(1)), -1, true);
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    micScale.value = withTiming(1);
    await recorder.stop();
    setAudioUri(recorder.uri);
  };

  const playSound = async (uri: string, id: string) => {
    if (isPlaying === id) {
      player?.pause();
      setIsPlaying(null);
      return;
    }

    if (player) player.remove();
    const newPlayer = createAudioPlayer(uri);
    setPlayer(newPlayer);
    setIsPlaying(id);
    newPlayer.play();
    
    // @ts-ignore
    newPlayer.addListener('playbackStatusUpdate', (status: any) => {
      if (status.didJustFinish) setIsPlaying(null);
    });
  };

  const resetAudio = () => {
    setAudioUri(null);
    if (player) {
      player.pause();
      setIsPlaying(null);
    }
  };

  return {
    isRecording,
    audioUri,
    isPlaying,
    micScale,
    startRecording,
    stopRecording,
    playSound,
    resetAudio,
    setAudioUri
  };
};
