import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import HeaderPrincipal from '../components/header'

const clientes = () => {
  return (

    <View style={styles.container}>
      <HeaderPrincipal title="Clientes">

      </HeaderPrincipal>
      <Text>clientes</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff3f3ff",
  }
})

export default clientes