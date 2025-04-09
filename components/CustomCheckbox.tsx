import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  label: string;
  value: boolean;
  onChange: () => void;
};

export default function CustomCheckbox({ label, value, onChange }: Props) {
  return (
    <Pressable onPress={onChange} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
      <MaterialIcons
        name={value ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={value ? '#5D74A6' : '#aaa'}
      />
      <Text style={{ marginLeft: 8 }}>{label}</Text>
    </Pressable>
  );
}
