import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import React, { useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';

const Boton = () => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  // estilos animados para cada botón
  const productoStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
    opacity: animation,
  };

  const ventasStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: animation,
  };

  const clienteStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -210],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fondo semitransparente */}
      {open && ( 
          <BlurView
             style={StyleSheet.absoluteFill}
             blurType="light"  
             blurAmount={20}
             reducedTransparencyFallbackColor="white"
       />)}

      <View style={styles.container}>
<Animated.View style={[styles.secondary, productoStyle]}>
  <View style={styles.row}>
    <Text style={styles.label}>Productos</Text>
    <TouchableOpacity style={styles.btn} 
    onPress={() => 
    {toggleMenu(); 
    navigation.navigate('productos')}}>
      <Icon name="food-drumstick" size={26} color="#fff" />
    </TouchableOpacity>
  </View>
</Animated.View>

<Animated.View style={[styles.secondary, ventasStyle]}>
  <View style={styles.row}>
    <Text style={styles.label}>Nueva venta</Text>
    <TouchableOpacity style={styles.btn}>
      <Icon name="plus" size={26} color="#fff" />
    </TouchableOpacity>
  </View>
</Animated.View>

<Animated.View style={[styles.secondary, clienteStyle]}>
  <View style={styles.row}>
    <Text style={styles.label}>Clientes</Text>
    <TouchableOpacity style={styles.btn} onPress={() => {toggleMenu(); navigation.navigate('clientes')}}>
      <Icon name="account-plus" size={26} color="#fff" />
    </TouchableOpacity>
  </View>
</Animated.View>


        {/* Botón principal */}
        <TouchableOpacity style={styles.mainBtn} onPress={toggleMenu}>
          <Icon name={open ? 'close' : 'plus'} size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Boton;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    opacity: 0.7
    
  },
  container: {
    position: 'absolute',
    bottom: 60,
    right: 100,
    alignItems: 'center',
  },
  mainBtn: {
    marginTop: 15,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'hsla(212, 100%, 50%, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    right: -90
  },
  secondary: {
    position: 'absolute',
  },
  row: {
    marginRight: -60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 170
  },
  label: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 16,
    elevation: 3,
  },
  btn: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#0fa2cfff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
