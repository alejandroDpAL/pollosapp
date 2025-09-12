
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const HeaderPrincipal = ({ title}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.tittle}>{title}</Text>
{/*         {children && <View style={styles.right}>{children}</View>} */}
      <View style={styles.logo}>
        <Icon name = 'account' size = {30} color ={'#c80303ff'} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#bbb',
    elevation: 3,
    flexDirection: 'row',        
    justifyContent: 'space-between',
    alignItems: 'center',         
    paddingHorizontal: 15,      
  },
  tittle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000',
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: '#ffadadff',
    justifyContent: 'center',
    alignItems: 'center',

  },
  right: {
    flexShrink: 1,
    marginLeft: 20,
  }
})

export default HeaderPrincipal
