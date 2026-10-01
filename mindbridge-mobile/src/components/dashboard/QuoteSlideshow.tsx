import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export const QuoteSlideshow = ({ theme, styles, t }: any) => {
  const [index, setIndex] = useState(0);
  const quotes = t('dashboard.motivations') as any[];
  
  useEffect(() => {
    const timer = setInterval(() => { 
      setIndex((prev) => (prev + 1) % (Array.isArray(quotes) ? quotes.length : 1)); 
    }, 7000);
    return () => clearInterval(timer);
  }, [quotes]);

  const quote = Array.isArray(quotes) ? quotes[index] : { text: "...", author: "..." };

  return (
    <Animated.View entering={FadeInUp.delay(50).duration(500)} style={styles.quoteCardContainer}>
      <LinearGradient colors={[theme.colors.plum, theme.isDark ? '#2E3A4A' : '#4A3E4F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quoteCard}>
        <View style={styles.quoteMarkContainer}><Text style={styles.largeQuoteMark}>“</Text></View>
        <Animated.View key={index} entering={FadeIn.duration(1000)}>
          <Text style={styles.quoteText}>{quote.text}</Text>
          <Text style={styles.quoteAuthor}>{quote.author}</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};
