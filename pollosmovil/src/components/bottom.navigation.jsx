import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const Menu = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState({ handlePress });

  const handlePress = (route, name) => {
    setSelected(name);
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handlePress('app', 'home')}>
        <Icon name="home-outline" size={30} color={selected === 'home' ? '#000' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('negocios', 'store')}>
        <Icon name="store-outline" size={30} color={selected === 'store' ? '#000' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('estadisticas', 'char')}>
        <Icon name="chart-bar" size={30} color={selected === 'char' ? '#000' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('ajustes', 'cog')}>
        <Icon name="cog" size={30} color={selected === 'cog' ? '#000' : '#fff'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#552525ff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Menu;
