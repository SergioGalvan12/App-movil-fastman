import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';
import { spacing } from '../../theme';

type PageStateProps = {
  title: string;
  message?: string;
  secondaryMessage?: string;
};

export const PageState = ({
  title,
  message,
  secondaryMessage,
}: PageStateProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={commonStyles.title}>{title}</Text>

      {message ? (
        <Text style={commonStyles.bodySecondary}>{message}</Text>
      ) : null}

      {secondaryMessage ? (
        <Text style={[commonStyles.bodySecondary, styles.secondaryMessage]}>
          {secondaryMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryMessage: {
    marginTop: spacing.xs,
  },
});