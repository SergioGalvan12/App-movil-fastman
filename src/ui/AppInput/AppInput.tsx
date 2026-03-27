import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formStyles } from '../../styles/formStyles';
import { colors, radius, spacing } from '../../theme';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  secureToggle?: boolean;
};

export const AppInput = ({
  label,
  error,
  secureToggle = false,
  secureTextEntry,
  editable = true,
  ...props
}: AppInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecureField = useMemo(
    () => secureToggle || !!secureTextEntry,
    [secureToggle, secureTextEntry]
  );

  const computedSecureTextEntry = isSecureField ? !isPasswordVisible : false;

  return (
    <View style={formStyles.fieldContainer}>
      <Text style={formStyles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.inputWrapperDisabled,
          error ? styles.inputWrapperError : null,
        ]}
      >
        <TextInput
          {...props}
          editable={editable}
          style={styles.input}
          placeholderTextColor="#999"
          secureTextEntry={computedSecureTextEntry}
        />

        {isSecureField ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            disabled={!editable}
          >
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={formStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputWrapperDisabled: {
    opacity: 0.7,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  iconButton: {
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
});