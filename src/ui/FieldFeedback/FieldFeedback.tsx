import React from 'react';
import { ActivityIndicator, Text, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';

type FieldFeedbackProps = {
  loading?: boolean;
  error?: string;
};

export const FieldFeedback = ({ loading = false, error = '' }: FieldFeedbackProps) => {
  if (loading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return null;
};

const styles = StyleSheet.create({
  feedbackContainer: {
    marginVertical: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});