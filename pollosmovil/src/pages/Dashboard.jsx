import React from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderPrincipal from '../components/header.jsx';
import Menu from '../components/bottom.navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GraphTest from "../components/Graficas.componet.jsx";

const Dashboard = () => {
    return (
        
        <View style={styles.container}>
            {/* Header fijo */}
            <HeaderPrincipal title="Asogasinga" />

            {/* Scrollable content */}
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Gráfico */}
                <View style={styles.graphSection}>

                    <GraphTest />

                    
                </View>

                {/* Cards */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: '#d0e8ff' }]}>
                            <Icon name='account-outline' size={28} color='#1a73e8' />
                        </View>
                        <Text style={styles.cardTitle}>Clientes</Text>
                        <Text style={styles.cardNumber}>200</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fff3d6' }]}>
                            <Icon name='storefront-outline' size={28} color='#fbbc04' />
                        </View>
                        <Text style={styles.cardTitle}>Ventas</Text>
                        <Text style={styles.cardNumber}>65</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e6ddff' }]}>
                            <Icon name='currency-usd' size={28} color='#6a1b9a' />
                        </View>
                        <Text style={styles.cardTitle}>Costos</Text>
                        <Text style={styles.cardNumber}>6500</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: '#dff7e6' }]}>
                            <Icon name='cube-outline' size={28} color='#2e7d32' />
                        </View>
                        <Text style={styles.cardTitle}>Productos</Text>
                        <Text style={styles.cardNumber}>2</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>



            {/* Menú fijo */}
          
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    graphSection: {
        height: 250,
        backgroundColor: '#ffffff',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 6,
    },
    cardsContainer: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#ffffff',
        width: '48%',
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    cardNumber: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
    },
    menuContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        backgroundColor: '#fff3f3ff',
    },
});
