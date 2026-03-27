import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type FormSectionLabelProps = {
    children: React.ReactNode;
};

export const FormSectionLabel = ({ children }: FormSectionLabelProps) => {
    return <Text style={styles.label}>{children}</Text>;
};

const styles = StyleSheet.create({
    label: {
        ...typography.body,
        color: colors.text,
        marginBottom: spacing.xs,
        marginTop: spacing.md,
        fontWeight: '600',
    },
});