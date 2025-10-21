
import { View, StyleSheet, TouchableOpacity, Animated, Text, Dimensions } from 'react-native';
import React, { useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Boton = () => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;

    // Animación principal
    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    setOpen(!open);
  };

  // Rotación del botón principal
  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Estilos animados mejorados para cada botón
  const productoStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        })
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
    opacity: animation,
  };

  const ventasStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        })
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -160],
        }),
      },
    ],
    opacity: animation,
  };

  const clienteStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        })
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -240],
        }),
      },
    ],
    opacity: animation,
  };

  const menuItems = [
    {
      label: 'Productos',
      icon: 'food-drumstick',
      style: productoStyle,
      color: '#FF6B6B',
      onPress: () => {
        toggleMenu();
        navigation.navigate('productos');
      }
    },
    {
      label: 'Nueva venta',
      icon: 'cart-plus',
      style: ventasStyle,
      color: '#4ECDC4',
      onPress: () => {
        toggleMenu();
        // navigation.navigate('nueva-venta');
      }
    },
    {
      label: 'Clientes',
      icon: 'account-plus',
      style: clienteStyle,
      color: '#45B7D1',
      onPress: () => {
        toggleMenu();
        navigation.navigate('clientes');
      }
    }
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" >
      {
        open && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={toggleMenu}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
        )}

      <View style={styles.container} pointerEvents="box-none" >
        {/* Botones secundarios */}
        {
          menuItems.map((item, index) => (
            <Animated.View key={index} style={[styles.secondary, item.style]} >
              <View style={styles.row} >
                <View style={styles.labelContainer} >
                  <Text style={styles.label} > {item.label} </Text>
                </View>
                < TouchableOpacity
                  style={[styles.btn, { backgroundColor: item.color }]}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  <Icon name={item.icon} size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        }

        {/* Botón principal mejorado */}
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name="plus" size={28} color="#fff" />
          </Animated.View>
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
    bottom: 15,
    right: 100,
    alignItems: 'center',
  },
  mainBtn: {
    marginTop: 15,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    right: -90,
    borderWidth: 2,
    borderColor: '#fff',
  },
  secondary: {
    position: 'absolute',

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: width * 0.6,
    marginRight: 60,
  },
  labelContainer: {
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});