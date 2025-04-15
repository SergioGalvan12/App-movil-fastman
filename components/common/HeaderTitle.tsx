// src/components/common/HeaderTitle.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderTitleProps {
  title: string;
}

export default function HeaderTitle({ title }: HeaderTitleProps) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#1B2A56',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3, // para sombra en Android
    shadowColor: '#000', // para sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  titleText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
