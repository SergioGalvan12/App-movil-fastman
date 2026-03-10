// components/layouts/ReportScreenLayout.tsx
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export default function ReportScreenLayout({
  children,
  scroll = true,
  contentStyle,
}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentNoScroll, contentStyle]}>{children}</View>
      )}
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

  contentNoScroll: {
    flex: 1,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});