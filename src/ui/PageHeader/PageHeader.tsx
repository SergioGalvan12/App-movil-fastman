import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';
import { spacing } from '../../theme';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={commonStyles.title}>{title}</Text>
      {subtitle ? <Text style={commonStyles.bodySecondary}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});