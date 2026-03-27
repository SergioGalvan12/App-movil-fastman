import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

type ScreenContainerProps = {
  children: React.ReactNode;
};

export const ScreenContainer = ({ children }: ScreenContainerProps) => {
  return (
    <SafeAreaView style={commonStyles.screen}>
      <View style={commonStyles.contentContainer}>{children}</View>
    </SafeAreaView>
  );
};