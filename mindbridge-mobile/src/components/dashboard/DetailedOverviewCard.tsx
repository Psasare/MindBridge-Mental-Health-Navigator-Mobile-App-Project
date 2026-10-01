import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export const DetailedOverviewCard = ({ title, value, label, icon: Icon, color, progress, theme, styles, onPress, subtitle }: any) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.detailedCard, { backgroundColor: theme.colors.surface }]}>
    <View style={styles.detailedHeader}>
      <View style={[styles.detailedIconWrap, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <ChevronRight color={theme.colors.text.disabled} size={18} />
    </View>
    <View style={styles.detailedContent}>
      <Text style={[styles.detailedTitle, { color: theme.colors.text.tertiary }]}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginVertical: 4 }}>
        <Text style={[styles.detailedValue, { color: theme.colors.text.primary }]}>{value}</Text>
        <Text style={[styles.detailedLabel, { color: theme.colors.text.secondary }]}>{label}</Text>
      </View>
      {subtitle && <Text style={[styles.detailedSubtitle, { color: theme.colors.text.tertiary }]}>{subtitle}</Text>}
      {progress !== undefined && (
        <View style={styles.detailedProgressBg}>
          <View style={[styles.detailedProgressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
      )}
    </View>
  </TouchableOpacity>
);
