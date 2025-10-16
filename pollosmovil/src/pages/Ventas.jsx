import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import HeaderPrincipal from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from '../components/Modal.componet';


const Ventas = () => {
    return (
        <View>
            <HeaderPrincipal />
            <Text>Estas en Ventas</Text>
        </View>
    )
}

export default Ventas