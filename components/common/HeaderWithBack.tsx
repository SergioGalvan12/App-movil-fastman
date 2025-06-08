// src/components/common/HeaderWithBack.tsx
import React from 'react';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../App';
import { StyleSheet } from 'react-native';

type Props = {
    title: string;
};

export default function HeaderWithBack({ title }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

    return (
        <Appbar.Header style={styles.header} mode="center-aligned">
            <Appbar.BackAction style={styles.arrow} onPress={() => navigation.goBack()} color="#FFFFFF" />
            <Appbar.Content title={title} titleStyle={styles.title} />
        </Appbar.Header>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#1B2A56',
        height: 48, 
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        elevation: 0,
        borderRadius: 10
    },
    title: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: -24, 
        textAlign: 'center',
    },
    arrow: {
        marginTop: -24, // espacio entre la flecha y el título
    },
});

