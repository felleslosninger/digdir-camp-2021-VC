import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, View, StyleSheet, Alert, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { Button, Text } from 'react-native-ui-lib';
import { signIn } from '../../redux/SignedInSlice';

/**
 * A profile site for administrativ changes on the profile
 * @returns A new site, A logout button and a delete button
 */
export default function ProfileMenuSlide() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [baseIdIssuer, setBaseIdIssuer] = useState('');

    const getBaseIdIssuer = async () => {
        const baseIdToken = await AsyncStorage.getItem('baseId');
        const decoded = jwtDecode(baseIdToken);
        setBaseIdIssuer(decoded.iss);
    };

    getBaseIdIssuer();

    const clearAllData = async () => {
        const keys = await AsyncStorage.getAllKeys();
        keys.map((key) => AsyncStorage.removeItem(key));
    };

    const deleteUserPressed = async () => {
        try {
            await AsyncStorage.removeItem('baseId'); // removes proof from AsyncStorage
            await AsyncStorage.removeItem('pin'); // removes pin from AsyncStorage
            await AsyncStorage.removeItem('privateKey');
            await AsyncStorage.removeItem('walletID');
            dispatch(signIn(false));
            if (await AsyncStorage.getAllKeys()) {
                clearAllData();
            }
            alert('Din bruker er slettet.');
        } catch (exception) {
            alert('Noe gikk galt...');
        }
    };

    /**
     * Allert button so that it is not clicked by accident
     * @returns Allert Button
     */
    const buttonAlert = async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            // Should add PIN code confirmation to delete user
            Alert.alert('VARSEL', 'Er du sikker på at du vil slette brukeren?', [
                {
                    text: 'Cancel',
                    onPress: () => navigation.navigate('Oversikt'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => deleteUserPressed() },
            ]);
        } else {
            alert('VARSEL: Brukeren din vil nå bli slettet!');
            deleteUserPressed();
        }
    };

    return (
        <SafeAreaView style={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', alignContent: 'center' }}>
            <View style={{ alignItems: 'flex-end', marginRight: 20, marginTop: 20 }}>
                <Button
                    label="Slett bruker"
                    backgroundColor="rgb(194,19,44)"
                    size={Button.sizes.small}
                    onPress={buttonAlert}
                    text90
                />
            </View>
            <View>
                <View style={styles.container} marginTop={40}>
                    <Icon name="user" size={200} color="rgb(30,46,60)" />
                </View>
                <Text style={styles.textstyle}>Kari Nordman</Text>
            </View>
            <Text style={styles.issuerText}>Du har grunnidentitet utstedt fra: {baseIdIssuer}</Text>
            <View width={320} style={{ alignSelf: 'center' }}>
                <Button backgroundColor="rgb(0,98,184)" onPress={() => dispatch(signIn(false))}>
                    <Text style={styles.buttonTextlogOut}>Logg ut</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        alignSelf: 'center',
    },
    textstyle: {
        fontSize: 20,
        paddingHorizontal: 20,
        alignSelf: 'center',
        color: 'rgb(30,46,60)',
    },
    logOut: {
        borderRadius: 4,
        backgroundColor: 'rgb(0,98,184)',
        padding: 10,
        marginTop: 10,
        marginBottom: 30,
        width: 250,
        alignSelf: 'center',
        right: 5,
        alignItems: 'center',
    },
    deleteUser: {
        borderRadius: 4,
        backgroundColor: '#FF5733',
        padding: 10,
        marginTop: 10,
        marginBottom: 30,
        width: 150,
        alignSelf: 'center',
        right: 5,
        alignItems: 'center',
    },
    issuerText: {
        marginTop: 70,
        marginBottom: 100,
        paddingHorizontal: 20,
        color: 'rgb(30,46,60)',
        textAlign: 'center',
        fontSize: 20,
    },
    buttonTextlogOut: {
        fontSize: 20,
        color: 'white',
    },
    buttonTextDeleteUser: {
        fontSize: 15,
    },
});
