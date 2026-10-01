import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react-native';

export const QuestItem = ({ icon: Icon, goal, title, subtitle, done, theme, isLast, onPress, styles }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <View style={[styles.questItemContainer, isLast && { borderBottomWidth: 0 }]}>
      <TouchableOpacity 
        style={styles.questItemRow} 
        onPress={() => {
          if (done) return;
          if (goal?.description) {
            setIsExpanded(!isExpanded);
          } else if (onPress) {
            onPress();
          }
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.questIconWrap, { backgroundColor: done ? theme.colors.accents.eucalyptus + '15' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
          <Icon size={20} color={done ? theme.colors.accents.eucalyptus : theme.colors.text.tertiary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.questTitle, done && { textDecorationLine: 'line-through', color: theme.colors.text.disabled }]}>{title}</Text>
          <Text style={styles.questSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.questCheck, done && { backgroundColor: theme.colors.accents.eucalyptus, borderColor: theme.colors.accents.eucalyptus }]}>
          {done ? <CheckCircle2 size={16} color="#FFF" /> : (
            goal?.description ? 
              <ChevronDown size={16} color={theme.colors.text.disabled} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} /> 
              : <ChevronRight size={16} color={theme.colors.text.disabled} />
          )}
        </View>
      </TouchableOpacity>
      
      {isExpanded && !done && goal?.description && (
        <Animated.View entering={FadeInUp.duration(300)} style={[styles.questExpandedContent, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }]}>
          <Text style={[styles.questDescription, { color: theme.colors.text.secondary }]}>{goal.description}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.questStartBtn, { backgroundColor: theme.colors.plum }]}>
            <Text style={styles.questStartBtnText}>Start Goal</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};
