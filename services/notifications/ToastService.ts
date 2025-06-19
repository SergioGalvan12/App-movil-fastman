// services/ToastService.ts
import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'danger';

interface ShowToastOptions {
  position?: 'top' | 'bottom';
  bottomOffset?: number;
  keyboardOffset?: number;
  // Podés agregar más propiedades personalizadas según la API de react-native-toast-message
}

export const showToast = (
  type: ToastType,
  text1: string,
  text2?: string,
  options?: ShowToastOptions
) => {
  Toast.show({
    type,
    text1,
    text2,
    position: options?.position || 'bottom',
    bottomOffset: options?.bottomOffset || 80,
    keyboardOffset: options?.keyboardOffset || 10,
    ...options,
  });
};
