import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Menu from '../components/bottom.navigation.jsx'
import HeaderPrincipal from '../components/header'

const productos = () => {
  return (
    <View style={styles.container}>
      <HeaderPrincipal title="Productos" />
      <Menu />
    </View>
  )

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff3f3ff",
  }
})

export default productos