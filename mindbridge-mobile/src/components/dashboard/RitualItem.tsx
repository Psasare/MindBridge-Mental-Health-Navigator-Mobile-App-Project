import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

export const RitualItem = ({ label, done, icon: Icon, color, theme, styles, onPress }: any) => (
  <TouchableOpacity style={styles.ritualItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.ritualIconCircle, { backgroundColor: done ? color : (theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }]}>
      <Icon color={done ? '#FFF' : theme.colors.text.disabled} size={24} />
      {done && <View style={styles.checkBadge}><CheckCircle2 color="#FFF" size={12} fill={color} /></View>}
    </View>
    <Text style={[styles.ritualLabel, { color: done ? theme.colors.text.primary : theme.colors.text.tertiary }]}>{label}</Text>
  </TouchableOpacity>
);
