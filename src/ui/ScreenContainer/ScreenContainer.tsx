import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../styles/commonStyles';

type ScreenContainerProps = {
  children: React.ReactNode;
};

export const ScreenContainer = ({ children }: ScreenContainerProps) => {
  return (
    <SafeAreaView style={commonStyles.screen} edges={['top', 'left', 'right']}>
      <View style={commonStyles.contentContainer}>{children}</View>
    </SafeAreaView>
  );
};