import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { formStyles } from '../../styles/formStyles';
import { colors } from '../../theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
};

export const AppButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AppButtonProps) => {
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        isGhost ? styles.ghostButton : [formStyles.button, formStyles.buttonPrimary],
        (disabled || loading) && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.primary : colors.white} size="small" />
      ) : (
        <Text style={isGhost ? styles.ghostText : formStyles.buttonTextPrimary}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
  ghostButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});