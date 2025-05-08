// components/SelectPersonal.tsx (deberia estar ahi)
// Este componente es un selector de personal
// screen/reports/SelectPersonal.tsx (aqui se encuentra de momento este componente)
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import apiClient, { ApiResponse } from '../../services/apiClient';

/**
 * Interfaz mínima que describe un elemento de “personal”
 */
export interface PersonalInterface {
  id_personal: number;
  nombre_personal: string;
  apaterno_personal: string;
  amaterno_personal: string;
}

interface Props {
  formulario: { id_personal: number };
  setFormulario: (f: { id_personal: number }) => void;
  /**
   * Si true → fuerza usar personal-me/  
   * Si false → fuerza usar personal/  
   * Si undefined → elige automáticamente:
   *   lista de todos si >1 | sólo tú si ===1
   */
  forceSingle?: boolean;
  etiqueta?: string;
}

export default function SelectPersonal({
  formulario,
  setFormulario,
  forceSingle,
  etiqueta = 'reporta',
}: Props) {
  const [personalList, setPersonalList] = useState<PersonalInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // ¿modo “sólo yo”?  o “modo lista completa”
        const singleMode = forceSingle === true
          ? true
          : forceSingle === false
            ? false
            : undefined;
            let resp: ApiResponse<PersonalInterface[]>;
            if (singleMode ?? (personalList.length === 1)) {
              // 2a) Solo tu registro
              console.log('[SelectPersonal] fetch personal-me...');
              resp = await apiClient.get<PersonalInterface[]>('personal-me/');
            } else {
              // 2b) Lista completa de personal activo
              console.log('[SelectPersonal] fetch personal list...');
              resp = await apiClient.get<PersonalInterface[]>('personal/', {
                params: { status_personal: true }
              });
            }

        // Logea sólo los primeros 5 ítems:
        console.log(
          '[SelectPersonal] respuesta API (max 5):',
          resp.success && resp.data
            ? resp.data.slice(0, 5)
            : resp
        );

        if (resp.success && resp.data) {
          setPersonalList(resp.data);
          // Si es “solo yo”, precarga el formulario:
          if ((singleMode ?? resp.data.length === 1) && resp.data.length) {
            setFormulario({ id_personal: resp.data[0].id_personal });
          }
        }
      } catch (e) {
        console.error('[SelectPersonal] error cargando datos', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [forceSingle]);

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 10 }} />;
  }

  const isDisabled = forceSingle === true
    ? true
    : forceSingle === false
      ? false
      : personalList.length === 1;

  return (
    <View style={styles.wrapper}>
      <Picker
        selectedValue={formulario.id_personal}
        onValueChange={(v) => {
          console.log('[SelectPersonal] cambio a id_personal →', v);
          setFormulario({ id_personal: Number(v) });
        }}
        enabled={!isDisabled}
        style={styles.picker}
      >
        <Picker.Item label={`— Selecciona ${etiqueta} —`} value={0} />
        {personalList.map((p) => (
          <Picker.Item
            key={p.id_personal}
            label={`${p.nombre_personal} ${p.apaterno_personal} ${p.amaterno_personal}`}
            value={p.id_personal}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 55,
    backgroundColor: '#FFF',
  },
});
