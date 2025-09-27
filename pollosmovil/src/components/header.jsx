import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HeaderPrincipal = ({ title, showBack = false, onBack }) => {
  return (
    <View style={styles.container}>
      
      {showBack ? (
        <TouchableOpacity style={styles.left} onPress={onBack}>
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
      ) : (
        null
      )}

      <Text style={styles.tittle}>{title}</Text>

      <View style={styles.logo}>
        <Icon name='account' size={25} color={'black'} />
      </View>
    </View>
  );
};

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
  left: {
    width: 30, // espacio fijo para mantener alineación
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeaderPrincipal;
