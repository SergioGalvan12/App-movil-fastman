import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type MenuItemProps = {
  title: string;
  onPress: () => void;
};

export default function MenuItem({ title, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '90%',
    paddingVertical: 15,
    backgroundColor: '#3260B2',
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
    // Sombra (opcional):
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Para Android
  },
  buttonText: {
    textAlign: 'center',
    color: '#F2F2F9',
    fontSize: 16,
    fontWeight: '600',
  },
});
