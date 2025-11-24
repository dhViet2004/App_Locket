import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddWidgetPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const AddWidgetPromptModal: React.FC<AddWidgetPromptModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
}) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Thêm vào màn hình Chờ?</Text>
        <Text style={styles.subtitle}>
          Chạm và giữ widget hoặc chạm Thêm để đưa “ảnh mới nhất từ bạn bè” ra màn hình chờ.
        </Text>

        <View style={styles.previewCard}>
          <View style={styles.previewIconWrapper}>
            <Ionicons name="heart" size={28} color="#fff" />
          </View>
          <Text style={styles.previewTitle}>Bài mới nhất</Text>
          <Text style={styles.previewMeta}>Tự cập nhật · 2 × 2</Text>
          <Text style={styles.previewCaption}>
            Widget hiển thị post mới nhất từ bạn bè ngay khi họ đăng
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Thoát</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Thêm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffd700',
    marginBottom: 24,
  },
  previewIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#222',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  previewCaption: {
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  primaryButtonText: {
    color: '#000',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddWidgetPromptModal;

