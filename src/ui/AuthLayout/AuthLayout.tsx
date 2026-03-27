import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { commonStyles } from '../../styles/commonStyles';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerTopSpacing?: number;
};

export const AuthLayout = ({
  title,
  subtitle,
  children,
  footerTopSpacing = spacing.lg,
}: AuthLayoutProps) => {
  return (
    <View style={styles.wrapper}>
      <View>
        <Image
          source={require('../../../assets/fastman.png')}
          style={styles.logo}
        />

        <Text style={commonStyles.title}>{title}</Text>

        {subtitle ? <Text style={commonStyles.bodySecondary}>{subtitle}</Text> : null}

        <View style={styles.formSection}>{children}</View>
      </View>

      <View style={[styles.footerSection, { marginTop: footerTopSpacing }]}>
        <Text style={styles.footer}>© Copyright Fastman 2025</Text>

        <View style={styles.linksContainer}>
          <Text style={styles.link}>Aviso de privacidad</Text>
          <Text style={styles.link}>Política de privacidad</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: spacing.md,
  },
  formSection: {
    marginTop: spacing.lg,
  },
  footerSection: {
    marginBottom: spacing.sm,
  },
  footer: {
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  link: {
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});