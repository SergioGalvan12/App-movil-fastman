import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

export const formStyles = StyleSheet.create({
  fieldContainer: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.body,
    marginBottom: spacing.xs,
    color: colors.text,
  },

  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },

  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.xs,
  },

  // 🔹 Botones
  button: {
    width: '100%',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonTextPrimary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});