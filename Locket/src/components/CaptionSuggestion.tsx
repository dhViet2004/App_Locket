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
  const [suggestedCaption, setSuggestedCaption] = useState<string | null>(null);
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
        setSuggestedCaption(null);
        return;
      }

      setSuggestedCaption(caption);
    } catch (err) {
      let message = 'Không thể gợi ý caption, thử lại sau.';
      if (isAxiosError(err)) {
        message =
          (err.response?.data as { message?: string })?.message || message;
      }
      setError(message);
      setSuggestedCaption(null);
    } finally {
      setLoading(false);
    }
  }, [image, loading, disabled]);

  const handleApply = useCallback(() => {
    if (suggestedCaption) {
      onApply(suggestedCaption);
    }
  }, [onApply, suggestedCaption]);

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

      {suggestedCaption ? (
        <View style={styles.resultContainer}>
          <Text style={styles.captionLabel}>Caption gợi ý</Text>
          <Text style={styles.captionText}>{suggestedCaption}</Text>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Chèn vào tin nhắn</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  resultContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  captionLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  applyButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffd700',
    borderRadius: 20,
  },
  applyText: {
    color: '#000',
    fontWeight: '600',
  },
});

