import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FiltrosAvanzados = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtros Avanzados</Text>
      {/* Aquí van los componentes futuros */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF0FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FiltrosAvanzados;
