import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const commonStyles = StyleSheet.create({
  // 🔹 Layout base de pantalla
  screen: {
    flex: 1,
    backgroundColor: colors.background, // reemplaza #EFF0FA
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  // 🔹 Helpers de layout
  flex1: {
    flex: 1,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // 🔹 Tipografía base
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  body: {
    ...typography.body,
  },

  bodySecondary: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },

  // 🔹 Separadores
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});