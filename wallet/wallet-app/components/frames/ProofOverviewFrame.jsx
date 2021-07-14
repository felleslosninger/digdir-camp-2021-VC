/* eslint-disable no-unused-expressions */
/* eslint-disable no-alert */
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { addCredential } from '../../redux/CredentialSlice';
import Proof from '../Proof';
import { signIn } from '../../redux/SignedInSlice';

/**
 * A frame with an overview of every proof the wallet has
 * @returns
 */
export default function ProofOverviewFrame() {
    const dispatch = useDispatch(); // To call every reducer that we want. Using dispatch to communicate with state management
    const { cred } = useSelector((state) => state.credentials);

    const [proofs, setProofs] = useState([]);
    const [keys, setKeys] = useState([]);

    const isFocused = useIsFocused();

    /**
     * Adds the keys and the associated information into a list
     */
    const getProofs = async () => {
        try {
            for (let key = 0; key < keys.length; key++) {
                const value = await AsyncStorage.getItem(keys[key]);
                if (value !== null) {
                    if (!proofs.some((item) => item.id === keys[key])) {
                        // Makes sure that there are no duplicates
                        proofs.push({ id: keys[key], proof: value });
                        dispatch(addCredential(JSON.parse(value)));
                    }
                }
            }
        } catch (error) {
            alert(error);
        }
    };

    /**
     * Gets all the keys in AsyncStorage, except for the pin key
     * Adds the keys into a list
     */
    const getKeys = async () => {
        try {
            const theKeys = await AsyncStorage.getAllKeys();
            if (theKeys !== null) {
                for (let i = 0; i < theKeys.length; i++) {
                    if (!keys.includes(theKeys[i]) && theKeys[i] !== 'pin') {
                        keys.push(theKeys[i]);
                    }
                }
            }
            getProofs();
        } catch (error) {
            alert(error);
        }
    };

    isFocused ? getKeys() : null;

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.logOut} onPress={() => dispatch(signIn(false))}>
                <Text>Logg ut</Text>
            </TouchableOpacity>
            <FlatList
                keyExtractor={(item) => item.jti}
                data={cred}
                renderItem={({ item }) => <Proof id={item.jti} credential={item} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: '5%',
    },
    theProofs: {
        backgroundColor: 'lightgrey',
        padding: 10,
        fontSize: 20,
        marginVertical: 3,
        marginHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    textProofs: {
        fontSize: 40,
        marginTop: '12%',
    },
    logOut: {
        borderRadius: 4,
        backgroundColor: '#3aa797',
        padding: 10,
        marginTop: 10,
        marginBottom: 30,
        width: 75,
        alignSelf: 'flex-end',
        right: 5,
    },
});
