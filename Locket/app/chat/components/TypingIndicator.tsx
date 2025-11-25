import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <View style={styles.typingIndicator}>
      <Text style={styles.typingText}>Đang gõ...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});

