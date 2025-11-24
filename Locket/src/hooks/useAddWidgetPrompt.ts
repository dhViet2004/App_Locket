import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ToastAndroid } from 'react-native';

const ANDROID_WIDGET_INTENT = 'android.appwidget.action.APPWIDGET_PICK';

const getLinkingWithIntent = () => Linking as Linking & {
  sendIntent?: (action: string, extras?: Record<string, any>) => Promise<void>;
};

const canUseNativeWidgetSheet = () =>
  Platform.OS === 'android' && typeof getLinkingWithIntent().sendIntent === 'function';

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Locket', message);
  }
};

export const useAddWidgetPrompt = () => {
  const [isPromptVisible, setPromptVisible] = useState(false);
  const [isProcessing, setProcessing] = useState(false);

  const launchNativeWidgetSheet = useCallback(async () => {
    if (!canUseNativeWidgetSheet()) {
      throw new Error('Widget intent unsupported');
    }
    const linking = getLinkingWithIntent();
    await linking.sendIntent?.(ANDROID_WIDGET_INTENT);
    showToast('Đã thêm tiện ích lên màn hình chờ!');
  }, []);

  const openAddWidgetPrompt = useCallback(async () => {
    console.log('[Analytics] widget_add_attempt');
    if (canUseNativeWidgetSheet()) {
      try {
        await launchNativeWidgetSheet();
        return;
      } catch (error) {
        console.warn('[Widget] Native sheet unavailable, fallback to modal', error);
      }
    }
    setPromptVisible(true);
  }, [launchNativeWidgetSheet]);

  const closePrompt = useCallback(() => {
    setPromptVisible(false);
  }, []);

  const confirmAddWidget = useCallback(async () => {
    setProcessing(true);
    try {
      if (canUseNativeWidgetSheet()) {
        await launchNativeWidgetSheet();
      } else {
        showToast('Thiết bị không hỗ trợ tiện ích');
      }
    } catch (error) {
      console.error('[Widget] Failed to start widget intent', error);
      showToast('Thiết bị không hỗ trợ tiện ích');
    } finally {
      setProcessing(false);
      setPromptVisible(false);
    }
  }, [launchNativeWidgetSheet]);

  return {
    openAddWidgetPrompt,
    isPromptVisible,
    closePrompt,
    confirmAddWidget,
    isProcessing,
  };
};

export type UseAddWidgetPromptReturn = ReturnType<typeof useAddWidgetPrompt>;

