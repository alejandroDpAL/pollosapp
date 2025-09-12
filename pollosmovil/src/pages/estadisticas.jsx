import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import HeaderPrincipal from '../components/header.jsx'
import Menu from '../components/bottom.navigation'


const estadisticas = () => {
  return (
    <View style= {styles.container}>
        <HeaderPrincipal title={"Estadistas"}/>
      <Text>Aqui va los datos del negocio ejemplo costos,perdidas y graficas </Text>
      <Menu/>
    </View>

)
}
const styles = StyleSheet.create ({
  container: {
    flex:1,
    backgroundColor: "#fff3f3ff",
  }
})

export default estadisticas

