import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import {
  suggestCaptionApi,
  type UploadImageFile,
} from '../api/services/post.service';

interface CaptionSuggestionProps {
  image?: UploadImageFile | null;
  disabled?: boolean;
  onApply(caption: string): void;
}

export default function CaptionSuggestion({
  image,
  disabled,
  onApply,
}: CaptionSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = useCallback(async () => {
    if (!image || loading || disabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await suggestCaptionApi(image);
      const caption = response.data.caption?.trim() || '';

      if (!caption) {
        setError('Không nhận được gợi ý, thử lại nhé!');
        return;
      }

      onApply(caption);
    } catch (err) {
      let message = 'Không thể gợi ý caption, thử lại sau.';
      if (isAxiosError(err)) {
        message =
          (err.response?.data as { message?: string })?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [image, loading, disabled, onApply]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          (disabled || !image || loading) && styles.actionButtonDisabled,
        ]}
        onPress={handleSuggest}
        disabled={!image || disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.actionText}>Gợi ý caption</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    fontWeight: '600',
    color: '#000',
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 8,
    textAlign: 'center',
  },
});

