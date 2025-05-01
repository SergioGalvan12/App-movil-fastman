// components/common/Select.tsx
import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface SelectProps<T> {
  /** Array de objetos con tus opciones */
  options: T[];
  /** Nombre de la clave que usamos como valor interno */
  valueKey: keyof T;
  /** Nombre de la clave que usamos para mostrar la etiqueta */
  labelKey: keyof T;
  /** Valor actualmente seleccionado (puede ser number|string|null) */
  selectedValue: T[keyof T] | null;
  /** Callback al cambiar selección */
  onValueChange: (value: T[keyof T] | null) => void;
  /** Texto que aparece como opción vacía */
  placeholder?: string;
  /** Si true, mostramos un spinner en lugar del Picker */
  loading?: boolean;
  /** Si no vacío, mostramos el mensaje de error */
  error?: string;
  /** Deshabilita el control */
  disabled?: boolean;
  /** Estilos custom para el wrapper */
  style?: ViewStyle;
  /** Estilos custom para el texto de error */
  errorStyle?: TextStyle;
}

export default function Select<T extends Record<string, any>>({
  options,
  valueKey,
  labelKey,
  selectedValue,
  onValueChange,
  placeholder = '— Selecciona —',
  loading = false,
  error = '',
  disabled = false,
  style,
  errorStyle,
}: SelectProps<T>) {
  if (loading) {
    // 1) Mientras cargan datos
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <View style={[styles.wrapper, style]}>
      {/* 2) Si hay error, lo pintamos arriba */}
      {error ? <Text style={[styles.error, errorStyle]}>{error}</Text> : null}

      {/* 3) El Picker propiamente */}
      <Picker
        selectedValue={selectedValue}
        onValueChange={(value) => onValueChange(value === '' ? null : value)}
        style={styles.picker}
        enabled={!disabled}
      >
        {/* 4) Opción vacía */}
        <Picker.Item label={placeholder} value={''} />
        {/* 5) Mapeo de opciones */}
        {options.map((opt, i) => (
          <Picker.Item
            key={i}
            label={String(opt[labelKey])}
            value={opt[valueKey]}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1B2A56',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  picker: {
    height: 60,
  },
  loader: {
    marginVertical: 10,
  },
  error: {
    color: '#E53935',
    fontSize: 12,
    padding: 4,
  },
});
