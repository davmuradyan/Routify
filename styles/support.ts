import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    bgImg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        backgroundColor: '#D9D9D9',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        width: 300,
    },
    input: {
        backgroundColor: '#F8EFFF',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        minHeight: 60,
    },
    emailInput: {
        backgroundColor: '#F8EFFF',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    button: {
      backgroundColor: '#FFC107',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      width: 200,
      alignSelf: 'center',
      marginTop: 10,
    },
    
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        alignSelf: 'center'
    },
});