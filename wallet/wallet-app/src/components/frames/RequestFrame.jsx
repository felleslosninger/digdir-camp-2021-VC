/* eslint-disable no-alert */
/* eslint-disable no-unused-expressions */
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import jwtDecode from 'jwt-decode';
// eslint-disable-next-line no-unused-vars
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, Colors, Picker, Button } from 'react-native-ui-lib';
import { httpGetAllIssuers, httpGetCredential, httpGetTypesFromIssuer } from '../../utils/httpRequests';
import { addCredential } from '../../redux/CredentialSlice';

/**
 * Page to request new proof, retrieve and save new proof
 * @returns Buttons and menus to select the issuer and type of proof
 */
export default function RequestFrame() {
    const dispatch = useDispatch();
    const [selectedIssuer, setSelectedIssuer] = useState('');
    const [feedback, setFeedback] = useState('hentet bevis');
    const [vcType, setVcType] = useState('');
    const [issuerTypes, setIssuerTypes] = useState([]);
    const [availableIssuers, setAvailableIssuers] = useState([]);
    // const { active } = useSelector((state) => state.spinnerStatus);

    async function getAllIssuers() {
        setAvailableIssuers(JSON.parse(await httpGetAllIssuers()));
    }

    getAllIssuers();

    /**
     * Retrieves the types of proofs the selected issuer is offering
     */
    useEffect(() => {
        async function fetchTypes() {
            const types = JSON.parse(await httpGetTypesFromIssuer(selectedIssuer));
            setVcType('');
            setIssuerTypes(types);
        }
        fetchTypes();
    }, [selectedIssuer]);

    /**
     * Retrieves a verifiable credential and adds it to state
     */
    async function retrieveCredential() {
        const baseVC = await AsyncStorage.getItem('baseId');
        //   dispatch(activateSpinner(true));
        const response = await httpGetCredential(vcType, baseVC, selectedIssuer);
        try {
            const decode = jwtDecode(response);
            const retrievedCredential = { ...decode, token: response, type: vcType };
            dispatch(addCredential(retrievedCredential));
            if (selectedIssuer === decode.iss.substring(0, decode.iss.length - 36)) {
                setFeedback(`hentet bevis`);
                setSelectedIssuer('');
                setVcType('');
            } else {
                setFeedback('Utsteder stemmer ikke med det du har etterspurt. Prøv igjen.');
            }

            // await saveProof(retrievedCredential);
        } catch (error) {
            setFeedback(response);
        } finally {
            alert(feedback);
            //     dispatch(activateSpinner(false));
        }
    }

    /*
    const saveProof = async (cred) => {
        if (vcType && cred.jti !== undefined) {
            try {
                await AsyncStorage.setItem(cred.jti, JSON.stringify(cred));
            } catch (error) {
                alert(error);
            }
        }
    };
    */

    return (
        <ScrollView style={styles.container}>
            {/*
          <Spinner
                visible={active}
                textContent="Vent litt..."
                textStyle={{ color: 'rgb(30,46,60)' }}
                color="rgb(0,98, 184)"
                overlayColor="rgba(0,0,0,0.1)"
            />
          */}
            <Text text40 style={{ paddingBottom: 30, paddingTop: 20 }}>
                Forespør et nytt bevis
            </Text>
            <SafeAreaView>
                <Picker
                    placeholder="Velg utsteder"
                    floatingPlaceholder
                    value={{ value: selectedIssuer, label: selectedIssuer }}
                    enableModalBlur={false}
                    onChange={(item) => setSelectedIssuer(item.value)}
                    topBarProps={{ title: 'Utstedere' }}
                    showSearch
                    searchPlaceholder="Søk etter utsteder"
                    searchStyle={{ color: 'rgb(0,98,184)', placeholderTextColor: Colors.dark50 }}>
                    {availableIssuers.map((i) => (
                        <Picker.Item key={i} label={i} value={i} />
                    ))}
                </Picker>
            </SafeAreaView>

            {selectedIssuer === '' ? (
                <SafeAreaView style={{ opacity: 0 }}>
                    <Picker
                        placeholder="Velg type bevis"
                        floatingPlaceholder
                        value={{ value: vcType, label: vcType }}
                        enableModalBlur={false}
                        onChange={(item) => setVcType(item.value)}
                        topBarProps={{ title: 'Type bevis' }}
                        showSearch
                        searchPlaceholder="Søk etter bevis"
                        searchStyle={{ color: 'rgb(0,98,184)', placeholderTextColor: Colors.dark50 }}>
                        {issuerTypes.length > 0
                            ? issuerTypes.map((i) => <Picker.Item key={i} label={i} value={i} />)
                            : null}
                    </Picker>
                </SafeAreaView>
            ) : (
                <SafeAreaView>
                    <Picker
                        placeholder="Velg type bevis"
                        floatingPlaceholder
                        value={{ value: vcType, label: vcType }}
                        enableModalBlur={false}
                        onChange={(item) => setVcType(item.value)}
                        topBarProps={{ title: 'Type bevis' }}
                        showSearch
                        searchPlaceholder="Søk etter bevis"
                        searchStyle={{ color: 'rgb(0,98,184)', placeholderTextColor: Colors.dark50 }}>
                        {issuerTypes.length > 0
                            ? issuerTypes.map((i) => <Picker.Item key={i} label={i} value={i} />)
                            : null}
                    </Picker>
                </SafeAreaView>
            )}

            <View style={{ alignItems: 'flex-end', alignSelf: 'center', paddingBottom: 20 }}>
                <Button
                    label="Hent bevis"
                    backgroundColor="rgb(0,98,184)"
                    onPress={() => {
                        retrieveCredential();
                    }}
                    disabled={vcType === ''}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: '18%',
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        alignSelf: 'center',
        marginBottom: 13,
    },
    text: {
        fontSize: 25,
        paddingBottom: '1%',
    },
    input: {
        borderColor: 'rgb(0,98,184)',
        borderWidth: 2,
        borderRadius: 5,
        padding: 7,
    },
    proof: {
        marginTop: '3%',
    },
    button: {
        marginTop: '5%',
        backgroundColor: 'rgb(0,98,184)',
        borderRadius: 5,
        height: 40,
        width: '80%',
        alignSelf: 'center',
    },
    buttonText: {
        fontSize: 22,
        marginTop: 7,
        alignSelf: 'center',
        color: 'black',
    },
    credential: {
        alignSelf: 'center',
        marginTop: '5%',
    },
});
