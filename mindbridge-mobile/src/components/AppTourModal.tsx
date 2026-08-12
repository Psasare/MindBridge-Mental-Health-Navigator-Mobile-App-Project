import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Leaf, BookOpen, Compass, ChevronRight, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TOUR_SLIDES = [
  {
    id: 'dashboard',
    title: 'Your Home Base',
    description: 'Track your daily quests, access quick tools, and get a weekly overview of your emotional rhythm on the Dashboard.',
    icon: Home,
    color: '#7B61FF'
  },
  {
    id: 'garden',
    title: 'Your Wellbeing Ecosystem',
    description: 'Log your moods, track your sleep, and watch your personal wellbeing garden grow with AI-powered analytics.',
    icon: Leaf,
    color: '#34D399'
  },
  {
    id: 'journal',
    title: 'Reflect & Grow',
    description: 'Express yourself through voice or text. Our AI guide provides personalized feedback to help you process your thoughts.',
    icon: BookOpen,
    color: '#F472B6'
  },
  {
    id: 'explore',
    title: 'Discover Resources',
    description: 'Find guided meditations, breathing exercises, and clinical assessments tailored to your unique mental health journey.',
    icon: Compass,
    color: '#60A5FA'
  }
];

interface AppTourModalProps {
  visible: boolean;
  theme: any;
  onClose: () => void;
}

export const AppTourModal = ({ visible, theme, onClose }: AppTourModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visible) return null;

  const currentSlide = TOUR_SLIDES[currentIndex];
  const Icon = currentSlide.icon;
  const isLast = currentIndex === TOUR_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <BlurView intensity={theme.isDark ? 50 : 20} tint={theme.isDark ? 'dark' : 'light'} style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: theme.colors.text.tertiary }]}>Skip</Text>
            <X size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          {/* Icon Wrap */}
          <View style={[styles.iconWrap, { backgroundColor: currentSlide.color + '15' }]}>
            <Icon size={48} color={currentSlide.color} strokeWidth={1.5} />
          </View>

          {/* Content */}
          <Text style={[styles.title, { color: theme.colors.text.primary, fontFamily: theme.typography.fonts.header }]}>{currentSlide.title}</Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary, fontFamily: theme.typography.fonts.body }]}>{currentSlide.description}</Text>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {TOUR_SLIDES.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.dot, 
                  { backgroundColor: idx === currentIndex ? theme.colors.plum : (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') },
                  idx === currentIndex && styles.activeDot
                ]} 
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.nextBtn, { backgroundColor: theme.colors.plum }]} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextBtnText, { fontFamily: theme.typography.fonts.header }]}>{isLast ? 'Get Started' : 'Next'}</Text>
            {!isLast && <ChevronRight size={20} color="#FFF" />}
          </TouchableOpacity>

        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative'
  },
  skipBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 8,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
