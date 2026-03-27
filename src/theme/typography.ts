import { colors } from './colors';

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },

  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.text,
  },

  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};