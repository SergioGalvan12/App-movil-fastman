// /components/common/HeaderWithBack.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, ViewProps } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export default function ReportScreenLayout({ children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF0FA',
    paddingTop: 10,
    paddingBottom: 40,
  },
  content: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
