import React from 'react';
import { View, Text } from 'react-native';

export const ProgressRings = ({ completed, total, theme, styles, t }: any) => {
  const size = 52;
  const strokeWidth = 5;
  const progress = completed / total;

  return (
    <View style={[styles.ringsContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)' }]}>
      <View style={styles.ringWrap}>
        <View style={[styles.ringBg, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: theme.colors.plum + '15' }]} />
        <View style={[styles.ringFill, { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          borderTopColor: theme.colors.plum, 
          borderRightColor: progress >= 0.33 ? theme.colors.plum : 'transparent', 
          borderBottomColor: progress >= 0.66 ? theme.colors.plum : 'transparent', 
          borderLeftColor: progress >= 1.0 ? theme.colors.plum : 'transparent', 
          borderTopWidth: strokeWidth, 
          borderRightWidth: strokeWidth, 
          borderBottomWidth: strokeWidth, 
          borderLeftWidth: strokeWidth, 
          transform: [{ rotate: '-45deg' }] 
        }]} />
      </View>
      <View style={{ marginRight: 4 }}>
        <Text style={[styles.ringsCount, { color: theme.colors.text.primary }]}>{completed}</Text>
        <Text style={[styles.ringsLabel, { color: theme.colors.text.secondary }]}>{completed === 1 ? 'Goal' : 'Goals'}</Text>
      </View>
    </View>
  );
};
