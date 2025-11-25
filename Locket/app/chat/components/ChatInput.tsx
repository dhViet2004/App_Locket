import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  sending: boolean;
}

export function ChatInput({
  inputText,
  onInputChange,
  onSend,
  onPickImage,
  sending,
}: ChatInputProps) {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={onPickImage}
        disabled={sending}
      >
        <Ionicons name="image-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#666"
        value={inputText}
        onChangeText={onInputChange}
        multiline
        maxLength={1000}
        editable={!sending}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!inputText.trim() || sending) && styles.sendButtonDisabled,
        ]}
        onPress={onSend}
        disabled={!inputText.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="send" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
});

